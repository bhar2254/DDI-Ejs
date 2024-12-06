module.exports = {
    apps: [
      {
        name: 'devils-dive', // Name of the app
        script: './app.js', // Path to your entry script
        instances: 'max', // Scales the app to maximum CPU cores in production
        max_restarts: 5, //Here you can define your max restarts
        exec_mode: 'cluster', // Cluster mode for production
        env: {
          NODE_ENV: 'production', // Environment-specific variable for development
          PORT: 8087, // Port for development
          LOG_LEVEL: 'error', // Minimal logging
        },
        development: {
          NODE_ENV: 'development', // Environment-specific variable for development
          PORT: 3000, // Port for development
          LOG_LEVEL: 'debug', // Minimal logging
        },
        production: {
          NODE_ENV: 'production', // Environment-specific variable for production
          PORT: 8087, // Port for production
          LOG_LEVEL: 'error', // Minimal logging
        },
      },
    ],
  };
  