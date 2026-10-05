module.exports = {
  apps: [
    {
      name: 'fortune-api',
      cwd: '/var/www/fortune-construction/current/apps/api',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
      max_memory_restart: '512M',
      time: true,
    },
  ],
}
