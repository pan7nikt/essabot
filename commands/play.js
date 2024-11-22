//Wersja node.js została zmieniona na 14.17.6 z 16.9.1
//https://github.com/fent/node-ytdl-core/issues/902#issuecomment-903079698
//ponieważ stream audio przerywał po jakimś czasie
//to jest tylko chwilowy workaround


//Testowo zastąpione tą biblioteką: https://github.com/amishshah/ytdl-core-discord
//ytdl-core nie dostalo jeszcze nowej zmiany API od google, wiec zamieniamy na @distube/ytdl-core
//const ytdl = require('ytdl-core');
const ytdl = require('@distube/ytdl-core');
const playdl = require('play-dl');
const ytdlexec = require('youtube-dl-exec');
//Do playlist
//const yetpl = require('ytpl');
//const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');
//const { execute } = require('./adv');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer } = require('@discordjs/voice');
const { createAudioResource } = require('@discordjs/voice');
const { StreamType } = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');
//import { createDiscordJSAdapter } from './adapter';

const queue = new Array();
var isPlaying = false;
var player = null;

module.exports = 
{
    name: 'play',
    description: "Odtwarza film z YT",
    async execute(message, args)
    {
        if(args == 'skip')
        {
            if(isPlaying && queue[1])
            {
                playNextVideo();
            }
            else if(isPlaying)
            {
                stopVideo();
            }
            else
            {
                message.channel.send("Nie ma nic do pominięcia");
            }
        }

        if(args == 'queue')
        {
            if(queue[0])
            {
                var queueString = "```";
                queue.forEach(function(item, index, array)
                {
                    queueString = queueString + index.toString() + ". " + item.title + "\n";
                });
                var queueString = queueString + "```";
    
                message.channel.send(queueString);
            }
            else
            {
                message.channel.send("Kolejka jest pusta (ez)");
            }

        }

        const voiceChannel = message.member.voice.channel;
        console.log(voiceChannel);

        if(!voiceChannel) return message.channel.send('Musisz być na kanale głosowym');
        if(!args.length) return message.channel.send('Brak argumentów');

        if(!isPlaying)
        {
        //const connection = await voiceChannel.join();
        //Tworzy odtwarzacz audio
        player = await createAudioPlayer();
        //Dołącza do kanału użytkownika
        const connection = await joinVoiceChannel({channelId: voiceChannel.id, guildId: message.guild.id, adapterCreator: message.guild.voiceAdapterCreator});
        //Subskrybuje do odtwarzacza utworzonego wcześniej
        const subscription = connection.subscribe(player);

                //po ukończeniu odtwarzania
                player.on(AudioPlayerStatus.Idle, () => {
                    console.log("Odtwarzacz przeszedł w stan bezczynności");
                    isPlaying = false;
                    playNextVideo();
                })

                
        //Catch error
        player.on('error', (error) => {
            console.error(`Error: ${error.message}`);
            console.log(error);
            player.stop();
        })

        }




        //Szuka filmu o podanej nazwie, wstawia go do tablicy i zwraca go
        const videoFinder = async (query) => {
            console.log(query);

            //jeżeli podano link do playlisty
            /*
            if(ytpl.validateID)
            {
                message.channel.send("podano playlistę (amogus)")
            }
            */
            //jeżeli podano link:
            
            if(ytdl.validateURL(query))
            {
                //Pobiera informacje o filmie z linku
                vidInfo = await ytdl.getInfo(query);
                //Konwertuje to do postaci uzyskiwanej przez ytSearch
                vid = {title: vidInfo.videoDetails.title, url: vidInfo.videoDetails.video_url}
                //Wstawia informacje jako obiekt do tablicy
                queue.push(vid);
                return vid;
            }

            
            //Jeżeli nie podano linku, szuka filmu i pobiera link do pierwszego wyniku, następnie wstawia go do tablicy
            const videoResult = await ytSearch(query);
            console.log(videoResult.videos[0]);
            if(videoResult.videos.length > 1 && videoResult.videos[0] != null)
            {
                queue.push(videoResult.videos[0]);
                return videoResult.videos[0];
            }


        }


        //Rozpoczyna odtwarzanie
        if(args != 'skip' && args != 'queue')
        {
            const video = await videoFinder(args.join(' '));
            

            if(video)
            {
                if(!isPlaying)
                {
                    console.log("dodano do kolejki i uruchomiono odtwarzanie");
                    playVideo();
                }
                else
                {
                    message.channel.send(`Dodano do kolejki: ***${video.title}***`)
                    console.log("dodano do kolejki");
                }
            }
            else
            {
                message.channel.send('nie znaleziono filmu');
            }
        }

        async function stopVideo()
        {
            player.stop();
            //TODO clear queue
            clearQueue();
        }

        async function clearQueue()
        {
            queue.splice(0, queue.length)
        }

        async function playNextVideo()
        {
            if(queue[1])
            {
                await queue.shift();
                if(queue[0])
                {
                    console.log(queue[0].title);
                    isPlaying = true;
                    console.log("odtwarzanie następnego filmu");
                    //Tu ytdl zamienione na playdl
                    //const stream = await playdl.stream(queue[0].url, { discordPlayerCompatibility : true});
                    const stream = await ytdl(queue[0].url, {filter: 'audioonly', liveBuffer: 2000, highWaterMark: 1 << 25});
                    //const stream = await ytdl(queue[0].url, {filter: 'audioonly', quality: 'highestaudio', dlChunkSize: 0, highWaterMark: 1 << 25,});
                    /*
                    const resource = await createAudioResource(stream, {
                        inputType: stream.type
                    });
                    */
                    let resource = createAudioResource(stream.stream, {
                        inputType: stream.type
                    })
                    await player.play(resource, {seek: 0, volume: 1})
                    await message.reply(`teraz odtwarzane: ***${queue[0].title}***`);
                }
                else
                {
                    clearQueue();
                    console.log("kolejka jest pusta");
                }
            }
            else
            {
                clearQueue();
                console.log("kolejka jest pusta");
            }
        }

        async function playVideo()
        {
            isPlaying = true;
            console.log("odtwarzanie pierwszego filmu");
            //To działało dotychczas:
            //const stream = await ytdl(queue[0].url, {filter: 'audioonly', quality: 'highestaudio', dlChunkSize: 0, highWaterMark: 1 << 25,});
            const stream = await ytdl(queue[0].url, {filter: 'audioonly', liveBuffer: 2000, highWaterMark: 1 << 25});
            //To już nie:
            //const stream = await playdl.stream(queue[0].url, { discordPlayerCompatibility : true});
            
            const resource = await createAudioResource(stream, {
                inputType: stream.type,
            });
            
           /*
            const stream = ytdlexec(queue[0].url, {
                o: '-',
                q: '',
                f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                r: '100K',
              }, { stdio: ['ignore', 'pipe', 'ignore'] });
            */
            //const resource = createAudioResource(stream);
            await player.play(resource, {seek: 0, volume: 1})
            await message.reply(`teraz odtwarzane: ***${queue[0].title}***`);
        }


    }
}