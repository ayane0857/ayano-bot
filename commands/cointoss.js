const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserData, addCoin } = require('../functions.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cointoss')
        .setDescription('コイントスができます。当てられた場合懸けコインが1.3倍になります')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('懸けるコインの数を入力してください')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('call')
                .setDescription('裏か表を選択します。(Trueが表、Falseが裏)')
                .setRequired(true)),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const userData = await getUserData(interaction.guildId, interaction.user.id)
            const cointosscoin = interaction.options.getInteger('number')
            const cointoss = interaction.options.getBoolean('call');
            if (cointosscoin <= 1) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('不正な数字')
                    .setDescription(`1未満は選択できません`)
                    .setTimestamp()

                await interaction.reply({ content: "", embeds: [embed] });
                return;
            }
            if (userData.coin >= cointosscoin) {
                await addCoin(interaction.guildId, interaction.user.id, -cointosscoin);
                if (Boolean(Math.floor(Math.random() * 2)) == cointoss) {
                    await addCoin(interaction.guildId, interaction.user.id, cointosscoin * 1.5);
                    const userData2 = await getUserData(interaction.guildId, interaction.user.id)
                    const embed = new EmbedBuilder()
                        .setColor('#4CAF50')
                        .setTitle('勝利！')
                        .setDescription(`${userData2.coin - userData.coin}コイン増えました。\n現在のコイン${userData2.coin}コイン`)
                        .setTimestamp()

                    await interaction.reply({ content: "", embeds: [embed] });
                } else {
                    const userData2 = await getUserData(interaction.guildId, interaction.user.id)
                    const embed = new EmbedBuilder()
                        .setColor('#4CAF50')
                        .setTitle('敗北')
                        .setDescription(`${cointosscoin}コイン減りました。\n現在のコイン${userData2.coin}コイン`)
                        .setTimestamp()

                    await interaction.reply({ content: "", embeds: [embed] });
                }
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