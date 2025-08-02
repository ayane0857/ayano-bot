const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ticketpanel')
        .setDescription('チケットパネルを作成します')
        .addRoleOption(role =>
            role.setName('role0')
                .setDescription('サポートするロールを選択してください(必須)')
                .setRequired(true)
        )
        .addRoleOption(role =>
            role.setName('role1')
                .setDescription('サポートするロールを選択してください(任意)')
                .setRequired(false)
        )
        .addRoleOption(role =>
            role.setName('role2')
                .setDescription('サポートするロールを選択してください(任意)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            let result = 'サポートロールは';
            let addprisma = []
            let permissionOverwriteslist = []
            permissionOverwriteslist.push({
                id: interaction.guild.id,
                deny: [
                    'ViewChannel',
                    'SendMessages',
                    'ReadMessageHistory'
                ]
            });
            for (let i = 0; i <= 3; i++) {
                const role = interaction.options.getRole(`role${i}`);
                if (role) {
                    if (role.id === interaction.guild.id) {
                        return interaction.reply({
                            content: '`@everyone` ロールは選択できません。',
                            ephemeral: true
                        });
                    }
                    addprisma.push(role.id);
                    result += `<@&${role.id}>`;
                    permissionOverwriteslist.push({
                        id: role.id,
                        allow: [
                            'ViewChannel',
                            'SendMessages',
                            'ReadMessageHistory'
                        ]
                    });
                }
            }
            const ticketcategory = await interaction.guild.channels.create({
                name: 'ticket',
                type: 4,
                permissionOverwrites: permissionOverwriteslist
            });
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('チケットパネルとチケット送信カテゴリーを作成しました')
                .setDescription(`サポートロールは${result}\nカテゴリー名はticket`)
                .setTimestamp();
            await interaction.reply(
                {
                    content: "",
                    embeds: [embed],
                    ephemeral: true
                }
            );
            const button = new ButtonBuilder()
                .setCustomId('create-ticket')
                .setLabel('チケットを作成')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder()
                .addComponents(button);
            const pubembed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('チケットパネル')
                .setDescription(`連絡窓口`)
                .setTimestamp();
            const sendmessage = await interaction.channel.send(
                {
                    content: "",
                    embeds: [pubembed],
                    components: [row]
                }
            );
            await prisma.Ticket.create({
                data: {
                    messageId: sendmessage.id,
                    categoryId: ticketcategory.id,
                    role: addprisma,
                    ticketnumber: 0,
                },
            });
        } catch (e) {
            throw e
        } finally {
            await prisma.$disconnect();
        }
    },
};