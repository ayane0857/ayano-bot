// discord.js v14 を利用
const { Client, GatewayIntentBits } = require('discord.js');

// 必要なインテントを有効化（Guilds と GuildMembers）
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // サーバー（ギルド）の取得
    const guild = client.guilds.cache.get('960865693614612480');
    if (!guild) {
        console.error('指定されたサーバーが見つかりません。');
        return;
    }

    try {
        // ユーザー（メンバー）の取得。キャッシュにない場合は fetch します。
        const member = await guild.members.fetch('1143183091565854851');
        if (!member) {
            console.error('指定されたユーザーがサーバー内に見つかりません。');
            return;
        }

        // ニックネームを "User001" に変更
        await member.setNickname('死刑囚');
        console.log(`${member.user.tag} のニックネームを 'User001' に変更しました。`);
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
});

// あなたのボットトークンに置き換えてください
client.login('MTMxNjM2NDgyMDAxODM2NDQxNg.GbrcJL.fRSsxcYUbMhWGb4BzA6yKBmOJU_zAFzQXA-RdQ');
