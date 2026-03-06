#!/usr/bin/env node

/**
 * GTM-TSXHZXT7 コンテナを公開（ワークスペース4 → バージョン作成 → 公開）
 */

import { GTMClient } from './src/gtm-client.js';

async function run() {
  const gtmClient = new GTMClient();
  const accountId = '4702826221';
  const containerId = '244511494';
  const workspaceId = '4';

  try {
    console.log('=== GTM-TSXHZXT7 コンテナ公開 ===\n');

    console.log('1. ワークスペースからバージョンを作成中...');
    const version = await gtmClient.createVersion(accountId, containerId, workspaceId, {
      name: 'Container size test - 変数10・トリガー10・タグ10',
      notes: 'コンテナサイズテスト用'
    });
    const versionId = version.containerVersion?.containerVersionId || version.containerVersion?.versionId || version.versionId;
    if (!versionId) {
      console.error('バージョンIDが取得できません:', version);
      process.exit(1);
    }
    console.log(`   バージョン作成完了: ID ${versionId}\n`);

    console.log('2. バージョンを公開中...');
    await gtmClient.publishVersion(accountId, containerId, versionId);
    console.log('   公開完了\n');

    console.log('=== 公開済み ===');
    console.log(`コンテナ: GTM-TSXHZXT7`);
    console.log(`バージョンID: ${versionId}`);
  } catch (err) {
    console.error('エラー:', err.message);
    if (err.response) console.error(err.response.data);
    process.exit(1);
  }
}

run();
