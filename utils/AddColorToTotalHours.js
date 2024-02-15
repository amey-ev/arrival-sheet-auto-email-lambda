const colorPercentageMapper = {
  "#f87171": 60,
  "#fb923c": 87,
};

//* Assuming the total hours will always be in String and in the foloowing format Hours:Minutes
const calculatePercentage = (recordedTime, totalTime = 8) => {
  if (!recordedTime.includes(":")) {
    return 0;
  }
  const [recordedHours, recordedMinutes] = recordedTime.split(":").map(Number);
  const totalRecordedMinutes = recordedHours * 60 + recordedMinutes;
  const percentage = (totalRecordedMinutes / (totalTime * 60)) * 100;
  return percentage.toFixed(2);
};

//* If the total hours is "--" or "00:00" them it'll have normal color which in our case is black
const addColorAccordingToTotalHours = (inputArray) => {
  const updatedArrayWithColors = inputArray.map((datum) => {
    const effectiveHours = datum["Effective Hours"];
    let color = null;
    if (effectiveHours === "--" || effectiveHours === "00:00") {
      return { ...datum, color };
    }
    const calculatedPercentage = calculatePercentage(effectiveHours);
    const colorMapper = Object.entries(colorPercentageMapper);
    colorMapper.forEach(([requiredColor, requiredPercentage]) => {
      if (color === null) {
        if (calculatedPercentage <= requiredPercentage) {
          color = requiredColor;
        }
      }
    });
    return { ...datum, color };
  });
  return updatedArrayWithColors;
};

module.exports = addColorAccordingToTotalHours;
