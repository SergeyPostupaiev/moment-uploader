const https = require('https');

async function main() {
  const p = await post();
  console.log(p);
}

main();

async function post() {
  const body = JSON.stringify({ momentoKey: 'keeeey' });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
    },
  };

  return await new Promise((resolve, reject) => {
    const req = https.request(
      'https://momento.codeda.com/api/moment/notify',
      options,
      (res) => {
        const resData = [];

        res.on('data', (chunk) => resData.push(chunk));

        res.on('end', () => {
          const resString = Buffer.concat(resData).toString();
          resolve(JSON.parse(resString));
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.write(body);
    req.end();
  });
}
