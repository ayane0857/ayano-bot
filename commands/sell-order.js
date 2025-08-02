const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, addCoin, addAyaCoin, ayacoindata } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellorder')
        .setDescription('彩コインからコインに変換する')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('変換する彩コインを決めてください')
                .setRequired(true)),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const userData = await getUserData(interaction.guildId, interaction.user.id)
            const buyayacoin = interaction.options.getInteger('number')
            const ayacoin = await ayacoindata()
            if (buyayacoin < 1) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('不正な数字')
                    .setDescription(`1未満は選択できません`)
                    .setTimestamp()

                await interaction.reply({ content: "", embeds: [embed] });
                return;
            }
            if (userData.ayacoin >= buyayacoin) {
                await addAyaCoin(interaction.guildId, interaction.user.id, -buyayacoin);
                await addCoin(interaction.guildId, interaction.user.id, Math.floor(buyayacoin * (ayacoin / 100)));
                const userData2 = await getUserData(interaction.guildId, interaction.user.id)
                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('完了')
                    .setDescription(`${buyayacoin}ayacoinを変換しました\n利益は${userData2.coin - userData.coin}`)
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