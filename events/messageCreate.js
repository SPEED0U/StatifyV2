const { Events } = require('discord.js');
const settings = require("../config.json");
let users = {}

module.exports = {
    name: Events.MessageCreate,
    execute(message, client) {
        antispamscam(message, client)
    }
};

function antispamscam(message, client) {
    if (message.content.length > 0) {
        console.log(users[message.author.id])
        if (users[message.author.id]) {
            const user = users[message.author.id]
            const lastMessage = user.message.last()
            const diff = (message.createdTimestamp - lastMessage.createdTimestamp) / 1000
            if (diff <= settings.antiscam.delay && lastMessage.content === message.content) {
                if (!user.messages.includes(lastMessage)) user.message.push(lastMessage)
                user.messages.push(message)
                const count = user.messages.length
                if (count === settings.antiscam.maxDuplicate) {
                    for (const msg of user.messages) {
                        try {
                            msg.delete()
                        } catch (error) {
                            console.log("The message that should've been deleted by myself has already been deleted.")
                        }
                    }
                    message.member.kick('Kicked for spamming "' + message.content + '"')
                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: message.author.tag + " has been kicked.",
                            iconURL: message.author.displayAvatarURL()
                        })
                        .setColor("#ff0000")
                        .addFields(
                            { name: "Spamming the following text", value: "```" + message.content + "```"},
                            { name: "Discord user id", value: "`" + message.author.id + "`"}
                        )
                        .setFooter({
                            text: client.user.tag,
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setTimestamp()
                    client.channels.cache.get(settings.channel.serverlogs).send({ embeds: [embed] })
                    delete users[message.author.id]
                }
            } else {
                user.messages = [message]
            }
        } else {
            users[message.author.id] = {
                messages: [message]
            }
        }
    } else if (message.content.length > 0) {
        if (users[message.author.id]) {
            const user = users[message.author.id]
            const lastMessage = user.messages.last()
            const diff = (message.createdTimestamp - lastMessage.createdTimestamp) / 1000
            if (diff <= settings.antispam.delay && lastMessage.content === message.content) {
                if (!user.messages.includes(lastMessage)) user.message.push(lastMessage)
                user.messages.push(message)
                const count = user.messages.length
                if (count === settings.antispam.maxDuplicate) {
                    for (const msg of user.messages) {
                        try {
                            msg.delete()
                        } catch (error) {
                            console.log("The message that should've been deleted by myself has already been deleted.")
                        }
                    }
                    message.member.kick('Kicked for spamming "' + message.content + '"')
                    const embed = new MessageEmbed()
                        .setAuthor({
                            name: message.author.tag + " has been kicked.",
                            iconURL: message.author.displayAvatarURL()
                        })
                        .setColor("#ff0000")
                        .addField("Spamming the following text", "```" + message.content + "```")
                        .addField("Discord user id", "`" + message.author.id + "`")
                        .setFooter({
                            text: client.user.tag,
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setTimestamp()
                    client.channels.cache.get(settings.channel.serverlogs).send({ embeds: [embed] })
                    delete users[message.author.id]
                }
            } else {
                user.messages = [message]
            }
        } else {
            users[message.author.id] = {
                messages: [message]
            }
        }
    }
}