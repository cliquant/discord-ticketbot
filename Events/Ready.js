const { ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const { joinVoiceChannel } = require('@discordjs/voice');

const Database = require('../Database')
const config = require("../Config.json")
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
      if(config.group.vchannel.enabled) {
        const vchannel = client.channels.cache.get(config.group.vchannel.id);
        const connection = joinVoiceChannel({
          channelId: config.group.vchannel.id,
          guildId: config.group.id,
          adapterCreator: vchannel.guild.voiceAdapterCreator,
        });
      }
      console.log(`[BOT] Logged in as ${client.user.tag}!`);
      Database.load();
      client.user.setPresence({
        activities: [{ name: "cliquant.lol", type: ActivityType.Listening }]
      });
      setInterval(async () => {
        client.user.setPresence({
          activities: [{ name: `${await Database.getArrayActiveLength()} active tickets`, type: ActivityType.Watching }]
        });
        setTimeout(async () => {
          client.user.setPresence({
            activities: [{ name: "cliquant.lol", type: ActivityType.Listening }]
          });
        }, 5000);
      }, 5000);
    }
}