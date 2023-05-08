const { SlashCommandBuilder, ChannelType, Client, PermissionFlagsBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
		.setName('sendembed')
		.setDescription('[Admin] - Ticket embed sending to specific channel')
		.addChannelOption(option =>
		option.setName('channel')
			.setDescription('Channel where gonna send ticket embed')
			.setRequired(true))
		.addStringOption(option =>
		option.setName('embedtype')
			.setDescription('Type of embed')
			.setRequired(true)
			.addChoices(
				{ name: 'Ticket Embed', value: 'ticketembed' },
				{ name: 'TOS Embed', value: 'tosembed' },
				{ name: 'Read-Me Embed', value: 'readmeembed' },
			))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

		if(channel.type != ChannelType.GuildText) {
			return interaction.reply({ content: 'This command can only be used for a text channel.', ephemeral: true });
		}

		const embedType = interaction.options.getString('embedtype');

		if(embedType === "ticketembed") {
			const embed = new EmbedBuilder()
				.setTitle('```cliquant.lol | #1 development service```')
				.setDescription(`
				Welcome to cliquant.lol! By clicking the button below,
				you will be prompted to a ticket where our team
				can further assist you.
				`)
				.setColor(0xFFFFFF)
				.setFooter({ text: 'cliquant.lol © 2023'});
	
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
					.setCustomId('support-ticket')
					.setLabel('Support')
					.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
					.setCustomId('development-ticket')
					.setLabel('Development')
					.setStyle(ButtonStyle.Secondary),
				);

			await channel.send({ embeds: [embed], components: [row] });
			await interaction.reply({ content: `Ticket embed has been sent to ${channel}.`, ephemeral: true })
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
		}
		if(embedType === "tosembed") {
			const embed = new EmbedBuilder()
				.setTitle('```cliquant.lol | tos```')
				.setDescription(`
				• By using this Discord server, you agree to our \nterms of service.

				• Be respectful, we are humans too.
				• We do not offer refunds, all sales are final.
				• You are responsible for anything & everything\n you use this service for.
				• If you want to use a middleman, you are\n responsible for covering the middleman fee.
				• In the event that the provided instructions are\n not sufficient and development proceeds, any\n resulting inaccuracies will be the responsibility of\n the client and no refunds will be issued.

				• If any rules are violated or if your behavior is\n deemed disruptive, we reserve the right to take\n appropriate action, including but not limited to\n banning the user.
				`)
				.setColor(0xFFFFFF)
				.setFooter({ text: 'cliquant.lol © 2023'});

			await channel.send({ embeds: [embed] });
			await interaction.reply({ content: `TOS embed has been sent to ${channel}.`, ephemeral: true })
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
		}
		if(embedType === "readmeembed") {
			const embed = new EmbedBuilder()
				.setTitle('```cliquant.lol | read-me```')
				.setDescription(`
				• **We will never DM you!**

				• We will never DM clients on this server, if you receive any\n unsolicited messages from someone claiming/is a developer, it\n most likely is a scam.
				
				• Your ticket is immediately received by our developers and\n kept 100% confidential between you and the developer who claims\n it.
				
				• Every message in your ticket is saved as a transcript to ensure\n security/safety, if you do respond to a DM, you are not safe and\n cliquant.lol is no longer responsible for that transaction.
				
				• If you want to use a middleman, you are\n responsible for covering the middleman fee.
				
				• Please report any suspicious messages to <@881776872239820813> or support immediately.
				`)
				.setColor(0xFFFFFF)
				.setFooter({ text: 'cliquant.lol © 2023'});

			await channel.send({ embeds: [embed] });
			await interaction.reply({ content: `Read-ME embed has been sent to ${channel}.`, ephemeral: true })
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
		}
    },
}; 