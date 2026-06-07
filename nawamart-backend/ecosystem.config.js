module.exports = {
  apps: [
    {
      name: 'nawamart-backend',
      script: 'src/server.js',
      instances: 'max', // Run on all available CPU cores
      exec_mode: 'cluster', // Enables load balancing across instances
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
    },
  ],
};
