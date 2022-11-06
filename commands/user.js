const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about your Discord account.'),
    async execute(interaction) {
        var timestamp = interaction.member.joinedTimestamp
        var date = new Date(timestamp)
        const embed = new EmbedBuilder()
            .setThumbnail(interaction.member.displayAvatarURL())
            .setTitle("Discord user information")
            .setColor(config.bot.embed.hexColor)
            .addFields(
                { name: 'Nickname', value: '`' + interaction.user.username + '`', inline: false },
                { name: 'Join date', value: '`' + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes() + '`', inline: false },
                { name: 'User ID', value: '`' + interaction.user.id + '`' }
            )
            .setFooter({
                text: interaction.client.user.tag,
                iconURL: interaction.client.user.displayAvatarURL() + "?size=64"
            })
            .setTimestamp()
        interaction.reply({ embeds: [embed] });
    },
};