const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");

module.exports = {
    allowedRoles: [config.role.admin, config.role.moderator],
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get multiple internal information about a player')
        .addStringOption((option) =>
            option
                .setName('target')
                .setDescription('Type a driver name or an account email.')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getString('target');
        con.query("SELECT ID FROM USER WHERE email = ?", [target], (err, userid) => {
            con.query("SELECT ID, USERID, iconIndex FROM PERSONA WHERE name = ?", [target], (err, pid) => {
                if (pid.length > 0 || userid.length > 0) {
                    con.query("SELECT EMAIL, gameHardwareHash, IP_ADDRESS, lastLogin, isLocked, created, ID, premium, discord FROM USER WHERE id = ?", [pid.length > 0 ? pid[0].USERID : userid[0].ID], (err, uid) => {
                        var email = uid[0].EMAIL
                        var ghh = uid[0].gameHardwareHash
                        var ip = uid[0].IP_ADDRESS
                        var lastlog = uid[0].lastLogin
                        var locked = uid[0].isLocked.readInt8()
                        var accCreation = uid[0].created
                        var userId = uid[0].ID
                        var premium = uid[0].premium.readInt8()
                        var discordid = uid[0].discord
                        con.query("SELECT name FROM PERSONA WHERE USERID = ?", [userId], (err, drivers) => {
                            var attachedDrivers = []
                            for (driver of drivers) {
                                attachedDrivers.push("`" + driver.name + "`")
                            }
                            const embed = new EmbedBuilder()
                                .setAuthor({
                                    name: "Account information of " + target.toUpperCase()
                                })
                                .setColor("#ff0000")
                                .addFields(
                                    { name: "Account ID", value: "`" + userId + "`" },
                                    { name: "Hardware hash", value: "`" + ghh.toUpperCase() + "`" },
                                    { name: "Email", value: "`" + email + "`" },
                                    { name: "Discord ID", value: discordid != null ? "`" + discordid + "` alias <@" + discordid + ">" : "`No account linked`" },
                                    { name: "IP address", value: "`" + ip + "`" },
                                    { name: "Membership", value: premium == 1 ? "`Premium`" : "`Freemium`" },
                                    { name: "Account state", value: locked == 1 ? "`Locked`" : "`Unlocked`" },
                                    { name: "Account creation date", value: "`" + accCreation.toLocaleString('en-GB', { timeZone: "Europe/Paris", hour12: false }) + "`" },
                                    { name: "Last connection", value: "`" + lastlog.toLocaleString('en-GB', { timeZone: "Europe/Paris", hour12: false }) + "`" },
                                )
                            if (attachedDrivers.length < 1) {
                                embed.addFields({ name: "Attached drivers", value: "`This account doesn't have any drivers.`" })
                            } else {
                                embed.addFields({ name: "Attached drivers", value: attachedDrivers.join(", ") })
                            }
                            embed.setFooter({
                                text: bot.user.tag,
                                iconURL: bot.user.displayAvatarURL()
                            })
                                .setTimestamp()
                            interaction.reply({ embeds: [embed] });
                        })
                    })
                } else if (target.includes('@')) {
                    interaction.reply({ content: "Couldn't find an account with the email **`" + target + "`** in database.", ephemeral: true });
                } else {
                    interaction.reply({ content: "Couldn't find a driver called **`" + target + "`** in database.", ephemeral: true });
                }
            })
        })
    }
}