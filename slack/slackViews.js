const { app } = require("../config");
const { addItemToDatabase, addItemToVacationDatabase, checkInAttendanceDatabase, checkOutAttendanceDatabase, addStatusBoardListToDatabase } = require("../notion/notionAPI");
const { getSeoulDateISOString } = require("../utils");
// values {
//   board_title: { 'board_title-action': { type: 'plain_text_input', value: 'test' } },
//   priority_select: {
//     'priority_select-action': { type: 'static_select', selected_option: [Object] }
//   },
//   attendees_select: {
//     'attendees_select-action': { type: 'multi_users_select', selected_users: [Array] }
//   }
// }
async function setupSlackViews() {
  app.view("uploadBoardList", async ({ ack, body, view, client }) => {
    await ack();

    const channelID = view?.private_metadata;
    const values = view?.state?.values;
    const info = values?.attendees_select;
    const selectedUsers = info?.["attendees_select-action"]?.selected_users || [];
    const boardTitle = values?.board_title?.["board_title-action"]?.value || "게시판 제목 없음";
    const priority = values?.priority_select?.["priority_select-action"]?.selected_option?.text?.text || "우선순위 없음";

    try {
      const notionData = await addStatusBoardListToDatabase(boardTitle, priority, selectedUsers);
      if (notionData) {
        const messageText = `📝 [리스트] *${boardTitle}* \n\n*🔖 우선순위:* ${priority}\n\n*👥 참여자:* ${selectedUsers?.map((user) => `<@${user}>`).join(", ")} \n\n*📎 링크:* ${
          notionData?.url
        }\n\n( ⚠️ 링크로 들어가 나머지 속성을 추가하여 주세요. )`;
        await client.chat.postMessage({
          channel: channelID,
          text: messageText,
        });
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  });

  app.view("checkIn", async ({ ack, body, view, client }) => {
    await ack();
    const channelID = view.private_metadata;
    const values = view.state.values;

    console.log("values", values);

    // 사용자 이름 가져오기
    const user = values["check_in_select"]["check_in_select-action"].selected_option.text.text;

    // 타임피커에서 선택한 시간 가져오기
    const selectedTime = values["check_in_timepicker"]["check_in_timepicker-action"].selected_time;

    let time = null;
    if (selectedTime) {
      console.log("selectedTime", selectedTime);
      time = new Date();
      const [hour, minute] = selectedTime.split(":");
      time.setHours(parseInt(hour, 10), parseInt(minute, 10), 0);
    } else {
      time = new Date();
    }

    // 출근지 정보 가져오기
    const location = values["header_text_input"]["header_text_input-action"].value;

    // 메시지 텍스트 구성
    const messageText = `:wave: [출근] ${user} ( ${time.toLocaleTimeString("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
    })} ) - ${location}`;

    // Notion 데이터베이스에 출근 정보 업데이트
    const notionData = await checkInAttendanceDatabase(user, location, time);

    if (notionData) {
      if (typeof notionData === "number") {
        await client.chat.postMessage({
          channel: body.user.id,
          text: "이미 출근한 사용자입니다.",
        });
        return;
      }
      try {
        // 출근 정보를 슬랙 채널에 메시지로 보내기
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
    // 타임피커에서 선택한 시간 가져오기
    const checkInDate = values["check_in_date_select"]["check_in_date_select-action"].selected_date;
    const checkOutDate = values["check_out_date_select"]["check_out_date_select-action"].selected_date;
    const selectedTime = values["check_out_timepicker"]["check_out_timepicker-action"].selected_time;
    // 위 세개의 변수는 전부 값이 존재해야하거나 전부값이 존재하지 않아야함
    if ((checkInDate && checkOutDate && selectedTime) || (!checkInDate && !checkOutDate && !selectedTime)) {
      console.log(checkInDate, checkOutDate, selectedTime);
    } else {
      await client.chat.postMessage({
        channel: body.user.id,
        text: "날짜와 시간을 모두 선택하거나 모두 선택하지 않아야합니다.",
      });
      return;
    }

    let curDate = new Date();
    // 선택한 날짜가 존재하면, 해당 날짜로 설정
    if (checkOutDate) {
      curDate = new Date(checkOutDate);
    }

    // 타임피커에서 선택한 시간이 존재하면, 해당 시간으로 설정
    if (selectedTime) {
      const [hour, minute] = selectedTime.split(":");
      curDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0);
    }

    const messageText = `🙋‍♀️ [퇴근] ${user} ( ${
      // mm-dd
      curDate.toLocaleDateString("ko-KR", {
        timeZone: "Asia/Seoul",
        month: "2-digit",
        day: "2-digit",
      })
    } ${curDate.toLocaleTimeString("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
    })} )`;
    const notionData = await checkOutAttendanceDatabase(user, curDate, checkInDate);
    if (notionData) {
      if (typeof notionData === "number") {
        await client.chat.postMessage({
          channel: body.user.id,
          text: "이미 퇴근한 사용자입니다.",
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
