const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");

module.exports.run = async (bot, msg, args) => {
    const author = msg.author ? msg.author.slice(0, 12) : msg.from.slice(0, 12);
    if (bot.messagesList.has(author)) {
        if (args.length) {
            try {
                let messages = bot.messagesList.get(author).messages;
                messages.push({ role: "user", content: args.join(' ') });
                const response = (await ai.getText(messages));
                await messages.push(response.response);
                await bot.messagesList.set(author, { type: bot.messagesList.get(author).type, messages: messages });
                await utils.naturalDelay(bot);
                let price = response.tokens*0.002/1000;
                if (bot.messagesList.get(author).type == "gpt4") price = (response.tokens*0.03/1000)+(response.completion_tokens*0.03/1000);
                await msg.reply(`${utils.price(price)}\n${response.response.content}`);
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

    else {
        await utils.naturalDelay(bot);
        await msg.reply(`Please use *${config.prefix}gpt3 <prompt>* or *${config.prefix}gpt4 <prompt>* to start a conversation first`)
    }
}

module.exports.help = {
    category: "ai",
    name: "reply",
    aliases: ["r"],
    args: "<prompt>"
}
