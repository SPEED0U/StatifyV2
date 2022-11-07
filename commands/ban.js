const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");
const mysql = require('mysql');
const axios = require('axios');
var con = mysql.createConnection(config.sql);

function convertToIntervalTime(date) {
    var suffix = date.split('').pop();
    var nums = date.replace(suffix, '');

    var times = "";

    switch (suffix) {
        case 'd': times = "DAY"; break;
        case 'm': times = "MONTH"; break;
        case 'w': times = "WEEK"; break;
        case 'y': times = "YEAR"; break;
    }

    return "DATE_ADD(NOW(), INTERVAL " + nums + " " + times + ")";
}

module.exports = {
    allowedRoles: [config.role.admin, config.role.moderator],
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a player from the game.')
        .addStringOption((option) =>
            option
                .setName('driver')
                .setDescription('The driver you want to ban.')
                .setRequired(true))
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('The reason of the ban')
                .setRequired(false))
        .addStringOption((option) =>
            option
                .setName('duration')
                .setDescription("The duration of the ban. Available suffixes: 'd' for day, 'w' for week, 'm' for month.")
                .setRequired(false)),

    async execute(interaction) {
        const driver = interaction.options.getString('driver');
        const reason = interaction.options.getString('reason');
        const duration = interaction.options.getString('duration');
        if (duration == undefined || duration.match(/^([0-9]+)(d|m|y|w)$/)) {
            con.query("SELECT USERID, ID, iconIndex, name FROM PERSONA WHERE name = ?", [driver], (err, result) => {
                if (result.length > 0) {
                    if (duration != undefined) {
                        var nosuffix = duration.substring(0, duration.length - 1);
                        var durationsuffix = duration.slice(-1)
                    }
                    var userid = result[0].USERID;
                    var icon = result[0].iconIndex + config.url.avatarFormat
                    const units = {
                        d: "day(s)",
                        w: "week(s)",
                        y: "year(s)",
                        m: "month(s)"
                    }
                    con.query("SELECT gameHardwareHash AS ghh FROM USER WHERE ID = ?", [userid], (err, userInfo) =>
                        con.query("SELECT * FROM BAN WHERE user_id = " + userid + " AND active = 1", (err, result1) => {
                            if (result1.length == 0) {
                                if (duration != undefined) {
                                    con.query("INSERT INTO `BAN` (`id`, `ends_at`, `reason`, `started`, `banned_by_id`, `user_id`, `active`) VALUES (NULL, " + convertToIntervalTime(duration) + ", ?, NOW(), ?, ?, 1)", [reason, config.core.botPersonaId, userid], err)
                                } else {
                                    con.query("INSERT INTO `BAN` (`id`, `ends_at`, `reason`, `started`, `banned_by_id`, `user_id`, `active`) VALUES (NULL, NULL, ?, NOW(), ?, ?, 1)", [reason, config.core.botPersonaId, userid], err)
                                }
                                con.query("UPDATE HARDWARE_INFO SET banned = 1 WHERE userId = ? AND hardwareHash = ?", [userid, userInfo[0].ghh]), (err)
                                axios.post(config.core.url + '/Engine.svc/ofcmdhook?webhook=false&pid=' + config.core.botPersonaId + '&cmd=kick%20' + result[0].name, null, { headers: { Authorization: config.core.token.openfire } }).then(res => { }).catch(error => { })
                                if (!err) {
                                    const post = new URLSearchParams();
                                    if (duration != undefined) {
                                        post.append('message', `TXT_ORANGE,[${result[0].name}] HAS BEEN TEMPORARILY BANNED FOR ` + nosuffix.toUpperCase() + " " + units[durationsuffix].toUpperCase() + ".");
                                    } else {
                                        post.append('message', `TXT_RED,[${result[0].name}] HAS BEEN PERMANENTLY BANNED.`);
                                    }
                                    post.append('announcementAuth', config.core.token.server);
                                    const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' } };
                                    axios.post(config.core.url + '/Engine.svc/Send/Announcement', post, config)
                                    const embed = new EmbedBuilder()
                                    if (duration != undefined) {
                                        embed.setAuthor({
                                            name: result[0].name + " has been temporarily banned.",
                                            iconURL: config.url.avatarEndpoint + icon
                                        })
                                        embed.addFields({ name: "⌛ Ban duration", value: nosuffix + " " + units[durationsuffix] })
                                        embed.setColor("#ff6600")
                                    } else {
                                        embed.setAuthor({
                                            name: result[0].name + " has been permanently banned.",
                                            iconURL: config.url.avatarEndpoint + icon
                                        })
                                        embed.setColor("#ff0000")
                                    }
                                    if (reason != undefined) {
                                        embed.addFields({ name: "📃 Reason", value: reason })
                                    }
                                    embed.addFields({ name: "👮 Banned by", value: "<@" + interaction.user.id + ">" })
                                        .setFooter({
                                            text: interaction.client.user.tag,
                                            iconURL: interaction.client.user.displayAvatarURL()
                                        })
                                        .setTimestamp()
                                    interaction.client.channels.cache.get(config.channel.banlogs).send({ embeds: [embed] })
                                    interaction.reply({
                                        embeds: [embed],
                                    });
                                } else {
                                    console.log(err)
                                }
                            }
                            else {
                                interaction.reply({ content: "The driver **`" + driver + "`** already have an active ban.", ephemeral: true });
                            }
                        }))
                } else {
                    interaction.reply({ content: "Couldn't find a driver called **`" + driver + "`** in database.", ephemeral: true });
                }
            });
        } else {
            interaction.reply({ content: "Unknown unit or format, the available units are `d`, `w`, `m` and `y`.\nExample of usage for a **5 day** ban: `/ban [DRIVER] [REASON] 5d`", ephemeral: true });
        }
    }
}