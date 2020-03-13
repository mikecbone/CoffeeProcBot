# CoffeeProcBot
A Discord bot to organise coffee

## Discord.js

This Discord bot uses the [Discord.js](https://discord.js.org/) library. The documentation can be found [here](https://discord.js.org/#/docs/main/master/general/welcome)

## Auth
The bot requires an auth token referenced in `main.js`. This can be added by creating the file `auth.json` and adding
```json
{
    "token": "tokenGoesHere"
}
```
The token can be retrieved from the [Discord Developer Portal](https://discordapp.com/developers) as the bot token.

## Commands

This discord bot has the following commands:

- `!help` to display a list of available commands
- `!coffee` to start a coffee order with a 30 minute countdown and 2 reminders
- `!quickcoffee` to start a coffee order with a 5 minute countdown and 0 reminders

## Hosting

The bot can be hosted on a raspberry pi using [PM2](https://pm2.keymetrics.io/). PM2 is a daemon process manager for node.js which makes the hosting process simple and easy.
