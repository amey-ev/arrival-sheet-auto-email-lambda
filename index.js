const fetchData = require("./utils/fetchData");
const generateTimeSheetTableTemplate = require("./utils/generateTimeSheetTable");
const fillMissingDays = require("./utils/fillMissingDays");
const getRMEmail = require("./utils/getRMEmail");
const gets3CSVData = require("./utils/gets3CSVData");
const fillMissingDates = require("./utils/fillMissingDates");
const checkIfEmpIsPresentAllDay = require("./utils/checkIfEmpIsPresentAllDay");
const generateEmpNotPresentTemplate = require("./utils/generateEmpNotPresentTemplate");
const sendSESEmails = require("./utils/sendSESEmail");
const addColorAccordingToTotalHours = require("./utils/addColorToTotalHours");

exports.handler = async (event) => {
  const ENDPOINT = process.env.ENDPOINT || "https://alb-dev-hub.everestek.com"; //Default endpoint to dev
  try {
    const resourceDetails = await fetchData(
      `${ENDPOINT}/hub/hub-services/v1/resources/details/`
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
      const reportingManagerName = datum["Reporting Manager"] || "";
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
            addColorAccordingToTotalHours(timeSheetDataWithMissingDays),
            employeeName,
            reportingManagerName,
            employeeId
          );
        emailTemplate = missingDateEmailTemplate;
        weekRange = missingDateWeekRange;
      } else {
        timeSheetWithMissingDates = fillMissingDates(
          timeSheetDataWithMissingDays
        );
        emailTemplate = generateTimeSheetTableTemplate(
          addColorAccordingToTotalHours(timeSheetWithMissingDates),
          employeeName,
          reportingManagerName,
          employeeId
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
        empEmail,
        weekRange,
      });
    });
    console.log("Started sending email....");
    for (const email of sendEmailArray) {
      const { rmEmail, empEmail, employeeName, weekRange, emailTemplate } =
        email;
      if (rmEmail !== "-" && empEmail !== "-") {
        await sendSESEmails({
          toAddresses: [rmEmail, empEmail, "management-alerts@everestek.com"],
          source: "hubnotifications@everestek.com",
          subject: `${employeeName} - Weekly Attendance Report [${weekRange}]`,
          htmlTemplate: emailTemplate || "-",
        });
      } else {
        console.log(
          `${employeeName} does not have RM Email or his/her own email.`
        );
      }
    }
    console.log("Sending of email completed !!!");
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
