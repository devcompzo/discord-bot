const { MessageEmbed } = require('discord.js');
const { scheduledSchema } = require('../models');
const { connectToChannelAndPlaySound, getChannelById } = require('../utils');

const rocketazoScheduler = async () => {
  const query = {
    date: {
      $lte: new Date(),
    },
  };
  const results = await scheduledSchema.find(query);
  await scheduledSchema.deleteMany(query);

  const promises = results.map(async (item) => {
    const { voiceUrl, voiceChannelId, textChannelId } = item;
    const embed = new MessageEmbed()
      .setTitle('Rocketazo inminente')
      .setDescription('Se hace un llamado al rocketazo')
      .setThumbnail(
        'https://e7.pngegg.com/pngimages/329/174/png-clipart-rocket-league-championship-series-esports-logo-rocket-league-official-game-soundtrack-rocket-league-emblem-text.png',
      )
      .setImage('https://iili.io/AZkYg9.jpg');
    return Promise.all([
      getChannelById(textChannelId).send(embed),
      connectToChannelAndPlaySound(getChannelById(voiceChannelId), voiceUrl),
    ]);
  });
  await Promise.all(promises);
};

const startSchedulers = () => {
  console.log('Scheduler started');
  setInterval(() => {
    rocketazoScheduler().catch(null);
  }, 5000);
};

module.exports = { startSchedulers };
