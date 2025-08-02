const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserData, addCoin } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('入力したコインをプレゼントできます。1未満は選択できません。')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('プレゼントするコインを決めてください')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('プレゼントする人を決めてください')
                .setRequired(true)),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const userData = await getUserData(interaction.guildId, interaction.user.id)
            const giftcoin = interaction.options.getInteger('number')
            if (giftcoin < 1) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('不正な数字')
                    .setDescription(`1未満は選択できません`)
                    .setTimestamp()

                await interaction.reply({ content: "", embeds: [embed] });
                return;
            }
            if (userData.coin > giftcoin) {
                const giftuser = interaction.options.getUser('user')
                await addCoin(interaction.guildId, giftuser.id, giftcoin);
                await addCoin(interaction.guildId, interaction.user.id, -giftcoin);
                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('完了')
                    .setDescription(`<@${giftuser.id}>さんに${giftcoin}coinをプレゼントしました`)
                    .setTimestamp()

                await interaction.reply({ content: "", embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('コイン不足')
                    .setDescription(`コインが足りません`)
                    .setTimestamp()

                await interaction.reply({ content: "", embeds: [embed] });
            }
        } catch (e) {
            throw e;
        }
    },
};