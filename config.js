require("dotenv").config();
const { App } = require("@slack/bolt");
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
});

module.exports = { notion, app };
