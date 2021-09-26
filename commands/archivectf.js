const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
const { token } = require("../config.json");

var execSync = require('child_process').execSync;
var fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('archivectf')
		.setDescription('REMOVES all challenge channels for a CTF, and backs them up.')
        .addBooleanOption(option => option.setName('dont_delete').setDescription('Do not delete the channels, just back up! False by default').setRequired(false)),
	async execute(interaction) {
        member = interaction.member;
        if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)){
            await interaction.reply("Sorry, but you must have the Manage Server permission to run this command.");
            return;
        }
        const currentChannel = interaction.channel;
		message = await currentChannel.send(`Remember, this will:\n- Remove every channel in this current category: **${currentChannel.parent.name}** (unless you set the dont_delete option as true)\n- Upload the deleted channels to https://archive.teamlessctf.org\n\n<@${interaction.user.id}> React to this message with 👍 to proceed.`);
        message.react("👍")

        const filter = (reaction, user) => {
            return reaction.emoji.name === '👍' && user.id === interaction.user.id;
        };

        const collector = message.createReactionCollector({ filter, time: 10000 });
        collector.on('collect', (reaction, user) => {
            collector.stop();
        });

        collector.on('end', async collected => {
            if (collected.size < 1){
                await currentChannel.send("Aborted.");
            } else{
                await currentChannel.send("Exporting channels... This may take a bit based on how many channels there are. ");

                const channels = currentChannel.parent.children.map(member => member.id);
                const channelsString = channels.join(" ");

                const allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_- ';
                const safeParentName = currentChannel.parent.name.replaceAll(" ", "_");
                var msg = false;
                safeParentName.split("").forEach(element => {
                    if (!allowed.includes(element)){
                        console.log(`iLLEGAL: '${element}'`);
                        if (!msg){
                            msg = true;
                        }
                    }
                });
                if (msg){
                    await currentChannel.send("It looks like your category name has an invalid character! Allowed characters are letters, numbers, spaces, underscores, and dashes.");
                    return;
                }

                await fs.mkdir(`./chats/${safeParentName}`, (err) => {});
                await execSync(`bash -c "./DiscordChatExporter export -b -t ${token} -o chats/${safeParentName} -c ${channelsString}"`);
                
                const files = fs.readdirSync(`chats/${safeParentName}`);
                var allChats = [];
                files.forEach(file => {
                    const fileNameParts = file.split(" ");
                    const renamed = `chats/${safeParentName}/${fileNameParts[fileNameParts.length - 2]}.html`;
                    allChats.push(fileNameParts[fileNameParts.length - 2]);
                    fs.rename(`chats/${safeParentName}/${file}`, renamed, () => {});
                });
                
                indexCode = `<!DOCTYPE html><head><link href='../../style.css' rel='stylesheet'></head><body><h1>${safeParentName} Chats</h1><ul>`;
                allChats.forEach(chatName => {
                    indexCode = indexCode.concat(`<li><a href='${chatName}.html'>${chatName}</a></li>`);
                });
                indexCode = indexCode.concat("</ul></body>");
                fs.writeFile(`chats/${safeParentName}/index.html`, indexCode, 'utf8', (err) => {});

                await currentChannel.send(`Completed backup! You can find the chats at https://archive.teamlessctf.org/${safeParentName}/index.html`);
                if (interaction.options.getBoolean("dont_delete") == true){
                    return;
                }
                await currentChannel.send("Deleting categories in 15 seconds. Send any message to cancel!");

                const filter2 = (message, user) => {
                    return message.author.id === interaction.user.id;
                };

                const collector = interaction.channel.createMessageCollector({ filter2, time: 15000 });

                collector.on('collect', async m => {
                    await currentChannel.send("Canceled deleting channels.");
                    collector.stop();
                });

                collector.on('end', async collected => {
                    if (collected.size > 0){
                        return;
                    }
                    await currentChannel.parent.children.forEach(async channel => channel.delete());
                    await currentChannel.parent.delete();
                });
            }
        });
	},
};