module.exports = {
  apps: [
    {
      name: 'nesil-bahce-backend',
      script: './dist-server/index.js',
      cwd: '/var/www/nesil-bahce-baglar',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'nesil-bahce-frontend',
      script: 'npx',
      args: 'serve -s dist -l 8080',
      cwd: '/var/www/nesil-bahce-baglar',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};

