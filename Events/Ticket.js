const { ActivityType, MessageAttachment, AttachmentBuilder, Events, ChannelType, PermissionFlagsBits, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Database = require('../Database');
const config = require("../Config.json");
const discordTranscripts = require('discord-html-transcripts');
const htmlMinifier = require('html-minifier');
const fs = require("fs")
const beautify = require('js-beautify').html;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction, client) {
		// Constants
		const getTicket = await Database.getTicket(interaction.channel.id)
		// Embeds & Buttons
		const embed = new EmbedBuilder()
			.setTitle('```cliquant.lol | read-me```')
			.setDescription(`
			We will **never** DM clients on this server, if you recieve any
			unsolicited messages from someone claiming/is a developer, it
			most likely is a scam.

			Please don't mention staff without needs.
			`)
			.setColor(0xFFFFFF)
			.setFooter({ text: 'cliquant.lol © 2023'});
		const embed2 = new EmbedBuilder()
			.setTitle('```cliquant.lol | close confirmation```')
			.setDescription(`
			Please confirm that you want to close this ticket`)
			.setColor(0xFFFFFF)
			.setFooter({ text: 'cliquant.lol © 2023'});

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
				.setCustomId('close-ticket-userside')
				.setLabel('Close')
				.setStyle(ButtonStyle.Danger)
		);
		const row2 = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('close-ticket-adminside')
				.setLabel('Confirm Close')
				.setStyle(ButtonStyle.Danger)
		);
		// Opening
		if (interaction.isButton()) {
			if(interaction.customId == "support-ticket") {
				console.log("[BOT] [TICKET] Pressed Support Ticked Button")
				interaction.deferReply({ ephemeral: true });
				const channel = await interaction.guild.channels.create({
					name: "support-" + parseInt(await Database.getLastDatabaseId() + 1),
					type: ChannelType.GuildText,
					parent: config.group.categorys.tickets,
					permissionOverwrites: [{
							id: interaction.guild.roles.everyone,
							deny: [PermissionFlagsBits.ViewChannel],
						},
						{
							id: interaction.user.id,
							allow: [PermissionFlagsBits.ViewChannel],
						},
						{
							id: config.group.roles.support,
							allow: [PermissionFlagsBits.ViewChannel],
						},
					],
				})
				setTimeout(() => {
					interaction.editReply({ content: "Created new support ticket <#" + channel.id + ">", ephemeral: true })
				}, 500);
				await Database.createTicket(channel.id, interaction.user.id);
				channel.send({ content: "New support ticket by <@" + interaction.user.id + ">", embeds: [embed], components: [row] })
			}
			if(interaction.customId == "development-ticket") {
				console.log("[BOT] [TICKET] Pressed Development Ticked Button")
				interaction.deferReply({ ephemeral: true });
				const channel = await interaction.guild.channels.create({
					name: "development-" + parseInt(await Database.getLastDatabaseId() + 1),
					type: ChannelType.GuildText,
					parent: config.group.categorys.tickets,
					permissionOverwrites: [{
							id: interaction.guild.roles.everyone,
							deny: [PermissionFlagsBits.ViewChannel],
						},
						{
							id: interaction.user.id,
							allow: [PermissionFlagsBits.ViewChannel],
						},
						{
							id: config.group.roles.support,
							allow: [PermissionFlagsBits.ViewChannel],
						},
					],
				})
				setTimeout(() => {
					interaction.editReply({ content: "Created new development ticket <#" + channel.id + ">", ephemeral: true })
				}, 500);
				await Database.createTicket(channel.id, interaction.user.id);
				channel.send({ content: "New support ticket by <@" + interaction.user.id + ">", embeds: [embed], components: [row] })
			}
		}
		// Closing
		if (interaction.isButton()) {
			if(interaction.customId == "close-ticket-userside") {
				console.log("[BOT] [TICKET] Pressed close-ticket-userside")
				if (interaction.user.id == getTicket.owner || interaction.member.roles.cache.has(config.group.roles.support) || interaction.member.permissions.has([PermissionsBitField.Flags.Administrator])) {
					await interaction.channel.permissionOverwrites.set([
						{
							id: interaction.guild.roles.everyone,
							deny: [PermissionsBitField.Flags.ViewChannel],
						},
						{
							id: config.group.roles.support,
							allow: [PermissionsBitField.Flags.ViewChannel],
						},
					]);
					interaction.reply({ embeds: [embed2], components: [row2] })
					async function execute() {
						if(await Database.getTicket2(interaction.channel.id)) {
							const ticketOwner = await interaction.guild.members.fetch(getTicket.owner)
							const transcriptc = client.channels.cache.get(config.group.channels.transcripts);
							const transcript = await discordTranscripts.createTranscript(interaction.channel, {
								limit: -1,
								returnType: 'string',
								footerText: `Exported {number} message{s} | cliquant.lol © 2023`,
								poweredBy: false,
							});
							  
							const unminifiedTranscript = beautify(transcript, {
								indent_size: 2,
								wrap_line_length: 80,
							});
							  
							fs.writeFile(`./TempFiles/${interaction.channel.name}.html`, unminifiedTranscript, (err) => {
								if (err) throw err;
							});
	
							const currentDate = new Date();
							const embedDM = new EmbedBuilder()
								.setTitle('Ticket closed')
								.setAuthor({ name: 'cliquant.lol | read-me'})
								.addFields(
									{ name: 'Ticket ID', value: `${getTicket.ticketid}`, inline: true },
									{ name: 'Opened By', value: `<@${getTicket.owner}>`, inline: true },
									{ name: 'Closed By', value: `<@${interaction.user.id}>`, inline: true },
								)
								.addFields(
									{ name: 'Close Time', value: `${currentDate.toLocaleString()}` },
								)
								.setColor(0xFFFFFF)
								.setFooter({ text: 'cliquant.lol © 2023'});
	
							const file = new AttachmentBuilder('./TempFiles/' + interaction.channel.name + '.html');
							await ticketOwner.user.send({ embeds: [embedDM], files: [file] });
							await transcriptc.send({ embeds: [embedDM], files: [file] })
							fs.unlink(`./TempFiles/${interaction.channel.name}.html`, function (err) {
								if (err) throw err;
							});
						}
					}
					execute().then(async () => {
						if(!interaction.channel.name.includes("closed-")) {
							await interaction.channel.setName("closed-" + interaction.channel.name)
						}
					})
					await Database.closeTicket(interaction.channel.id)
				} else {
					interaction.reply({ content: "You cannot do this.", ephemeral: true })
				}
			}
			if(interaction.customId == "close-ticket-adminside") { 
				console.log("[BOT] [TICKET] Pressed close-ticket-adminside") 
				if (interaction.member.roles.cache.has(config.group.roles.support) || interaction.member.permissions.has([PermissionsBitField.Flags.Administrator])) {
					interaction.channel.delete();
				} else {
					interaction.reply({ content: "You cannot do this.", ephemeral: true })
				}
			}
		}
    }
}