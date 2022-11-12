const { EmbedBuilder, ActivityType } = require('discord.js');
const CronJob = require('cron').CronJob;
const axios = require('axios');
const config = require("../config.json");
const channel = bot.channels.cache.get(config.channel.status);

function playersonline() {
    try {
        con.query("SELECT * FROM ONLINE_USERS ORDER BY numberOfOnline DESC LIMIT 1", function (err, result) {
            if (!err) countMaxOnline = result[0].numberOfOnline;
            if (!err) timestamp = result[0].time * 1000;
            date = new Date(timestamp);
            datePlayerPeak = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
        });
    } catch (err) { }
}

let countMaxOnline, datePlayerPeak, timestamp, date
function serverstatus() {
    axios.get(config.core.url + "/Engine.svc/GetServerInformation").then(response => {
        const json = response.data
        if (response.status !== 200 || json.length === 0) {
            throw ''
        }
        if (config.core.announceLobbies === true) {
            if (json.onlineNumber <= config.core.maxPlayerAnnounceLobby) {
                con.query("SELECT value FROM PARAMETER WHERE name = 'SBRWR_INFORM_EVENT'", function (err, paramresult) {
                    if (paramresult[0].value == "false") {
                        con.query("UPDATE PARAMETER SET value = 'true' WHERE name = 'SBRWR_INFORM_EVENT'")
                        axios.post(config.core.url + '/Engine.svc/ReloadParameters', "adminAuth=" + config.core.token.server, null)
                    }
                })
            } else if (json.onlineNumber > config.core.maxPlayerAnnounceLobby) {
                con.query("SELECT value FROM PARAMETER WHERE name = 'SBRWR_INFORM_EVENT'", function (err, paramresult) {
                    if (paramresult[0].value == "true") {
                        con.query("UPDATE PARAMETER SET value = 'false' WHERE name = 'SBRWR_INFORM_EVENT'")
                        axios.post(config.core.url + '/Engine.svc/ReloadParameters', "adminAuth=" + config.core.token.server, null)
                    }
                })
            }
        }

        bot.guilds.fetch(config.bot.serverId).then(guild => {
            var srvVer = json.serverVersion.substring(
                json.serverVersion.indexOf(""),
                json.serverVersion.lastIndexOf(" -")
            )
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: json.serverName,
                    url: config.url.website,
                    iconURL: guild.iconURL()
                })
                .setColor(config.bot.embed.hexColor)
                .setDescription("🟢 • Server is up and running.")
                .addFields({ name: '🌐 Online players', value: json.onlineNumber.toString(), inline: true })
                .addFields({ name: '🔖 Player peak', value: "**" + countMaxOnline + "** the **" + datePlayerPeak + "**", inline: true })
                .addFields({ name: '🎫 Registered players', value: Intl.NumberFormat('en-US').format(json.numberOfRegistered) + "", inline: true })
            if (json.cashRewardMultiplier <= 1 & json.repRewardMultiplier <= 1) {
                embed.addFields({ name: "📈 Multiplier", value: "No multiplier active", inline: true })
            } else if (json.cashRewardMultiplier > 1 & json.repRewardMultiplier <= 1) {
                embed.addFields({ name: "📈 Multiplier", value: "Cash **X" + (json.cashRewardMultiplier) + "**", inline: true })
            } else if (json.repRewardMultiplier > 1 & json.cashRewardMultiplier <= 1) {
                embed.addFields({ name: "📈 Multiplier", value: "Reputation **X" + (json.repRewardMultiplier) + "**", inline: true })
            } else if (json.cashRewardMultiplier > 1 & json.repRewardMultiplier > 1) {
                embed.addFields({ name: "📈 Multiplier", value: "Cash & Rep **X" + (json.cashRewardMultiplier) + "**", inline: true })
            } else if (json.cashRewardMultiplier != json.repRewardMultiplier && json.repRewardMultiplier > 1 || json.cashRewardMultiplier > 1) {
                embed.addFields({ name: "📈 Multiplier", value: "Cash **X" + (json.cashRewardMultiplier) + "**, Rep **X" + (json.repRewardMultiplier) + "**", inline: true })
            }
            embed.addFields({ name: "🕵 Admins", value: "<@&" + config.role.admin + ">", inline: true })
                .addFields({ name: "👮 Moderators", value: "<@&" + config.role.moderator + ">", inline: true })
                .addFields({ name: "⏲️ Timezone", value: '[' + config.core.timezone + '](https://time.is/' + config.core.timezone + ') [' + ('0' + new Date().getHours()).slice(-2) + ':' + ('0' + new Date().getMinutes()).slice(-2) + ']', inline: true })
                .addFields({ name: "⏲️ Speedbug timer", value: "**" + (json.secondsToShutDown / 60 / 60) + "** hours", inline: true })
                .addFields({ name: "⚙️ Server version", value: "**" + srvVer + "**", inline: true })
                .setFooter({
                    text: bot.user.tag,
                    iconURL: bot.user.displayAvatarURL()
                })
                .setTimestamp()
            channel.messages.fetch({ limit: 1 }).then(messages => {
                let lastMessage = messages.first()
                if (lastMessage) {
                    lastMessage.edit({ embeds: [embed] });
                } else {
                    channel.send({ embeds: [embed] })
                }
            })
            bot.user.setPresence({ activities: [{ name: json.onlineNumber + " players racing", type: ActivityType.Watching, url: config.url.website }], status: 'online' })
        });
    }).catch(() => {
        bot.guilds.fetch(config.bot.serverId).then(guild => {
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: config.core.serverName,
                    url: config.url.website,
                    iconURL: guild.iconURL()
                })
                .setColor("#ff0000")
                .setDescription("🔴 • Server is offline, check <#" + config.channel.announcement + "> for further informations.")
                .addFields({ name: "🌐 Online players", value: "N/A", inline: true })
                .addFields({ name: "🔖 Player peak", value: "N/A", inline: true })
                .addFields({ name: "🎫 Registered players", value: "N/A", inline: true })
                .addFields({ name: "📈 Multiplier", value: "N/A", inline: true })
                .addFields({ name: "🕵 Admins", value: "N/A", inline: true })
                .addFields({ name: "👮 Moderators", value: "N/A", inline: true })
                .addFields({ name: "⏲️ Timezone", value: "N/A", inline: true })
                .addFields({ name: "⏲️ Speedbug timer", value: "N/A", inline: true })
                .addFields({ name: "⚙️ Server version", value: "N/A", inline: true })
                .setFooter({
                    text: "last update"
                })
                .setTimestamp()

            channel.messages.fetch({ limit: 1 }).then(messages => {
                let lastMessage = messages.first()
                if (lastMessage) {
                    lastMessage.edit({ embeds: [embed] });
                } else {
                    channel.send({ embeds: [embed] })
                }
            })
        })
        bot.user.setPresence({ activities: [{ name: "watching players complain because they don't read #📰-announcements.", type: ActivityType.Watching }], status: 'dnd' })
    })
}
const jobmaxplayer = new CronJob('* * * * *', playersonline)
const jobstatus = new CronJob('* * * * *', serverstatus)

jobmaxplayer.start()
jobstatus.start()
playersonline()
serverstatus()