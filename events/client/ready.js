const { Events, ActivityType } = require('discord.js');

async function updateStatus(client) {
    try {
        const serverCount = client.guilds.cache.size;
        const uniqueUsers = new Set();

        for (const guild of client.guilds.cache.values()) {
            try {
                const members = await guild.members.fetch();

                members.forEach(member => {
                    if (!member.user.bot) {
                        uniqueUsers.add(member.user.id);
                    }
                });
            } catch (error) {
                console.error(`${guild.name} のメンバー取得中にエラーが発生: ${error}`);
            }
        }

        client.user.setActivity({
            name: `${serverCount}サーバーに導入中 | ${uniqueUsers.size}ユーザーが使用中`,  // ここを後で実際のデータに置き換え
            type: ActivityType.Custom
        });
    } catch (error) {
        console.error('ステータス更新エラー:', error);
    }
}


module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        updateStatus(client);
        setInterval(() => {
            updateStatus(client);
        }, 600000);
    },
};