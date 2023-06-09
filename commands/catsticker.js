const config = require("../config.json");
const utils = require("../utils.js");
const { MessageMedia } = require('whatsapp-web.js');

module.exports.run = async (bot, msg, args) => {
    try {
        let image_url = "https://cataas.com/cat";
        const image = await MessageMedia.fromUrl(image_url, { unsafeMime: true });
        await utils.naturalDelay(bot);
        await msg.reply(image, null, { sendMediaAsSticker: true });
    } catch (error) {
        console.log(error);
        await utils.naturalDelay(bot);
        await msg.react('⚠️');
    }
}

module.exports.help = {
    category: "fun",
    name: "catsticker",
    aliases: ["cat"],
    args: ""
}
