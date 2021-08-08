const { Client } = require('discord.js');
require('dotenv').config();

const { ASSETS_VOICES_URL } = process.env;
const guildId = process.env.GUILD_ID || null;
const client = new Client();

module.exports = {
  guildId,
  client,
  ASSETS_VOICES_URL,
};
