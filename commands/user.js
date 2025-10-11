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

            // オプションから User を取得（指定がなければ実行者）
            const user = interaction.options.getUser('user') || interaction.user;

            // キャッシュにある GuildMember を取得（なければ null）
            let member = interaction.options.getMember('user');

            // member が null の場合、API から取得を試みる（ギルドにいるがキャッシュされていない場合）
            if (!member) {
                try {
                    member = await interaction.guild.members.fetch(user.id);
                } catch (err) {
                    // ギルドにいない、または取得失敗した場合は null のままにする
                    member = null;
                }
            }

            const displayName = member?.nickname ?? user.username;
            const avatarUrl = (user.displayAvatarURL && typeof user.displayAvatarURL === 'function')
                ? user.displayAvatarURL({ dynamic: true })
                : null;

            const fields = [
                { name: '名前', value: `${displayName} (${user.tag ?? user.username})` },
                { name: 'ID', value: user.id },
                { name: 'サーバーに入会日', value: member ? member.joinedAt.toLocaleString() : 'サーバーメンバーではありません' },
                { name: 'アカウント作成日', value: user.createdAt ? user.createdAt.toLocaleString() : '不明' }
            ];

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${displayName} の情報`)
                .setThumbnail(avatarUrl)
                .addFields(fields)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: 'ユーザー情報の取得中にエラーが発生しました。', ephemeral: true });
        }
    },
};