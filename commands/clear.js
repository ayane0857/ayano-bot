const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('直近の指定された数のメッセージを削除します')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('削除するメッセージの件数を入力してください')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        try {
            const deletenumber = interaction.options.getInteger('number')
            if (deletenumber > 30) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('エラー')
                    .setDescription(`削除できるメッセージの限界は30件です`)
                    .setTimestamp()
                await interaction.reply({ content: "", embeds: [embed] });
                return
            }
            const messages = await interaction.channel.messages.fetch({ limit: deletenumber });
            const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            const filtered = messages.filter(message =>
                message.createdTimestamp > twoWeeksAgo
            );

            // フィルタリングしたメッセージを一括削除
            if (filtered.size > 0) {
                await interaction.channel.bulkDelete(filtered);
            }

            const oldMessagesCount = messages.filter(message =>
                !message.author.bot &&
                message.createdTimestamp <= twoWeeksAgo
            ).size;
            let embed;
            if (oldMessagesCount > 0) {
                embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('削除')
                    .setDescription(`メッセージを削除しました\n${deletenumber}件中${oldMessagesCount}件が削除できませんでした`)
                    .setTimestamp()
            } else {
                embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('削除')
                    .setDescription('メッセージを削除しました')
                    .setTimestamp()
            }

            await interaction.reply({ content: "", embeds: [embed] });
        } catch (e) {
            throw e;
        }
    },
};