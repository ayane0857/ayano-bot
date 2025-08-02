const { Events, EmbedBuilder } = require('discord.js');
const { getUserData, addXP, addCoin, levenextxp } = require('../functions.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            if (message.author.bot) return;
            user_id = message.author.id
            if (!message.guildId) return;
            const guild_id = message.guildId
            const userData = await getUserData(guild_id, user_id)
            let result = levenextxp(userData.xp);
            let result2 = levenextxp(userData.xp + 10 + Math.min(Math.round(message.content.length * 0.2), 7));
            if (result.level < result2.level) {
                await addCoin(guild_id, user_id, 50 + result2.level * 3)
            }
            await addXP(guild_id, user_id, 10 + Math.min(Math.round(message.content.length * 0.2), 7));
        } catch (error) {
            console.error(error);
            console.error(error);
            const channel = message.client.channels.cache.get('1335518928293593128');
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('エラー')
                .setDescription('コマンドの実行中にエラーが発生しました')
                .addFields(
                    {
                        name: 'メッセージ', value: message.content, inline: true
                    },
                    {
                        name: '実行者', value: `${message.author.username} (${message.author.id})`, inline: true
                    },
                    {
                        name: 'サーバー', value: message.guildId ? `${message.guildId} (${message.channelId})` : 'DM', inline: true
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
    },
};