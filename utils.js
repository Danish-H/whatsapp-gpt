const config = require("./config.json");

const randomDelay = function(min, max) {
    delay = Math.round(min*1000+(Math.random()*(max-min)*1000));
    console.log(`Starting ${delay}ms delay...`);
    return delay;
}

const naturalDelay = async function(min=config.naturalDelay.min, max=config.naturalDelay.max) {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Finished ${delay}ms delay!`);
            resolve();
        }, delay=randomDelay(min, max));
    });
}

const price = function(usd, pkr=usd*300) {
    return `*Price:* $${usd.toFixed(2)} ≈ ₨ ${pkr.toFixed(2)}`
}

module.exports = {
    naturalDelay,
    price
}
