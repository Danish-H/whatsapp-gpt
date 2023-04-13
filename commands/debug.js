const config = require("../config.json");
const utils = require("../utils.js");
const { MessageMedia } = require('whatsapp-web.js');
const { createCanvas } = require('canvas');


module.exports.run = async (bot, msg, args) => {
    console.log(msg.links);
    try {
        console.log(config);

        const text = `[${Date.now()}]
git@github.com:Danish-H/whatsapp-gpt.git
Current processes: ${bot.processCount-1}
Total processes: ${bot.processHistory-2}
Bot config: printed in console
Enabled commands: ${config.enabled_commands.length}
Message history: ${bot.messagesList.size}`;

        const lines = text.split('\n');
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'green';
        ctx.font = '18px Consolas';
        const lineHeight = 20;
        let yOffset = 40;
        ctx.strokeStyle = 'green'
        ctx.lineWidth = 2;

        lines.forEach((line) => {
            ctx.fillText(line, 20, yOffset);
            yOffset += lineHeight;
        });

        const vals = bot.processHistory.map(e => e[1])
        const xAxisY = 500;
        const yAxisX = 20;

        const yMin = 0;
        const yMax = Math.max.apply(null, vals);
        const xMin = bot.processHistory[0][0];
        const xMax = bot.processHistory.slice(-1)[0][0];
        const xScale = (760) / (xMax - xMin);
        const yScale = (300) / (yMax - yMin);

        ctx.beginPath();
        ctx.moveTo(yAxisX, 200);
        ctx.lineTo(yAxisX, xAxisY);
        ctx.lineTo(800 - 20, xAxisY);
        ctx.stroke();

        ctx.beginPath();
        bot.processHistory.forEach(([time, pc], index) => {
            const xPosition = yAxisX + (time - xMin) * xScale;
            const yPosition = xAxisY - (pc   - yMin) * yScale;
            if(index === 0) ctx.moveTo(xPosition, yPosition);
            else ctx.lineTo(xPosition, yPosition);
        });
        ctx.stroke();

        const base64Image = canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '');
        await msg.reply(new MessageMedia('image/png', base64Image));
    }
    
    catch (error) {
        console.log(error);
        await utils.naturalDelay(bot);
        await msg.react('⚠️');
    }
}

module.exports.help = {
    category: "tools",
    name: "debug",
    aliases: [],
    args: ""
}
