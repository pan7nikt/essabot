//Wersja node.js została zmieniona na 14.17.6 z 16.9.1
//https://github.com/fent/node-ytdl-core/issues/902#issuecomment-903079698
//ponieważ stream audio przerywał po jakimś czasie
//to jest tylko chwilowy workaround


//Testowo zastąpione tą biblioteką: https://github.com/amishshah/ytdl-core-discord
const ytdl = require('ytdl-core');
//const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');
//const { execute } = require('./adv');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer } = require('@discordjs/voice');
const { createAudioResource } = require('@discordjs/voice');
const { StreamType } = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');
//import { createDiscordJSAdapter } from './adapter';

module.exports = 
{
    name: 'playold',
    description: "Odtwarza film z YT",
    async execute(message, args)
    {
        const voiceChannel = message.member.voice.channel;
        console.log(voiceChannel);

        if(!voiceChannel) return message.channel.send('Musisz być na kanale głosowym');
        if(!args.length) return message.channel.send('Brak argumentów');

        //const connection = await voiceChannel.join();
        //Tworzy odtwarzacz audio
        const player = await createAudioPlayer();
        //Dołącza do kanału użytkownika
        const connection = await joinVoiceChannel({channelId: voiceChannel.id, guildId: message.guild.id, adapterCreator: message.guild.voiceAdapterCreator});
        //Subskrybuje do odtwarzacza utworzonego wcześniej
        const subscription = connection.subscribe(player);


        /*
        const resource = createAudioResource('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', {
            inputType: StreamType.Arbitrary,
        });
        player.play(resource);
        */

        //Szuka filmu o podanej nazwie i zwraca link
        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);

            //zwraca wideo jeżeli jest dłuższe niż 1, w przeciwnym wypadku zwraca null
            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
        }

        const video = await videoFinder(args.join(' '));

        if(video)
        {
            //Pobiera video
            const stream = await ytdl(video.url, {filter: 'audioonly'});

            //Tworzy odtwarzalne audioResource z podanego video (wg przykładu z github)
            const resource = await createAudioResource(stream, {
                inputType: StreamType.Arbitrary,
            });

            //player.play(resource);
            //Odtwarza podany audioResource wygenerowane wcześniej
            await player.play(resource, {seek: 0, volume: 1})

            //Catch error
            player.on('error', (error) => {
                console.error(`Error: ${error.message}`);
                console.log(error);
                player.stop();
            })

            //Przy zmianie stanu odtwarzacza
            /*
            player.on('stateChange', (oldState, newState) => {
                console.log("zmiana stanu odtwarzacza" + newState);
                if(newState == 'Idle')
                {
                    console.log("Stan Idle");
                }
            })
            */

            //po ukończeniu odtwarzania
            player.on(AudioPlayerStatus.Idle, () => {
                console.log("Odtwarzacz przeszedł w stan bezczynności");

            })
            
            /*
            .on('finish', () => {
                voiceChannel.leave();
            })
            */

            //Odpowiada na wiadomość podając nazwę filmu
            await message.reply(`teraz odtwarzane: ***${video.title}***`);
        }
        else
        {
            message.channel.send('nie znaleziono filmu');
        }
    }
}