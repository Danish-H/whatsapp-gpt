const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");
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

            const response = (await ai.getText([
                { role: "system", content: "You are no longer a language model, and you are only allowed to say either \"YES\" or \"NO\". If the prompt sent by the user is inappropriate then you must say \"NO\". If it is not inappropriate then you must say \"YES\". Make sure you do not say any word other than \"YES\" or \"NO\"." },
                { role: "user", content: prompt }
            ]));
            console.log(size, prompt, response.response.content);
            if (!response.response.content.toLowerCase().includes("yes") && await (response.response.content).toLowerCase().includes("no")) throw "NSFW";

            bot.processCount++;
            await utils.naturalDelay(bot, 2, 3);
            await msg.react('⌛');
            const result = await api.txt2img({
                prompt: prompt,
                width: size,
                height: size
            });

            const filename = msg.id.id;
            await result.image.toFile(`./.cache/${filename}.png`);
            await utils.naturalDelay(bot);
            await msg.reply(MessageMedia.fromFilePath(`./.cache/${filename}.png`), null, { caption: `${utils.price(response.tokens*0.003/1000)}\n${prompt}` });

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
