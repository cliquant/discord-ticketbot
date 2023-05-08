const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('message')
    .setDescription('Sends an message to a specific channel')
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('Channel where the message should be sent')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
  
    const titleCollector = interaction.channel.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 15000,
      max: 1,
    });
  
    const whatTitleMessage = await interaction.reply('What should be the title of the message?');
  
    titleCollector.on('collect', async (m) => {
      const title = m;
      const titleContent = m.content;
  
      const descriptionCollector = interaction.channel.createMessageCollector({
        filter: (m) => m.author.id === interaction.user.id,
        time: 15000,
        max: 1,
      });
  
      const whatDescriptionMessage = await interaction.followUp('What should be the description of the message?');
  
      descriptionCollector.on('collect', async (m) => {
        const description = m;
        const descriptionContent = m.content;
  
        const announceEmbed = new EmbedBuilder()
          .setTitle(titleContent)
          .setDescription(descriptionContent)
          .setColor(0xFFFFFF)
          .setFooter({ text: 'cliquant.lol © 2023'});

        try {
          title.delete();
        } catch (error) {
          console.log(`1 Failed to delete messages: ${error}`);
        }
        try {
          whatTitleMessage.delete();
        } catch (error) {
          console.log(`4 Failed to delete messages: ${error}`);
        }
        try {
          description.delete();
        } catch (error) {
          console.log(`2 Failed to delete messages: ${error}`);
        }
        try {
          whatDescriptionMessage.delete();
        } catch (error) {
          console.log(`3 Failed to delete messages: ${error}`);
        }
        const actionRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('announce_confirm')
            .setLabel('Send')
            .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
            .setCustomId('announce_cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary),
          );
  
        const confirmMessage = await interaction.followUp({ content: "This is example", embeds: [announceEmbed], components: [actionRow] });
  
        const buttonCollector = confirmMessage.createMessageComponentCollector({
          filter: (i) => i.user.id === interaction.user.id,
          time: 15000,
          max: 1,
        });
  
        buttonCollector.on('collect', async (i) => {
          if (i.customId === 'announce_confirm') {
            await channel.send({ embeds: [announceEmbed] });
            await i.update({ content: 'Message sent!', components: [] });
            try {
              await confirmMessage.delete();
            } catch (error) {
              console.log(`5 Failed to delete messages: ${error}`);
            }
          } else {
            await i.update({ content: 'Message cancelled!', components: [] });
            try {
              await confirmMessage.delete();
            } catch (error) {
              console.log(`6 Failed to delete messages: ${error}`);
            }
          }
        });

        buttonCollector.on('end', async (i, reason) => {
          if (reason === 'time') {
            await interaction.followUp({ content: 'Button collection timed out.', ephemeral: true });       
          }
          try {
            await i.delete();
          } catch (error) {
            console.log(`Failed to delete messages: ${error}`);
          }
        });
      });

      titleCollector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          await interaction.followUp({ content: 'Title collection timed out.', ephemeral: true });     
        }
      });
  
      descriptionCollector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          await interaction.followUp({ content: 'Description collection timed out.', ephemeral: true });
        }
      });
    });
  },
};