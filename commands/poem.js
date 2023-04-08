const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");

module.exports.run = async (bot, msg, args) => {
    if (msg.hasQuotedMsg) {
        const quote = await msg.getQuotedMessage();
        message = `Use the following text to write a short poem:\n${await quote.body}`;
        
        let messages = [];
        messages = [ { role: "user", content: message } ]

        try {
            const response = (await ai.getText(messages));
            await utils.naturalDelay(bot);
            await msg.reply(`${utils.price(response.tokens*0.002/1000)}\n${response.response.content}`);
        } catch (error) {
            console.error(`Error with WhatsApp: ${error}`);
            await utils.naturalDelay(bot);
            await msg.react('⚠️');
        }
    } else {
        await utils.naturalDelay(bot);
        await msg.react('❔');
    }
}

module.exports.help = {
    category: "ai",
    name: "poem",
    aliases: [],
    args: ""
}
