module.exports = {
  apps: [
    {
      name: "Unduck", // Give your app a meaningful name
      script: "npm", // Use 'pnpm' as the script
      args: "run preview -- --port 6942", // Pass the preview command and port as arguments
      // instances: "max", // Use 'max' to utilize all CPU cores in cluster mode
      // exec_mode: "cluster", // Enable cluster mode
      autorestart: true, // Automatically restart if the app crashes
      watch: true, // Disable file watching (usually not needed for preview)
      max_memory_restart: "1G", // Restart if the app uses too much memory
      env: {
        NODE_ENV: "production", // Set the environment (important for some frameworks)
      },
    },
  ],
};
