const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("../config.json");

module.exports = {
	allowedRoles: [config.role.admin, config.role.moderator],
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('Unlock the account of a player with driver name or email.')
		.addStringOption((option) =>
			option
				.setName('type')
				.setDescription('Choose if you will give an email or a driver name.')
				.addChoices(
					{ name: "E-mail", value: "email" },
					{ name: "Driver name", value: "driver" }
				)
				.setRequired(true))
		.addStringOption((option) =>
			option
				.setName('target')
				.setDescription('Who is the target?')
				.setRequired(true)),
		

	async execute(interaction) {
		const type = interaction.options.getString('type');
		const target = interaction.options.getString('target');
		if (type === 'email') {
			con.query("SELECT ID, email, isLocked FROM USER WHERE email = ?", target, (err, result) => {
				if (result.length > 0) {
					con.query("SELECT ID, IconIndex FROM PERSONA WHERE USERID = ? ORDER BY ID LIMIT 1", result[0].ID, (err2, result2) => {
						con.query("UPDATE USER SET isLocked = 0 WHERE ID = ?", result[0].ID)
						var icon = result2[0].iconIndex + config.url.avatarFormat
						const embed = new EmbedBuilder()
						if (result2[0].ID === 0) {
							embed.setAuthor({
								name: "The account with email " + result[0].email + " has been unlocked.",
								iconURL: config.url.avatarEndpoint + icon
							})
						} else {
							embed.setAuthor({
								name: "The account with email " + result[0].email + " has been unlocked",
								iconURL: config.url.avatarEndpoint + "26.jpg"
							})
						}
							embed.setColor("#11ff00")
							.addFields({ name: "👮 Unlocked by", value: "<@" + interaction.user.id + ">" })
							.setFooter({
								text: interaction.client.user.tag,
								iconURL: interaction.client.user.displayAvatarURL()
							})
							.setTimestamp()
						interaction.reply({
							embeds: [embed],
						});
					}
					)
				} else interaction.reply({ content: "Couldn't find the email **`" + target + "`** in database.", ephemeral: true });
			} 
		)}

		if (type === 'driver') {
			con.query("SELECT USERID, name, iconIndex FROM PERSONA WHERE name = ?", target, (err, result) => {
				if (result.length > 0) {
						con.query("UPDATE USER SET isLocked = 0 WHERE ID = ?", result[0].USERID)
						var icon = result[0].iconIndex + config.url.avatarFormat
						const embed = new EmbedBuilder()
							.setAuthor({
								name: "The account attached to " + result[0].name + " has been unlocked.",
								iconURL: config.url.avatarEndpoint + icon
							})
							.setColor("#11ff00")
							.addFields({ name: "👮 Unlocked by", value: "<@" + interaction.user.id + ">" })
							.setFooter({
								text: interaction.client.user.tag,
								iconURL: interaction.client.user.displayAvatarURL()
							})
							.setTimestamp()
						interaction.reply({
							embeds: [embed],
						});
				} else interaction.reply({ content: "Couldn't find a driver called **`" + target + "`** in database.", ephemeral: true });
			} 
		)}
	},
};