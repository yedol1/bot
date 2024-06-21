const { app } = require("../config");
const { addSolutionTeamMeetingToDatabase, addSolDeveloperMeetingToDatabase, addSolAIDeveloperMeetingToDatabase, addSolPlannerMeetingToDatabase } = require("../notion/notionAPI");

function setupSlackCommands() {
  app.command("/add-solution-meeting", async ({ ack, body, client }) => {
    await ack();

    const channelID = body.channel_id;
    try {
      const notionData = await addSolutionTeamMeetingToDatabase();
      if (notionData) {
        const messageText = `*[ 📂 솔루션팀 회의록이 생성되었습니다. ]*\n\n\n*📎 링크*: ${notionData?.url}\n\n*⚠️ 링크에 접근하여, 페이지에 들어간후 [미팅 템플릿]을 클릭하여주세요.`;
        await client.chat.postMessage({
          channel: channelID,
          text: messageText,
        });
      }
    } catch (error) {
      console.error("Notion 데이터 추가 실패:", error);
    }
  });
  app.command("/add-s-developer-meeting", async ({ ack, body, client }) => {
    await ack();

    const channelID = body.channel_id;
    try {
      const notionData = await addSolDeveloperMeetingToDatabase();
      if (notionData) {
        const messageText = `*[ 📂 솔루션팀 웹 개발파트 회의록이 생성되었습니다. ]*\n\n\n*📎 링크*: ${notionData?.url}\n\n*⚠️ 링크에 접근하여, 페이지에 들어간후 [미팅 템플릿]을 클릭하여주세요.`;
        await client.chat.postMessage({
          channel: channelID,
          text: messageText,
        });
      }
    } catch (error) {
      console.error("Notion 데이터 추가 실패:", error);
    }
  });
  app.command("/add-s-ai-developer-meeting", async ({ ack, body, client }) => {
    await ack();

    const channelID = body.channel_id;
    try {
      const notionData = await addSolAIDeveloperMeetingToDatabase();
      if (notionData) {
        const messageText = `*[ 📂 솔루션팀 AI 개발파트 회의록이 생성되었습니다. ]*\n\n\n*📎 링크*: ${notionData?.url}\n\n*⚠️ 링크에 접근하여, 페이지에 들어간후 [미팅 템플릿]을 클릭하여주세요.`;
        await client.chat.postMessage({
          channel: channelID,
          text: messageText,
        });
      }
    } catch (error) {
      console.error("Notion 데이터 추가 실패:", error);
    }
  });
  app.command("/add-s-planner-meeting", async ({ ack, body, client }) => {
    await ack();

    const channelID = body.channel_id;
    try {
      const notionData = await addSolPlannerMeetingToDatabase();
      if (notionData) {
        const messageText = `*[ 📂 솔루션팀 기획파트 회의록이 생성되었습니다. ]*\n\n\n*📎 링크*: ${notionData?.url}\n\n*⚠️ 링크에 접근하여, 페이지에 들어간후 [미팅 템플릿]을 클릭하여주세요.`;
        await client.chat.postMessage({
          channel: channelID,
          text: messageText,
        });
      }
    } catch (error) {
      console.error("Notion 데이터 추가 실패:", error);
    }
  });
  app.command("/list", async ({ ack, body, client, payload }) => {
    await ack();
    try {
      const res = await client.views.open({
        trigger_id: payload.trigger_id,
        view: {
          type: "modal",
          callback_id: "uploadBoardList",
          private_metadata: body.channel_id,
          close: {
            type: "plain_text",
            text: "Cancel",
          },
          title: {
            type: "plain_text",
            text: "Status board",
          },
          blocks: [
            {
              type: "context",
              elements: [
                {
                  type: "plain_text",
                  text: "Status board",
                  emoji: true,
                },
              ],
            },
            {
              type: "input",
              block_id: "board_title",
              element: {
                type: "plain_text_input",
                action_id: "board_title-action",
              },
              label: {
                type: "plain_text",
                text: "의논할 주제",
                emoji: true,
              },
            },
            {
              type: "section",
              block_id: "priority_select",
              text: {
                type: "mrkdwn",
                text: "우선순위",
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
                      text: "1순위",
                      emoji: true,
                    },
                    value: "1순위",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "2순위",
                      emoji: true,
                    },
                    value: "2순위",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "3순위",
                      emoji: true,
                    },
                    value: "3순위",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "그외",
                      emoji: true,
                    },
                    value: "그외",
                  },
                ],
                action_id: "priority_select-action",
              },
            },
            // 참석자 다중선택
            {
              type: "section",
              block_id: "attendees_select",
              text: {
                type: "mrkdwn",
                text: "참석자",
              },
              accessory: {
                type: "multi_users_select",
                placeholder: {
                  type: "plain_text",
                  text: "선택하기",
                  emoji: true,
                },
                action_id: "attendees_select-action",
              },
            },
          ],
          submit: {
            type: "plain_text",
            text: "Submit",
          },
        },
      });
      console.log("Modal opened:", res);
    } catch (error) {
      console.error("슬랙 창 열기 실패:", error);
    }
  });
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
                  {
                    text: {
                      type: "plain_text",
                      text: "이종원",
                      emoji: true,
                    },
                    value: "이종원",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "조문근",
                      emoji: true,
                    },
                    value: "조문근",
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
                text: "✅ 출근 체크",
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
                  {
                    text: {
                      type: "plain_text",
                      text: "이종원",
                      emoji: true,
                    },
                    value: "이종원",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "조문근",
                      emoji: true,
                    },
                    value: "조문근",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "test",
                      emoji: true,
                    },
                    value: "test",
                  },
                ],
                action_id: "check_in_select-action",
              },
            },
            // 선택해도 되고 안해도 되는 부분
            {
              type: "section",
              block_id: "check_in_timepicker",
              text: {
                type: "mrkdwn",
                text: "⚠️ 출근 시간 선택 (현재 시간이 아닐 경우 입력)",
              },
              accessory: {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "ex) 1550 === 15:50",
                  emoji: true,
                },
                action_id: "check_in_timepicker-action",
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
                text: "✅ 퇴근 체크",
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
                  {
                    text: {
                      type: "plain_text",
                      text: "이종원",
                      emoji: true,
                    },
                    value: "이종원",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "조문근",
                      emoji: true,
                    },
                    value: "조문근",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "test",
                      emoji: true,
                    },
                    value: "test",
                  },
                ],
                action_id: "check_out_select-action",
              },
            },
            {
              type: "rich_text",
              elements: [
                {
                  type: "rich_text_section",
                  elements: [
                    {
                      type: "text",
                      text: "⚠️ 퇴근 시간이 현 시간이 아닐 경우 입력해주세요.",
                    },
                  ],
                },
              ],
            },
            // 선택해도 되고 안해도 되는 부분

            {
              type: "section",
              block_id: "check_in_date_select",
              text: {
                type: "mrkdwn",
                text: "출근 날짜 선택",
              },
              accessory: {
                type: "datepicker",
                placeholder: {
                  type: "plain_text",
                  text: "출근 날짜 선택",
                  emoji: true,
                },
                action_id: "check_in_date_select-action",
              },
            },
            {
              type: "section",
              block_id: "check_out_date_select",
              text: {
                type: "mrkdwn",
                text: "퇴근 날짜 선택",
              },
              accessory: {
                type: "datepicker",
                placeholder: {
                  type: "plain_text",
                  text: "퇴근 날짜 선택",
                  emoji: true,
                },
                action_id: "check_out_date_select-action",
              },
            },
            {
              type: "section",
              block_id: "check_out_timepicker",
              text: {
                type: "mrkdwn",
                text: "퇴근 시간 선택",
              },
              accessory: {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "ex) 1550 === 15:50",
                  emoji: true,
                },
                action_id: "check_out_timepicker-action",
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
  app.command("/request-attendance-fix", async ({ ack, body, client }) => {
    await ack();
    try {
      const res = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          callback_id: "requestAttendanceFix",
          private_metadata: body.channel_id,
          title: {
            type: "plain_text",
            text: "근태 수정 신청",
          },
          blocks: [
            {
              type: "section",
              block_id: "attendance_fix_person_select",
              text: {
                type: "mrkdwn",
                text: "근태 수정자 선택",
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
                  {
                    text: {
                      type: "plain_text",
                      text: "이종원",
                      emoji: true,
                    },
                    value: "이종원",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "조문근",
                      emoji: true,
                    },
                    value: "조문근",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "test",
                      emoji: true,
                    },
                    value: "test",
                  },
                ],
                action_id: "attendance_fix_person_select-action",
              },
            },
            {
              type: "section",
              block_id: "attendance_fix_date_select",
              text: {
                type: "mrkdwn",
                text: "근태 수정 날짜 선택",
              },
              accessory: {
                type: "datepicker",
                placeholder: {
                  type: "plain_text",
                  text: "날짜 선택",
                  emoji: true,
                },
                action_id: "attendance_fix_date_select-action",
              },
            },
            // 수정할 근태 상태 선택
            {
              type: "section",
              block_id: "attendance_fix_status_select",
              text: {
                type: "mrkdwn",
                text: "수정할 근태 상태 선택",
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
                      text: "출근",
                      emoji: true,
                    },
                    value: "출근",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "퇴근",
                      emoji: true,
                    },
                    value: "퇴근",
                  },
                ],
                action_id: "attendance_fix_status_select-action",
              },
            },
            // 수정한 근태 날짜 선택
            {
              type: "section",
              block_id: "attendance_fix_time_select",
              text: {
                type: "mrkdwn",
                text: "수정한 근태 시간 선택",
              },
              accessory: {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "시간 선택",
                  emoji: true,
                },
                action_id: "attendance_fix_time_select-action",
              },
            },

            // 근태 수정 사유 입력
            {
              type: "input",
              block_id: "attendance_fix_reason_input",
              element: {
                type: "plain_text_input",
                multiline: true,
              },
              label: {
                type: "plain_text",
                text: "근태 수정 사유",
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
                  {
                    text: {
                      type: "plain_text",
                      text: "이종원",
                      emoji: true,
                    },
                    value: "이종원",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "조문근",
                      emoji: true,
                    },
                    value: "조문근",
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
