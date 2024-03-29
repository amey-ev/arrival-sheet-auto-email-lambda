// TODO: Commented Employee Number, Employee Name, Reporting Manager
// {/* <td style="border: 1px solid #000000;height: 60px; width: 140px; text-align: center; vertical-align: middle; border: 1px solid #000000;">${
//                         employee["Employee Number"] || "-"
//                       }</td>
//                       <td style="border: 1px solid #000000;height: 60px; width: 140px; text-align: center; vertical-align: middle; border: 1px solid #000000;">${
//                         employee["Employee Name"] || "-"
//                       }</td>
//                       <td style="border: 1px solid #000000;height: 60px; width: 140px; text-align: center; vertical-align: middle; border: 1px solid #000000;">${
//                         employee["Reporting Manager"] || "-"
//                       }</td> */}
const calculateAverageEffectivHours = require("./calculateAverageEffectiveHours");
const generateTimeSheetTableTemplate = (
  employeeTimeArray,
  employeeName,
  reportingManagerName,
  employeeId
) => {
  const tableHeaders = [
    "Date",
    "Day",
    // "Employee ID",
    // "Employee Name",
    // "Reporting Manager Name",
    "Attendance Mode",
    "In-Time",
    "Out-Time",
    "Effective Hours",
    "Total Hours",
  ];
  const averageEffectiveHours =
    calculateAverageEffectivHours(employeeTimeArray);
  const timeSheetTableTemplate = `
    <html>
      <body style="display: block";>
        <p>
          Hi ${employeeName}, Attached is your weekly attendance report for your review. This report will also be shared with your Resource Manager for their records.
        </p>
        <p>
          <b>Employee Name :</b> ${employeeName}
        </p>
        <p>
          <b>Employee Id :</b> ${employeeId}
        </p>
        <p>
          <b>Resource Manager :</b> ${reportingManagerName}
        </p>
        <p>
          <b>Average Effective Hours :</b> ${averageEffectiveHours}
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border: 1px solid #000000;">
            ${tableHeaders
              .map(
                (header) => `
                <th style="border: 1px solid #000000;padding:4px;text-align: center; vertical-align: middle; border: 1px solid #000000;font-size: 14px;">${header}</th>
            `
              )
              .join("")}
            </tr>
          </thead>
          <tbody>
              ${employeeTimeArray
                .map((employee) => {
                  let calculatedType = "-";
                  if (
                    employee["In Time"] !== "--" &&
                    employee["Out Time"] !== "--"
                  ) {
                    calculatedType = "WFO";
                  } else {
                    calculatedType = "WFH/Leave/Holiday";
                    employee["In Time"] = "00:00";
                    employee["Out Time"] = "00:00";
                    employee["Effective Hours"] = "00:00";
                    employee["Total Hours"] = "00:00";
                  }
                  return `
                    <tr style="border: 1px solid #000000;">
                      <td style="border: 1px solid #000000;padding:4px;text-align: center; vertical-align: middle; border: 1px solid #000000;font-size: 14px;">${
                        employee?.Date || "-"
                      }</td>
                      <td style="border: 1px solid #000000;padding:4px;text-align: center; vertical-align: middle; border: 1px solid #000000;font-size: 14px;">${
                        employee?.Day || "-"
                      }</td>
                      <td style="border: 1px solid #000000;padding:4px;text-align: center; vertical-align: middle; border: 1px solid #000000;font-size: 14px;">${calculatedType}</td>
                      <td style="border: 1px solid #000000;padding:4px;text-align: center; vertical-align: middle; border: 1px solid #000000;font-size: 14px;">${
                        employee["In Time"] || "-"
                      }</td>
                      <td style="border: 1px solid #000000;padding:4px;text-align: center; vertical-align: middle; border: 1px solid #000000;font-size: 14px;">${
                        employee["Out Time"] || "-"
                      }</td>
                      <td style="border: 1px solid #000000;padding:4px;text-align: center; vertical-align: middle; border: 1px solid #000000;font-size: 14px;background-color:${
                        employee?.color
                      };">${employee["Effective Hours"] || "-"}</td>
                      <td style="border: 1px solid #000000;padding:4px;text-align: center; vertical-align: middle; border: 1px solid #000000;font-size: 14px;">${
                        employee["Total Hours"] || "-"
                      }</td>
                    </tr>
                  `;
                })
                .join("")}
          </tbody>
        </table>
        <p>
          Kindly note that this is an automated email generated by the system. Feel free to reach out to your RM if you have any questions or require further clarification.
        </p>
        <p>
          Thanks & Regards,
        </p>
        <p>
        Everestek Support Team
        </p>
      </body>
    </html>
  `;

  return timeSheetTableTemplate.replace(/\n/g, "");
};

module.exports = generateTimeSheetTableTemplate;
