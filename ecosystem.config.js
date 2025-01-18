module.exports = {
  apps: [
    {
      name: "discovery-backend",
      script: "server.js",
      env: {
        DB_HOST: "discovery-database.c1e2goekmu67.ap-south-1.rds.amazonaws.com",
        DB_PORT: "3306",
        DB_USER: "discoveryadmin",
        DB_PASSWORD: "discoverylive123",
        DB_DATABASE: "DiscoveryConnect"
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
