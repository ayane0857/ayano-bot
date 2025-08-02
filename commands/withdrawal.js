const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, addCoin, addBank } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdrawal')
        .setDescription('銀行から出金')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('出金するコインを決めてください')
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
            if (userData.bankcoin >= giftcoin) {
                await addBank(interaction.guildId, interaction.user.id, -giftcoin);
                await addCoin(interaction.guildId, interaction.user.id, giftcoin);
                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('完了')
                    .setDescription(`${giftcoin}coinを出金しました`)
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
            throw e
        }
    },
};