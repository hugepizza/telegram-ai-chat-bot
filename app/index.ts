import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";
import createCommandHandler from "./handler/command";
import createAIHandler from "./handler/ai";
dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

bot
  .setMyCommands([
    {
      command: "newsession",
      description: "start a new session",
    },
  ])
  .then(() => {
    const aiHandler = createAIHandler(bot);
    const commandHandler = createCommandHandler(bot);

    bot.onText(/\//, commandHandler);

    bot.onText(/^[^/]/, aiHandler);
    bot.on("voice", aiHandler);

    console.log("bot is running...");
  });
