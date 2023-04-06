console.log("Copyright 2023 Danish Humair. All rights reserved.\nThis program is only for educational purposes!\n");

const config = require("./config.json");
const qrcode = require('qrcode-terminal');
const sharp = require('sharp');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { Configuration, OpenAIApi } = require("openai");

const client = new Client({
    authStrategy: new LocalAuth()
});

function randomnaturalDelay(min, max) {
    currentProcesses++;
    delay = Math.round(min*1000 + (Math.random()*(max-min+currentProcesses)*1000));
    console.log('Delaying for '+delay+'ms...');
    return delay;
}

function naturalDelay() {
    return new Promise(resolve => {
        setTimeout(() => {
            currentProcesses--;
            resolve();
        }, delay=randomnaturalDelay(config.naturalDelay.min, config.naturalDelay.max))
    })
}

function msgLog(msg, out="") {
    if (out != "") { console.log(out); }
    console.log(`[${msg.timestamp}] [CID:${msg.from}] [T:${msg.type}] [M:${msg.hasMedia}] ${msg.author}: ${msg.body}`);
    console.log("Current processes: "+currentProcesses);
}

client.on('qr', qr => {
    console.log("Please scan the following QR code to authenticate:")
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log(`\n(!) Client is ready!\nPrefix: ${config.prefix}\nEnabled triggers: ${config.enabled_triggers}\nEnabled commands: ${config.enabled_commands}\nWhitelist: ${config.whitelist}\nError: ${config.error}\nInitial prompt: ${config.initial_prompt}\n`);
});

const configuration = new Configuration({
    organization: config.OPENAI_ORG,
    apiKey: config.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let stickerQueue = [];
let authorsQueue = [];
let messagesQueue = [];
let currentProcesses = 0;

client.on('message_create', async msg => {
    if (!config.whitelist.length || config.whitelist.includes(msg.from)) {
        if (config.enabled_triggers.includes("fire") && msg.body.toLowerCase().includes("fire")) {
            console.log("[!] Reacting with fire emoji...");
            await naturalDelay();
            await msg.react("🔥");
        }

        if (msg.hasMedia && msg.type == "image") {
            if (stickerQueue.includes(msg.author)) {
                msgLog(msg, "[!] Received image for sticker");
                stickerQueue.splice(stickerQueue.indexOf(msg.author), 1);
                const image = await msg.downloadMedia();
                await naturalDelay();
                await msg.reply(image, null, { sendMediaAsSticker: true });
            }
        }

        if (msg.body.startsWith(config.prefix)) {
            msgLog(msg, "[!] Received potential command");
            const [cmd, ...args] = msg.body.replace(config.prefix, '').split(" ");
            console.log("Command: "+cmd+"\tArgs: "+args.join(' '));

            if (cmd == "help" && config.enabled_commands.includes("help")) {
                let response = "Commands you can use:\n\n";
                let count = 0;

                if (config.enabled_commands.includes("gpt3"))    { count++; response += `${count}. *${config.prefix}gpt3* <prompt>\n`; }
                if (config.enabled_commands.includes("gpt4"))    { count++; response += `${count}. *${config.prefix}gpt4* <prompt>\n`; }
                if (config.enabled_commands.includes("reply"))   { count++; response += `${count}. *${config.prefix}reply* <prompt>\n`; }
                if (config.enabled_commands.includes("clear"))   { count++; response += `${count}. *${config.prefix}clear*\n`; }
                if (config.enabled_commands.includes("dalle"))   { count++; response += `${count}. *${config.prefix}dalle* [256|512|1024] <prompt>\n`; }
                if (config.enabled_commands.includes("sticker")) { count++; response += `${count}. *${config.prefix}sticker* [prompt]\n`; }
                response += "\n<> - required\n[] - optional";

                await naturalDelay();
                await msg.reply(response);
            }

            else if (cmd == "ping" && (config.enabled_commands.includes("ping") || config.ops.includes(msg.author))) {
                console.log("[!] Starting delay check");
                console.log("<request>")
                await naturalDelay();
                await console.log("<response>");
            }

            else if (cmd == "summarize") {
                try {
                    if (msg.hasQuotedMsg) {
                        console.log("Quote detected!");
                        const quote = await msg.getQuotedMessage();
                        if (quote.type == "chat") {
                            let gptMessages = [
                                { role: "system", content: config.initial_prompt },
                                { role: "user", content: `Summarize the following text into a few paragraphs at most, and make sure that the summary is actually smaller than the provided text:\n${quote.body}` }
                            ];
                            
                            try {
                                const cmpl = await openai.createChatCompletion({
                                    model: "gpt-3.5-turbo",
                                    messages: gptMessages
                                });
            
                                authorsQueue.push(msg.author);
                                gptMessages.push(cmpl.data.choices[0].message);
                                messagesQueue.push(gptMessages);
                                await naturalDelay();
                                await msg.reply(`*Price:* $${(cmpl.data.usage.total_tokens*0.002/1000).toFixed(2)} ≈ ₨ ${(cmpl.data.usage.total_tokens*0.002*300/1000).toFixed(2)}\n${cmpl.data.choices[0].message.content}`);
                            } catch(error) {
                                if (error.response) {
                                    console.error(error.response.status, error.response.data);
                                } else {
                                    console.error(`Error with OpenAI API request: ${error.message}`);
                                }
                                await naturalDelay();
                                await msg.reply(config.error);
                            }
                        } else {
                            await naturalDelay();
                            await msg.reply("That message doesn't contain any text! Please use *!help* for more information.")
                        }
                    }
                } catch(error) {
                    console.log(error);
                }
            }
            
            else if (cmd == "gpt3" && config.enabled_commands.includes("gpt3")) {
                let gptMessages = [
                    { role: "system", content: config.initial_prompt },
                    { role: "user", content: args.join(' ') }
                ];

                if (authorsQueue.includes(msg.author)) {
                    messagesQueue.splice(authorsQueue.indexOf(msg.author), 1);
                    authorsQueue.splice(authorsQueue.indexOf(msg.author), 1);
                }
                
                try {
                    const cmpl = await openai.createChatCompletion({
                        model: "gpt-3.5-turbo",
                        messages: gptMessages
                    });

                    authorsQueue.push(msg.author);
                    gptMessages.push(cmpl.data.choices[0].message);
                    messagesQueue.push(gptMessages);
                    await naturalDelay();
                    await msg.reply(`*Price:* $${(cmpl.data.usage.total_tokens*0.002/1000).toFixed(2)} ≈ ₨ ${(cmpl.data.usage.total_tokens*0.002*300/1000).toFixed(2)}\n${cmpl.data.choices[0].message.content}`);
                } catch(error) {
                    if (error.response) {
                        console.error(error.response.status, error.response.data);
                    } else {
                        console.error(`Error with OpenAI API request: ${error.message}`);
                    }
                    await naturalDelay();
                    await msg.reply(config.error);
                }
            }
            
            else if (cmd == "gpt4" && config.enabled_commands.includes("gpt4")) {
                let gptMessages = [
                    { role: "system", content: config.initial_prompt },
                    { role: "user", content: args.join(' ') }
                ];

                if (authorsQueue.includes(msg.author)) {
                    messagesQueue.splice(authorsQueue.indexOf(msg.author), 1);
                    authorsQueue.splice(authorsQueue.indexOf(msg.author), 1);
                }
                
                try {
                    const cmpl = await openai.createChatCompletion({
                        model: "gpt-4",
                        messages: gptMessages
                    });

                    authorsQueue.push(msg.author);
                    gptMessages.push(cmpl.data.choices[0].message);
                    messagesQueue.push(gptMessages);
                    await naturalDelay();
                    await msg.reply(`*Price:* $${(cmpl.data.usage.total_tokens*0.002/1000).toFixed(2)} ≈ ₨ ${(cmpl.data.usage.total_tokens*0.002*300/1000).toFixed(2)}\n${cmpl.data.choices[0].message.content}`);
                } catch(error) {
                    if (error.response) {
                        console.error(error.response.status, error.response.data);
                    } else {
                        console.error(`Error with OpenAI API request: ${error.message}`);
                    }
                    await naturalDelay();
                    await msg.reply(config.error);
                }
            }

            else if (cmd == "reply" && config.enabled_commands.includes("reply")) {
                if (authorsQueue.includes(msg.author)) {
                    let gptMessages = messagesQueue[authorsQueue.indexOf(msg.author)];
                    gptMessages.push({ role: "user", content: args.join(' ') })
                    
                    try {
                        const cmpl = await openai.createChatCompletion({
                            model: "gpt-3.5-turbo",
                            messages: gptMessages
                        });
    
                        gptMessages.push(cmpl.data.choices[0].message);
                        messagesQueue[authorsQueue.indexOf(msg.author)] = gptMessages;
                        await naturalDelay();
                        await msg.reply(`*Price:* $${(cmpl.data.usage.total_tokens*0.002/1000).toFixed(2)} ≈ ₨ ${(cmpl.data.usage.total_tokens*0.002*300/1000).toFixed(2)}\n${cmpl.data.choices[0].message.content}`);
                    } catch(error) {
                        if (error.response) {
                            console.error(error.response.status, error.response.data);
                        } else {
                            console.error(`Error with OpenAI API request: ${error.message}`);
                        }
                        await naturalDelay();
                        await msg.reply(config.error);
                    }
                } else {
                    await msg.reply("Please use *!gpt3 <prompt>* or *!gpt4 <prompt>* to start a conversation first")
                }
            }

            else if (cmd == "clear" && config.enabled_commands.includes("reply")) {
                if (authorsQueue.includes(msg.author)) {
                    messagesQueue.splice(authorsQueue.indexOf(msg.author), 1);
                    authorsQueue.splice(authorsQueue.indexOf(msg.author), 1);
                }
                await naturalDelay();
                await msg.reply("Cleared chat history!")
            }
            
            else if (cmd == "dalle" && config.enabled_commands.includes("dalle")) {
                let dallePrompt = args.join(' ');
                let dalleSize = "256x256";
                let price = "$0.016 ≈ Rs 5";
                
                if (args[0] == "256") {
                    args.shift();
                    dallePrompt = args.join(' ');
                } else if (args[0] == "512") {
                    args.shift();
                    dallePrompt = args.join(' ');
                    dalleSize = "512x512";
                    price = "$0.018 ≈ Rs 5.5";
                } else if (args[0] == "1024") {
                    args.shift();
                    dallePrompt = args.join(' ');
                    dalleSize = "1024x1024";
                    price = "$0.02 ≈ Rs 6";
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

                    await naturalDelay();
                    await msg.reply(image, null, { caption: `*Price:* ${price}\n${dallePrompt}` });
                } catch(error) {
                    if (error.response) {
                        console.error(error.response.status, error.response.data);
                    } else {
                        console.error(`Error with OpenAI API request: ${error.message}`);
                    }
                    await naturalDelay();
                    await msg.reply(config.error);
                }
            }
            
            else if (cmd == "sticker" && config.enabled_commands.includes("sticker")) {
                if (args.length) {
                    if (stickerQueue.includes(msg.author)) {
                        stickerQueue.splice(stickerQueue.indexOf(msg.author), 1)
                    }

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

                        await naturalDelay();
                        await msg.reply(`*Price:* $0.016 ≈ ₨ 5\n${dallePrompt}`);
                        await client.sendMessage(msg.from, image, { sendMediaAsSticker: true });
                    } catch(error) {
                        if (error.response) {
                            console.error(error.response.status, error.response.data);
                        } else {
                            console.error(`Error with OpenAI API request: ${error.message}`);
                        }
                        await naturalDelay();
                        await msg.reply(config.error);
                    }
                } else if (msg.hasQuotedMsg) {
                    console.log("Quote detected!");
                    const quote = await msg.getQuotedMessage();
                    if (quote.hasMedia && quote.type == "image") {
                        console.log("Image detected!");
                        const image = await quote.downloadMedia();
                        await naturalDelay();
                        await msg.reply(image, null, { sendMediaAsSticker: true });
                    } else {
                        await naturalDelay();
                        await msg.reply("That message doesn't contain an image! Please use *!help* for more information.")
                    }
                } else {
                    if (!stickerQueue.includes(msg.author)) {
                        stickerQueue.push(msg.author);
                    }
                    
                    await naturalDelay();
                    await msg.reply(`Send an image now to turn it into a sticker, otherwise use *${config.prefix}sticker <prompt>* to generate one`);
                }

            }

            else if (cmd == "qsticker") {
                try {
                    if (msg.hasQuotedMsg) {
                        const quote = await msg.getQuotedMessage();
                        if (quote.hasMedia && quote.type == "image") {
                            let image = await quote.downloadMedia();
                            let imgBuffer = await Buffer.from(image.data, 'base64');
                            let img = await sharp(imgBuffer);
                            let metadata = await img.metadata()

                            sz = Math.max(metadata.width, metadata.height);
                            w = Math.floor(sz/2)
                            h = Math.floor(sz/2)

                            const imgA = await sharp(imgBuffer).resize(sz, sz, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0.0 }});
                            const imgB = await sharp(imgBuffer).resize(sz, sz, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0.0 }});
                            const imgC = await sharp(imgBuffer).resize(sz, sz, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0.0 }});
                            const imgD = await sharp(imgBuffer).resize(sz, sz, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0.0 }});

                            img1 = await imgA.extract({left: 0, top: 0, width: w, height: h}).toBuffer();
                            img2 = await imgB.extract({left: w, top: 0, width: w, height: h}).toBuffer();
                            img3 = await imgC.extract({left: 0, top: h, width: w, height: h}).toBuffer();
                            img4 = await imgD.extract({left: w, top: h, width: w, height: h}).toBuffer();

                            await naturalDelay();
                            await naturalDelay();

                            image = await new MessageMedia('image/png', img1.toString('base64'));
                            await client.sendMessage(msg.from, image, { sendMediaAsSticker: true });
                            image = await new MessageMedia('image/png', img2.toString('base64'));
                            await client.sendMessage(msg.from, image, { sendMediaAsSticker: true });
                            image = await new MessageMedia('image/png', img3.toString('base64'));
                            await client.sendMessage(msg.from, image, { sendMediaAsSticker: true });
                            image = await new MessageMedia('image/png', img4.toString('base64'));
                            await client.sendMessage(msg.from, image, { sendMediaAsSticker: true });
                        } else {
                            await naturalDelay();
                            await msg.reply("That message doesn't contain an image! Please use *!help* for more information.")
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
});

client.initialize();
