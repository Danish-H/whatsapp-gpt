const config = require("../config.json");
const utils = require("../utils.js");
const ai = require("../ai.js");
const fs = require("fs");
const child_process = require('child_process');
const { MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');

module.exports.run = async (bot, msg, args) => {
    try {
        if (msg.hasQuotedMsg) {
            const quote = await msg.getQuotedMessage();
            if (quote.hasMedia && (quote.type == "image" || quote.type == "sticker")) {
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
                await utils.naturalDelay(bot);
                for (let i=0; i<4; i++) {
                    chat = await msg.getChat();
                    await chat.sendMessage(new MessageMedia('image/png', images[i].toString('base64')), { sendMediaAsSticker: true });
                }
            }

            else if (quote.hasMedia && quote.type == "video") {
                const filename = msg.id.id;
                const image = await quote.downloadMedia();
                let buffer = Buffer.from(image.data, 'base64');
                await fs.writeFileSync(`./.cache/${filename}.mp4`, buffer);
                bot.processCount--;
                await child_process.execSync(`/usr/bin/ffmpeg -i .cache/${filename}.mp4 -c:v libvpx -crf 15 -b:v 1M -filter:v "crop=in_w/2:in_h/2:0:0" -c:a libvorbis .cache/${filename}_1.webm`);
                await child_process.execSync(`/usr/bin/ffmpeg -i .cache/${filename}.mp4 -c:v libvpx -crf 15 -b:v 1M -filter:v "crop=in_w/2:in_h/2:in_w/2:0" -c:a libvorbis .cache/${filename}_2.webm`);
                await child_process.execSync(`/usr/bin/ffmpeg -i .cache/${filename}.mp4 -c:v libvpx -crf 15 -b:v 1M -filter:v "crop=in_w/2:in_h/2:0:in_h/2" -c:a libvorbis .cache/${filename}_3.webm`);
                await child_process.execSync(`/usr/bin/ffmpeg -i .cache/${filename}.mp4 -c:v libvpx -crf 15 -b:v 1M -filter:v "crop=in_w/2:in_h/2:in_w/2:in_h/2" -c:a libvorbis .cache/${filename}_4.webm`);
                const media1 = MessageMedia.fromFilePath(`.cache/${filename}_1.webm`);
                const media2 = MessageMedia.fromFilePath(`.cache/${filename}_2.webm`);
                const media3 = MessageMedia.fromFilePath(`.cache/${filename}_3.webm`);
                const media4 = MessageMedia.fromFilePath(`.cache/${filename}_4.webm`);
                const chat = await msg.getChat();
                await chat.sendMessage(media1, { sendMediaAsSticker: true });
                await chat.sendMessage(media2, { sendMediaAsSticker: true });
                await chat.sendMessage(media3, { sendMediaAsSticker: true });
                await chat.sendMessage(media4, { sendMediaAsSticker: true });
            }
            
            else {
                await utils.naturalDelay();
                await msg.reply("That message doesn't contain an image! Please use *!help* for more information.");
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
    args: ""
}
