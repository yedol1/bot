const { app } = require("./config");
const { setupSlackAction } = require("./slack/slackAction");
const { setupSlackCommands } = require("./slack/slackCommand");
const { setupSlackViews } = require("./slack/slackViews");

(async () => {
  await app.start();
  console.log("Bolt app is running!");
  setupSlackCommands();
  setupSlackViews();
  setupSlackAction();
})();
