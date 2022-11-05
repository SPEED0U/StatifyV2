const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const settings = require("../config.json");
const mysql = require('mysql');
var con = mysql.createConnection(settings.sql);

module.exports = {
	allowedRoles: [settings.role.admin, settings.role.moderator],
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription('Give a certain amount of currency to a player.')
		.addNumberOption((option) =>
			option
				.setName('amount')
				.setDescription('The amount of currency you want to send.')
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('currency')
				.setDescription('The currency you want to send.')
				.addChoices(
					{ name: "Cash", value: "cash" },
					{ name: "Speedboost", value: "sb" }
				)
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('driver')
				.setDescription('The driver that will receive the money.')
				.setRequired(true)),

	async execute(interaction, client) {
		const driver = interaction.options.getString('driver');
		const currency = interaction.options.getString('currency');
		const amount = interaction.options.getNumber('amount');
		var sql_command = "";

		if(currency === "cash") {
			sql_command = "UPDATE PERSONA SET cash = cash + ? WHERE name = ?";
		} else {
			sql_command = "UPDATE PERSONA SET boost = boost + ? WHERE name = ?";
		}

		con.query("SELECT ID, cash, boost, iconIndex, name FROM PERSONA WHERE name = ?", [driver], (err, result) => {
			if (result.length > 0) {
				var icon = result[0].iconIndex + settings.url.avatarFormat;
				
				con.query(sql_command, [amount, driver], err => {
					const embed = new EmbedBuilder()
						.setAuthor({
							name: result[0].name + " received " + (currency === "cash") ? "cash" : "speedboost" + ".",
							iconURL: settings.url.avatarEndpoint + icon
						})
						.setColor("#0398fc");

						if(currency === "cash") {
							embed.addFields(
								{ name: "Old cash amount", value: "`" + Intl.NumberFormat('en-US').format(result[0].cash) + " $`" },
								{ name: "New cash amount", value: "`" + Intl.NumberFormat('en-US').format(Number(result[0].cash) + Number(amount)) + " $`" },
								{ name: "Cash added by", value: "<@" + interaction.user.id + ">" }
							)							
						} else {
							embed.addFields(
								{ name: "Old speedboost amount", value: "`" + Intl.NumberFormat('en-US').format(result[0].cash) + " SB`" },
								{ name: "New speedboost amount", value: "`" + Intl.NumberFormat('en-US').format(Number(result[0].cash) + Number(amount)) + " SB`" },
								{ name: "Speedboost added by", value: "<@" + interaction.user.id + ">" })
						}

						embed.setFooter({
							text: client.user.tag,
							iconURL: client.user.displayAvatarURL()
						})
						.setTimestamp();

						interaction.reply({
							embeds: [embed],
						});
					})
			} else interaction.reply({ content: "Couldn't find a driver called **`" + interaction.options.getString('driver') + "`** in database.", ephemeral: true });
		})
	},
};