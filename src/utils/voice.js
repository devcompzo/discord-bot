const { Constants } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  StreamType,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require('@discordjs/voice');

const adapters = new Map();
const trackedClients = new Set();
const trackedShards = new Map();

const trackClient = (client) => {
  if (trackedClients.has(client)) return;
  trackedClients.add(client);
  client.ws.on(Constants.WSEvents.VOICE_SERVER_UPDATE, (payload) => {
    adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
  });
  client.ws.on(Constants.WSEvents.VOICE_STATE_UPDATE, (payload) => {
    if (payload.guild_id && payload.session_id && payload.user_id === client.user?.id) {
      adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload);
    }
  });
  client.on(Constants.Events.SHARD_DISCONNECT, (_, shardID) => {
    const guilds = trackedShards.get(shardID);
    if (guilds) {
      for (const guildID of guilds.values()) {
        adapters.get(guildID)?.destroy();
      }
    }
    trackedShards.delete(shardID);
  });
};

const trackGuild = (guild) => {
  let guilds = trackedShards.get(guild.shardID);
  if (!guilds) {
    guilds = new Set();
    trackedShards.set(guild.shardID, guilds);
  }
  guilds.add(guild.id);
};

const createDiscordJSAdapter = (channel) => {
  return (methods) => {
    adapters.set(channel.guild.id, methods);
    trackClient(channel.client);
    trackGuild(channel.guild);
    return {
      sendPayload(data) {
        if (channel.guild.shard.status === Constants.Status.READY) {
          channel.guild.shard.send(data);
          return true;
        }
        return false;
      },
      destroy() {
        return adapters.delete(channel.guild.id);
      },
    };
  };
};

const playSong = (player, resourceUrl) => {
  const resource = createAudioResource(resourceUrl, {
    inputType: StreamType.Arbitrary,
  });

  player.play(resource);

  return entersState(player, AudioPlayerStatus.Playing, 10000);
};

const connectToChannel = async (channel) => {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: createDiscordJSAdapter(channel),
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 10000);

    return connection;
  } catch (error) {
    connection.destroy();
    throw error;
  }
};

const connectToChannelAndPlaySound = async (channel, resouceUrl, destroyOnEnd = true) => {
  const player = createAudioPlayer();
  await playSong(player, resouceUrl);

  const connection = await connectToChannel(channel);
  connection.subscribe(player);

  if (destroyOnEnd) {
    player.on('stateChange', () => {
      if (player.checkPlayable() === false && connection) {
        connection.destroy();
      }
    });
  }

  return true;
};

module.exports = {
  trackClient,
  trackGuild,
  createDiscordJSAdapter,
  playSong,
  connectToChannel,
  connectToChannelAndPlaySound,
};
