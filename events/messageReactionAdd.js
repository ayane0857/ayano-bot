const { Events } = require('discord.js');
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
                            sendmessage = await reaction.message.channel.send(`${member.displayName} から役職 <@&${role}> を削除しました。`);
                        } else {
                            await member.roles.add(role);
                            sendmessage = await reaction.message.channel.send(`${member.displayName} に役職 <@&${role}> を付与しました。`);
                        }
                        await reaction.users.remove(user.id);
                        await setTimeout(1000);
                        await sendmessage.delete()
                    }
                }
            } catch (error) {
                console.error('メッセージのフェッチに失敗しました:', error);
            }
        }
    },
};