const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createctf')
		.setDescription('Sends a reaction role and creates a channel for a CTF in #ctf-proposals')
		.addStringOption(option => option.setName('message_id').setDescription('The message ID of the interest poll in #ctf-proposals').setRequired(true)),
	async execute(interaction) {
		await interaction.reply("Sent a reaction role in <#855779318118613012>!");
	},
};