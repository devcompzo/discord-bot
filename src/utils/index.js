const DiscordJS = require('discord.js');
const { connectToChannelAndPlaySound } = require('./voice');
const { client } = require('../constants');

const getApp = (guildId) => {
  const app = client.api.applications(client.user.id);
  if (guildId) {
    app.guilds(guildId);
  }
  return app;
};

const getChannelById = (channelId) => {
  return client.channels.cache.array().find((c) => c.id === channelId);
};

const createAPIMessage = async (interaction, content) => {
  const { data, files } = await DiscordJS.APIMessage.create(
    client.channels.resolve(interaction.channel_id),
    content,
  )
    .resolveData()
    .resolveFiles();

  return { ...data, files };
};

const reply = async (interaction, response) => {
  let data = {
    content: response,
  };

  if (typeof response === 'object') {
    data = await createAPIMessage(interaction, response);
  }

  client.api.interactions(interaction.id, interaction.token).callback.post({
    data: {
      type: 4,
      data,
    },
  });
};

module.exports = {
  createAPIMessage,
  reply,
  getApp,
  getChannelById,
  connectToChannelAndPlaySound,
};
