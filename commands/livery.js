const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");

module.exports = {
    allowedRoles: [config.role.admin, config.role.moderator],
    data: new SlashCommandBuilder()
        .setName('livery')
        .setDescription('Manage the livery of a car owned by someone')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Remove a car livery.')
                .addStringOption((option) =>
                    option
                        .setName('driver')
                        .setDescription('The driver owning the car. This will remove the livery from the currently used car.')
                        .setRequired(true))
                .addStringOption((option) =>
                    option
                        .setName('carid')
                        .setDescription('The car id. This will remove the livery from a specific car.')
                        .setRequired(false))
                .addStringOption((option) =>
                    option
                        .setName('reason')
                        .setDescription('Give a reason to your action.')
                        .setRequired(false))
        ),

    async execute(interaction) {
        const subc = interaction.options._subcommand
        const driver = interaction.options.getString('driver');
        const carid = interaction.options.getString('carid');
        const reason = interaction.options.getString('reason');

        if (subc === 'remove') {
            con.query("SELECT id, curCarIndex, iconIndex, name FROM PERSONA WHERE name = ?", driver, (err, result) => {
                if (result.length > 0) {
                    var persona = result[0].id;
                    var carindex = result[0].iconIndex + config.url.avatarFormat
                    var icon = result[0].iconIndex + ".jpg";
                    con.query("SELECT id FROM CAR WHERE personaId = ? LIMIT ?,1;", [persona, carindex], (err2, result2) => {
                        if (carid != undefined) {
                            con.query("DELETE FROM VINYL WHERE carId = ?", carid, (err3, result3) => {
                                if (!err3) {
                                    const embed = new EmbedBuilder()
                                        embed.setAuthor({
                                            name: result[0].name + " has lost a livery",
                                            iconURL: config.url.avatarEndpoint + icon
                                        })
                                        embed.setColor("#ff0000")
                                    if (reason != undefined) {
                                        embed.addFields({ name: "📃 Reason", value: reason })
                                    }
                                    embed.addFields({ name: "👮 Livery removed by", value: "<@" + interaction.user.id + ">" })
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
                            con.query("DELETE FROM VINYL WHERE carId = ?", result2[0].id, (err4, result4) => {
                                if (!err4) {
                                    const embed = new EmbedBuilder()
                                        embed.setAuthor({
                                            name: result[0].name + " has lost a livery",
                                            iconURL: config.url.avatarEndpoint + icon
                                        })
                                        embed.setColor("#ff0000")
                                    if (reason != undefined) {
                                        embed.addFields({ name: "📃 Reason", value: reason })
                                    }
                                    embed.addFields({ name: "👮 Livery removed by", value: "<@" + interaction.user.id + ">" })
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
                    })
                } else {
                    interaction.reply({ content: "Couldn't find a driver called **`" + driver + "`** in database.", ephemeral: true });
                }

            })
            
        }
    }
}