var player = require('./play.js');

module.exports = 
{
    name: 'skip',
    description: "test zaawansowanych komend",
    execute(message, args)
    {
        message.channel.send('essa byku');
        player.playNext();
    }
}