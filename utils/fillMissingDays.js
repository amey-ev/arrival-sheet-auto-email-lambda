const workDaysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const findMissingDaysAndInsert = (inputArray, placeholderObject) => {
  const dataMap = new Map(inputArray.map((item) => [item.Day, item]));
  const result = workDaysOfWeek.map((day) => {
    if (dataMap.has(day)) {
      return dataMap.get(day);
    } else {
      return {
        Day: day,
        Date: "DD-MM-YYYY",
        "Employee Number": "--",
        "Job Title": "--",
        "Business Unit": "--",
        Department: "--",
        "Sub Department": "--",
        Location: "--",
        "Cost Center": "--",
        "Reporting Manager": "--",
        "In Time": "--",
        "Premise Name (IN)": "--",
        "Out Time": "--",
        "Premise Name (OUT)": "--",
        "Effective Hours": "--",
        "Total Hours": "--",
        Type: "--",
        ...placeholderObject,
      };
    }
  });

  return result;
};

const fillMissingDays = (inputArray) => {
  const placeHolderObject = {
    "Employee Number": inputArray[0]["Employee Number"],
    "Employee Name": inputArray[0]["Employee Name"],
    "Reporting Manager": inputArray[0]["Reporting Manager"],
  };
  const arrayWithDays = inputArray.map((datum) => {
    return {
      Day: workDaysOfWeek[new Date(datum.Date).getDay()],
      ...datum,
    };
  });
  const missingDaysFilledArray = findMissingDaysAndInsert(
    arrayWithDays,
    placeHolderObject
  );

  return missingDaysFilledArray;
};

module.exports = fillMissingDays;
