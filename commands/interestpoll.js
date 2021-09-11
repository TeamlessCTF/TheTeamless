const bent = require('bent');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { ctfProposalsId } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('interestpoll')
		.setDescription('Send a poll (not reaction role) to survey interest in a ctf in #ctf-proposals')
		.addStringOption(option => option.setName('ctftime_link').setDescription('The CTFtime Link of the event. Ex: https://ctftime.org/event/1313').setRequired(true))
		.addStringOption(option => option.setName('additional_info').setDescription('Any additional notes about the event? (hint hint, you can use \\n for newlines)').setRequired(false))
		.addStringOption(option => option.setName('team_size').setDescription('If there is a team size limit, what is it?').setRequired(false)),
	async execute(interaction) {
		await interaction.reply(`Working on it...`);

		const time = new Date().getTime();

		const getJSON = bent('json')
		const response = await getJSON(`https://ctftime.org/api/v1/events/?limit=100&start=${time - 1000}finish=${time*100}`);
		const url = interaction.options.getString('ctftime_link');
		
		let addtlInfo = "";
		let teamSize = "N/A";

		if(interaction.options.getString("additional_info") != null){
			addtlInfo = interaction.options.getString('additional_info').replaceAll("\\n", "\n");
		}else{
			addtlInfo = "N/A";
		}

		if(interaction.options.getString("team_size") != null){
			teamSize = interaction.options.getString('team_size');
		}

		var data = "";

		response.every((item) => {
			data = item;
			if (item['id'].toString() == url.split("/").slice(-1)[0].toString()){
				return false;
			}
			return true;
		})

		const exampleEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle(data['title'])
			.setDescription(data['description'])
			.setThumbnail(data['logo'])
			.addFields(
				{ name: 'Starts: ', value: new Date(Date.parse(data['start'])).toString() },
				{ name: 'Ends: ', value: new Date(Date.parse(data['finish'])).toString() },
				{ name: 'URL: ', value: data['url'].toString() },
				{ name: 'Weight: ', value: data['weight'].toString() },
				{ name: 'Team Size Limit: ', value: teamSize},
				{ name: 'Additional Info: ', value: addtlInfo}
			)
		const channel = await interaction.client.channels.fetch(ctfProposalsId.toString());
		const message = await channel.send({ embeds: [exampleEmbed] });
		await message.react("👍");
		await message.react("👎");
		//create thread
		await message.startThread({
			name: data['title'],
			autoArchiveDuration: "1440",
			reason: `Do we want to participate in ${data['name']}`,	
		});
		await interaction.editReply(`Sent a poll in <#${ctfProposalsId}>!`);
	},
};