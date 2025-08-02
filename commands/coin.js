const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('現在のコインを確認します')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('閲覧するユーザーを選んでください')
                .setRequired(false)),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const user = interaction.options.getUser('user') || interaction.user;
            const userData = await getUserData(interaction.guildId, user.id)
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('現在のコイン')
                .setDescription(`<@${user.id}>さんのコイン`)
                .addFields(
                    { name: '現在のコイン', value: `${userData.coin}コイン`, inline: true },
                    { name: '預金', value: `${userData.bankcoin}コイン`, inline: true },
                )
                .setTimestamp()

            await interaction.reply({ content: "", embeds: [embed] });
        } catch (e) {
            throw e;
        }
    },
};