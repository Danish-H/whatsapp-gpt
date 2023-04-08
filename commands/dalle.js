const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");
const { MessageMedia } = require('whatsapp-web.js');

module.exports.run = async (bot, msg, args) => {
    if (args.length) {
        try {
            let dallePrompt = args.join(' ');
            let dalleSize = "256x256";
            let price = 0.016;
            if (("256", "512", "1024").includes(args[0])) {
                if (args[0] == "512") price = 0.018;
                else if (args[0] == "1024") price = 0.02;
                dalleSize = `${args[0]}x${args[0]}`;
                args.shift();
                dallePrompt = args.join(' ');
            }
            bot.processCount++;
            await utils.naturalDelay(bot, 2, 3);
            await msg.react('⌛');
            const image_url = (await ai.getImage(dallePrompt, dalleSize)).image_url;
            const image = await MessageMedia.fromUrl(image_url);
            await utils.naturalDelay(bot);
            chat = await msg.getChat();
            await msg.reply(image, null, { caption: `${utils.price(price)}\n${dallePrompt}` });
            await bot.processCount++;
            await utils.naturalDelay(bot, 1, 2);
            await msg.react('');
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
    name: "dalle",
    aliases: ["diffuse", "sd", "generate", "gen", "dale"],
    args: "[256|512|1024] <prompt>"
}
