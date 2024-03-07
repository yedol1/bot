const { App } = require("@slack/bolt");
const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
});
const authorData = {
  강인해: {
    name: "강인해",
    color: "purple",
  },
  김재호: {
    name: "김재호",
    color: "blue",
  },
  박경호: {
    name: "박경호",
    color: "gray",
  },
  이광렬: {
    name: "이광렬",
    color: "orange",
  },
  정태현: {
    name: "정태현",
    color: "green",
  },
};
const bugData = {
  디자인: {
    name: "디자인",
    color: "purple",
  },
  기능: {
    name: "기능",
    color: "yellow",
  },
  기타: {
    name: "기타",
    color: "green",
  },
};
async function addItemToDatabase(report, header, author, developerName, bug) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        // 기능영역의 속성 유형은 텍스트입니다.
        기능영역: {
          type: "rich_text",
          rich_text: [
            {
              text: {
                content: report,
              },
            },
          ],
        },
        문제요약: {
          title: [
            {
              text: {
                content: header,
              },
            },
          ],
        },
        // 버그 작성자의 속성 유형은 다중 선택 입니다.
        "버그 작성자": {
          select: {
            name: authorData[author].name,
          },
        },

        // 개발 담당자의 속성 유형은 다중 선택 입니다.
        "개발 담당자": {
          select: {
            name: authorData[developerName].name,
          },
        },

        // 버그 유형의 속성 유형은 다중 선택 입니다.
        "버그 유형": {
          select: {
            name: bugData[bug].name,
          },
        },
      },
    });
    console.log("Notion에 데이터가 추가되었습니다:", response);
    return response;
  } catch (error) {
    console.error("Notion 데이터 추가 실패:", error);
  }
}
app.command("/qa-add", async ({ body, ack, client }) => {
  // Acknowledge the action
  await ack();
  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "uploadBlog",
        private_metadata: body.channel_id,
        close: {
          type: "plain_text",
          text: "Cancel",
        },
        title: {
          type: "plain_text",
          text: "QA 리포트 작성",
        },
        blocks: [
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: "리포트 작성",
                emoji: true,
              },
            ],
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "report_text_input",
            element: {
              type: "plain_text_input",
              dispatch_action_config: {
                trigger_actions_on: ["on_character_entered"],
              },
              action_id: "report_text_input-action",
            },
            label: {
              type: "plain_text",
              text: "기능영역",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "header_text_input",
            element: {
              type: "plain_text_input",
              dispatch_action_config: {
                trigger_actions_on: ["on_character_entered"],
              },
              action_id: "header_text_input-action",
            },
            label: {
              type: "plain_text",
              text: "문제요약",
              emoji: true,
            },
          },
          {
            type: "section",
            block_id: "author_select",
            text: {
              type: "mrkdwn",
              text: "버그 리포트 작성자",
            },
            accessory: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "선택하기",
                emoji: true,
              },
              options: [
                {
                  text: {
                    type: "plain_text",
                    text: "박경호",
                    emoji: true,
                  },
                  value: "박경호",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "이광렬",
                    emoji: true,
                  },
                  value: "이광렬",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "강인해",
                    emoji: true,
                  },
                  value: "강인해",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "김재호",
                    emoji: true,
                  },
                  value: "김재호",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "정태현",
                    emoji: true,
                  },
                  value: "정태현",
                },
              ],
              action_id: "author_select-action",
            },
          },
          {
            type: "section",
            block_id: "developer_select",
            text: {
              type: "mrkdwn",
              text: "개발 담당자 작성자",
            },
            accessory: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "선택하기",
                emoji: true,
              },
              options: [
                {
                  text: {
                    type: "plain_text",
                    text: "이광렬",
                    emoji: true,
                  },
                  value: "U066HPC6GAG",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "김재호",
                    emoji: true,
                  },
                  value: "U042RS7CBU6",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "정태현",
                    emoji: true,
                  },
                  value: "U05CWRU2K60",
                },
              ],
              action_id: "developer_select-action",
            },
          },
          // {
          //   type: "section",
          //   block_id: "developer_select",
          //   text: {
          //     type: "mrkdwn",
          //     text: "개발 담당자 선택하기",
          //   },
          //   accessory: {
          //     type: "users_select",
          //     placeholder: {
          //       type: "plain_text",
          //       text: "선택하기",
          //       emoji: true,
          //     },
          //     action_id: "users_select-action",
          //   },
          // },
          {
            type: "section",
            block_id: "bug_select",
            text: {
              type: "mrkdwn",
              text: "버그 유형",
            },
            accessory: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "선택하기",
                emoji: true,
              },
              options: [
                {
                  text: {
                    type: "plain_text",
                    text: "디자인",
                    emoji: true,
                  },
                  value: "디자인",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "기능",
                    emoji: true,
                  },
                  value: "기능",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "기타",
                    emoji: true,
                  },
                  value: "기타",
                },
              ],
              action_id: "bug_select-action",
            },
          },
        ],
        submit: {
          type: "plain_text",
          text: "Submit",
        },
      },
    });
  } catch (error) {
    console.error("슬랙 창 열기 실패:", error);
    // await client.chat.postMessage({
    //   channel: body.user_id,
    //   text: "슬랙 모달창에 문제가 생겼어요😵 다시 시도해주세용!",
    // });
  }
});
const developer = {
  U066HPC6GAG: "이광렬",
  U042RS7CBU6: "김재호",
  U05CWRU2K60: "정태현",
};
// 모달창에서 submit 버튼을 클릭하면, 입력한 내용을 채팅을 통해 보내는 부분입니다.
app.view("uploadBlog", async ({ ack, body, view, client, say }) => {
  await ack();
  console.log("view:", view.state.values);
  const channelID = view.private_metadata;
  const values = view.state.values;
  const report = values["report_text_input"]["report_text_input-action"].value;
  const header = values["header_text_input"]["header_text_input-action"].value;
  const author = values["author_select"]["author_select-action"].selected_option.text.text;
  const developer_ID = values["developer_select"]["developer_select-action"].selected_option.value;
  const developerName = values["developer_select"]["developer_select-action"].selected_option.text.text;
  const bug = values["bug_select"]["bug_select-action"].selected_option.text.text;

  try {
    const notionData = await addItemToDatabase(report, header, author, developerName, bug);
    const messageText = `*[ QA 리포트가 제출되었습니다! ]*\n\n\n*⚒️ 기능영역:* ${report}\n\n*📝 문제요약:* ${header}\n\n*🙋‍♀️ 버그 리포트 작성자:* ${author}\n\n*🧑‍💻 개발 담당자:* <@${developer_ID}>\n\n*🐞 버그 유형:* ${bug}\n\n\n*📎 링크*: ${notionData.url}`;
    if (notionData) {
      await client.chat.postMessage({
        channel: channelID, // 추출한 채널 ID 사용
        text: messageText,
      });
    }
  } catch (error) {
    console.error("Notion 데이터 추가 실패:", error);
    await client.chat.postMessage({
      channel: body.user.id,
      text: "QA 리포트 전송에 실패했어요😵 다시 확인후 시도해주세요!\n( 선택가능한 개발자는 현재 ['김재호','정태현','이광렬'] 입니다. )",
    });
  }
});

(async () => {
  // Start your app
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
