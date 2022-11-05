const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { bot } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),
    async execute(interaction, client) {
        var timestamp = interaction.guild.createdTimestamp
        var date = new Date(timestamp)
        const embed = new EmbedBuilder()
            .setThumbnail(interaction.guild.iconURL())
            .setTitle("Discord server information")
            .setColor(bot.embed.hexColor)
            .addFields(
                { name: 'Name', value: '`' + interaction.guild.name + '`', inline: false },
                { name: 'Members', value: '`' + Intl.NumberFormat('en-US').format(interaction.guild.memberCount) + '`' },
                { name: 'Creation date', value: '`' + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes() + '`', inline: false },
            )
            .setFooter({
                text: client.user.tag,
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp()
        interaction.reply({ embeds: [embed] });
    },
};