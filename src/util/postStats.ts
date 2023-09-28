import { Client, TextChannel } from "discord.js";

import axios from "axios";
import cap from "./cap";
import { embeds, emojis as emoji, main } from "../config";
import escapeMarkdown from "../functions/escapeMarkdown";
import humaniseTime from "../functions/humaniseTime";

const userUrl = `https://api.stats.fm/api/v1/users/${main.spotifyId}`;
const streamsUrl = `https://api.stats.fm/api/v1/users/${main.spotifyId}/streams/recent`;

export default async function (client: Client, Discord: any) {
    try {
        const userRes = await axios.get(userUrl); // Fetch user data
        const res = await axios.get(streamsUrl); // Fetch recent streams data

        const user = userRes.data.item; // Get user info
        const streams = res.data.items.slice(0, 10); // Get the 10 most recent streams 

        const songs: string[] = [];

        const embed = new Discord.EmbedBuilder()
            .setColor(embeds.default)
            .setAuthor({ name: user.displayName, iconURL: user.image, url: `https://stats.fm/${user.customId}` })
            .setTitle("Recently Played Songs")
            .setTimestamp()

        const buttons = new Discord.ActionRowBuilder()
            .addComponents (
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setEmoji(emoji.spotify)
                    .setLabel("Spotify")
                    .setURL(`https://open.spotify.com/user/${user.id}`),

                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setEmoji(emoji.statsfm)
                    .setLabel("stats.fm")
                    .setURL(`https://stats.fm/${user.customId}`)
            )

        // Add each song to the array
        streams.forEach((stream: any, i: number) => {
            songs.push(`- [${escapeMarkdown(stream.track.name)}](https://stats.fm/track/${stream.track.id}) (${humaniseTime(stream.durationMs)})`);
        })

        embed.setDescription(cap(songs.join("\n"), 2000));

        const channel = client.channels.cache.get(main.channel) as TextChannel;

        if(!channel) throw new Error("Channel not found");

        // Fetch the last 10 messages sent by the bot
        const messages = await channel.messages.fetch({ limit: 10 });
        // Filter out any messages that weren't sent by the bot
        const botMessages = messages.filter(msg => msg.author.id === client.user.id);
        // Get the last message sent by the bot
        const message = botMessages.first();

        if(message) {
            // Edit the original message
            message.edit({ embeds: [embed], components: [buttons] });
        } else {
            // Send a new message
            channel.send({ embeds: [embed], components: [buttons] });
        }
    } catch(err) {
        console.error(err);
    }
}
