const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");
const { MessageMedia } = require('whatsapp-web.js');

module.exports.run = async (bot, msg, args) => {
    if (args.length) {
        if (bot.stickerQueue.includes(msg.author)) bot.stickerQueue.splice(bot.stickerQueue.indexOf(msg.author), 1);
        try {
            dallePrompt = args.join(' ');
            const image_url = (await ai.getImage(dallePrompt)).image_url;
            const image = await MessageMedia.fromUrl(image_url);

            await utils.naturalDelay(bot);
            await msg.reply(`${utils.price(0.016, 5)}\n${dallePrompt}`)
            chat = await msg.getChat();
            await chat.sendMessage(image, { sendMediaAsSticker: true });
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
        } else {
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
    args: "[prompt]"
}
