import Discord from "discord.js";
const client = new Discord.Client({ intents: [] });

require("dotenv").config();

import postStats from "./util/postStats";

client.on("ready", () => {
    console.log(`Logged in as: ${client.user?.tag}`);

    postStats(client, Discord);
    setInterval(() => { postStats(client, Discord) }, 300000); // Update embed every 5 minutes
})

client.login(process.env.token);
