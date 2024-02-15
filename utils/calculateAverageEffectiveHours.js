const calculateAverageEffectivHours = (employeeTimeArray) => {
  const getEffectiveHoursTimeList = (inputList) => {
    if (inputList.length === 0) {
      return "0:0";
    }
    const effectiveHoursArray = inputList
      .map((datum) => {
        if (datum["Effective Hours"] !== "--") {
          return datum["Effective Hours"];
        }
      })
      .filter((datum) => datum !== undefined);
    return effectiveHoursArray;
  };
  const timeToSeconds = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60;
  };

  const secondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };
  const timeList = getEffectiveHoursTimeList(employeeTimeArray);
  const totalSeconds = timeList.reduce(
    (acc, timeStr) => acc + timeToSeconds(timeStr),
    0
  );
  const avgSeconds = totalSeconds / timeList.length;
  return secondsToTime(avgSeconds);
};

module.exports = calculateAverageEffectivHours;
