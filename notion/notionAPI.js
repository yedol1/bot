const { notion } = require("../config");
const { authorData, bugData } = require("../data");
const { getSeoulDateISOString } = require("../utils");

async function addItemToVacationDatabase(user, startDate, endDate, totalVacationDays) {
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
            start: startDate,
            end: endDate,
          },
        },
        // Vacation 속성 유형은 상태입니다.
        상태: {
          status: {
            name: "휴가",
          },
        },
        // 휴가일수 속성 유형은 숫자입니다.
        휴가일수: {
          number: totalVacationDays,
        },
      },
    });
    return response;
  } catch (error) {
    console.error("Notion 데이터 추가 실패:", error);
  }
}

async function checkInAttendanceDatabase(user, location, date) {
  // date 는 2024-04-12T05:43:42.203Z 의 형태를 사용하여, 날짜를 비교합니다.
  // date 속성을 이용하여, 해당 날짜의 년, 월, 일을 추출합니다.
  const dateString = date instanceof Date ? date.toISOString() : date.toString();

  const justDate = dateString.split("T")[0]; // '2024-04-12' 형태의 문자열을 얻습니다.

  const startDate = `${justDate}T00:00:00.000Z`; // 해당 날짜의 시작 시각
  const endDate = `${justDate}T23:59:59.999Z`; // 해당 날짜의 종료 시각

  console.log(startDate, endDate);
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
            on_or_after: startDate,
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
  console.log("서버:", date);
  if (queryResponse.results.length > 0) {
    return queryResponse.results.length; // 해당 날짜에 이미 데이터가 있다면, 그 수를 반환
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
            start: date,
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

async function checkOutAttendanceDatabase(user, date, checkInDate) {
  // checkInDate 는 2024-04-12 형태거나 null 일 수 있습니다.
  const nowDate = new Date();
  const dateString = nowDate.toISOString();
  const justDate = dateString.split("T")[0]; // '2024-04-12' 형태의 문자열을 얻습니다.

  console.log(justDate);

  const startDate = checkInDate ? `${checkInDate}T00:00:00.000Z` : `${justDate}T00:00:00.000Z`; // 해당 날짜의 시작 시각
  const endDate = checkInDate ? `${checkInDate}T23:59:59.999Z` : `${justDate}T23:59:59.999Z`; // 해당 날짜의 종료 시각

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
            on_or_after: startDate,
            on_or_before: endDate,
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
  if (!queryResponse) return new Error("데이터베이스에 접근할 수 없습니다.");
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
            start: date,
          },
        },
        // Attendance 속성 유형은 상태입니다.
        상태: {
          status: {
            name: "퇴근",
          },
        },
        비고: {
          type: "rich_text",
          rich_text: [
            {
              text: {
                content: checkInDate ? `출근날짜: ${checkInDate}` : `출근날짜: ${date}`,
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

async function updateAttendanceDatabase(user, state, curDate, updateDate, text) {
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
            equals: curDate,
          },
        },
        {
          property: "상태",
          status: {
            equals: state,
          },
        },
      ],
    },
  });
  if (!queryResponse) return new Error("데이터베이스에 접근할 수 없습니다.");
  try {
    const response = await notion.pages.update({
      page_id: queryResponse.results[0].id,
      properties: {
        날짜: {
          date: {
            start: updateDate,
          },
        },
        비고: {
          type: "rich_text",
          rich_text: [
            {
              text: {
                content: text,
              },
            },
          ],
        },
      },
    });
    console.log("Notion에 데이터가 업데이트되었습니다:", response);
    return response;
  } catch (error) {
    console.error("Notion 데이터 업데이트 실패:", error);
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

module.exports = {
  checkInAttendanceDatabase,
  checkOutAttendanceDatabase,
  addItemToDatabase,
  addItemToVacationDatabase,
  updateAttendanceDatabase,
};
