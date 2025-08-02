const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, addCoin, addAyaCoin, ayacoindata } = require('../functions.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('buyorder')
        .setDescription('彩コインを購入できます')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('買う彩コインの数を決めてください。')
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
            if (userData.coin > Math.floor(buyayacoin * (ayacoin / 100))) {
                await addAyaCoin(interaction.guildId, interaction.user.id, buyayacoin);
                await addCoin(interaction.guildId, interaction.user.id, -Math.floor(buyayacoin * (ayacoin / 100)));
                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('完了')
                    .setDescription(`${buyayacoin}ayacoinを購入しました\n値段は${Math.floor(buyayacoin * (ayacoin / 100))}コインでした`)
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