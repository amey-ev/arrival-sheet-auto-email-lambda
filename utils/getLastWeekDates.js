const getLastWeekStartEndDate = () => {
  const startOfLastWeek = new Date();
  startOfLastWeek.setDate(
    startOfLastWeek.getDate() - startOfLastWeek.getDay() - 6
  );
  const formatCustomDate = (date) => {
    return (
      date.getDate().toString().padStart(2, "0") +
      "-" +
      new Intl.DateTimeFormat("en-US", { month: "short" }).format(date) +
      "-" +
      date.getFullYear()
    );
  };
  const lastWeekDates = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfLastWeek);
    currentDate.setDate(startOfLastWeek.getDate() + i);
    lastWeekDates.push(formatCustomDate(currentDate));
  }
  lastWeekDates.shift();
  lastWeekDates.pop();
  return lastWeekDates;
};
