const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");
const { MessageMedia } = require('whatsapp-web.js');

module.exports.run = async (bot, msg, args) => {
    if (args.length) {
        let message = args.join(' ');
        if (msg.hasQuotedMsg) {
            const quote = await msg.getQuotedMessage();
            message = `Message: ${await quote.body}\nReferring to the message above, answer the following question: ${message}`;
        }
        let messages = [];
        await msg.getContact().then(contact => {
            messages = [
                { role: "system", content: config.initial_prompt.replace("{USERNAME}", contact.pushname).replace("{CONTACT}", contact.name).replace("{NUMBER}", msg.author.slice(0, 12)) },
                { role: "user", content: message }
            ]
        });
        try {
            const response = (await ai.getText(messages, "gpt-4"));
            await messages.push(response.content);
            await bot.messagesList.set(msg.author, messages);
            await utils.naturalDelay(bot);
            await msg.reply(`${utils.price(response.tokens*0.002/1000)}\n${response.response.content}`);
        } catch (error) {
            console.error(`Error with WhatsApp: ${error}`);
            await utils.naturalDelay(bot);
            await msg.react('⚠️');
        }
    }

    else {
        await utils.naturalDelay(bot);
        await msg.react('❔');
    }
}

module.exports.help = {
    category: "ai",
    name: "gpt4",
    aliases: [],
    args: "<prompt>"
}
