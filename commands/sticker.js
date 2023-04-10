const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");
const fs = require("fs");
const child_process = require('child_process');
const { MessageMedia } = require('whatsapp-web.js');

module.exports.run = async (bot, msg, args) => {
    if (args.length) {
        if (bot.stickerQueue.includes(msg.author)) bot.stickerQueue.splice(bot.stickerQueue.indexOf(msg.author), 1);
        try {
            dallePrompt = args.join(' ');
            const image_url = (await ai.getImage(dallePrompt)).image_url;
            const image = await MessageMedia.fromUrl(image_url);

            await utils.naturalDelay(bot);
            chat = await msg.getChat();
            await msg.reply(image, null, { sendMediaAsSticker: true });
            await chat.sendMessage(`${utils.price(0.016, 5)}\n${dallePrompt}`);
        } catch (error) {
            console.error(`Error with WhatsApp: ${error}`);
            await utils.naturalDelay(bot);
            await msg.react('⚠️');
        }
    }

    else if (msg.hasQuotedMsg) {
        const quote = await msg.getQuotedMessage();
        if (quote.hasMedia && quote.type == "image") {
            try {
                const image = await quote.downloadMedia();
                await utils.naturalDelay(bot);
                await msg.reply(image, null, { sendMediaAsSticker: true });
            } catch (error) {
                console.error(`Error with WhatsApp: ${error}`);
                await utils.naturalDelay(bot);
                await msg.react('⚠️');
            }
        }

        else if (quote.hasMedia && quote.type == "video") {
            try {
                const filename = msg.id.id;
                const image = await quote.downloadMedia();
                let buffer = Buffer.from(image.data, 'base64');
                await fs.writeFileSync(`./.cache/${filename}.mp4`, buffer);
                bot.processCount--;
                await child_process.execSync(`/usr/bin/ffmpeg -i .cache/${filename}.mp4 -c:v libvpx -crf 15 -b:v 1M -c:a libvorbis .cache/${filename}.webm`);
                const media = MessageMedia.fromFilePath(`.cache/${filename}.webm`);
                await msg.reply(media, null, { sendMediaAsSticker: true });
            } catch (error) {
                console.error(`Error with WhatsApp: ${error}`);
                await utils.naturalDelay(bot);
                await msg.react('⚠️');                
            }
        }
        
        else {
            await utils.naturalDelay(bot);
            await msg.reply("That message doesn't contain an image")
        }
    }

    else {
        if (!bot.stickerQueue.includes(msg.author)) bot.stickerQueue.push(msg.author);
        await utils.naturalDelay(bot);
        await msg.reply(`Send an image now to turn it into a sticker, otherwise use *${config.prefix}${module.exports.help.name} ${module.exports.help.args}* to generate one`);
    }
}

module.exports.help = {
    category: "fun",
    name: "sticker",
    aliases: ["stick"],
    args: "[prompt]"
}
