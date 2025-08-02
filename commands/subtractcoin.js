const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addCoin } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subtractcoin')
        .setDescription('入力したコインを減らすことができます。1未満は選択できません。')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('減らすコインを決めてください')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('減らす人を決めてください')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const giftcoin = interaction.options.getInteger('number')
            const giftuser = interaction.options.getUser('user') || interaction.user;
            await addCoin(interaction.guildId, giftuser.id, -giftcoin);
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('完了')
                .setDescription(`<@${giftuser.id}>さんに${giftcoin}coinを減らしました`)
                .setTimestamp()
            await interaction.reply({ content: "", embeds: [embed] });
        } catch (e) {
            const channel = interaction.client.channels.cache.get('1335518928293593128');
            if (channel) {
                channel.send(`実行者：${interaction.user.globalName}\nエラー: ${e.message}`);
            }
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('エラー')
                .setDescription('エラーが発生しました\n運営にお問い合わせください')
                .setTimestamp()

            await interaction.reply({ content: "", embeds: [embed] });
        }
    },
};