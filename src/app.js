const mongoose = require('mongoose');
const { client, guildId } = require('./constants');
const { rocketazoCommand } = require('./commands');
const { getApp, reply } = require('./utils');
const { startSchedulers } = require('./schedulers');
const { MONGO_URI, DISCORD_BOT_TOKEN } = process.env;

client.on('ready', async () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log(`DB connected`);
  startSchedulers();

  await getApp(guildId).commands.post({
    data: {
      name: 'ping',
      description: 'Simple ping pong command',
    },
  });

  await getApp(guildId).commands.post({
    data: {
      name: 'rocketazo',
      description: 'Call out the ROCKETAZO!!',
      options: [
        {
          name: 'voice_channel_name',
          description: 'Name of the channel',
          required: true,
          type: 3,
        },
        {
          name: 'text_channel_name',
          description: 'Name of the channel',
          required: true,
          type: 3,
        },
        {
          name: 'wait',
          description: 'Hour or interval for the call out to be sent',
          required: false,
          type: 3,
        },
      ],
    },
  });

  client.ws.on('INTERACTION_CREATE', async (interaction) => {
    const { name, options } = interaction.data;
    const command = name.toLowerCase();
    const args = {};

    if (options) {
      options.forEach((option) => {
        const { name, value } = option;
        args[name] = value;
      });
    }

    switch (command) {
      case 'ping':
        reply(interaction, 'pong');
        break;
      case 'rocketazo':
        rocketazoCommand(interaction, args);
        break;
    }
  });
});

client.login(DISCORD_BOT_TOKEN);
