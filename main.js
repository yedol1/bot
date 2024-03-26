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
async function addItemToAttendanceDatabase(user, location) {
  const queryResponse = await notion.databases.query({
    database_id: process.env.NOTION_ATTENDANCE_DATABASE_ID,
    filter: {
      and: [
        {
          property: "Name",
          title: {
            equals: user,
          },
        },
        {
          property: "날짜",
          date: {
            equals: new Date().toISOString().slice(0, 10),
          },
        },
      ],
    },
  });
  if (queryResponse.results.length > 0) {
    console.log("이미 출근한 사용자입니다.");
    return queryResponse.results.length;
  }
  try {
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_ATTENDANCE_DATABASE_ID },
      properties: {
        // Name 속성 유형은 제목입니다.
        Name: {
          title: [
            {
              text: {
                content: user,
              },
            },
          ],
        },
        // Date 속성 유형은 날짜입니다.
        날짜: {
          date: {
            start: new Date().toISOString().slice(0, 10),
          },
        },
        // Attendance 속성 유형은 상태입니다.
        상태: {
          status: {
            name: "출근",
          },
        },
        // 출근지의 속성 유형은 텍스트입니다.
        동선: {
          type: "rich_text",
          rich_text: [
            {
              text: {
                content: location,
              },
            },
          ],
        },
      },
    });
    console.log("Notion에 데이터가 추가되었습니다:", response);
    return response;
  } catch (error) {
    console.error("Notion 데이터 추가 실패:", error);
  }
}
async function changeStatusToAttendanceDatabase(user, date) {
  const queryResponse = await notion.databases.query({
    database_id: process.env.NOTION_ATTENDANCE_DATABASE_ID,
    filter: {
      and: [
        {
          property: "Name",
          title: {
            equals: user,
          },
        },
        {
          property: "날짜",
          date: {
            equals: date,
          },
        },
        {
          property: "상태",
          status: {
            equals: "출근",
          },
        },
      ],
    },
  });

  try {
    // notion api를 사용하여 데이터베이스에 접근하여, 받아온 user, date, status 값과 일치하는 데이터를 찾아 상태를 변경합니다.
    const response = await notion.pages.update({
      page_id: queryResponse.results[0].id,
      properties: {
        // Attendance 속성 유형은 상태입니다.
        상태: {
          status: {
            name: "퇴근",
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
    const res = await client.views.open({
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
    return res;
  } catch (error) {
    console.error("슬랙 창 열기 실패:", error);
  }
});
const developer = {
  U066HPC6GAG: "이광렬",
  U042RS7CBU6: "김재호",
  U05CWRU2K60: "정태현",
};
app.command("/check-in", async ({ ack, body, client }) => {
  await ack();
  try {
    const res = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "checkIn",
        private_metadata: body.channel_id,
        title: {
          type: "plain_text",
          text: "출근자 선택",
        },
        blocks: [
          {
            type: "section",
            block_id: "check_in_select",
            text: {
              type: "mrkdwn",
              text: "출근 체크",
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
                {
                  text: {
                    type: "plain_text",
                    text: "김태원",
                    emoji: true,
                  },
                  value: "김태원",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "유희경",
                    emoji: true,
                  },
                  value: "유희경",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "임재림",
                    emoji: true,
                  },
                  value: "임재림",
                },
              ],
              action_id: "check_in_select-action",
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
              text: "출근지",
              emoji: true,
            },
          },
        ],
        submit: {
          type: "plain_text",
          text: "Submit",
        },
      },
    });
    return res;
  } catch (error) {
    console.error("슬랙 창 열기 실패:", error);
  }
});
app.view("checkIn", async ({ ack, body, view, client }) => {
  await ack();
  const channelID = view.private_metadata;
  const values = view.state.values;
  const user = values["check_in_select"]["check_in_select-action"].selected_option.text.text;
  const time = new Date().toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
  });
  const location = values["header_text_input"]["header_text_input-action"].value;

  const messageText = `:wave: [출근] ${user} ( ${time} ) - ${location}`;

  const notionData = await addItemToAttendanceDatabase(user, location);

  if (notionData) {
    if (typeof notionData === "number") {
      await client.chat.postMessage({
        channel: body.user.id,
        text: "이미 출근한 사용자입니다. ",
      });
      return;
    }
    try {
      await client.chat.postMessage({
        channel: channelID,
        text: messageText,
      });
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  }
});
app.command("/check-out", async ({ ack, body, client }) => {
  await ack();
  try {
    const res = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "checkOut",
        private_metadata: body.channel_id,
        title: {
          type: "plain_text",
          text: "퇴근자 선택",
        },
        blocks: [
          {
            type: "section",
            block_id: "check_out_select",
            text: {
              type: "mrkdwn",
              text: "퇴근 체크",
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
                {
                  text: {
                    type: "plain_text",
                    text: "김태원",
                    emoji: true,
                  },
                  value: "김태원",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "유희경",
                    emoji: true,
                  },
                  value: "유희경",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "임재림",
                    emoji: true,
                  },
                  value: "임재림",
                },
              ],
              action_id: "check_out_select-action",
            },
          },
        ],
        submit: {
          type: "plain_text",
          text: "Submit",
        },
      },
    });
    return res;
  } catch (error) {
    console.error("슬랙 창 열기 실패:", error);
  }
});
app.view("checkOut", async ({ ack, body, view, client }) => {
  await ack();
  const channelID = view.private_metadata;
  const values = view.state.values;
  const user = values["check_out_select"]["check_out_select-action"].selected_option.text.text;
  const time = new Date().toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    // 초는 제외합니다.
  });

  const messageText = `:woman-raising-hand: [퇴근] ${user} ( ${time} )`;
  const notionData = await changeStatusToAttendanceDatabase(user, new Date().toISOString().slice(0, 10), channelID, client);
  if (notionData) {
    try {
      await client.chat.postMessage({
        channel: channelID,
        text: messageText,
      });
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  } else {
    // 에러 발생시 개인 DM으로 에러 메시지 전송
    await client.chat.postMessage({
      channel: body.user.id,
      text: "퇴근 체크에 실패했어요😵 다시 확인후 시도해주세요!",
    });
  }
});
//
app.view("uploadBlog", async ({ ack, body, view, client, say }) => {
  if (view.private_metadata !== "C06N992QPD3") return new Error("해당 채널에서는 사용할 수 없는 명령어입니다. ");
  await ack();
  const channelID = view.private_metadata;
  const values = view.state.values;
  const report = values["report_text_input"]["report_text_input-action"].value;
  const header = values["header_text_input"]["header_text_input-action"].value;
  const author = values["author_select"]["author_select-action"].selected_option.text.text;
  const developer_ID = values["developer_select"]["developer_select-action"].selected_option.value;
  const developerName = values["developer_select"]["developer_select-action"].selected_option.text.text;
  const bug = values["bug_select"]["bug_select-action"].selected_option.text.text;

  try {
    // 채널이 'C06N992QPD3' 와 다르면 에러 발생
    if (channelID !== "C06N992QPD3") {
      await client.chat.postMessage({
        channel: channelID,
        text: "해당 채널에서는 사용할 수 없는 명령어입니다. ",
      });
      return new Error("해당 채널에서는 사용할 수 없는 명령어입니다. ");
    } else {
      const notionData = await addItemToDatabase(report, header, author, developerName, bug);
      const messageText = `*[ QA 리포트가 제출되었습니다! ]*\n\n\n*⚒️ 기능영역:* ${report}\n\n*📝 문제요약:* ${header}\n\n*🙋‍♀️ 버그 리포트 작성자:* ${author}\n\n*🧑‍💻 개발 담당자:* <@${developer_ID}>\n\n*🐞 버그 유형:* ${bug}\n\n\n*📎 링크*: ${notionData.url}`;

      if (notionData) {
        await client.chat.postMessage({
          channel: channelID, // 추출한 채널 ID 사용
          text: messageText,
        });
      }
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
