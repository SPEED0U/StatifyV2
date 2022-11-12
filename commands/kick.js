const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");
const axios = require('axios');

module.exports = {
    allowedRoles: [config.role.admin, config.role.moderator],
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a player out of the game.')
        .addStringOption((option) =>
            option
                .setName('driver')
                .setDescription('The driver you want to kick.')
                .setRequired(true))
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('The reason of the kick')
                .setRequired(false)),

    async execute(interaction) {
        const driver = interaction.options.getString('driver');
        const reason = interaction.options.getString('reason');
        con.query("SELECT USERID, ID, name, iconIndex FROM PERSONA WHERE name = ?", [driver], (err, result) => {
            if (result.length == 1) {
                const post = new URLSearchParams();
                post.append('message', `TXT_ORANGE,[${result[0].name}] HAS BEEN KICKED.`);
                post.append('announcementAuth', config.core.token.server);
                var icon = result[0].iconIndex + config.url.avatarFormat
                const headers = { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' } };
                axios.post(config.core.url + '/Engine.svc/Send/Announcement', post, headers)
                axios.post(config.core.url + '/Engine.svc/ofcmdhook?cmd=/kick%20' + result[0].name + '&pid=' + config.core.botPersonaId + '&webhook=0', null, { headers: { Authorization: config.core.token.openfire } }).catch(error => { console.log(error) })
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: result[0].name + " has been kicked.",
                        iconURL: config.url.avatarEndpoint + icon
                    })
                    .setColor("#fff700")
                if (reason != undefined) {
                    embed.addFields({ name: "📃 Reason", value: reason })
                }
                embed.addFields({ name: "👮 Kicked by", value: "<@" + interaction.user.id + ">" })
                    .setFooter({
                        text: interaction.client.user.tag,
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                    .setTimestamp()
                interaction.client.channels.cache.get(config.channel.banlogs).send({ embeds: [embed] })
                interaction.reply({
                    embeds: [embed],
                });
            } else interaction.reply({ content: "Couldn't find a driver called **`" + driver + "`** in database.", ephemeral: true });
        })
    }
}