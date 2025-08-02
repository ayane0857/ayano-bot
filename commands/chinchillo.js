const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserData, addCoin, getYaku } = require('../functions.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('chinchillo')
        .setDescription('チンチロができます')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('懸けるコインの数を入力してください')
                .setRequired(true)),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const userData = await getUserData(interaction.guildId, interaction.user.id)
            const chinchillocoin = interaction.options.getInteger('number')
            if (chinchillocoin <= 1) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('不正な数字')
                    .setDescription(`1未満は選択できません`)
                    .setTimestamp()

                await interaction.reply({ content: "", embeds: [embed] });
                return;
            }
            if (userData.coin >= chinchillocoin) {
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;
                const dice3 = Math.floor(Math.random() * 6) + 1;

                const diceArray = [dice1, dice2, dice3];
                let keltuka = getYaku(diceArray, chinchillocoin)
                await addCoin(interaction.guildId, interaction.user.id, keltuka.coin);
                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle(keltuka.yaku)
                    .setDescription(`結果：${dice1} ${dice2} ${dice3}\n${keltuka.coin}になりました。\n現在のコイン${Number(userData.coin + keltuka.coin)}コイン`)
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