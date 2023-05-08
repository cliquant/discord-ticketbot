const { Client, Intents, GatewayIntentBits, EmbedBuilder, Partials, Events, ActivityType, Collection, REST, Routes } = require('discord.js');
const fs = require("fs");
const path = require('path');
const config = require("./Config.json");

const client = new Client({
    intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel],
});

client.commands = new Collection();
const commands = [];

const handlersPath = path.join(__dirname, 'Events');
const HandlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

const foldersPath = path.join(__dirname, 'Commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

for (const file of HandlerFiles) {
  const event = require(path.resolve(__dirname, `./Events/${file}`));
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

const rest = new REST().setToken(config.bot.token);

(async () => {
	try {
		console.log(`[BOT] Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(config.bot.id, config.group.id),
			{ body: commands },
		);

		console.log(`[BOT] Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
		}
	}
});

client.login(config.bot.token);