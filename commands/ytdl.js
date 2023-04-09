const config = require("../config.json");
const utils = require("../utils.js");
const child_process = require('child_process');
const { MessageMedia } = require('whatsapp-web.js');

module.exports.run = async (bot, msg, args) => {
    try {
        if (args.length) {
            let ytdlpArgs = "-f 'bestvideo[filesize<16M][ext=mp4]+bestaudio[ext=m4a]/mp4'";
            let ext = "mp4";
            let options = {};

            if (("audio", "a").includes(args[0])) {
                args.shift();
                ytdlpArgs = "-f 'bestaudio[ext=m4a]'";
                ext = "m4a";
            }
            
            else if (("sticker", "s").includes(args[0])) {
                args.shift();
                ytdlpArgs = "-f 'bestvideo[ext=webm]'";
                ext = "webm";
                options = { sendMediaAsSticker: true };
            }

            if (("video", "v").includes(args[0])) args.shift();

            const filename = msg.id.id;
            child_process.execSync(`${config.ytdlp} ${ytdlpArgs} --output ".cache/${filename}.${ext}" ${args[0]}`);  

            await utils.naturalDelay(bot);
            const media = MessageMedia.fromFilePath(`.cache/${filename}.${ext}`);
            await msg.reply(media, null, options);
        }
    } catch (error) {
        await console.log(error.response);
        await utils.naturalDelay(bot);
        await msg.react('⚠️');
    }
}

module.exports.help = {
    category: "tools",
    name: "ytdl",
    aliases: ["yt"],
    args: "[video|audio|sticker] <url>"
}
