const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sendSESEmail = async ({ toAddresses, source, subject, htmlTemplate }) => {
  const sesClient = new SESClient();
  const params = {
    Destination: {
      ToAddresses: Array.isArray(toAddresses) ? toAddresses : [toAddresses],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlTemplate,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: source,
  };

  const sendEmailCommand = new SendEmailCommand(params);
  try {
    setTimeout(() => {
      console.log("Sending Email...");
    }, 10000);
    const data = await sesClient.send(sendEmailCommand);
    console.log("Email sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendSESEmail;
