const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");

module.exports.run = async (bot, msg, args) => {
    if (args.length) {
        const author = msg.author ? msg.author.slice(0, 12) : msg.from.slice(0, 12);
        let message = args.join(' ');
        if (msg.hasQuotedMsg) {
            const quote = await msg.getQuotedMessage();
            message = `Message: ${await quote.body}\nReferring to the message above, answer the following question: ${message}`;
        }
        let messages = [];
        await msg.getContact().then(contact => {
            messages = [
                { role: "system", content: config.initial_prompt.replace("{USERNAME}", contact.pushname).replace("{CONTACT}", contact.name).replace("{NUMBER}", author) },
                { role: "user", content: message }
            ]
        });
        try {
            bot.processCount++;
            await utils.naturalDelay(bot, 1, 2);
            await msg.react('⌛');
            const response = (await ai.getText(messages, "gpt-4"));
            await msg.react('');
            await utils.naturalDelay(bot);
            await msg.reply(`${utils.price((response.tokens*0.03/1000)+(response.completion_tokens*0.03/1000))}\n${response.response.content}`);
            await messages.push(response.response);
            await bot.messagesList.set(author, { type: 'gpt4', messages: messages });
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
