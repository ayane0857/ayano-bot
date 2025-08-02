const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getUserData, addCoin } = require('../functions.js');

function getrandom2() {
    try {
        const numbers = Array.from({ length: 101 }, (_, i) => i);
        const randomIndex1 = Math.floor(Math.random() * numbers.length);
        const randomNumber1 = numbers.splice(randomIndex1, 1)[0]; // 1つ目の数字を取得して削除
        const randomIndex2 = Math.floor(Math.random() * numbers.length);
        const randomNumber2 = numbers[randomIndex2]; // 2つ目の数字を取得

        return [randomNumber1, randomNumber2];
    } catch (e) {
        throw e;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('highandlow')
        .setDescription('ハイアンドローができます。')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('懸けるコインの数を入力してください')
                .setRequired(true)),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const userData = await getUserData(interaction.guildId, interaction.user.id)
            const handlcoin = interaction.options.getInteger('number')
            if (handlcoin <= 1) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('不正な数字')
                    .setDescription(`1未満は選択できません`)
                    .setTimestamp()

                await interaction.reply({ content: "", embeds: [embed] });
                return;
            }
            if (userData.coin >= handlcoin) {
                const getrandom = getrandom2()
                const embed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('ハイアンドロー')
                    .setDescription(`${getrandom[0]}です`)
                    .setTimestamp()

                // ボタンの作成
                const high = new ButtonBuilder()
                    .setCustomId('high')
                    .setLabel('ハイ')
                    .setStyle(ButtonStyle.Primary);
                const low = new ButtonBuilder()
                    .setCustomId('low')
                    .setLabel('ロー')
                    .setStyle(ButtonStyle.Primary);

                // ActionRowの作成とボタンの追加
                const row = new ActionRowBuilder()
                    .addComponents(high)
                    .addComponents(low);
                const originalUser = interaction.user.id;
                // ボタンクリックのコレクター設定
                const message = await interaction.reply({
                    embeds: [embed],
                    components: [row],
                    fetchReply: true
                });

                // ボタンのインタラクション待機
                const collector = message.createMessageComponentCollector({
                    time: 60000 // 60秒間有効
                });
                let disable
                collector.on('collect', async i => {
                    if (i.user.id !== originalUser) {
                        await i.reply({
                            content: 'このボタンは、コマンドを実行したユーザーのみが使用できます。',
                            ephemeral: true
                        });
                        return;
                    }
                    let embed
                    let answer = "失敗"
                    await addCoin(interaction.guildId, interaction.user.id, -handlcoin);
                    if (i.customId === 'high') {
                        if (getrandom[0] < getrandom[1]) {
                            answer = "正解"
                            await addCoin(interaction.guildId, interaction.user.id, handlcoin * 1.2);
                        }
                        embed = new EmbedBuilder()
                            .setColor('#4CAF50')
                            .setTitle('ハイ')
                            .setDescription(`${getrandom[1]}でした。${answer}`)
                            .setTimestamp()
                    }
                    if (i.customId === 'low') {
                        if (getrandom[0] > getrandom[1]) {
                            answer = "正解"
                            await addCoin(interaction.guildId, interaction.user.id, handlcoin * 1.2);
                        }
                        embed = new EmbedBuilder()
                            .setColor('#4CAF50')
                            .setTitle('ロー')
                            .setDescription(`${getrandom[1]}でした。${answer}`)
                            .setTimestamp()
                    }
                    const disabledRow = new ActionRowBuilder()
                        .addComponents([
                            high.setDisabled(true),
                            low.setDisabled(true)
                        ]);
                    message.edit({ embeds: [embed], components: [disabledRow] });
                    disable = true
                });

                collector.on('end', collected => {
                    // タイムアウト時の処理
                    if (message.editable && !disable) {
                        const disabledRow = new ActionRowBuilder()
                            .addComponents([
                                high.setDisabled(true),
                                low.setDisabled(true)
                            ]);
                        message.edit({ components: [disabledRow] });
                    }
                });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('コイン不足')
                    .setDescription(`コインが足りません`)
                    .setTimestamp()

                await interaction.reply({ content: "", embeds: [embed] });
            }
        } catch (e) {
            throw e;
        }
    },
};
