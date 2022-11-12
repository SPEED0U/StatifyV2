const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");
const axios = require('axios')

module.exports = {
    allowedRoles: [config.role.admin, config.role.launcher, config.role.moderator],
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Manage server settings.')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('edit')
                .setDescription('Edit a server setting.')
                .addNumberOption((option) =>
                    option
                        .setName('repmultiplier')
                        .setDescription('Change reputation multiplier.')
                        .setRequired(false))
                .addNumberOption((option) =>
                    option
                        .setName('cashmultiplier')
                        .setDescription('Change cash multiplier.')
                        .setRequired(false))
                .addNumberOption((option) =>
                    option
                        .setName('multiplier')
                        .setDescription('Change global multiplier.')
                        .setRequired(false))
                .addNumberOption((option) =>
                    option
                        .setName('modsversion')
                        .setDescription('Change mods version.')
                        .setRequired(false))
                .addStringOption((option) =>
                    option
                        .setName('mapscenery')
                        .setDescription('Change map scenery.')
                        .addChoices(
                            { name: "Normal", value: "normal" },
                            { name: "Halloween", value: "halloween" },
                            { name: "Oktoberfest", value: "oktoberfest" },
                            { name: "Fireworks", value: "fireworks" },
                            { name: "Chirstmas", value: "christmas" },
                        )
                        .setRequired(false))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('launcher')
                .setDescription('Edit a launcher setting.')
                .addStringOption((option) =>
                    option
                        .setName('add')
                        .setDescription('Add a SHA or HWID to allowed launcher settings.')
                        .addChoices(
                            { name: "SHA of launcher build", value: "sha" },
                            { name: "HWID of computer", value: "hwid" },
                        )
                        .setRequired(false))
                .addStringOption((option) =>
                    option
                        .setName('remove')
                        .setDescription('Remove a SHA or HWID from allowed launcher settings.')
                        .addChoices(
                            { name: "SHA of launcher build", value: "sha" },
                            { name: "HWID of computer", value: "hwid" },
                        )
                        .setRequired(false))
                .addStringOption((option) =>
                    option
                        .setName('value')
                        .setDescription('The SHA or HWID value.')
                        .setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('apply')
                .setDescription('Apply edited settings.')),

    async execute(interaction) {
        const subc = interaction.options._subcommand
        const repm = interaction.options.getNumber('repmultiplier')
        const cashm = interaction.options.getNumber('cashmultiplier')
        const m = interaction.options.getNumber('multiplier')
        const modsv = interaction.options.getNumber('modsversion')
        const mapsc = interaction.options.getString('mapscenery')
        const add = interaction.options.getString('add')
        const remove = interaction.options.getString('remove')
        const value = interaction.options.getString('value')

        if (subc === "apply") {
            axios.post(config.core.url + '/Engine.svc/ReloadParameters', "adminAuth=" + config.core.token.server, null).then(() => {
                const embed = new EmbedBuilder()
                    .setColor("#00ff33")
                    .addFields(
                        { name: "Server parameters applied", value: "The new settings are now active." },
                        { name: "Settings applied by", value: "<@" + interaction.user.id + ">" })
                    .setFooter({
                        text: interaction.client.user.tag,
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                    .setTimestamp()
                interaction.reply({
                    embeds: [embed],
                });
            })
        } if (subc === "edit") {
            if (repm != undefined) {
                con.query("UPDATE PARAMETER SET value = ? WHERE name = 'REP_REWARD_MULTIPLIER'", [repm])
            }
            if (cashm != undefined) {
                con.query("UPDATE PARAMETER SET value = ? WHERE name = 'CASH_REWARD_MULTIPLIER'", [cashm])
            }
            if (m != undefined) {
                con.query("UPDATE PARAMETER SET value = ? WHERE name = 'REP_REWARD_MULTIPLIER' OR name = 'CASH_REWARD_MULTIPLIER'", [m])
            }
            if (modsv != undefined) {
                const modsurl = config.url.modsEndpoint + modsv
                con.query("UPDATE PARAMETER SET value = ? WHERE name = 'MODDING_BASE_PATH'", [modsurl])
            }
            if (mapsc != undefined) {
                if (mapsc === "normal") {
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_NORMAL' WHERE name = 'SERVER_INFO_ENABLED_SCENERY'")
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_NORMAL_DISABLED' WHERE name = 'SERVER_INFO_DISABLE_SCENERY'")
                } if (mapsc === "oktoberfest") {
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_OKTOBERFEST' WHERE name = 'SERVER_INFO_ENABLED_SCENERY'")
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_OKTOBERFEST_DISABLED' WHERE name = 'SERVER_INFO_DISABLE_SCENERY'")
                } if (mapsc === "fireworks") {
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_NEWYEARS' WHERE name = 'SERVER_INFO_ENABLED_SCENERY'")
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_NEWYEARS_DISABLED' WHERE name = 'SERVER_INFO_DISABLE_SCENERY'")
                } if (mapsc === "halloween") {
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_HALLOWEEN' WHERE name = 'SERVER_INFO_ENABLED_SCENERY'")
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_HALLOWEEN_DISABLED' WHERE name = 'SERVER_INFO_DISABLE_SCENERY'")
                } if (mapsc === "christmas") {
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_CHRISTMAS' WHERE name = 'SERVER_INFO_ENABLED_SCENERY'")
                    con.query("UPDATE PARAMETER SET value = 'SCENERY_GROUP_CHRISTMAS_DISABLED' WHERE name = 'SERVER_INFO_DISABLE_SCENERY'")
                }
            }
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: "New server settings",
                    iconURL: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/60/twitter/53/hammer-and-wrench_1f6e0.png"
                })
                .setColor("#b2c6d1")
            if (repm != undefined) {
                embed.addFields({ name: "⭐ Reputation multiplier", value: "**`X" + repm + "`**" })
            } if (cashm != undefined) {
                embed.addFields({ name: "💰 Cash multiplier", value: "**`X" + cashm + "`**" })
            } if (m != undefined) {
                embed.addFields({ name: ":x: Global multiplier", value: "**`X" + m + "`**" })
            } if (modsv != undefined) {
                embed.addFields({ name: "📂 Mods version", value: "**`" + modsv + "`**" })
            } if (mapsc != undefined) {
                embed.addFields({ name: "🗺️ Map scenery", value: "**`" + mapsc.charAt(0).toUpperCase() + mapsc.slice(1) + "`**" })
            }
            embed.addFields({ name: "** **", value: "To apply the new settings please use `/settings apply`." })
            embed.setFooter({
                text: interaction.client.user.tag,
                iconURL: interaction.client.user.displayAvatarURL()
            })
                .setTimestamp()
            interaction.reply({
                embeds: [embed],
            });
        } if (subc === "launcher") {
            if (add == "sha" || remove == "sha") {
                if (add != undefined) {
                    con.query("UPDATE PARAMETER SET value = CONCAT(value, ?) WHERE name = 'SIGNED_LAUNCHER_HASH'", [";" + value.toUpperCase()])
                } else if (remove != undefined) {
                    con.query("SELECT value FROM PARAMETER WHERE name = 'SIGNED_LAUNCHER_HASH'", [], (err, result) => {
                        con.query("UPDATE PARAMETER SET value = ? WHERE name = 'SIGNED_LAUNCHER_HASH'", [result[0]['value'].replace(';' + value, '')])
                    })
                }
            } else if (add == "hwid" || remove == "hwid") {
                if (add != undefined) {
                    con.query("UPDATE PARAMETER SET value = CONCAT(value, ?) WHERE name = 'SIGNED_LAUNCHER_HWID_WL'", [";" + value.toUpperCase()])
                } else if (remove != undefined) {
                    con.query("SELECT value FROM PARAMETER WHERE name = 'SIGNED_LAUNCHER_HWID_WL'", [], (err, result) => {
                        con.query("UPDATE PARAMETER SET value = ? WHERE name = 'SIGNED_LAUNCHER_HWID_WL'", [result[0]['value'].replace(';' + value, '')])
                    })
                }
            } else {
                interaction.reply({ content: "You have to specify the type of your value with **`add`** or **`remove`** choices.", ephemeral: true });
            } if (add != undefined || remove != undefined) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: "New launcher settings",
                        iconURL: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/60/twitter/53/hammer-and-wrench_1f6e0.png"
                    })
                    .setColor("#b2c6d1")
                if (add != undefined) {
                    if (add == "sha") {
                        embed.addFields({ name: "🆔 Added SHA", value: "**`" + value.toUpperCase() + "`**" })
                    } else if (add == "hwid") {
                        embed.addFields({ name: "🆔 Added HWID", value: "**`" + value.toUpperCase() + "`**" })
                    }
                } if (remove != undefined) {
                    if (remove == "sha") {
                        embed.addFields({ name: "🆔 Removed SHA", value: "**`" + value.toUpperCase() + "`**" })
                    } else if (add == "hwid") {
                        embed.addFields({ name: "🆔 Removed HWID", value: "**`" + value.toUpperCase() + "`**" })
                    }
                }
                embed.addFields({ name: "** **", value: "To apply the new settings please use `/settings apply`." })
                embed.setFooter({
                    text: interaction.client.user.tag,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                    .setTimestamp()
                interaction.reply({
                    embeds: [embed],
                });
            }
        }
    },
};