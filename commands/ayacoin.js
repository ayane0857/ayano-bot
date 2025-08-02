const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, ayacoindata } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayacoin')
        .setDescription('現在の彩コインを確認します'),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const userData = await getUserData(interaction.guildId, interaction.user.id)
            let embed
            if (userData.ayacoin == 0) {
                const ayacoin = await ayacoindata()
                embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('現在の彩コインの価値')
                    .setDescription(`${ayacoin / 100}コイン`)
                    .setTimestamp()
            } else {
                const ayacoin = await ayacoindata()
                embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('彩コイン')
                    .setDescription(`<@${interaction.user.id}>さんのコイン\n現在${userData.ayacoin}彩コイン`)
                    .addFields(
                        { name: '現在の彩コインの価値', value: `${ayacoin / 100}コイン`, inline: true },
                        { name: '自分が保有している彩コインの価値', value: `${Math.floor(Number(userData.ayacoin) * (Number(ayacoin) / 100))}コイン`, inline: true },
                    )
                    .setTimestamp()
            }

            await interaction.reply({ content: "", embeds: [embed] });
        } catch (e) {
            throw e;
        }
    },
};