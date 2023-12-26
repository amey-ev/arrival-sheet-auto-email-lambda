const fetchData = require("./utils/fetchData");
const generateTimeSheetTableTemplate = require("./utils/generateTimeSheetTable");
const fillMissingDays = require("./utils/fillMissingDays");
const getRMEmail = require("./utils/getRMEmail");
const gets3CSVData = require("./utils/gets3CSVData");
const fillMissingDates = require("./utils/fillMissingDates");
const checkIfEmpIsPresentAllDay = require("./utils/checkIfEmpIsPresentAllDay");
const generateEmpNotPresentTemplate = require("./utils/generateEmpNotPresentTemplate");
const sendSESEmails = require("./utils/sendSESEmail");

exports.handler = async (event) => {
  try {
    const resourceDetails = await fetchData(
      "https://alb-dev-hub.everestek.com/hub/hub-services/v1/resources/details/"
    );
    const sendEmailArray = []; // Call this array on-loop to send email
    const bucket = event.Records[0].s3.bucket.name;
    const arrayUniqueKey = "Employee Number";
    const key = event.Records[0].s3.object.key;
    const params = {
      Bucket: bucket,
      Key: decodeURIComponent(key.replace(/\+/g, " ")), // to remove "+" from the key name of the keys (event replaces " " with "+")
    };
    const s3Object = await gets3CSVData(params);
    const arrayUniqueByKey = [
      ...new Map(s3Object.map((item) => [item[arrayUniqueKey], item])).values(),
    ];

    arrayUniqueByKey.forEach(async (datum) => {
      const employeeId = datum[arrayUniqueKey];
      const employeeName = datum["Employee Name"] || "-";
      let weekRange = "-";
      const employeeReportingManagerName = datum["Reporting Manager"];
      const filteredDataFromTimeSheet = s3Object.filter((datum) => {
        if (datum[arrayUniqueKey] === employeeId) {
          return datum;
        }
      });
      let emailTemplate = null;
      const timeSheetDataWithMissingDays = fillMissingDays(
        filteredDataFromTimeSheet
      );
      let timeSheetWithMissingDates = timeSheetDataWithMissingDays;
      if (checkIfEmpIsPresentAllDay(timeSheetDataWithMissingDays)) {
        const { missingDateEmailTemplate, missingDateWeekRange } =
          generateEmpNotPresentTemplate(
            timeSheetDataWithMissingDays,
            employeeName
          );
        emailTemplate = missingDateEmailTemplate;
        weekRange = missingDateWeekRange;
      } else {
        timeSheetWithMissingDates = fillMissingDates(
          timeSheetDataWithMissingDays
        );
        emailTemplate = generateTimeSheetTableTemplate(
          timeSheetWithMissingDates,
          employeeName
        );
        const firstDayOfWeek = timeSheetWithMissingDates[0]?.Date;
        const lastDayOfWeek =
          timeSheetWithMissingDates[timeSheetWithMissingDates.length - 1]?.Date;
        weekRange = `${firstDayOfWeek} to ${lastDayOfWeek}`;
      }

      const { rmEmail, empEmail } = getRMEmail(
        parseInt(employeeId),
        resourceDetails
      );
      sendEmailArray.push({
        employeeName,
        emailTemplate,
        rmEmail,
        rmName: employeeReportingManagerName,
        weekRange,
      });
    });
    const slicedEmailArray = sendEmailArray.slice(0, 7);
    for (const email of slicedEmailArray) {
      //TODO: Change slicedEmailArray to sendEmailArray AfterTesting
      //TODO: At prod. change the toAddresses to rmEmail,empEmail
      await sendSESEmails({
        toAddresses: [
          "amey.bhogaonkar@everestek.com",
          "rahul.varma@everestek.com",
        ], //* Ex. toAddress: [rmEmail, empEmail]
        source: "hubnotifications@everestek.com",
        subject: `Weekly Attendance Report of ${email?.employeeName} for [${email?.weekRange}]`,
        htmlTemplate: email?.emailTemplate || "-",
      });
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email Sent Successfully" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
