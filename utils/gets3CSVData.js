const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { parse } = require('csv-parse');
const { Readable } = require('stream');

const client = new S3Client({});

const csvToJson = (csvData) => {
  return new Promise((resolve, reject) => {
    const parser = parse({ columns: true });
    const readableStream = Readable.from(csvData);
    const result = [];
    readableStream.pipe(parser);
    parser
      .on('data', (data) => {
        result.push(data);
      })
      .on('end', () => {
        resolve(result);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

const gets3CSVData = async ({ Bucket, Key }) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });

  try {
    const response = await client.send(command);
    const csvContent = response.Body;
    const jsonData = await csvToJson(csvContent);
    return jsonData;
  } catch (err) {
    console.error(err);
  }
};

module.exports = gets3CSVData;
