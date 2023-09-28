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
        console.log("\n[INFO] -----------------------");
        console.log("[INFO] Fetching user data...");
        const userRes = await axios.get(userUrl); // Fetch user data
        const user = userRes.data.item; // Get user info
        console.log(`[INFO] Found user: ${user.displayName} (${user.customId})`);

        console.log("[INFO] Fetching recent streams...");
        const streamRes = await axios.get(streamsUrl); // Fetch recent streams data
        console.log(`[INFO] Found ${streamRes.data.items.length} recent streams.`);
        const streams = streamRes.data.items.slice(0, 10); // Get the 10 most recent streams
        console.log(`[INFO] Using the last ${streams.length} recent streams.`);

        const songs: string[] = [];

        console.log("[INFO] Building embed...");
        const embed = new Discord.EmbedBuilder()
            .setColor(embeds.default)
            .setAuthor({ name: user.displayName, iconURL: user.image })
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
        console.log("[INFO] Formatting streams...");
        streams.forEach((stream: any, i: number) => {
            // Get the artists for the song
            const artists: string[] = [];
            // Add each artist to the array
            stream.track.artists.forEach((artist: Artist) => {
                artists.push(`[${artist.name}](https://stats.fm/artist/${artist.id})`);
            })

            // Convert ISO 8601 timestamp to milliseconds
            const timestamp = Date.parse(stream.endTime).toString().slice(0, -3);

            songs.push(`- [**${escapeMarkdown(stream.track.name)}**](https://stats.fm/track/${stream.track.id}) by ${artists.join(", ")} (<t:${timestamp}:R>)`);
        })

        embed.setDescription(cap(songs.join("\n"), 2000));

        // Get the channel to post the message in
        const channel = client.channels.cache.get(main.channel) as TextChannel || await client.channels.fetch(main.channel) as TextChannel;

        // Fetch the last 10 messages sent by the bot
        const messages = await channel.messages.fetch({ limit: 10 });
        // Filter out any messages that weren't sent by the bot
        const botMessages = messages.filter(msg => msg.author.id === client.user.id);
        // Get the last message sent by the bot
        const message = botMessages.first();

        console.log(`[INFO] Posting stats for ${user.displayName}...`);

        if(message) {
            // Edit the original message
            message.edit({ embeds: [embed], components: [buttons] });
        } else {
            // Send a new message
            channel.send({ embeds: [embed], components: [buttons] });
        }

        console.log("[INFO] Stats posted successfully!");
        console.log("[INFO] -----------------------");
    } catch(err) {
        console.error(err);
    }
}

export type Artist = {
    id: number;
    name: string;
}
