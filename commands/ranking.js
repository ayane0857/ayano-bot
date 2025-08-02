const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTopUsersByCoin, getTopUsersByXP, levenextxp } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('ランキングを確認します')
        .addStringOption(option =>
            option.setName('select')
                .setDescription('コインのランキングを選択するかレベルのランキングを取得するかを選択します')
                .setRequired(true)
                .addChoices(
                    { name: 'コイン', value: 'Coin' },
                    { name: 'レベル(XP)', value: 'XP' },
                )),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const select = interaction.options.getString('select');
            let ranking;
            let displayName;

            if (select === "Coin") {
                ranking = await getTopUsersByCoin(interaction.guildId);
                displayName = 'コイン';
            } else if (select === "XP") {
                ranking = await getTopUsersByXP(interaction.guildId);
                displayName = 'レベル(XP)';
            }

            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('ランキング')
                .addFields(
                    (await Promise.all(ranking.map(async (user, index) => {
                        try {
                            const member = await interaction.guild.members.fetch(user.userId);
                            const username = member?.nickname || member?.user?.username || 'Unknown User';
                            let corxs;

                            if (select === "Coin") {
                                const coin = Number(user.coin) || 0;
                                const bankcoin = Number(user.bankcoin) || 0;
                                corxs = coin + bankcoin;
                                return {
                                    name: `${index + 1}位 ${username}`,
                                    value: `${corxs.toLocaleString()} ${displayName}`,
                                    inline: false
                                };
                            } else if (select === "XP") {
                                const xp = Number(user.xp) || 0;
                                const level = levenextxp(xp);
                                return {
                                    name: `${index + 1}位 ${username}`,
                                    value: `レベル ${level.level} (XP: ${xp.toLocaleString()})`,
                                    inline: false
                                };
                            }
                        } catch (error) {
                            console.error(`ユーザー ${user.userId} の取得に失敗:`, error);
                            return null;
                        }
                    }))).filter(field => field !== null)
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (e) {
            throw e;
        }
    },
};