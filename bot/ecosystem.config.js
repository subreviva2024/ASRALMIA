/**
 * PM2 Ecosystem Configuration — ASTRALMIA
 * Production deployment configuration
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart astralmia-bot
 *   pm2 logs astralmia-bot
 */

module.exports = {
  apps: [
    {
      name: "astralmia-bot",
      script: "astralmia-bot.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "production",
      },
      // Logs
      error_file: "./logs/bot-error.log",
      out_file: "./logs/bot-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      // Restart policy
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: 10000,
    },
    {
      name: "caela-engine",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "150M",
      env: {
        NODE_ENV: "production",
        BOT_PORT: "4001",
      },
      error_file: "./logs/caela-error.log",
      out_file: "./logs/caela-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: 10000,
    },
  ],
};
