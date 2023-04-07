const config = require("../config.json");
const utils = require("../utils.js")

module.exports.run = async (bot, msg, args) => {
    await utils.naturalDelay(bot);
    await msg.reply(bot.help);
}

module.exports.help = {
    category: "tools",
    name: "help",
    aliases: ["?"],
    args: ""
}
