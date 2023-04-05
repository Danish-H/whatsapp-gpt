console.log("Copyright 2023 Danish Humair. All rights reserved.");

const config = require("./config.json");
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { Configuration, OpenAIApi } = require("openai");

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

const configuration = new Configuration({
    organization: config.OPENAI_ORG,
    apiKey: config.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

client.on('message_create', async msg => {
    if (!config.whitelist.length || config.whitelist.includes(msg.from)) {
        console.log(`[${msg.timestamp}] [CID:${msg.from}] [T:${msg.type}] [M:${msg.hasMedia}] ${msg.author}: ${msg.body}`);

        if (config.enabled_triggers.includes("fire") && msg.body.toLowerCase().includes("fire")) {
            console.log("Reacting with fire emoji...");
            await msg.react("🔥");
        }

        if (msg.body.startsWith(config.prefix)) {
            const [cmd, ...args] = msg.body.replace(config.prefix, '').split(" ");
            
            console.log("Command: "+cmd);
            console.log("Args:"+args);

            if (cmd == "help" && config.enabled_commands.includes("help")) {
                let response = "Commands you can use:\n\n";
                let count = 0;

                if (config.enabled_commands.includes("gpt3"))    { count++; response += `${count}. *${config.prefix}gpt3* <prompt>\n`; }
                if (config.enabled_commands.includes("gpt4"))    { count++; response += `${count}. *${config.prefix}gpt4* <prompt>\n`; }
                if (config.enabled_commands.includes("dalle"))   { count++; response += `${count}. *${config.prefix}dalle* [256|512|1024] <prompt>\n`; }
                if (config.enabled_commands.includes("sticker")) { count++; response += `${count}. *${config.prefix}sticker* <prompt>\n`; }
                response += "\n<> - required\n[] - optional";

                await msg.reply(response);
            } else if (cmd == "gpt3" && config.enabled_commands.includes("gpt3")) {
                const gptMessages = [
                    { role: "system", content: config.initial_prompt },
                    { role: "user", content: args.join(' ') }
                ];
                
                try {
                    const cmpl = await openai.createChatCompletion({
                        model: "gpt-3.5-turbo",
                        messages: gptMessages
                    });
                    await msg.reply(`*Price:* $${(cmpl.data.usage.total_tokens*0.002/1000).toFixed(2)} ≈ ₨ ${(cmpl.data.usage.total_tokens*0.002*300/1000).toFixed(2)}\n${cmpl.data.choices[0].message.content}`);
                } catch(error) {
                    if (error.response) {
                        console.error(error.response.status, error.response.data);
                    } else {
                        console.error(`Error with OpenAI API request: ${error.message}`);
                    }
                    await msg.reply(config.error);
                }
            } else if (cmd == "gpt4" && config.enabled_commands.includes("gpt4")) {
                const gptMessages = [
                    { role: "system", content: config.initial_prompt },
                    { role: "user", content: args.join(' ') }
                ];
                
                try {
                    const cmpl = await openai.createChatCompletion({
                        model: "gpt-4",
                        messages: gptMessages
                    });
                    await msg.reply(`*Price:* $${(cmpl.data.usage.total_tokens*0.002/1000).toFixed(2)} ≈ ₨ ${(cmpl.data.usage.total_tokens*0.002*300/1000).toFixed(2)}\n${cmpl.data.choices[0].message.content}`);
                } catch(error) {
                    if (error.response) {
                        console.error(error.response.status, error.response.data);
                    } else {
                        console.error(`Error with OpenAI API request: ${error.message}`);
                    }
                    await msg.reply(config.error);
                }
            } else if (cmd == "dalle" && config.enabled_commands.includes("dalle")) {
                let dallePrompt = args.join(' ');
                let dalleSize = "256x256";
                let price = "$0.016 ~ Rs 5";
                
                if (args[0] == "256") {
                    args.slice(1);
                    dallePrompt = args.join(' ');
                } else if (args[0] == "512") {
                    args.slice(1);
                    dallePrompt = args.join(' ');
                    dalleSize = "512x512";
                    price = "$0.018 ~ Rs 5.5";
                } else if (args[0] == "1024") {
                    args.slice(1);
                    dallePrompt = args.join(' ');
                    dalleSize = "1024x1024";
                    price = "$0.02 ~ Rs 6";
                }

                try {
                    const response = await openai.createImage({
                        prompt: dallePrompt,
                        n: 1,
                        size: dalleSize,
                    });
                    
                    const image_url = response.data.data[0].url
                    console.log(image_url)
                    const image = await MessageMedia.fromUrl(image_url);

                    await msg.reply(image, null, { caption: `*Price:* ${price}\n${dallePrompt}` });
                } catch(error) {
                    if (error.response) {
                        console.error(error.response.status, error.response.data);
                    } else {
                        console.error(`Error with OpenAI API request: ${error.message}`);
                    }
                    await msg.reply(config.error);
                }
            } else if (cmd == "sticker" && config.enabled_commands.includes("sticker")) {
                const dallePrompt = args.join(' ');

                try {
                    const response = await openai.createImage({
                        prompt: dallePrompt,
                        n: 1,
                        size: "256x256",
                    });

                    let image_url = response.data.data[0].url;
                    console.log(image_url)
                    const image = await MessageMedia.fromUrl(image_url);

                    await msg.reply(`*Price:* $0.016 ≈ ₨ 5\n${dallePrompt}`);
                    await client.sendMessage(msg.from, image, { sendMediaAsSticker: true });
                } catch(error) {
                    if (error.response) {
                        console.error(error.response.status, error.response.data);
                    } else {
                        console.error(`Error with OpenAI API request: ${error.message}`);
                    }
                    await msg.reply(config.error);
                }
            }
        }
    }
});
