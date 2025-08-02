const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('応答します'),
    async execute(interaction) {
        try {
            await interaction.reply("測定中");
            let msg = await interaction.fetchReply();
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('Ping結果')
                .addFields(
                    { name: 'WebSocket Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
                    { name: 'API Endpoint Ping', value: `${msg.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
                )
                .setTimestamp()
            await interaction.editReply({ content: "", embeds: [embed] });
        } catch (e) {
            throw e;
        }
    },
};