import stt from "../openai/stt";
import chat, { Message as OpenAIMessage } from "../openai/chat";
import tts from "../openai/tts";
import { prisma } from "../prisma";
import TelegramBot from "node-telegram-bot-api";

async function getInputMessageContent(
  bot: TelegramBot,
  msg: TelegramBot.Message
) {
  let text = "";
  let voiceFileId = "";
  if (msg.text) {
    text = msg.text;
  } else if (msg.voice) {
    const file = await bot.getFile(msg.voice.file_id);
    const resp = await fetch(
      `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN!}/${
        file.file_path
      }`,
      { method: "GET" }
    );
    const msgText = await stt(resp);
    text = msgText;
    voiceFileId = msg.voice?.file_id;
  }
  return { text, voiceFileId };
}

async function getSession(msg: TelegramBot.Message) {
  let session = await prisma.chatSession.findFirst({
    where: { chatId: msg.chat.id },
    orderBy: { createdAt: "desc" },
    include: { messages: true },
  });
  if (!session) {
    const newSession = await prisma.chatSession.create({
      data: {
        chatId: msg.chat.id,
        from: msg.from?.username ?? null,
      },
      include: { messages: true },
    });
    session = newSession;
  }
  const messages: OpenAIMessage[] = (session?.messages || []).map((ele) => ({
    ...ele,
    role: ele.role as "system" | "user" | "assistant",
  }));
  return { session, messages };
}

export default function createAIHandler(bot: TelegramBot) {
  return async (msg: TelegramBot.Message) => {
    try {
      const { text: inputText, voiceFileId: inputVoiceFileId } =
        await getInputMessageContent(bot, msg);
      if (!inputText) {
        throw new Error("unknown input");
      }

      const { session, messages } = await getSession(msg);
      const context = messages.concat({ role: "user", text: inputText });
      const outputText = await chat(context);
      const speech = await tts(
        {
          voice: "alloy",
          speed: 1,
        },
        outputText!
      );
      const chatId = msg.chat.id;
      const vioceMsg = await bot.sendVoice(
        chatId,
        Buffer.from(speech.buffer),
        {},
        {
          contentType: speech.mimetype,
          filename: `${new Date().getTime()}.mp3`,
        }
      );
      await prisma.chatMessage.createMany({
        data: [
          {
            chatId: msg.chat.id,
            role: "user",
            text: inputText,
            fileId: inputVoiceFileId,
            sessionId: session.id,
          },
          {
            chatId: msg.chat.id,
            role: "assistant",
            text: outputText!,
            fileId: vioceMsg.voice?.file_id,
            sessionId: session.id,
          },
        ],
      });
    } catch (error) {
      bot.sendMessage(msg.chat.id, `error occured: ${error}`);
    }
  };
}
