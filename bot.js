const TelegramBot = require("node-telegram-bot-api");
const { main, stop } = require('./index')
require('dotenv').config();

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(process.env.DFA_CMD, { polling: true });



bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "No help at the moment.");
});

bot.onText(/\/status/, (msg) => {
    bot.sendMessage(msg.chat.id, "I'm alive ^^");
});

bot.onText(/\/stop/, (msg) => {
    bot.sendMessage(msg.chat.id, "Task Terminated");
    stop()
    console.log('TASK ENDED : OK')
});


bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "TASK STARTING");
    main()
});
