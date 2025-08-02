const { SlashCommandBuilder, EmbedBuilder, } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('ユーザー情報を確認します')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('閲覧するユーザーを選んでください')
                .setRequired(false)),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;

            const member = interaction.options.getMember('user') || interaction.member;
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${member.nickname} の情報`)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: '名前', value: `${member.nickname}(${member.user.username})` },
                    { name: 'サーバーに入会日', value: member.joinedAt.toLocaleString() },
                    { name: 'アカウント作成日', value: member.user.createdAt.toLocaleString() }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            throw e
        }
    },
};