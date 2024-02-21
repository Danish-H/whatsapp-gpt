const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");

module.exports.run = async (bot, msg, args) => {
    console.log("Running chat.js")
    if (args.length) {
        const author = msg.author ? msg.author.slice(0, 12) : msg.from.slice(0, 12);
        // let message = args.join(' ');
        console.log(args);
        let message = args[1]
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
            const response = (await ai.getText(messages));
            await utils.naturalDelay(bot);
            console.log(response);
            await msg.reply(`${utils.price(response.tokens*0.002/1000)}\n${response.response.content}\n\n🤖`);
            await messages.push(response.response);
            await bot.messagesList.set(author, { type: 'gpt3', messages: messages });
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
    name: "chat",
    aliases: [],
    args: ""
}
