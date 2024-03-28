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

async function addItemToAttendanceDatabase(user, location) {
  const date = getSeoulDateISOString();
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
            equals: date.slice(0, 10),
          },
        },
      ],
    },
  });
  if (queryResponse.results.length > 0) {
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
            start: date.slice(0, 10),
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

module.exports = {
  addItemToAttendanceDatabase,
  changeStatusToAttendanceDatabase,
  addItemToDatabase,
  addItemToVacationDatabase,
};
