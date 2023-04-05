console.log("Copyright 2023 Danish Humair. All rights reserved.");

const config = require("./config.json");
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

function randomDelay(min, max) {
    return Math.round(min*1000 + (Math.random()*(max-min)*1000))
}

client.on('qr', qr => {
    console.log("Please scan the following QR code to authenticate:")
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log("(!) Client is ready!");
});

client.initialize();

client.on('message', async msg => {
    console.log(`[${msg.timestamp}] [CID:${msg.from}] [T:${msg.type}] [M:${msg.hasMedia}] ${msg.author}: ${msg.body}`);

    if (config.enabled_triggers.includes("fire") && msg.body.toLowerCase().includes("fire")) {
        console.log("Reacting with fire emoji...");
        await msg.react("🔥");
    }

    // if (msg.body.startsWith(config.prefix)) {
    // }
});
