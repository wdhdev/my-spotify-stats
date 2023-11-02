import Discord from "discord.js";

const client = new Discord.Client({
    intents: [],
    presence: { 
        activities: [
            {
                name: "🎵 Listening to music",
                type: Discord.ActivityType.Custom
            }
        ],
        status: "online"
    }
})

require("dotenv").config();

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

client.login(process.env.token);
