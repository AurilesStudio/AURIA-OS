module.exports = {
  apps: [
    {
      name: "auria-api",
      script: "npx",
      args: "tsx server/index.ts",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};
