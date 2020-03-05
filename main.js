const Discord = require('discord.js');
const token = require('./auth.json');

// Coffee order vars
let countdownIntervalFunction = null;
let countdownTimeMinutes = null;
let countdownTimeNotifyMinutes = null;
let countdownReactionMilliseconds = null;
let incomingDiscordMessage = null;
let yesReactionCount = null;
let noReactionCount = null;
let coffeeMessageStrings = [
    "Who needs coffee today?",
    "Who's up for a fresh pot?",
    "Anyone need some go juice?",
    "Cup of joe?",
    "How many for high octane brain juice?",
    "How much liquid energy today?",
    "Java? No, not the langugue!",
    "Coffee flavoured coffee?",
    "Morning breakfast fuel for anyone?",
    "How many coffeephiles are there today?",
    "Ska vi fika?",
    "Caffination time?"
];

// Initialize Discord Bot
const bot = new Discord.Client();

bot.on('ready', function (evt) {
    console.log('Connected');
    console.log(`Logged in as: ${bot.user.tag}`);
});

// On discord message
bot.on('message', message => {
    // Exit if earlier message is being processed
    if (incomingDiscordMessage !== null) {
        return;
    }
    else if (message.content === "!coffee" && message.channel.name === 'coffee') {
        incomingDiscordMessage = message;
        countdownTimeMinutes = 30;
        countdownTimeNotifyMinutes = 10;
        processCoffeeCommand();
    }
    else if (message.content === "!quickcoffee" && message.channel.name === 'coffee') {
        incomingDiscordMessage = message;
        countdownTimeMinutes = 5;
        countdownTimeNotifyMinutes = 5;
        processCoffeeCommand()
    }
    else if (message.content === "!help" && message.channel.name === 'coffee') {
        message.channel.send('Type !coffee for a 30 minute order or !quickcoffee for a 5 minute order!');
    }
});

bot.login(token.token);

// Functions
function processCoffeeCommand() {
    countdownReactionMilliseconds = minutesToMilliseconds(countdownTimeMinutes) - 2000;
    sendCoffeeMessage();
    countdownIntervalFunction = setInterval(countdownToOrder, minutesToMilliseconds(countdownTimeNotifyMinutes));
}

async function sendCoffeeMessage() {
    const coffeeMessage = coffeeMessageStrings[Math.floor(Math.random()*coffeeMessageStrings.length)];
    const sentMessage = await incomingDiscordMessage.channel.send(`${coffeeMessage} - ${countdownTimeMinutes} Minutes to Order!`);
    sentMessage.react(`⛔`);
    sentMessage.react(`✅`);

    // Count reactions at the end of the order timer
    const filter = (reaction, user) => {
        return ['⛔', '✅'].includes(reaction.emoji.name) && user.id === sentMessage.author.id;
    };
    const reactionCollecter = sentMessage.createReactionCollector(filter, {time: countdownReactionMilliseconds });
    reactionCollecter.on('end', collected => {
        yesReactionCount = collected.get('✅').count - 1;
        noReactionCount = collected.get('⛔').count - 1;
    });
}

function countdownToOrder() {
    countdownTimeMinutes -= countdownTimeNotifyMinutes;
    if (countdownTimeMinutes <= 0) {
        // Inform user and reset
        incomingDiscordMessage.channel.send(`Coffee Order Ready! That's ${yesReactionCount} coffees to go!`);
        clearInterval(countdownIntervalFunction);
        countdownTimeMinutes = null;
        incomingDiscordMessage = null;
        yesReactionCount = null;
        noReactionCount = null;
        countdownTimeNotifyMinutes = null;
    }
    else {
        incomingDiscordMessage.channel.send(`${countdownTimeMinutes} Minutes to Order!`);
    }
}

function minutesToMilliseconds(minutes) {
    return (minutes * 60 * 1000);
}
