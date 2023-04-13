const config = require("../config.json");
const utils = require("../utils.js")

module.exports.run = async (bot, msg, args) => {
    if (msg.hasQuotedMsg) {
        const quote = await msg.getQuotedMessage();
        if (quote.hasMedia && quote.fromMe) {
            try {
                await utils.naturalDelay(bot);
                await quote.delete(true);
            } catch (error) {
                console.error(`Error with WhatsApp: ${error}`);
                await utils.naturalDelay(bot);
                await msg.react('⚠️');
            }
        } else {
            await utils.naturalDelay(bot);
            await msg.react('🚫');
        }
    } else {
        if (!chat.isGroup) {
            await utils.naturalDelay(bot);
            await msg.react('❔');
        }
    }
}

module.exports.help = {
    category: "tools",
    name: "delete",
    aliases: [],
    args: "<num>"
}
