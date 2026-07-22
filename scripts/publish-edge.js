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
  return { data, location: response.headers.get('location') };
}

async function sleep(milliseconds) {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function pollOperation(url, headers, operation) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await fetch(url, { headers });
    const { data } = await parseResponse(response, operation);
    if (data.status === 'Succeeded') return data;
    if (data.status === 'Failed') throw new Error(`${operation} failed: ${JSON.stringify(data)}`);
    await sleep(10_000);
  }
  throw new Error(`${operation} did not complete within ten minutes`);
}

function operationId(location) {
  if (!location) throw new Error('Microsoft Edge API response did not include a Location operation ID');
  return location.split('/').filter(Boolean).pop();
}

async function main() {
  const packagePath = process.argv[2];
  if (!packagePath || !fs.existsSync(packagePath)) throw new Error('A valid Edge package path is required');

  const productId = required('EDGE_PRODUCT_ID');
  const clientId = required('EDGE_CLIENT_ID');
  const apiKey = required('EDGE_API_KEY');
  const submit = process.env.SUBMIT === 'true';
  const baseUrl = 'https://api.addons.microsoftedge.microsoft.com/v1';
  const headers = {
    Authorization: `ApiKey ${apiKey}`,
    'X-ClientID': clientId
  };

  const uploadResponse = await fetch(`${baseUrl}/products/${encodeURIComponent(productId)}/submissions/draft/package`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/zip'
    },
    body: fs.readFileSync(packagePath)
  });
  const upload = await parseResponse(uploadResponse, 'Edge package upload');
  const uploadId = operationId(upload.location);
  await pollOperation(
    `${baseUrl}/products/${encodeURIComponent(productId)}/submissions/draft/package/operations/${encodeURIComponent(uploadId)}`,
    headers,
    'Edge package processing'
  );
  console.log('Edge package upload succeeded.');

  if (!submit) {
    console.log('Edge publication was not requested; the uploaded draft remains unpublished.');
    return;
  }

  const notes = process.env.EDGE_CERTIFICATION_NOTES
    || 'Automated submission from the verified GitHub release artifact. No remote code or telemetry is included.';
  const publishResponse = await fetch(`${baseUrl}/products/${encodeURIComponent(productId)}/submissions`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'text/plain; charset=utf-8'
    },
    body: notes
  });
  const publication = await parseResponse(publishResponse, 'Edge publication request');
  const publicationId = operationId(publication.location);
  const result = await pollOperation(
    `${baseUrl}/products/${encodeURIComponent(productId)}/submissions/operations/${encodeURIComponent(publicationId)}`,
    headers,
    'Edge publication processing'
  );
  console.log(`Edge publication request succeeded: ${JSON.stringify(result)}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
