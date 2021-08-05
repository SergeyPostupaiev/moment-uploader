const { createReadStream, unlink, readdirSync } = require('fs');
const { extname } = require('path');
const { S3 } = require('aws-sdk');
require('dotenv').config();

const MOMENT_FOLDER = './moment-data';
const S3_FOLDER = 'live_moments';
const RESERVED = 'xxxxxxxxxxxxxxxxxxxxxx';
const options = {
  storage: {
    bucket: getEnvStr('STORAGE_BUCKET'),
    key: getEnvStr('STORAGE_KEY'),
    secret: getEnvStr('STORAGE_SECRET'),
  },
  pathData: {
    stadium_name: getEnvStr('STADIUM_NAME'),
    camera_name: getEnvStr('CAMERA_NAME'),
  },
};

async function main() {
  console.time('time to upload');
  const files = readdirSync(MOMENT_FOLDER).filter(
    (file) => file !== '.gitkeep'
  );

  const date = new Date();
  let timestamp = date.getTime();
  const currentDate = date.toISOString().split('T')[0].replace(/-/g, '');

  const storageKeys = files.map((file) => {
    timestamp += 500;
    return {
      key: `${S3_FOLDER}/${options.pathData.stadium_name}/${
        options.pathData.camera_name
      }/${currentDate}/${timestamp}_${RESERVED}${extname(file)}`,
      filePath: `${MOMENT_FOLDER}/${file}`,
    };
  });

  console.log(storageKeys);
  console.log('total momentOs uploaded', storageKeys.length);

  const s3 = new S3({
    accessKeyId: options.storage.key,
    secretAccessKey: options.storage.secret,
    params: { Bucket: options.storage.bucket },
  });

  await Promise.all(
    storageKeys.map(({ key, filePath }) =>
      s3
        .upload({
          Body: createReadStream(filePath),
          Bucket: options.storage.bucket,
          Key: key,
        })
        .promise()
    )
  );
  console.timeEnd('time to upload');
}

function getEnvStr(key, _default) {
  const s = process.env[key];
  if (!s) {
    if (_default || _default === '') {
      return _default;
    } else {
      throw `env ${key} is required`;
    }
  } else {
    return s;
  }
}

main();
