const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");

module.exports = {
	allowedRoles: [config.role.admin, config.role.moderator],
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
				.setDescription('The driver that will receive money.')
				.setRequired(true)),

	async execute(interaction) {
		const driver = interaction.options.getString('driver');
		const currency = interaction.options.getString('currency');
		const amount = interaction.options.getNumber('amount');
		con.query("SELECT ID, cash, boost, iconIndex, name FROM PERSONA WHERE name = ?", [driver], (err, result) => {
			if (result.length > 0) {
				var icon = result[0].iconIndex + config.url.avatarFormat;
				if (currency === "cash")
					con.query("UPDATE PERSONA SET cash = cash + ? WHERE name = ?", [amount, driver], err => {
						const embed = new EmbedBuilder()
							.setAuthor({
								name: result[0].name + " received cash.",
								iconURL: config.url.avatarEndpoint + icon
							})
							.setColor("#0398fc")
							.addFields(
								{ name: "Old cash amount", value: "**`" + Intl.NumberFormat('en-US').format(result[0].cash) + " $`**" },
								{ name: "New cash amount", value: "**`" + Intl.NumberFormat('en-US').format(Number(result[0].cash) + Number(amount)) + " $`**" },
								{ name: "Cash added by", value: "<@" + interaction.user.id + ">" })
							.setFooter({
								text: interaction.client.user.tag,
								iconURL: interaction.client.user.displayAvatarURL()
							})
							.setTimestamp()
						interaction.reply({
							embeds: [embed],
						});
					})
				else if (currency === "sb")
					con.query("UPDATE PERSONA SET boost = boost + ? WHERE name = ?", [amount, driver], err => {
						const embed = new EmbedBuilder()
							.setAuthor({
								name: result[0].name + " received speedboost.",
								iconURL: config.url.avatarEndpoint + icon
							})
							.setColor("#fcba03")
							.addFields(
								{ name: "Old speedboost amount", value: "**`" + Intl.NumberFormat('en-US').format(result[0].boost) + " SB`**" },
								{ name: "New speedboost amount", value: "**`" + Intl.NumberFormat('en-US').format(Number(result[0].boost) + Number(amount)) + " SB`**" },
								{ name: "Speedboost added by", value: "<@" + interaction.user.id + ">" })
							.setFooter({
								text: interaction.client.user.tag,
								iconURL: interaction.client.user.displayAvatarURL()
							})
							.setTimestamp()
						interaction.reply({
							embeds: [embed],
						});
					})
			} else interaction.reply({ content: "Couldn't find a driver called **`" + driver + "`** in database.", ephemeral: true });
		})
	},
};