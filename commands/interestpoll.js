const bent = require('bent');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('interestpoll')
		.setDescription('Send a poll (not reaction role) to survey interest in a ctf in #ctf-proposals')
		.addStringOption(option => option.setName('ctftime_link').setDescription('The CTFtime Link of the event. Ex: https://ctftime.org/event/1313').setRequired(true)),
	async execute(interaction) {
		const time = new Date().getTime();

		const getJSON = bent('json')
		const response = await getJSON(`https://ctftime.org/api/v1/events/?limit=100&start=${time - 1000}finish=${time*100}`);
		const url = interaction.options.getString('ctftime_link');

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
			)
		const channel = await interaction.client.channels.fetch("855779318118613012");
		const message = await channel.send({ embeds: [exampleEmbed] });
		await message.react("👍");
		await message.react("👎");
		//create thread
		await message.startThread({
			name: data['title'],
			autoArchiveDuration: "1440",
			reason: `Do we want to participate in ${data['name']}`,	
		});
		await interaction.reply("Sent a poll in <#855779318118613012>!");
	},
};