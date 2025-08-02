const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, levenextxp } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('現在のレベルを確認します')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('閲覧するユーザーを選んでください')
                .setRequired(false)),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const user = interaction.options.getUser('user') || interaction.user;
            const userData = await getUserData(interaction.guildId, user.id)
            let result = levenextxp(userData.xp);
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('現在のレベル')
                .setDescription(`<@${user.id}>さん`)
                .addFields(
                    { name: '現在のレベル', value: `${String(result.level)}レベル`, inline: true },
                    { name: '現在のXP', value: `${String(userData.xp)}XP`, inline: true },
                    { name: '次のレベルになるために必要なXP', value: `${String(result.NextXP)}XP`, inline: false },
                )
                .setTimestamp()

            await interaction.reply({ content: "", embeds: [embed] });
        } catch (e) {
            throw e;
        }
    },
};