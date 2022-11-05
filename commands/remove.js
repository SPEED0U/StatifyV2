const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const settings = require("../config.json");
const mysql = require('mysql');
var con = mysql.createConnection(settings.sql);

module.exports = {
	allowedRoles: [settings.role.admin, settings.role.moderator],
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove a certain amount of currency to a player.')
		.addNumberOption((option) =>
			option
				.setName('amount')
				.setDescription('The amount of currency you want to remove.')
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('currency')
				.setDescription('The currency you want to remove.')
				.addChoices(
					{ name: "Cash", value: "cash" },
					{ name: "Speedboost", value: "sb" }
				)
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('driver')
				.setDescription('The driver that will lose money.')
				.setRequired(true)),

	async execute(interaction, client) {
		const driver = interaction.options.getString('driver');
		const currency = interaction.options.getString('currency');
		const amount = interaction.options.getNumber('amount');
		con.query("SELECT ID, cash, boost, iconIndex, name FROM PERSONA WHERE name = ?", [driver], (err, result) => {
			if (result.length > 0) {
				var icon = result[0].iconIndex + settings.url.avatarFormat;
				if (currency === "cash")
					con.query("UPDATE PERSONA SET cash = cash - ? WHERE name = ?", [amount, driver], err => {
						const embed = new EmbedBuilder()
							.setAuthor({
								name: result[0].name + " lost cash.",
								iconURL: settings.url.avatarEndpoint + icon
							})
							.setColor("#0398fc")
							.addFields(
								{ name: "Old cash amount", value: "`" + Intl.NumberFormat('en-US').format(result[0].cash) + " $`" },
								{ name: "New cash amount", value: "`" + Intl.NumberFormat('en-US').format(Number(result[0].cash) - Number(amount)) + " $`" },
								{ name: "Cash removed by", value: "<@" + interaction.user.id + ">" })
							.setFooter({
								text: client.user.tag,
								iconURL: client.user.displayAvatarURL()
							})
							.setTimestamp()
						interaction.reply({
							embeds: [embed],
						});
					})
				else if (currency === "sb")
					con.query("UPDATE PERSONA SET boost = boost - ? WHERE name = ?", [amount, driver], err => {
						const embed = new EmbedBuilder()
							.setAuthor({
								name: result[0].name + " lost speedboost.",
								iconURL: settings.url.avatarEndpoint + icon
							})
							.setColor("#fcba03")
							.addFields(
								{ name: "Old speedboost amount", value: "`" + Intl.NumberFormat('en-US').format(result[0].cash) + " SB`" },
								{ name: "New speedboost amount", value: "`" + Intl.NumberFormat('en-US').format(Number(result[0].cash) - Number(amount)) + " SB`" },
								{ name: "Speedboost removed by", value: "<@" + interaction.user.id + ">" })
							.setFooter({
								text: client.user.tag,
								iconURL: client.user.displayAvatarURL()
							})
							.setTimestamp()
						interaction.reply({
							embeds: [embed],
						});
					})
			} else interaction.reply({ content: "Couldn't find a driver called **`" + interaction.options.getString('driver') + "`** in database.", ephemeral: true });
		})
	},
};