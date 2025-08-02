const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addCoin } = require('../functions.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcoin')
        .setDescription('入力したコインを増やすできます。1未満は選択できません。')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('増やすコインを決めてください')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('増やす人を決めてください')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            const giftcoin = interaction.options.getInteger('number')
            const giftuser = interaction.options.getUser('user') || interaction.user;
            await addCoin(interaction.guildId, giftuser.id, giftcoin);
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('完了')
                .setDescription(`<@${giftuser.id}>さんに${giftcoin}coinを増やしました`)
                .setTimestamp()
            await interaction.reply({ content: "", embeds: [embed] });
        } catch (e) {
            throw e;
        }
    },
};