function getSeoulDateISOString() {
  const timeZone = "Asia/Seoul";
  const now = new Date();
  const seoulDateString = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timeZone,
  }).format(now);

  // 'yyyy-MM-dd' 형식으로 변환
  const [year, month, day] = seoulDateString.split("-");
  const seoulDate = `${year}-${month}-${day}`;

  // T00:00:00.000Z 형식으로 변환하여 한국의 현재 날짜로 만듦
  return new Date(`${seoulDate}T00:00:00.000Z`).toISOString();
}

module.exports = { getSeoulDateISOString };
