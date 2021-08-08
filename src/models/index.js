const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true,
};

const scheduledSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  guildId: reqString,
  voiceUrl: reqString,
  voiceChannelId: reqString,
  textChannelId: reqString,
});

const name = 'schedulerTasks';

module.exports = {
  scheduledSchema: mongoose.model[name] || mongoose.model(name, scheduledSchema, name),
};
