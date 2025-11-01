const { Events, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ChatInputCommandInteraction } = require('discord.js');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
require('dotenv').config();
let errorLogChannelId = process.env.ERRORSENDCHANNEL;

// クールダウンを保存するためのCollectionを作成
const cooldowns = new Collection();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                // クールダウンの確認と設定
                if (command.cooldown) {
                    if (!cooldowns.has(command.data.name)) {
                        cooldowns.set(command.data.name, new Collection());
                    }

                    const now = Date.now();
                    const timestamps = cooldowns.get(command.data.name);
                    const cooldownAmount = (command.cooldown) * 1000;
                    const userId = interaction.user.id;

                    if (timestamps.has(userId)) {
                        const expirationTime = timestamps.get(userId) + cooldownAmount;

                        if (now < expirationTime) {
                            const timeLeft = (expirationTime - now) / 1000;
                            return await interaction.reply({
                                content: `このコマンドは${timeLeft.toFixed(1)}秒後に使用可能になります。`,
                                flags: MessageFlags.Ephemeral
                            });
                        }
                    }

                    timestamps.set(userId, now);
                    setTimeout(() => timestamps.delete(userId), cooldownAmount);
                }

                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                const channel = interaction.client.channels.cache.get('1335518928293593128');
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('エラー')
                    .setDescription('コマンドの実行中にエラーが発生しました')
                    .addFields(
                        {
                            name: 'コマンド名', value: interaction.commandName, inline: true
                        },
                        {
                            name: '実行者', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true
                        },
                        {
                            name: 'サーバー', value: interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : 'DM', inline: true
                        },
                        {
                            name: 'エラー内容', value: "```\n" + error + "\n```", inline: false
                        }
                    )
                    .setTimestamp();
                if (channel) {
                    channel.send({ content: "", embeds: [embed] });
                }

                // インタラクションが有効かどうかチェック
                if (!interaction.replied && !interaction.deferred) {
                    try {
                        const embed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('エラー')
                            .setDescription('エラーが発生しました\n運営にお問い合わせください')
                            .setTimestamp()

                        await interaction.reply({
                            content: "",
                            embeds: [embed],
                            flags: MessageFlags.Ephemeral
                        });
                    } catch (replyError) {
                        console.error('エラー応答の送信に失敗:', replyError);
                    }
                } else {
                    try {
                        const embed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('エラー')
                            .setDescription('エラーが発生しました\n運営にお問い合わせください')
                            .setTimestamp()
                        await interaction.followUp({
                            content: "",
                            embeds: [embed],
                            flags: MessageFlags.Ephemeral
                        });
                    } catch (followUpError) {
                        console.error('フォローアップの送信に失敗:', followUpError);
                    }
                }
            }
        }

        if (interaction.isButton()) {
            // インタラクションがまだ有効かチェック
            if (interaction.replied || interaction.deferred) {
                console.log('インタラクションは既に処理済みです');
                return;
            }

            if (interaction.customId === 'create-ticket') {
                try {
                    // 先にインタラクションを延期して時間を稼ぐ
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                    const Roledata = await prisma.Ticket.findUnique({
                        where: {
                            messageId: String(interaction.message.id)
                        }
                    });

                    if (!Roledata) {
                        return await interaction.editReply({
                            content: 'チケットの設定が見つかりません。',
                        });
                    }

                    const createchannel = await interaction.guild.channels.create({
                        name: `ticket-${Roledata.ticketnumber}`,
                        parent: Roledata.categoryId,
                        permissionOverwrites: [{
                            id: interaction.user.id,
                            allow: [
                                'ViewChannel',
                                'SendMessages',
                                'ReadMessageHistory'
                            ]
                        }]
                    })

                    await prisma.Ticket.upsert({
                        where: {
                            messageId: String(interaction.message.id)
                        },
                        update: {
                            ticketnumber: {
                                increment: 1
                            }
                        },
                        create: {
                            categoryId: Roledata.categoryId,
                            messageId: String(interaction.message.id),
                            ticketnumber: 1
                        }
                    })

                    let result = '';
                    for (let i = 0; i <= 3; i++) {
                        const role = Roledata.role[i];
                        if (role) {
                            result += (`<@&${role}> `);
                        }
                    }

                    const button = new ButtonBuilder()
                        .setCustomId('delete-ticket')
                        .setLabel('削除')
                        .setStyle(ButtonStyle.Danger);
                    const row = new ActionRowBuilder()
                        .addComponents(button);
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('チケット作成完了')
                        .setDescription('チケットを作成しました。\nサポートが来るまでお待ちください')
                        .setTimestamp();

                    await createchannel.send({
                        content: `<@${interaction.user.id}> ${result} ようこそ`,
                        embeds: [embed],
                        components: [row]
                    });

                    // 成功したことを通知
                    await interaction.editReply({
                        content: `チケットを作成しました: ${createchannel}`,
                    });

                } catch (error) {
                    console.error('チケット作成エラー:', error);

                    // エラーログの送信
                    try {
                        const errorLogChannel = await interaction.client.channels.fetch(errorLogChannelId);

                        const errorInfo = {
                            user: interaction.user.tag,
                            userId: interaction.user.id,
                            guild: interaction.guild?.name ?? 'DM',
                            guildId: interaction.guild?.id ?? 'N/A',
                            messageId: interaction.message.id,
                            command: interaction.commandName ?? 'button-interaction',
                            timestamp: new Date().toISOString(),
                            error: {
                                name: error.name,
                                message: error.message,
                                stack: error.stack
                            }
                        };

                        const errorEmbed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('⚠️ エラーが発生しました')
                            .setDescription('実行中にエラーが発生しました。')
                            .addFields(
                                { name: '実行者', value: `${errorInfo.user} (${errorInfo.userId})`, inline: true },
                                { name: 'サーバー', value: `${errorInfo.guild} (${errorInfo.guildId})`, inline: true },
                                { name: 'メッセージ', value: `${errorInfo.messageId}`, inline: true },
                                { name: 'コマンド', value: errorInfo.command, inline: false },
                                { name: 'エラー種類', value: errorInfo.error.name, inline: true },
                                { name: 'エラーメッセージ', value: errorInfo.error.message, inline: true },
                                {
                                    name: 'スタックトレース', value: '```' +
                                        (errorInfo.error.stack?.substring(0, 1000) ?? 'No stack trace') +
                                        '```', inline: false
                                }
                            )
                            .setTimestamp();

                        await errorLogChannel.send({ embeds: [errorEmbed] });
                    } catch (sendError) {
                        console.error('Error sending error log:', sendError);
                    }

                    // ユーザーにエラーを通知
                    try {
                        if (interaction.deferred) {
                            await interaction.editReply({
                                content: 'チケットの作成中にエラーが発生しました。',
                            });
                        } else {
                            await interaction.reply({
                                content: 'チケットの作成中にエラーが発生しました。',
                                flags: MessageFlags.Ephemeral
                            });
                        }
                    } catch (replyError) {
                        console.error('エラー応答の送信に失敗:', replyError);
                    }
                }
            }

            // 役職パネルのボタン処理
            if (interaction.customId && interaction.customId.startsWith('rr-role-')) {
                try {
                    // 押した本人にだけ見えるように先に defer
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                    const parts = interaction.customId.split('-');
                    const index = parseInt(parts[2], 10);

                    const Roledata = await prisma.Reactionrole.findUnique({
                        where: { messageId: String(interaction.message.id) }
                    });

                    if (!Roledata) {
                        return await interaction.editReply({ content: 'このパネルは設定されていません。' });
                    }

                    const roleId = Roledata.role[index];
                    if (!roleId) {
                        return await interaction.editReply({ content: '選択された役職が見つかりませんでした。' });
                    }

                    // 確認用ボタンを表示
                    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                    const confirm = new ButtonBuilder()
                        .setCustomId(`rr-confirm-${index}-${interaction.message.id}`)
                        .setLabel('確認して付与')
                        .setStyle(ButtonStyle.Success);
                    const cancel = new ButtonBuilder()
                        .setCustomId('rr-cancel')
                        .setLabel('キャンセル')
                        .setStyle(ButtonStyle.Secondary);
                    const row = new ActionRowBuilder().addComponents(confirm, cancel);

                    const role = interaction.guild.roles.cache.get(roleId);
                    await interaction.editReply({ content: `<@${interaction.user.id}> 役職「${role?.name ?? '指定されたロール'}」を付与／解除します。よければ「確認して付与」を押してください。`, components: [row] });

                } catch (error) {
                    console.error('rr-role ボタン処理エラー:', error);
                    try {
                        if (!interaction.replied && !interaction.deferred) {
                            await interaction.reply({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
                        } else {
                            await interaction.editReply({ content: 'エラーが発生しました。' });
                        }
                    } catch (e) {
                        console.error('エラー応答失敗:', e);
                    }
                }
            }

            // キャンセルボタン処理（確認ダイアログを閉じる）
            if (interaction.customId === 'rr-cancel') {
                try {
                    // defer していない可能性があるので、もし未応答なら reply、応答済みなら edit
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'キャンセルしました。', flags: MessageFlags.Ephemeral });
                    } else {
                        await interaction.editReply({ content: 'キャンセルしました。', components: [] });
                    }
                } catch (error) {
                    console.error('rr-cancel 処理エラー:', error);
                    try {
                        if (!interaction.replied && !interaction.deferred) {
                            await interaction.reply({ content: 'キャンセル処理中にエラーが発生しました。', flags: MessageFlags.Ephemeral });
                        }
                    } catch (e) { console.error(e); }
                }
            }

            if (interaction.customId && interaction.customId.startsWith('rr-confirm-')) {
                try {
                    // このボタンはエフェメラルで送られたため、そのままreplyでOK
                    const parts = interaction.customId.split('-');
                    const index = parseInt(parts[2], 10);
                    const messageId = parts.slice(3).join('-');

                    const Roledata = await prisma.Reactionrole.findUnique({
                        where: { messageId: String(messageId) }
                    });

                    if (!Roledata) {
                        return await interaction.reply({ content: '設定が見つかりませんでした。', flags: MessageFlags.Ephemeral });
                    }

                    const roleId = Roledata.role[index];
                    if (!roleId) return await interaction.reply({ content: '役職が見つかりませんでした。', flags: MessageFlags.Ephemeral });

                    const member = interaction.guild.members.cache.get(interaction.user.id);
                    if (!member) return await interaction.reply({ content: 'メンバー情報が取得できませんでした。', flags: MessageFlags.Ephemeral });

                    const has = member.roles.cache.has(roleId);
                    if (has) {
                        await member.roles.remove(roleId);
                        await interaction.reply({ content: `役職を外しました：<@&${roleId}>`, flags: MessageFlags.Ephemeral });
                    } else {
                        await member.roles.add(roleId);
                        await interaction.reply({ content: `役職を付与しました：<@&${roleId}>`, flags: MessageFlags.Ephemeral });
                    }

                } catch (error) {
                    console.error('rr-confirm 処理エラー:', error);
                    try {
                        await interaction.reply({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
                    } catch (e) { console.error(e); }
                }
            }

            if (interaction.customId === 'delete-ticket') {
                try {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('チケットを削除します')

                    await interaction.reply({ embeds: [embed] });

                    setTimeout(async () => {
                        try {
                            await interaction.channel.delete();
                        } catch (deleteError) {
                            console.error('チャンネル削除エラー:', deleteError);
                        }
                    }, 3000);

                } catch (error) {
                    console.error('チケット削除エラー:', error);

                    // エラーログの送信
                    try {
                        const errorLogChannel = await interaction.client.channels.fetch(errorLogChannelId);

                        const errorInfo = {
                            user: interaction.user.tag,
                            userId: interaction.user.id,
                            guild: interaction.guild?.name ?? 'DM',
                            guildId: interaction.guild?.id ?? 'N/A',
                            messageId: interaction.message.id,
                            command: interaction.commandName ?? 'button-interaction',
                            timestamp: new Date().toISOString(),
                            error: {
                                name: error.name,
                                message: error.message,
                                stack: error.stack
                            }
                        };

                        const errorEmbed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('⚠️ エラーが発生しました')
                            .setDescription('実行中にエラーが発生しました。')
                            .addFields(
                                { name: '実行者', value: `${errorInfo.user} (${errorInfo.userId})`, inline: true },
                                { name: 'サーバー', value: `${errorInfo.guild} (${errorInfo.guildId})`, inline: true },
                                { name: 'メッセージ', value: `${errorInfo.messageId}`, inline: true },
                                { name: 'コマンド', value: errorInfo.command, inline: false },
                                { name: 'エラー種類', value: errorInfo.error.name, inline: true },
                                { name: 'エラーメッセージ', value: errorInfo.error.message, inline: true },
                                {
                                    name: 'スタックトレース', value: '```' +
                                        (errorInfo.error.stack?.substring(0, 1000) ?? 'No stack trace') +
                                        '```', inline: false
                                }
                            )
                            .setTimestamp();

                        await errorLogChannel.send({ embeds: [errorEmbed] });
                    } catch (sendError) {
                        console.error('Error sending error log:', sendError);
                    }

                    // ユーザーにエラーを通知
                    try {
                        if (!interaction.replied && !interaction.deferred) {
                            await interaction.reply({
                                content: 'チケットの削除中にエラーが発生しました。',
                                flags: MessageFlags.Ephemeral
                            });
                        }
                    } catch (replyError) {
                        console.error('エラー応答の送信に失敗:', replyError);
                    }
                }
            }
        }
    },
};