const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');

const { ctfProposalsId } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createctf')
		.setDescription('Sends a reaction role and creates a channel for a CTF in #ctf-proposals')
		.addStringOption(option => option.setName('message_link').setDescription('The message link of the interest poll in #ctf-proposals').setRequired(true)),
	async execute(interaction) {
		await interaction.reply(`Working on it...`);
		const link = interaction.options.getString('message_link');

		if (!link.includes("http")){
			await interaction.editReply(`Uh oh! Looks like you didn't input a message link. Try something like https://discord.com/channels/855778152738848769/855778152738848772/886089625976864778\nHelp: https://support.discord.com/hc/en-us/community/posts/360042546452-Message-links`);
		}

		const messageId = link.split("/").reverse()[0];

		const channel = await interaction.client.channels.fetch(ctfProposalsId);

		const proposal = await channel.messages.fetch(messageId);
		const embed = proposal.embeds[0]
		const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('roleAssigner')
				.setLabel('Join CTF!')
				.setStyle('PRIMARY')
				.setEmoji('870785531536113784'),
		);
		
		const role = await interaction.guild.roles.create({
			name: embed.title,
			color: 'RED'
		});

		const newCategory = await interaction.guild.channels.create(embed.title, {
			type: 'GUILD_CATEGORY',
			permissionOverwrites: [
				{id: role.id, allow: [Permissions.FLAGS.VIEW_CHANNEL]},
				{id: channel.guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL]},
			],
		})

		await interaction.guild.channels.create('info', {
			type: 'GUILD_TEXT',
			parent: newCategory
		})

		await interaction.guild.channels.create('discussion', {
			type: 'GUILD_TEXT',
			parent: newCategory
		})

		await interaction.guild.channels.create('___unsolved___', {
			type: 'GUILD_TEXT',
			parent: newCategory
		})

		await interaction.guild.channels.create('___solved___', {
			type: 'GUILD_TEXT',
			parent: newCategory
		})

		await channel.send({ embeds: [embed], content: `Press the button below to receive the <@&${role.id}> role!`, components: [row]});

		await proposal.delete();
		await interaction.editReply(`Sent a reaction role in <#${ctfProposalsId}>!`);
	},
};