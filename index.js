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
    const sender = msg.author ? msg.author.slice(0, 12) : msg.from.slice(0, 12);
    console.log("Received message from " + sender);

    if ((config.whitelist.length && !config.whitelist.includes(sender))) return;
    if (msg.body.endsWith("🤖") && msg.fromMe) return;
    if (await msg.getChat().isGroup) return;

    const [cmd, ...args] = [msg.type, msg.id, msg.body]
    console.log(`[${msg.timestamp}] [CID:${msg.from}] [T:${msg.type}] [M:${msg.hasMedia}] ${msg.author}: ${msg.body}`);

    if (msg.body.startsWith(config.prefix)) {
        console.log("[!] Received potential command");

        const cmd_wo_prefix = cmd.slice(config.prefix.length);
        
        if (cmd_wo_prefix == "reload" && config.ops.includes(sender)) {
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

        else if (cmd_wo_prefix == "debug" && config.ops.includes(sender)) {
            bot.processCount++;
            console.log(bot);
            await utils.naturalDelay(bot);
            await msg.react('✅');
        }

        else if (cmd_wo_prefix == "stop" && config.ops.includes(sender)) {
            await utils.naturalDelay(bot);
            await msg.react('👋');
            await process.exit();
        }

        else if (("reload", "debug", "stop").includes(cmd_wo_prefix) && !config.ops.includes(sender)) {
            await utils.naturalDelay(bot);
            await msg.react('🤨');
        }

        return;
    }

    if (msg.hasMedia) {
        try {
            console.log("[!] Received media")
            bot.processCount++;
            media = await msg.downloadMedia();
            args.push(media);
        } catch (error) {
            console.error(`Error with WhatsApp: ${error}`);
            await utils.naturalDelay(bot);
            await msg.react('⚠️');
        }
    }

    let command = bot.commands.get(cmd);
    if (command) {
        bot.processCount++;
        if (config.enabled_commands.includes("*") || config.enabled_commands.includes(command.help.name)) {
            command.run(bot, msg, args);
        } else {
            await utils.naturalDelay(bot);
            await msg.react('🚫')
        }
    }
});

bot.loadCommands();
client.initialize();
