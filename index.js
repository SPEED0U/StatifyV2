const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const config = require('./config.json');
const commands = [];
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const mysql = require('mysql');

let sql;

function connectDatabase() {
    if (!sql) {
        sql = mysql.createConnection(config.sql);
        sql.connect(err => {
            if (!err) {
                console.log(`[SQL] Succesfully connected to ${config.sql.database} database with the user ${config.sql.user}.`);
            } else {
                console.log('[SQL] Error while trying to connect to ${config.sql.database} database with the user ${config.sql.user}.');
            }
        })

        sql.on('error', function (err) {
            console.log('db error', err);
            if (err.code === 'ECONNRESET') {
                sql = null
                connectDatabase()
            } else {
                throw err;
            }
        });
    }
    return sql;
}

global["con"] = connectDatabase()

client.commands = new Collection();

const eventsPath = path.join(__dirname, 'events');
const commandsPath = path.join(__dirname, 'commands');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.bot.token);

(async () => {
    try {
        console.log(`[API] Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationGuildCommands(config.bot.clientId, config.bot.serverId),
            { body: commands },
        );

        console.log(`[API] Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.login(config.bot.token)