const moment = require('moment-timezone');
const { client, ASSETS_VOICES_URL } = require('../constants');
const { reply } = require('../utils');
const { scheduledSchema } = require('../models');

const rocketazoCommand = async (interaction, args) => {
  const { guild_id } = interaction;
  const { wait, voice_channel_name, text_channel_name } = args;
  const channels = client.channels.cache.array().filter(({ guild: { id } }) => id === guild_id);

  let date = new Date();
  if (wait) {
    let unit = '';
    const amount = Number(wait.split(' ')[0]) || 0;
    if (wait.includes('minute')) {
      unit = 'minutes';
    } else if (wait.includes('hour')) {
      unit = 'hours';
    } else {
      unit = 'seconds';
    }

    date = moment().add(unit, amount);
  }

  const voiceChannel = channels.find(
    ({ name, type }) =>
      type === 'voice' &&
      (voice_channel_name ? name.toLowerCase().includes(voice_channel_name.toLowerCase()) : true),
  );

  const textChannel = channels.find(
    ({ name, type }) =>
      type === 'text' &&
      (text_channel_name ? name.toLowerCase().includes(text_channel_name.toLowerCase()) : true),
  );

  if (!voiceChannel || !textChannel) {
    reply(interaction, 'Channels not found');
    return;
  }

  const voicesArray = ASSETS_VOICES_URL.split(',');
  const voiceUrl = voicesArray[Math.floor(Math.random() * voicesArray.length)];

  await scheduledSchema({
    date,
    guildId: guild_id,
    voiceUrl,
    voiceChannelId: voiceChannel.id,
    textChannelId: textChannel.id,
  })
    .save()
    .catch(console.log);

  reply(interaction, 'Got it bro!');
};

module.exports = rocketazoCommand;
