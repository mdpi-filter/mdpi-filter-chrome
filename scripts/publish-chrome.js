'use strict';

const fs = require('node:fs');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function parseResponse(response, operation) {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text.slice(0, 2000) };
  }
  if (!response.ok) {
    throw new Error(`${operation} failed with HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function sleep(milliseconds) {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function main() {
  const packagePath = process.argv[2];
  if (!packagePath || !fs.existsSync(packagePath)) throw new Error('A valid Chrome package path is required');

  const publisherId = required('CHROME_PUBLISHER_ID');
  const extensionId = required('CHROME_EXTENSION_ID');
  const clientId = required('CHROME_CLIENT_ID');
  const clientSecret = required('CHROME_CLIENT_SECRET');
  const refreshToken = required('CHROME_REFRESH_TOKEN');
  const submit = process.env.SUBMIT === 'true';

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const tokenData = await parseResponse(tokenResponse, 'Chrome OAuth token refresh');
  if (!tokenData.access_token) throw new Error('Chrome OAuth response did not contain an access token');

  const itemBase = `https://chromewebstore.googleapis.com/v2/publishers/${encodeURIComponent(publisherId)}/items/${encodeURIComponent(extensionId)}`;
  const authorization = `Bearer ${tokenData.access_token}`;
  const uploadResponse = await fetch(
    `https://chromewebstore.googleapis.com/upload/v2/publishers/${encodeURIComponent(publisherId)}/items/${encodeURIComponent(extensionId)}:upload`,
    {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/zip'
      },
      body: fs.readFileSync(packagePath)
    }
  );
  let uploadData = await parseResponse(uploadResponse, 'Chrome package upload');

  for (let attempt = 0; uploadData.uploadState === 'UPLOAD_IN_PROGRESS' && attempt < 60; attempt += 1) {
    await sleep(10_000);
    const statusResponse = await fetch(`${itemBase}:fetchStatus`, {
      headers: { Authorization: authorization }
    });
    uploadData = await parseResponse(statusResponse, 'Chrome upload status');
  }

  if (uploadData.uploadState !== 'SUCCEEDED') {
    throw new Error(`Chrome upload did not succeed: ${JSON.stringify(uploadData)}`);
  }
  console.log('Chrome package upload succeeded.');

  if (!submit) {
    console.log('Chrome publication was not requested; the uploaded draft remains unpublished.');
    return;
  }

  const publishResponse = await fetch(`${itemBase}:publish`, {
    method: 'POST',
    headers: { Authorization: authorization }
  });
  const publishData = await parseResponse(publishResponse, 'Chrome publication request');
  console.log(`Chrome publication request accepted: ${JSON.stringify(publishData)}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
