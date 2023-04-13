const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");

module.exports.run = async (bot, msg, args, author=msg.author?msg.author.slice(0, 12):msg.from.slice(0, 12)) => {
    if (args.length) {
        const chat = await msg.getChat();
        chat.sendSeen();
        chat.sendStateTyping();

        let messages = []
        let message = args.join(' ');
        let old_tokens = 0;

        if (bot.messagesList.has(`${author}_DM`)) {
            messages = bot.messagesList.get(`${author}_DM`).messages;
            old_tokens = bot.messagesList.get(`${author}_DM`).total_cost;
            await msg.getContact().then(contact => {
                messages.push({ role: "user", content: `Message from ${contact.pushname}: ${message}` });
                while (messages.length > config.dm.history_length) {
                    console.log("[!] Popping old messages...")
                    messages.splice(1, 1);
                }
            });
        }
        
        else {
            await msg.getContact().then(contact => {
                messages = [
                    { role: "system", content: `${config.initial_prompt.replace("{USERNAME}", contact.pushname).replace("{CONTACT}", contact.pushname).replace("{NUMBER}", author)}\n${config.dm.initial_prompt}` },
                    { role: "user", content: `Message from ${contact.pushname}: ${message}` }
                ]
            });
        }

        try {
            const response = (await ai.getText(messages, "gpt-3.5-turbo", Math.min(Math.round(4*message.length*3), 1500)));
            const tokens = await old_tokens+response.completion_tokens;
            const chat = await msg.getChat();
            let res = response.response.content;

            if (config.dm.humanize) {
                res = res.toLowerCase();
                let numCapitals = msg.body.replace(/[a-z]/g, '').length;
                if (numCapitals > (0.8*msg.body.length)) res = response.response.content.toUpperCase();
                if (res.length > 0 && res.slice(-1) == ".") res = res.slice(0, res.length-1);
            }

            await utils.naturalDelay(bot);
            await chat.sendMessage(`${res}`);

            if (Math.random() > 0.9) await chat.sendMessage(`So far you've spent ₨ ${(tokens*(0.002/1000)*300).toFixed(2)} talking to a bot -.-`);
            await messages.push(response.response);
            await bot.messagesList.set(`${author}_DM`, { type: 'dm', messages: await messages, total_cost: tokens });
        }
        
        catch (error) {
            console.error(`Error with WhatsApp: ${error}`);
            await utils.naturalDelay(bot);
            await msg.react('💀');
        }
    }

    else {
        await utils.naturalDelay(bot);
        await msg.react('❔');
    }
}

module.exports.help = {
    category: "ai",
    name: "dm",
    aliases: [],
    args: "<prompt>"
}
