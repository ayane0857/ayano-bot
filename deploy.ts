import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();
const CLIEN_ID = process.env.CLIEN_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!CLIEN_ID || !DISCORD_TOKEN) {
    throw new Error('Required environment variables are not set');
}

const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'));

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
        ) as { length: number };

        console.log(`${data.length} 個のコマンドを登録しました。`);
    } catch (error) {
        console.error(error);
    }
})();