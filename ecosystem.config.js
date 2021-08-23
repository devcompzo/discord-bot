module.exports = {
  apps: [
    {
      name: 'Discord-bot',
      script: 'yarn install && yarn start',
      watch: './src',
      ignore_watch: ['*pm2*', 'node_modules'],
      out_file: './output.pm2.log',
      error_file: './output.pm2.log',
      max_memory_restart: '200M',
    },
  ],
};
