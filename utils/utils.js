module.exports = {
  getEnvName: () => {
      switch (process.env.ENV) {
          case "DEV":
              return "Development";
          case "STAGING":
              return "Staging";
          case "PRODUCTION":
              return "Production";
      }
  }
};
