const checkIfEmpIsPresentAllDay = (inputArray) => {
  return inputArray.every((item) => item.Date === 'DD-MM-YYYY');
};

module.exports = checkIfEmpIsPresentAllDay;
