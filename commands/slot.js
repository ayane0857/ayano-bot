const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, addCoin } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slot')
        .setDescription('スロットができます')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('懸けるコインの数を入力してください')
                .setRequired(true)),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const userData = await getUserData(interaction.guildId, interaction.user.id)
            const slotcoin = interaction.options.getInteger('number')
            if (slotcoin <= 1) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('不正な数字')
                    .setDescription(`1未満は選択できません`)
                    .setTimestamp()

                await interaction.reply({ content: "", embeds: [embed] });
                return;
            }
            if (userData.coin >= slotcoin) {
                const slot1 = Math.floor(Math.random() * 9);
                const slot2 = Math.floor(Math.random() * 9);
                const slot3 = Math.floor(Math.random() * 9);
                const emoji = ['🍎', '🍌', '🍍', '🍓', '🍇', '🍉', '🍒', '🥥', '🍊'];
                let keltuka = -slotcoin
                if (slot1 === slot2 && slot2 === slot3) {
                    keltuka = slotcoin * 7
                    await addCoin(interaction.guildId, interaction.user.id, keltuka);
                } else if (slot1 === slot2 || slot2 === slot3 || slot1 == slot3) {
                    keltuka = slotcoin * 3
                    await addCoin(interaction.guildId, interaction.user.id, keltuka);
                } else {
                    await addCoin(interaction.guildId, interaction.user.id, keltuka);
                }
                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('スロット')
                    .setDescription(`結果：${emoji[slot1]} ${emoji[slot2]} ${emoji[slot3]}\n${keltuka}になりました。\n現在のコイン${userData.coin + keltuka}コイン`)
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