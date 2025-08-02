const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('developer-only ver:1.0.21'),
    async execute(interaction) {
        try {
            interaction.reply({
                content: 'アップデートは完了しています',
                ephemeral: true
            });
        } catch (e) {
            throw e
        }
    },
};