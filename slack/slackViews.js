const { app } = require("../config");
const { addItemToAttendanceDatabase, changeStatusToAttendanceDatabase, addItemToDatabase, addItemToVacationDatabase } = require("../notion/notionAPI");
const { getSeoulDateISOString } = require("../utils");

function setupSlackViews() {
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
    const date = getSeoulDateISOString();
    const notionData = await changeStatusToAttendanceDatabase(user, date.slice(0, 10), channelID, client);
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

  app.view("requestVacation", async ({ ack, body, view, client }) => {
    // 모달 제출에 대한 응답을 확인합니다.
    await ack();
    const channelID = view.private_metadata;
    const values = view.state.values;
    // vacation_person_select의 선택된 값 추출
    const user = values["vacation_person_select"]["vacation_person_select-action"].selected_option.value;

    // 모든 datepicker 블록의 값을 추출합니다.
    let [startDate, endDate] = [
      values["request_vacation_select-start"]["request_vacation_select-action"].selected_date,
      values["request_vacation_select-end"]["request_vacation_select-action"].selected_date,
    ];
    // startDate 보다 endDate가 더 빠른 경우, 개인 DM으로 에러 메시지 전송
    if (new Date(startDate) > new Date(endDate)) {
      await client.chat.postMessage({
        channel: body.user.id,
        text: "휴가 시작일이 종료일보다 늦습니다. 다시 확인 후 시도해주세요!",
      });
      return;
    }
    const totalVacationDays = Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const notionData = await addItemToVacationDatabase(user, startDate, endDate, totalVacationDays);
    if (notionData) {
      const messageText = `:palm_tree: [휴가] ${user}님의 휴가 신청이 완료되었습니다. \n\n*휴가 일정:* ${startDate} ~ ${endDate} [${totalVacationDays}일]`;
      try {
        await client.chat.postMessage({
          channel: channelID,
          text: messageText,
        });
      } catch (error) {
        console.error("메시지 전송 실패:", error);
      }
    } else {
      await client.chat.postMessage({
        channel: body.user.id,
        text: "휴가 신청에 실패했어요😵 다시 확인후 시도해주세요!",
      });
    }
    // Notion 데이터베이스에 휴가 정보를 추가하는 로직을 구현하세요.
    // const notionData = await addItemToVacationDatabase(user, dateArray);

    // 휴가 신청이 성공적으로 처리되면, Slack 채널 또는 사용자에게 메시지를 보내는 로직을 구현하세요.
  });
}

module.exports = { setupSlackViews };
