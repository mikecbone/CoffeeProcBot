const Discord = require('discord.js');
const token = require('./auth.json');

// Coffee order vars
let countdownIntervalFunction = null;
let scrumTimeoutFunction = null;
let timerTimeoutFunction = null;
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
let magicCodeBallStrings = [
    "You should Google it.",
    "Error 404: Not Found.",
    "It's a feature, not a bug.",
    "Try asking a rubber duck.",
    "It works on my machine!",
    "Sudo it!",
    "Syntax error.",
    "Have you tried turning it off and on again?",
    "Check stack overflow!",
    "It's the newest team members fault.",
    "Maybe leave this alone, you'll only make it worse.."
];

// Initialize Discord Bot
const bot = new Discord.Client();

bot.on('ready', function (evt) {
    console.log('Connected');
    console.log(`Logged in as: ${bot.user.tag}`);
});

// On discord message
bot.on('message', message => {
    // Help message
    if (message.content === "!help") {
        console.log(`!help`);
        message.channel.send(`
            Available commands:
            - "!coffee" for a 30 minute order in a "Coffee" channel.
            - "!quickcoffee" for a 5 minute order in a "Coffee" channel.
            - "!timer X" for an X minute timer countdown.
            - "!schedscrum" to setup a daily scrum reminder, in the current channel, at the time of the command.
            - "!clearscrum" to clear the daily scrum reminder.
            - "!mcb" for a magic code ball response in a "MagicCodeBall" channel.
        `);
    }
    // Coffee order
    else if (message.content === "!coffee" && message.channel.name === 'coffee' && incomingDiscordMessage == null) {
        console.log(`!coffee`);
        incomingDiscordMessage = message;
        countdownTimeMinutes = 30;
        countdownTimeNotifyMinutes = 10;
        processCoffeeCommand();
    }
    // Quick coffee order
    else if (message.content === "!quickcoffee" && message.channel.name === 'coffee' && incomingDiscordMessage == null) {
        console.log(`!quickcoffee`);
        incomingDiscordMessage = message;
        countdownTimeMinutes = 5;
        countdownTimeNotifyMinutes = 5;
        processCoffeeCommand()
    }
    // Magic code ball response
    else if (message.content.startsWith("!mcb") && message.channel.name === 'magiccodeball') {
        console.log(`!mcb`);
        processMcbCommand(message);
    }
    // Setup countdown timer
    else if (message.content.startsWith("!timer")) {
        console.log(`!timer`);
        const mins = parseInt(message.content.substring(7));
        if (isNaN(mins)) { 
            return; 
        }
        processTimerCommand(message, mins);
    }
    // Setup scrum scedular
    else if (message.content.startsWith("!schedscrum")) {
        console.log(`!schedscrum`);
        processScrumCommand(message);
    }
    // Setup scrum scedular
    else if (message.content.startsWith("!clearscrum")) {
        console.log(`!clearscrum`);
        processClearScrumCommand(message);
    }
});

bot.login(token.token);

// Functions
function processCoffeeCommand() {
    countdownReactionMilliseconds = minutesToMilliseconds(countdownTimeMinutes) - 2000;
    sendCoffeeMessage();
    countdownIntervalFunction = setInterval(countdownToOrder, minutesToMilliseconds(countdownTimeNotifyMinutes));
}

function processMcbCommand(message) {
    const mcbMessage = magicCodeBallStrings[Math.floor(Math.random()*magicCodeBallStrings.length)];
    message.channel.send(`${mcbMessage}`);
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

function processScrumCommand(message) {
    clearTimeout(scrumTimeoutFunction);
    message.channel.send(scrumMessage());
    scrumTimeoutFunction = setTimeout(processScrumCommand, 86400000, message);
}

function scrumMessage() {
    const date = new Date();
    let dd = date.getDay();
    let mm = date.getMonth() + 1;
    const yyyy = date.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }

    return `**Scrum ${dd}/${mm}/${yyyy}**`;
}

function processClearScrumCommand(message) {
    if (scrumTimeoutFunction) {
        clearTimeout(scrumTimeoutFunction);
        scrumTimeoutFunction = null;
        message.channel.send('Scrum schedule cleared');
    } 
    else {
        message.channel.send('No active scrum schedule found');
    }
}

function processTimerCommand(message, mins) {
    clearTimeout(timerTimeoutFunction);
    message.channel.send(`Timer set for ${mins} minutes`);
    const milliseconds = minutesToMilliseconds(mins);
    timerTimeoutFunction = setTimeout(() => {
        message.channel.send('Timer finished!');
    }, milliseconds);
}