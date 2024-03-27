const { app } = require("../config");

const datePickerBlock = {
  type: "section",
  block_id: "add_date_action",
  text: {
    type: "mrkdwn",
    text: "휴가 신청 날짜 추가선택",
  },
  accessory: {
    type: "datepicker",
    placeholder: {
      type: "plain_text",
      text: "날짜 선택",
      emoji: true,
    },
    action_id: "add_date_action",
  },
};

function setupSlackAction() {
  // "날짜 추가" 버튼 클릭 이벤트 핸들러
  app.action("add_date_action", async ({ ack, body, client }) => {
    await ack();

    if (!body.view || !Array.isArray(body.view.blocks)) {
      console.error("view 또는 view.blocks가 유효하지 않습니다.");
      return;
    }
    try {
      await client.views.update({
        view_id: body.view.id,
        hash: body.view.hash,
        view: {
          type: "modal",
          callback_id: "requestVacation",
          title: {
            type: "plain_text",
            text: "휴가 신청",
          },
          blocks: [
            ...body.view.blocks,
            {
              type: "section",
              block_id: "request_vacation_select-action",
              text: {
                type: "mrkdwn",
                text: "휴가 마지막 날짜 선택",
              },
              accessory: {
                type: "datepicker",
                placeholder: {
                  type: "plain_text",
                  text: "날짜 선택",
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
    } catch (error) {
      console.error("모달 업데이트 실패:", error);
    }
  });
}

module.exports = { setupSlackAction };
