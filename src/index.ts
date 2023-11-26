import Discord from "discord.js";

const client = new Discord.Client({
    intents: [],
    presence: { 
        activities: [
            {
                name: "🎧 Listening to music",
                type: Discord.ActivityType.Custom
            }
        ],
        status: "online"
    }
})

require("dotenv").config();
import { exec } from "child_process";

import postStats from "./util/postStats";

client.once("ready", async () => {
    console.log(`Logged in as: ${client.user.tag}`);

    // Refresh data on startup
    await postStats(client, Discord);

    setInterval(async () => {
        await postStats(client, Discord);
    }, 2 * 60 * 1000) // Refresh data every 2 minutes

    // Automatic Git Pull
    try {
        setInterval(() => {
            exec("git pull", (err: any, stdout: any) => {
                if(err) return console.log(err);
                if(stdout.includes("Already up to date.")) return;

                console.log(stdout);
                process.exit();
            })
        }, 30 * 1000) // 30 seconds
    } catch(err) {
        console.log(err);
    }
})

client.login(process.env.token);
