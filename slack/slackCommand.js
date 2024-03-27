const { app } = require("../config");

function setupSlackCommands() {
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
  app.command("/request-vacation", async ({ ack, body, client }) => {
    await ack();
    try {
      const res = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          callback_id: "requestVacation",
          private_metadata: body.channel_id,
          title: {
            type: "plain_text",
            text: "휴가 신청",
          },
          blocks: [
            {
              type: "section",
              block_id: "vacation_person_select",
              text: {
                type: "mrkdwn",
                text: "휴가자 선택",
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
                action_id: "vacation_person_select-action",
              },
            },
            {
              type: "section",
              block_id: "request_vacation_select-start",
              text: {
                type: "mrkdwn",
                text: "휴가 시작 날짜 선택",
              },
              accessory: {
                type: "datepicker",
                placeholder: {
                  type: "plain_text",
                  text: "시작 날 선택",
                  emoji: true,
                },
                action_id: "request_vacation_select-action",
              },
            },
            {
              type: "section",
              block_id: "request_vacation_select-end",
              text: {
                type: "mrkdwn",
                text: "휴가 마지막 날짜 선택",
              },
              accessory: {
                type: "datepicker",
                placeholder: {
                  type: "plain_text",
                  text: "마지막 날 선택",
                  emoji: true,
                },
                action_id: "request_vacation_select-action",
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
}
module.exports = { setupSlackCommands };
