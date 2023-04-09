const config = require("../config.json");
const utils = require("../utils.js");
const { MessageMedia } = require('whatsapp-web.js');
const { StableDiffusionApi } = require('stable-diffusion-api');

const api = new StableDiffusionApi({
    host: config.sdwebui.host,
    port: config.sdwebui.port,
    protocol: "http",
    defaultSampler: "Euler a",
    defaultStepCount: 60,
});

module.exports.run = async (bot, msg, args) => {
    if (args.length) {
        try {
            let prompt = args.join(' ');
            let size = 512;
            if (("512", "1024").includes(args[0])) {
                size = parseInt(args[0]);
                args.shift();
                prompt = args.join(' ');
            }
            bot.processCount++;
            await utils.naturalDelay(bot, 2, 3);
            await msg.react('⌛');
            const result = await api.txt2img({
                prompt: prompt,
                width: size,
                height: size
            });
            const filename = Math.floor(100000000 + Math.random() * 900000000).toString();
            await result.image.toFile(`./.cache/${filename}.png`);

            await utils.naturalDelay(bot);
            await msg.reply(await MessageMedia.fromFilePath(`./.cache/${filename}.png`), null, { caption: `${utils.price(0)}\n${prompt}` });
            
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
    name: "diffuse",
    aliases: ["diff", "sd", "generate", "gen"],
    args: "[512|1024] <prompt>"
}
