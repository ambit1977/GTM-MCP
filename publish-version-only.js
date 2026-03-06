#!/usr/bin/env node

import { GTMClient } from './src/gtm-client.js';

async function run() {
  const gtmClient = new GTMClient();
  const accountId = '4702826221';
  const containerId = '244511494';
  const versionId = '3'; // 既に作成済みのバージョン

  try {
    console.log('バージョン 3 を公開中...');
    await gtmClient.publishVersion(accountId, containerId, versionId);
    console.log('公開完了');
    console.log('コンテナ GTM-TSXHZXT7 が公開されました。');
  } catch (err) {
    console.error('エラー:', err.message);
    if (err.response) console.error(err.response.data);
    process.exit(1);
  }
}

run();
