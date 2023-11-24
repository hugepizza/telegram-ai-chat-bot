import TelegramBot from "node-telegram-bot-api";
import { prisma } from "../prisma";

export default function createCommandHandler(bot: TelegramBot) {
  return async (msg: TelegramBot.Message) => {
    try {
      switch (msg.text!) {
        case "/newsession":
          await prisma.chatSession.create({
            data: {
              chatId: msg.chat.id,
              from: msg.from?.username ?? null,
            },
          });
          bot.sendMessage(msg.chat.id, "new session started");
          break;
      }
    } catch (error) {
      bot.sendMessage(msg.chat.id, `error occured: ${error}`);
    }
  };
}
