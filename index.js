const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

console.log("Bot Starting...");

// Start bank update tasks (cron schedule + exchange simulator)
try {
    require(path.join(__dirname, 'bankupdate'));
} catch (err) {
    console.error('[ERROR] Failed to start bankupdate module:', err);
}

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const dirsToProcess = [eventsPath];

while (dirsToProcess.length > 0) {
    const currentDir = dirsToProcess.shift();
    const files = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(currentDir, file.name);

        if (file.isDirectory()) {
            // サブディレクトリをキューに追加
            dirsToProcess.push(filePath);
        } else if (file.name.endsWith('.js')) {
            // イベントファイルを読み込む
            const event = require(filePath);

            // clientかinteractionsかを判定（パスから自動判定）
            const target = filePath.includes('interactions') ? client : client;

            if (event.once) {
                target.once(event.name, (...args) => event.execute(...args));
            } else {
                target.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
}

client.login(token);