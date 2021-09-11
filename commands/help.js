const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows a help menu and all the commands'),
	async execute(interaction) {
		const helpEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle("TheTeamless")
			.setDescription('This bot helps organize the Discord server')
			.setThumbnail("https://images-ext-2.discordapp.net/external/HNJn2dT55WN_FR-o_9laQv-M74NTQ82a2_VaMucL9lQ/https/cdn.discordapp.com/avatars/865371151312224257/c93e5cf4455fff62a76031e8a1557c3f.webp")
			.addFields(
				{ name: '/help', value: "Shows this help menu!" },
				{ name: '/interestpoll', value: "Creates a **poll** (not a role assigner) to gauge interest in a CTF" },
				{ name: '/createctf', value: "Creates a role, category, channels, and a button to gain access" },
				{ name: '/pfp', value: "Gives the profile picture of a user." },
                { name: '/archivectf', value: "Coming soon™️" },
			)

        await interaction.reply({embeds: [helpEmbed]});
	},
};