const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");
const sharp = require('sharp')
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
            if (args[0] == "models") {
                const curModel = await api.getCurrentModel();
                const models = await api.getSdModels();
                let output = `*Current model:*\n${await curModel.split(" (")[0]}\n\n*Other models:*\n`;
                models.forEach((m, i) => output += `[${i+1}] ${m.model_name.split(" (")[0]}\n`)
                await utils.naturalDelay(bot, 1, 2);
                await msg.reply(output);
                return;
            }

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
                negative_prompt: config.sdwebui.negative_prompt,
                width: size,
                height: size
            });

            let tokens = 0;
            let filename = msg.id.id;
            await result.image.toFile(`./.cache/${filename}.png`);
            await utils.naturalDelay(bot);

            if (!config.sdwebui.allow_nsfw_dm || (await msg.getChat()).isGroup) {
                const response = (await ai.getText([
                    { role: "system", content: config.sdwebui.nsfw_prompt },
                    { role: "user", content: prompt }
                ]));
                
                if (!response.response.content.toLowerCase().includes("yes") && await (response.response.content).toLowerCase().includes("no")) {
                    await msg.react('⚠️');
                    await sharp(`./.cache/${filename}.png`)
                    .blur(20)
                    .composite([{
                        input: Buffer.from(`<svg width="${size}" height="${size}"><rect x="0" y="0" width="100%" height="100%" fill="#fff" fill-opacity="0.2" /><text x="50%" y="50%" text-anchor="middle" dy="0.25em" font-size="4em" fill="#000">⚠️ NSFW ⚠️</text></svg>`),
                        top: 0,
                        left: 0
                    }])
                    .png()
                    .toFile(`./.cache/${filename}_blur.png`)
                    filename = await filename+"_blur"
                };

                tokens = response.tokens;
            }

            await msg.reply(MessageMedia.fromFilePath(`./.cache/${filename}.png`), null, { caption: `${utils.price(tokens*0.003/1000)}\n${prompt}` });

            bot.processCount++;
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
