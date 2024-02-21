const config = require("./config.json");
const fs = require("fs");

const randomDelay = function(min, max) {
    return Math.round(min*1000+(Math.random()*(max-min)*1000));
}

const naturalDelay = async function(bot={processCount: 0}, min=config.naturalDelay.min, max=config.naturalDelay.max, silent=false) {
    return new Promise(resolve => {
        const delay = randomDelay(min, max)*bot.processCount;
        const process = bot.processCount;
        if (!silent) console.log(`(Process ${process}) Starting ${delay}ms delay...`);
        bot.processHistory.push([Date.now(), bot.processCount]);
        setTimeout(() => {
            if (!silent) console.log(`(Process ${process}) Finished ${delay}ms delay!`);
            bot.processCount--;
            bot.processHistory.push([Date.now(), bot.processCount]);
            if (bot.processCount < 0) bot.processCount = 0;
            resolve();
        }, delay);
    });
}

const price = function(usd, pkr=usd*300) {
    return `*Price:* $${usd.toFixed(2)} ≈ ₨ ${pkr.toFixed(2)}`
}

const bot = {
    commands: null,
    help: null,
    processCount: 0,
    processHistory: [],
    loadCommands: null,
    messagesList: new Map(),
    stickerQueue: []
}

bot.loadCommands = function() {
    bot.commands = new Map();
    fs.readdir("./types/", (err, files) => {
        if (err) return console.log(err);
        let jsfile = files.filter(f => f.split(".").pop() == "js");
        bot.help = "No commands were found!"
        if (jsfile.length <= 0) return console.log("No commands were discovered.");
        bot.help = "Commands you can use:\n\n";
        jsfile.forEach((f, i) => {
            delete require.cache[require.resolve(`./types/${f}`)]
            let props = require(`./types/${f}`);
            console.log(`[${i+1}] ${f} was discovered.`);
            bot.commands.set(props.help.name, props);
            props.help.aliases.forEach(name => bot.commands.set(name, props));
            let cmd = `${i+1}. *${config.prefix}${props.help.name}* ${props.help.args}`.trim();
            if (!config.enabled_commands.includes("*") && !config.enabled_commands.includes(props.help.name)) cmd = `~${cmd}~`;
            bot.help += cmd+"\n";
        });
        bot.help += "\n<> - required\n[] - optional";
    });
}

module.exports = {
    naturalDelay,
    price,
    bot
}
