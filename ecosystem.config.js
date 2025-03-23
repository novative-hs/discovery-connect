module.exports = {
  apps: [
    {
      name: "discovery-backend",
      script: "server.js",
      env: {
        DB_HOST: "localhost",
        DB_PORT: "3306",
        DB_USER: "root",
        DB_PASSWORD: "123456789",
        DB_DATABASE: "discovery_connect123"
      }
    },
    {
      name: "discovery-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
