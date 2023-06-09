console.log("Copyright 2023 Danish Humair. All rights reserved.\nThis program is only for educational purposes!\n");

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
let config = require("./config.json");
let utils = require("./utils.js");

let clientConfig = { authStrategy: new LocalAuth() };
if (config.chrome != "") clientConfig.puppeteer = { executablePath: config.chrome };

const client = new Client(clientConfig);
const bot = utils.bot;

client.on('qr', qr => {
    console.log("Please scan the following QR code to authenticate:")
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log("[!] Client is ready!");
});

client.on('message_create', async msg => {
    if ((config.whitelist.length && !config.whitelist.includes(msg.author))) return;

    if (msg.body.startsWith(config.prefix)) {
        console.log("[!] Received potential command");
        const [cmd, ...args] = msg.body.replace(config.prefix, '').split(' ');
        const sender = msg.author ? msg.author.slice(0, 12) : msg.from.slice(0, 12);
        console.log("Command: "+cmd+"\tArgs: "+(args.length ? args.join(' ')     : "None"));

        let command = bot.commands.get(cmd);
        if (command) {
            bot.processCount++;
            if (config.enabled_commands.includes("*") || config.enabled_commands.includes(command.help.name)) {
                console.log(`[${msg.timestamp}] [CID:${msg.from}] [T:${msg.type}] [M:${msg.hasMedia}] ${msg.author}: ${msg.body}`);
                command.run(bot, msg, args);
            } else {
                await utils.naturalDelay(bot);
                await msg.react('🚫')
            }
        }
        
        else if (cmd == "reload" && config.ops.includes(sender)) {
            bot.processCount = 1;
            delete require.cache[require.resolve("./config.json")];
            delete require.cache[require.resolve("./utils.js")];
            delete require.cache[require.resolve("./ai.js")];
            if (args[0] == "hard") bot.messagesList = new Map();
            config = require("./config.json");
            utils = require("./utils.js");
            await bot.loadCommands();
            await utils.naturalDelay(bot, 1, 2);
            await msg.react('✅');
        }

        else if (cmd == "debug" && config.ops.includes(sender)) {
            bot.processCount++;
            console.log(bot);
            await utils.naturalDelay(bot);
            await msg.react('✅');
        }

        else if (cmd == "stop" && config.ops.includes(sender)) {
            await utils.naturalDelay(bot);
            await msg.react('👋');
            await process.exit();
        }

        else if (("reload", "debug", "stop").includes(cmd) && !config.ops.includes(sender)) {
            await utils.naturalDelay(bot);
            await msg.react('🤨');
        }
    }

    else if (msg.hasMedia) {
        if (msg.type == "image" && bot.stickerQueue.includes(msg.author)) {
            bot.stickerQueue.splice(bot.stickerQueue.indexOf(msg.author), 1);
            console.log("[!] Received image for sticker");
            bot.processCount++;
            try {
                const image = await msg.downloadMedia();
                await utils.naturalDelay(bot);
                await msg.reply(image, null, { sendMediaAsSticker: true });
            } catch (error) {
                console.error(`Error with WhatsApp: ${error}`);
                await utils.naturalDelay(bot);
                await msg.react('⚠️');
            }
        }
    }

    else if (config.dm.enabled && !msg.fromMe && msg.body.toLowerCase().includes(config.dm.trigger.toLowerCase()) && (await msg.getChat()).isGroup) {
        let command = bot.commands.get("dm");
        bot.processCount++;
        command.run(bot, msg, msg.body.split(' '), msg.from);
    }

    else if (config.dm.enabled && !msg.fromMe && !(await msg.getChat()).isGroup) {
        let command = bot.commands.get("dm");
        bot.processCount++;
        command.run(bot, msg, msg.body.split(' '));
    }
});

bot.loadCommands();
client.initialize();
