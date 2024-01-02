const generateDatesInRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const formattedDate =
      currentDate.getDate().toString().padStart(2, "0") +
      "-" +
      new Intl.DateTimeFormat("en-US", { month: "short" }).format(currentDate) +
      "-" +
      currentDate.getFullYear();
    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const getWeekRange = (inputDate) => {
  const date = new Date(inputDate);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  const dayOfWeek = date.getDay();
  const firstDayDiff = dayOfWeek - 0;
  const firstDay = new Date(date);
  firstDay.setDate(date.getDate() - firstDayDiff);
  const lastDayDiff = 6 - dayOfWeek;
  const lastDay = new Date(date);
  lastDay.setDate(date.getDate() + lastDayDiff);

  return {
    firstDay: firstDay,
    lastDay: lastDay,
  };
};

const fillMissingDates = (inputArray) => {
  const firstOccuranceOfDate = inputArray.find((element) => {
    return element.Date !== "DD-MM-YYYY";
  });
  const { firstDay, lastDay } = getWeekRange(firstOccuranceOfDate.Date);
  const dateArray = generateDatesInRange(firstDay, lastDay);
  const arrayWithDateInserted = inputArray.map((item, index) => {
    return {
      ...item,
      Date: dateArray[index],
    };
  });

  arrayWithDateInserted.shift();
  arrayWithDateInserted.pop();
  return arrayWithDateInserted;
};

module.exports = fillMissingDates;
