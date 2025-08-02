const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('reactionroles')
        .setDescription('CreateNow')
        .addRoleOption(option =>
            option.setName('role0')
                .setDescription('付与するロールを選択してください')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role1')
                .setDescription('付与するロールを選択してください')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role2')
                .setDescription('付与するロールを選択してください')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role3')
                .setDescription('付与するロールを選択してください')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role4')
                .setDescription('付与するロールを選択してください')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role5')
                .setDescription('付与するロールを選択してください')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role6')
                .setDescription('付与するロールを選択してください')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role7')
                .setDescription('付与するロールを選択してください')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role8')
                .setDescription('付与するロールを選択してください')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role9')
                .setDescription('付与するロールを選択してください')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        try {
            if (!interaction.guildId) return;
            let result = '';
            let addprisma = [];
            let alphabet = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿']
            const memberRoles = interaction.member.roles.cache.map(role => role.position);
            const highestMemberRole = Math.max(...memberRoles);

            const botRoles = interaction.guild.members.me.roles.cache.map(role => role.position);
            const highestBotRole = Math.max(...botRoles);

            for (let i = 0; i <= 10; i++) {
                const role = interaction.options.getRole(`role${i}`);
                if (role) {
                    // @everyone ロールのIDを取得
                    if (role.id === interaction.guild.id) {
                        return interaction.reply({
                            content: '`@everyone` ロールは選択できません。',
                            ephemeral: true
                        });
                    }

                    // ユーザーの役職よりも高い権限のロールを指定した場合
                    if (role.position > highestMemberRole) {
                        return interaction.reply({
                            content: `指定されたロール ${role.name} はあなたより高い権限を持っています。これを付与することはできません。`,
                            ephemeral: true
                        });
                    }

                    // ボットの役職よりも高い権限のロールを指定した場合
                    if (role.position >= highestBotRole) {
                        return interaction.reply({
                            content: `指定されたロール ${role.name} はこのボットより高い権限を持っています。これを付与することはできません。`,
                            ephemeral: true
                        });
                    }

                    addprisma.push(role.id);
                    result += `${alphabet[i]} は<@&${role.id}>\n`;
                }
            }

            const send = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('役職パネル')
                .setDescription(result)
                .setTimestamp()
            let message = await interaction.channel.send({
                embeds: [send]
            });
            const reply = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('役職パネル作成完了')
                .setDescription('役職パネルが作成されました。')
                .setTimestamp()
            await interaction.reply({
                embeds: [reply],
                ephemeral: true
            });
            await prisma.Reactionrole.create({
                data: {
                    messageId: message.id,
                    role: addprisma,
                },
            });
            for (let i = 0; i < addprisma.length; i++) {
                try {
                    await message.react(alphabet[i]);
                } catch (error) {
                    console.error(`リアクションの追加中にエラーが発生しました: ${error}`);
                }
            }
        } catch (e) {
            throw e;
        } finally {
            await prisma.$disconnect();
        }
    },
};