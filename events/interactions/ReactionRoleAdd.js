const { Events, EmbedBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { setTimeout } = require('node:timers/promises');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('リアクションのフェッチに失敗しました:', error);
                return;
            }
        }
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch();
            } catch (error) {
                console.error('メッセージのフェッチに失敗しました:', error);
                return;
            }
        }
        if (reaction.message.author.id === reaction.client.user.id && !user.bot) {
            try {
                const botReactions = reaction.message.reactions.cache.filter(react =>
                    react.users.cache.has(reaction.client.user.id)
                );
                if (botReactions.size > 0) {
                    let alphabet = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿']

                    let index = alphabet.indexOf(reaction.emoji.name);

                    if (index !== -1) {
                        const Roledata = await prisma.Reactionrole.findUnique({
                            where: {
                                messageId: String(reaction.message.id)
                            }
                        });
                        const member = reaction.message.guild.members.cache.get(user.id);
                        const role = Roledata.role[index];
                        let sendmessage;
                        if (member.roles.cache.has(role)) {
                            await member.roles.remove(role);
                            const embed = new EmbedBuilder()
                                .setColor('#4CAF50')
                                .setTitle('役職削除')
                                .setDescription(`${member.displayName} から役職 <@&${role}> を削除しました。`)
                                .setTimestamp();
                            sendmessage = await reaction.message.channel.send({ content: "", embeds: [embed] });
                        } else {
                            await member.roles.add(role);
                            const embed = new EmbedBuilder()
                                .setColor('#4CAF50')
                                .setTitle('役職追加')
                                .setDescription(`${member.displayName} から役職 <@&${role}> を追加しました。`)
                                .setTimestamp();
                            sendmessage = await reaction.message.channel.send({ content: "", embeds: [embed] });
                        }
                        await reaction.users.remove(user.id);
                        await setTimeout(1000);
                        await sendmessage.delete()
                    }
                }
            } catch (error) {
                const channel = reaction.message.client.channels.cache.get('1335518928293593128');
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('エラー')
                    .setDescription('コマンドの実行中にエラーが発生しました')
                    .addFields(
                        {
                            name: '実行者', value: `${reaction.message.author.username} (${reaction.message.author.id})`, inline: true
                        },
                        {
                            name: 'サーバー', value: reaction.message.guildId ? `${reaction.message.guildId} (${reaction.message.channelId})` : 'DM', inline: true
                        },
                        {
                            name: 'エラー内容', value: "```\n" + error + "\n```", inline: false
                        }
                    )
                    .setTimestamp();
                if (channel) {
                    channel.send({ content: "", embeds: [embed] });
                }
            }
        }
    },
};