const config = require("../config.json");
const utils = require("../utils.js")

module.exports.run = async (bot, msg, args) => {
    if (args[0]) {
        try {
            const chat = await msg.getChat();
            if (!chat.isGroup) throw "NOT GROUP";

            let admin = false;
            await chat.participants.forEach(p => { if (p.id._serialized == msg.author && (p.isAdmin || p.isSuperAdmin)) admin = true; });
            if (!admin) throw "NOT ADMIN";

            if (parseInt(args[0]) > 20) throw "TOO MANY MESSAGES";

            const messages = await chat.fetchMessages({ limit: parseInt(args[0]) });
            while (messages.length) {
                const message = await messages.pop();
                console.log(`[${parseInt(args[0]) - messages.length}/${parseInt(args[0])}] Deleting ${message.author}:${message.body}`);
                await message.delete(true);
                bot.processCount++;
                await utils.naturalDelay(bot, 0.2, 0.4, true);
            }
        }
        
        catch (error) {
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
    category: "tools",
    name: "purge",
    aliases: [],
    args: ""
}
