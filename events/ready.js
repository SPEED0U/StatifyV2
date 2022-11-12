const { Events } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        global["bot"] = client
        const scriptsPath = path.join(__dirname, '../scripts');
        const scriptsFiles = fs.readdirSync(scriptsPath).filter(file => file.endsWith('.js'));
        for (const file of scriptsFiles) {
            require(`../scripts/${file}`);
            console.log(`[BOT] Started executing ${scriptsFiles.length} scripts.`);
        }
        console.log(`[BOT] I'm ready to rumble, connected as ${client.user.tag}.`);
    },
};