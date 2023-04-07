console.log("Copyright 2023 Danish Humair. All rights reserved.\nThis program is only for educational purposes!\n");

const fs = require("fs");
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
let config = require("./config.json");
let utils = require("./utils.js");

const client = new Client({
    authStrategy: new LocalAuth()
});

const bot = {
    commands: null,
    help: null,
    stickerQueue: [],
    loadCommands: null
}

bot.loadCommands = function() {
    bot.commands = new Map();
    fs.readdir("./commands/", (err, files) => {
        if (err) return console.log(err);
        let jsfile = files.filter(f => f.split(".").pop() == "js");
        if (jsfile.length <= 0) return console.log("No commands were discovered.");
        jsfile.forEach((f, i) => {
            delete require.cache[require.resolve(`./commands/${f}`)]
            let props = require(`./commands/${f}`);
            console.log(`[${i+1}] ${f} was discovered.`);
            bot.commands.set(props.help.name, props);
        });

        bot.help = "Commands you can use:\n\n";
        let i = 0;
        bot.commands.forEach(props => {
            let cmd = `${++i}. *${config.prefix}${props.help.name}* ${props.help.args}`.trim();     
            if (!config.enabled_commands.includes(props.help.name)) cmd = `~${cmd}~`;   
            bot.help += cmd+"\n";        
        });
        bot.help += "\n<> - required\n[] - optional";
    });
}

client.on('qr', qr => {
    console.log("Please scan the following QR code to authenticate:")
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log("[!] Client is ready!");
});

client.on('message_create', async msg => {
    if (config.whitelist.length && !config.whitelist.includes(msg.author)) return;

    if (msg.body.startsWith(config.prefix)) {
        console.log("[!] Received potential command");
        const [cmd, ...args] = msg.body.replace(config.prefix, '').split(' ');
        console.log("Command: "+cmd+"\tArgs: "+(args.length ? args.join(' ')     : "None"));

        let command = bot.commands.get(cmd);
        if (command) {
            command.run(bot, msg, args);
        }
        
        else if (cmd == "reload") {
            delete require.cache[require.resolve("./config.json")];
            delete require.cache[require.resolve("./utils.js")];
            delete require.cache[require.resolve("./ai.js")];
            config = require("./config.json");
            utils = require("./utils.js");
            await bot.loadCommands();
        }
        
        else if (cmd == "help") {
            await utils.naturalDelay();
            await msg.reply(bot.help);
        }
    }

    else if (msg.hasMedia) {
        if (msg.type == "image" && bot.stickerQueue.includes(msg.author)) {
            bot.stickerQueue.splice(bot.stickerQueue.indexOf(msg.author), 1);
            console.log("[!] Received image for sticker");
            try {
                const image = await msg.downloadMedia();
                await utils.naturalDelay();
                await msg.reply(image, null, { sendMediaAsSticker: true });
            } catch (error) {
                console.error(`Error with WhatsApp: ${error}`);
                await utils.naturalDelay();
                await msg.react('⚠️');
            }
        }
    }
});

bot.loadCommands();
client.initialize();
