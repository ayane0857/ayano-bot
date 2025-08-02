const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { deleteUserServerData } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeuserdata')
        .setDescription('彩乃のデータから削除します')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('削除人を決めてください')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;

            const deleteuser = interaction.options.getUser('user') || interaction.user;

            // Create confirmation buttons
            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('データ削除')
                .setStyle(ButtonStyle.Danger);

            const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('キャンセル')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(cancel, confirm);

            // Send confirmation message
            const confirmMessage = await interaction.reply({
                content: `${deleteuser.id === interaction.user.id ? '自分' : deleteuser.tag}のデータを削除してもよろしいですか？`,
                components: [row],
                fetchReply: true
            });

            // Create button collector with filter
            const collector = confirmMessage.createMessageComponentCollector({
                time: 15000 // 15 seconds timeout
            });

            collector.on('collect', async i => {
                // Check if the user who clicked is the same as who initiated the command
                if (i.user.id !== interaction.user.id) {
                    await i.reply({
                        content: 'このボタンは使用できません。',
                        ephemeral: true
                    });
                    return;
                }

                if (i.customId === 'confirm') {
                    await deleteUserServerData(interaction.guildId, deleteuser.id);
                    const embed = new EmbedBuilder()
                        .setColor('#4CAF50')
                        .setTitle('完了')
                        .setDescription(`<@${deleteuser.id}>さんのデータを削除しました`)
                        .setTimestamp();
                    await i.update({ content: '', embeds: [embed], components: [] });
                } else if (i.customId === 'cancel') {
                    const embed = new EmbedBuilder()
                        .setColor('#808080')
                        .setTitle('キャンセル')
                        .setDescription('データの削除をキャンセルしました')
                        .setTimestamp();
                    await i.update({ content: '', embeds: [embed], components: [] });
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    const embed = new EmbedBuilder()
                        .setColor('#808080')
                        .setTitle('タイムアウト')
                        .setDescription('時間切れになりました')
                        .setTimestamp();
                    await interaction.editReply({ content: '', embeds: [embed], components: [] });
                }
            });

        } catch (e) {
            throw e;
        }
    },
};