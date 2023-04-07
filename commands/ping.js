const config = require("../config.json");
const utils = require("../utils.js")

module.exports.run = async (bot, msg, args) => {
    timestamp = Math.floor(Date.now()/1000);
    console.log(`[!] Pinged\nS: ${msg.timestamp}\nR: ${timestamp}`);

    response = await msg.reply("Pinging...");
    await console.log(`E: ${response.timestamp}`);
    await utils.naturalDelay(bot, 0.5, 1.5);

    chat = await response.getChat();
    await chat.sendMessage(`🏓 Pong! ${(response.timestamp - msg.timestamp)}s`);
}

module.exports.help = {
    category: "tools",
    name: "ping",
    args: ""
}
