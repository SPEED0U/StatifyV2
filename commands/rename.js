const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");

module.exports = {
    allowedRoles: [config.role.admin, config.role.moderator],
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename a driver from the game.')
        .addStringOption((option) =>
            option
                .setName('driver')
                .setDescription('The driver you want to rename.')
                .setRequired(true))
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('How do you want to rename the driver ?')
                .setRequired(false))
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('The reason of the rename.')
                .setRequired(false)),

    async execute(interaction) {
        const driver = interaction.options.getString('driver');
        const reason = interaction.options.getString('reason');
        const name = interaction.options.getString('name');

        con.query("SELECT ID, USERID, iconIndex FROM PERSONA WHERE name = ?", [driver], (err, pid) => {
            if (pid.length > 0) {
                let personaid = pid[0].ID
                var icon = pid[0].iconIndex + config.url.avatarFormat
                if (name != undefined) {
                    con.query("SELECT ID FROM PERSONA WHERE name = ?", [name], (err, result1) => {
                        if (result1.length === 0) {
                            con.query("UPDATE PERSONA SET name = ? WHERE ID = " + personaid, [name], err => {
                                if (!err) {
                                    const embed = new EmbedBuilder()
                                        .setAuthor({
                                            name: driver.toUpperCase() + " has been renamed.",
                                            iconURL: config.url.avatarEndpoint + icon
                                        })
                                        .setColor("#0080ff")
                                        .addFields({ name: "✍️ Renamed to", value: name.toUpperCase() })
                                    if (reason != undefined) {
                                        embed.addFields({ name: "📃 Reason", value: reason })
                                    }
                                    embed.addFields({ name: "👮 Renamed by", value: "<@" + interaction.user.id + ">" })
                                        .setFooter({
                                            text: interaction.client.user.tag,
                                            iconURL: interaction.client.user.displayAvatarURL()
                                        })
                                        .setTimestamp()
                                    interaction.client.channels.cache.get(config.channel.banlogs).send({ embeds: [embed] })
                                    interaction.reply({
                                        embeds: [embed],
                                    });
                                }
                            })
                        } else {
                            interaction.reply({ content: "There is already a driver called **`" + name + "`**.", ephemeral: true });
                        }
                    })
                } else {
                    con.query("UPDATE PERSONA SET name = ? WHERE ID = " + personaid, ["DRIVER" + personaid], err => {
                        if (!err) {
                            const embed = new EmbedBuilder()
                                .setAuthor({
                                    name: driver.toUpperCase() + " has been renamed.",
                                    iconURL: config.url.avatarEndpoint + icon
                                })
                                .setColor("#0080ff")
                                .addFields({ name: "✍️ Renamed to", value: "DRIVER" + personaid })
                            if (reason != undefined) {
                                embed.addFields({ name: "📃 Reason", value: reason })
                            }
                            embed.addFields({ name: "👮 Renamed by", value: "<@" + interaction.user.id + ">" })
                                .setFooter({
                                    text: interaction.client.user.tag,
                                    iconURL: interaction.client.user.displayAvatarURL()
                                })
                                .setTimestamp()
                            interaction.client.channels.cache.get(config.channel.banlogs).send({ embeds: [embed] })
                            interaction.reply({
                                embeds: [embed],
                            });
                        }
                    })
                }
            } else interaction.reply({ content: "Couldn't find a driver called **`" + driver + "`** in database.", ephemeral: true });
        })
    }
}