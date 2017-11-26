const Discord = require("discord.js");
const Binance = new Discord.Client();
const config  = require('./config.json');
const getPairs = require('./getpairs.js');
let channel;
let lastPairs = [];

function isDuplicateArray(array1, array2) {
    if(array1.length != array2.length) return false;
    for (i = 0 ; i < array1.length ; i++) {
        if (!array2.includes(array1[i])) return false;
    }
    return true;
}

Binance.on('ready', () => {
    channel = Binance.guilds.get(config.discord.server).channels.get(config.discord.channel);
    check();
    setInterval(check, config.runningInterval);
})



Binance.login(config.discord.token);

function check() {
    channel.startTyping();
    getPairs().then((item) => {
        if (isDuplicateArray(item.pairs, lastPairs))
            return;
        channel.send(`The time is **${item.time}**, and the following pairs may be tradeable:\n\`\`\`${item.pairs.join("\n")}\`\`\``);
        lastPairs = item.pairs;
    });
    channel.stopTyping();
};
