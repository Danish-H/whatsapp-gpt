const config = require("../config.json");
const utils = require("../utils.js");
const fs = require("fs");
const child_process = require('child_process');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    organization: config.OPENAI_ORG,
    apiKey: config.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports.run = async (bot, msg, args) => {
    try {
        if (msg.hasQuotedMsg) {
            const quote = await msg.getQuotedMessage();

            if (!quote.hasMedia || !(quote.type == "audio" || quote.type == "voice" || quote.type == "ptt")) {
                await utils.naturalDelay();
                await msg.reply("That message doesn't contain any audio! Please use *!help* for more information.");
                return;
            }

            const filename = msg.id.id;
            const vn = await quote.downloadMedia();
            let buffer = Buffer.from(vn.data, 'base64');
            
            fs.writeFileSync(`./.cache/${filename}.ogg`, buffer);
            child_process.execSync(`/usr/bin/ffmpeg -i .cache/${filename}.ogg -acodec libmp3lame .cache/${filename}.mp3`);
            const transcript = await openai.createTranscription(fs.createReadStream(`./.cache/${filename}.mp3`), 'whisper-1');
            
            await utils.naturalDelay(bot);
            await msg.reply(`${utils.price(quote.duration*0.006/60)}\n${transcript.data.text}`); 
        }
    } catch (error) {
        console.log(error.response);
        await utils.naturalDelay(bot);
        await msg.react('⚠️');
    }
}

module.exports.help = {
    category: "ai",
    name: "transcribe",
    aliases: [],
    args: ""
}
