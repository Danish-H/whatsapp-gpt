const config = require("./config.json");

const randomDelay = function(min, max) {
    return Math.round(min*1000+(Math.random()*(max-min)*1000));
}

const naturalDelay = async function(bot={processCount: 0}, min=config.naturalDelay.min, max=config.naturalDelay.max) {
    return new Promise(resolve => {
        const delay = randomDelay(min, max)*bot.processCount;
        console.log(`(${bot.processCount} processes) Starting ${delay}ms delay...`);
        setTimeout(() => {
            bot.processCount--;
            console.log(`(${bot.processCount} processes) Finished ${delay}ms delay!`);
            resolve();
        }, delay);
    });
}

const price = function(usd, pkr=usd*300) {
    return `*Price:* $${usd.toFixed(2)} ≈ ₨ ${pkr.toFixed(2)}`
}

module.exports = {
    naturalDelay,
    price
}
