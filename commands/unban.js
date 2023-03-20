const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");

module.exports = {
    allowedRoles: [config.role.admin, config.role.moderator],
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a player from the game.')
        .addStringOption((option) =>
            option
                .setName('driver')
                .setDescription('The driver you want to unban.')
                .setRequired(true))
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('The reason of the unban.')
                .setRequired(false)),

    async execute(interaction) {
        const driver = interaction.options.getString('driver');
        const reason = interaction.options.getString('reason');
        con.query("SELECT USERID, name, iconIndex FROM PERSONA WHERE name = ?", driver, (err, result) => {
            if (result.length > 0) {
                var userid = result[0].USERID
                var pname = result[0].name
                var icon = result[0].iconIndex + config.url.avatarFormat
                con.query("SELECT gameHardwareHash AS ghh FROM USER WHERE ID = ?", [userid], (err, userInfo) =>
                    con.query("SELECT * FROM BAN WHERE user_id = ? AND active = 1", [userid], (err, result1) =>
                        con.query("SELECT * FROM HARDWARE_INFO WHERE userId = ? AND hardwareHash = ? AND banned = 1", [userid, userInfo[0].ghh], (err, result2) => {
                            if (result1.length > 0 || result2.length > 0) {
                                con.query("UPDATE BAN SET active = 0 WHERE user_id = ?", [userid]); {
                                    con.query("UPDATE HARDWARE_INFO SET banned = 0 WHERE hardwareHash = ?", [userInfo[0].ghh])
                                    con.query("UPDATE USER SET isLocked = 0 WHERE ID = ?", [userid])
                                    const embed = new EmbedBuilder()
                                        .setAuthor({
                                            name: pname + " has been unbanned.",
                                            iconURL: config.url.avatarEndpoint + icon
                                        })
                                        .setColor("#11ff00")
                                    if (reason != undefined) {
                                        embed.addFields({ name: "📃 Reason", value: reason })
                                    }
                                    embed.addFields({ name: "👮 Unbanned by", value: "<@" + interaction.user.id + ">" })
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
                                con.query("SELECT email, ID, isLocked FROM USER WHERE gameHardwareHash = ?", [userInfo[0].ghh], (err, otherAcc) => {
                                    if (otherAcc.length > 1) {
                                        const embed1 = new EmbedBuilder()
                                            .setAuthor({
                                                iconURL: config.url.avatarEndpoint + icon
                                            })
                                            .setDescription(result[0].name + " is also hardware banned on the following accounts :arrow_heading_down:")
                                        message.channel.send({ embeds: [embed1] })
                                        otherAcc.forEach(acc => {
                                            const embed2 = new EmbedBuilder()
                                                .setColor("#ff0000")
                                                .addFields(
                                                    { name: "📧 Email", value: "**`" + acc.emai + "`**" },
                                                    { name: "🪪 User ID", value: "**`" + acc.ID + "`**" },
                                                    { name: "🔐 Account state", value: acc.isLocked == 1 ? "`Locked`" : "`Unlocked`" }
                                                )
                                                .setFooter({
                                                    text: interaction.client.user.tag,
                                                    iconURL: interaction.client.user.displayAvatarURL()
                                                })
                                                .setTimestamp()
                                            interaction.message.channel.send({ embeds: [embed2] })
                                        })
                                    }
                                })
                            }
                            else {
                                interaction.reply({ content: "The driver **`" + driver + "`** doesn't have any active ban.", ephemeral: true });
                            }
                        })))
            } else {
                interaction.reply({ content: "Couldn't find a driver called **`" + driver + "`** in database.", ephemeral: true });
            }
        });
    }
}