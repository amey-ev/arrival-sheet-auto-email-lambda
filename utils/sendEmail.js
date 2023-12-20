const Q = require('q');
const { SES, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const nodemailer = require('nodemailer');

const sendEmail = async ({
  senderName,
  senderEmail,
  receiverName,
  receiverEmail,
  mailTitle,
  message,
  attachment,
}) => {
  const deferred = Q.defer();
  const ses = new SES();

  let transporter = nodemailer.createTransport({
    SES: {
      ses: ses,
      aws: { SendRawEmailCommand },
    },
  });

  const infoObject = {
    from: `${senderName} <${senderEmail}>`,
    to: `${receiverName} <${receiverEmail}>`,
    subject: mailTitle,
    html: message,
  };

  const updatedInfoObject = attachment
    ? Object.assign(infoObject, {
        attachments: [
          {
            filename: attachment.fileName,
            path: attachment.file,
            contentType: attachment.contentType,
          },
        ],
      })
    : infoObject;

  try {
    let info = await transporter.sendMail(updatedInfoObject);
    console.log('messageId : ', JSON.stringify(info.messageId));
    deferred.resolve(info.messageId);
  } catch (e) {
    console.log('sendingMails-error', e);
    return deferred.reject(e);
  }
  return deferred.promise;
};

module.exports = sendEmail;
