const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('コマンド一覧を表示します'),
    async execute(interaction) {
        try {
            // ページごとのコマンド情報を定義
            const pages = [
                {
                    title: '基本コマンド',
                    commands: [
                        { name: '`/help`', value: "Helpコマンドを表示できます" },
                        { name: '`/ping`', value: "ping値を測定できます" },
                        { name: '`/clear [数]`', value: "指定した数のメッセージを削除できます\n※14日以内のメッセージのみ\n　メッセージ管理権限保有者のみ" },
                        { name: '`/user [ユーザー]`', value: "ユーザー情報を取得できます" },

                    ]
                },
                {
                    title: 'サーバー管理',
                    commands: [
                        { name: '`/reactionroles [ロール] [オプション:ロール(複数)]`', value: "リアクションロールを作成できます" },
                        { name: '`/ticketpanel [ロール] [オプション:ロール(複数)]`', value: "チケットパネルを作成できます" },
                    ]
                },
                {
                    title: 'コイン・レベル・彩コイン関連',
                    commands: [
                        { name: '`/coin [オプション：ユーザー]`', value: "現在のコインを確認します" },
                        { name: '`/ayacoin`', value: "彩コインを確認します" },
                        { name: '`/gift [渡す金額] [ユーザー]`', value: "コインをほかの人に渡せます" },
                        { name: '`/deposit [渡す金額] [ユーザー]`', value: "コインを入金にできます" },
                        { name: '`/withdrawal [渡す金額] [ユーザー]`', value: "コインを出金にできます" },
                        { name: '`/level [オプション：ユーザー]`', value: "現在のレベルを確認します" },
                        { name: '`/ranking`', value: "現在のランキングを表示します" },
                        { name: '`/buy-order [買う金額]`', value: "彩コインを購入できます" },
                        { name: '`/sell-order [売る金額]`', value: "彩コインを売却できます" },
                    ]
                },
                {
                    title: 'コイン・レベル関連(管理者限定)',
                    commands: [
                        { name: '`/removeuserdata [ユーザー]`', value: "彩乃のデータを削除します" },
                        { name: '`/addcoin [増やす金額] [オプション：ユーザー]`', value: "コインを増やせます" },
                        { name: '`/subtractcoin [減らす金額] [オプション：ユーザー]`', value: "コインを減らせます" },
                    ]
                },
                {
                    title: 'ゲーム',
                    commands: [
                        { name: '`/cointoss [掛け金] [表か裏か]`', value: "コイントスができます" },
                        { name: '`/chinchillo [掛け金]`', value: "チンチロができます" },
                        { name: '`/slot [掛け金]`', value: "スロットができます" },
                    ]
                }
            ];

            let currentPage = 0;

            // ページのEmbedを作成する関数
            const createEmbed = (pageIndex) => {
                const page = pages[pageIndex];
                return new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle(`コマンド一覧 - ${page.title}`)
                    .addFields(...page.commands)
                    .setFooter({ text: `ページ ${pageIndex + 1}/${pages.length} | 公式サーバー: https://discord.gg/qyTSUJFctN` })
                    .setTimestamp();
            };

            // ボタンを作成
            const createButtons = (pageIndex) => {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('前へ')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(pageIndex === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('次へ')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(pageIndex === pages.length - 1)
                    );
                return row;
            };

            // 最初のページを送信
            const initialEmbed = createEmbed(currentPage);
            const initialButtons = createButtons(currentPage);
            const response = await interaction.reply({
                embeds: [initialEmbed],
                components: [initialButtons],
                fetchReply: true
            });

            // ボタンのインタラクションを収集
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000 // 60秒でボタンを無効化
            });

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    await i.reply({ content: 'このボタンは他の人は使用できません。', ephemeral: true });
                    return;
                }

                if (i.customId === 'previous') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }

                const newEmbed = createEmbed(currentPage);
                const newButtons = createButtons(currentPage);
                await i.update({ embeds: [newEmbed], components: [newButtons] });
            });

            collector.on('end', async () => {
                // コレクターの終了時、ボタンを無効化
                const disabledButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('前へ')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('次へ')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );
                await response.edit({ components: [disabledButtons] }).catch(() => { });
            });

        } catch (e) {
            throw e;
        }
    },
};