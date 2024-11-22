//Wersja node.js została zmieniona na 14.17.6 z 16.9.1
//https://github.com/fent/node-ytdl-core/issues/902#issuecomment-903079698
//ponieważ stream audio przerywał po jakimś czasie
//to jest tylko chwilowy workaround
global.AbortController = require("abort-controller");
//to jest tylko chwilowy workaround /\/\/\/\

const { Client, GatewayIntentBits } = require('discord.js')
const Discord = require('discord.js');

//const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
//const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES","GUILD_MEMBERS","GUILD_BANS","GUILD_EMOJIS_AND_STICKERS","GUILD_INTEGRATIONS","GUILD_WEBHOOKS","GUILD_INVITES","GUILD_PRESENCES","GUILD_MESSAGE_REACTIONS","GUILD_MESSAGE_TYPING","DIRECT_MESSAGES","DIRECT_MESSAGE_REACTIONS","DIRECT_MESSAGE_TYPING"]});
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
    ]});

const prefix = "es";

const fs = require('fs');

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles)
{
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('essabot is ready (es)');
});

client.on('messageCreate', (msg) => {
    console.log('received a message');
    console.log(msg);

    if(!msg.content.startsWith(prefix) || msg.author.bot)
    {

        return;
    }

    console.log('received a message with a prefix');
    //Dzieli komendę zawierającą wiele argumentów i ucina prefix
    const args = msg.content.slice(prefix.length).split(' ');
    //Zmienia litery na małe i wprowadza zmienną command, gdzie dodaje wszystko, co jest po spacji
    const command = args.shift().toLowerCase();

    //msg.channel.send("essa!");

    if(command == 'test')
    {
        console.log('received a command: test');
        msg.channel.send("essa!");
    }

    if(command == 'adv')
    {
        //Wywołuje zaawansowaną komendę
        client.commands.get('adv').execute(msg, args);
    }

    if(command == 'play')
    {
        //Wywołuje zaawansowaną komendę
        client.commands.get('play').execute(msg, args);
        console.log('received a command: PLAY');
    }
    

    if(command == 'sa')
    {
        //Wywołuje zaawansowaną komendę
        client.commands.get('playold').execute(msg, args);
    }


    if(command == 'skip')
    {
        //Wywołuje zaawansowaną komendę
        client.commands.get('play').execute(msg, 'skip');
    }

    if(command == 'queue')
    {
        //Wywołuje zaawansowaną komendę
        client.commands.get('play').execute(msg, 'queue');
    }
});


client.login('');