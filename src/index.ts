import Discord, { Client, Interaction } from "discord.js";
const client = new Discord.Client({ intents: [] }) as Client & ExtraVariables;

require("dotenv").config();

import { emojis as emoji, main } from "./config";
import postStats from "./util/postStats";

client.once("ready", async () => {
    console.log(`Logged in as: ${client.user.tag}`);

    // Refresh data on startup
    console.log("\n[INFO] Automatic data refresh on startup");
    await postStats(client, Discord);

    setInterval(async () => {
        console.log("\n[INFO] Automatic data refresh at 2 minute interval");
        await postStats(client, Discord);
    }, 2 * 60 * 1000) // Refresh data every 2 minutes
})

client.lastRefresh = 0;

client.on("interactionCreate", async (interaction: Interaction) => {
    // Return if the interaction is not a button
    if(!interaction.isButton()) return;
    // Return if the interaction is not from the bot owner
    if(interaction.user.id !== main.owner) {
        await interaction.reply({ content: `${emoji.cross} You do not have permission to perform this action!`, ephemeral: true });
        return;
    }

    if(interaction.customId === "refresh-data") {
        if(Date.now() - client.lastRefresh < 30 * 1000) {
            await interaction.reply({ content: `${emoji.cross} The embed can only be refreshed every 30 seconds. It can be refreshed again <t:${(client.lastRefresh + 30 * 1000).toString().slice(0, -3)}:R>.`, ephemeral: true });

            setTimeout(async () => {
                await interaction.deleteReply();
            }, 30 * 1000 - (Date.now() - client.lastRefresh));
            return;
        }

        // Reply to the interaction
        const i = await interaction.reply({ content: `${emoji.ping} Refreshing embed...`, ephemeral: true });

        // Refresh data
        console.log(`\n[INFO] Manual data refresh requested by ${interaction.user.username} (${interaction.user.id})`);
        await postStats(client, Discord);

        // Edit the message to show that the data was refreshed
        await i.edit({ content: `${emoji.tick} The embed has been refreshed.` });
        return;
    }
})

client.login(process.env.token);

export type ExtraVariables = {
    lastRefresh: number;
}
