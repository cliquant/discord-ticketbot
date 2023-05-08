const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear channel messages')
        .addIntegerOption(option => 
            option.setName('number')
                .setDescription('Choose an integer between 1 and 100')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
	async execute(interaction) {
		const countmessage = interaction.options.getInteger('number');

        const messages = await interaction.channel.messages.fetch({ limit: countmessage });
        try {
            interaction.channel.bulkDelete(messages);
            interaction.reply({ content: `Clearing ${countmessage} from this channel.`, ephemeral: true })
            setTimeout(() => {
                interaction.deleteReply();
            }, 5000);
        } catch (error) {
            console.log(`Failed to clear messages: ${error}`);
            interaction.reply({ content: `Error on our side.`, ephemeral: true })
        }
	},
};