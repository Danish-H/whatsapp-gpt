const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");
const { MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');

module.exports.run = async (bot, msg, args) => {
    try {
        if (msg.hasQuotedMsg) {
            const quote = await msg.getQuotedMessage();
            if (!quote.hasMedia || !(quote.type == "image" || quote.type == "sticker")) {
                await naturalDelay();
                await msg.reply("That message doesn't contain an image! Please use *!help* for more information.");
            } else {
                const image = await quote.downloadMedia();
                let imgBuffer = Buffer.from(image.data, 'base64');
                const img = sharp(imgBuffer);
                const metadata = await img.metadata()
    
                let sz = Math.max(metadata.width, metadata.height);
                let w = Math.floor(sz/2);
    
                imgBuffer = await img.resize(sz, sz, { fit: 'contain' } ).toBuffer();
                let images = [];
                images.push(await sharp(imgBuffer).extract( {left: 0, top: 0, width: w, height: w} ).toBuffer());
                images.push(await sharp(imgBuffer).extract( {left: w, top: 0, width: w, height: w} ).toBuffer());
                images.push(await sharp(imgBuffer).extract( {left: 0, top: w, width: w, height: w} ).toBuffer());
                images.push(await sharp(imgBuffer).extract( {left: w, top: w, width: w, height: w} ).toBuffer());
                bot.processCount++;
                await utils.naturalDelay(bot, config.naturalDelay.min*1.5, config.naturalDelay.max*1.5);
                for (let i=0; i<4; i++) {
                    chat = await msg.getChat();
                    await chat.sendMessage(new MessageMedia('image/png', images[i].toString('base64')), { sendMediaAsSticker: true });
                }
            } 
        }
    } catch (error) {
        console.log(error);
        await utils.naturalDelay(bot);
        await msg.react('⚠️');
    }
}

module.exports.help = {
    category: "fun",
    name: "qsticker",
    aliases: ["qstick"],
    args: "[prompt]"
}
