const { REST, Routes } = require('discord.js');
require('dotenv').config();
const { CLIEN_ID, DISCORD_TOKEN } = process.env;
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log(`${commands.length} 個のコマンドを登録します。`);

        const data = await rest.put(
            Routes.applicationCommands(CLIEN_ID),
            { body: commands },
        );

        console.log(`${data.length} 個のコマンドを登録しました。`);
    } catch (error) {
        console.error(error);
    }
})();