#!/usr/bin/env node
/**
 * 指定した Public ID (GTM-XXXXXX) のコンテナ情報を取得して表示
 * 使用例: node check-container.js GTM-T5W8QJ
 */

import { GTMClient } from './src/gtm-client.js';

const publicId = process.argv[2] || 'GTM-T5W8QJ';

async function findContainerByPublicId(gtmClient, targetPublicId) {
  const accounts = await gtmClient.listAccounts();
  const normalized = targetPublicId.replace(/^GTM-/, '');
  for (const acc of accounts) {
    const containers = await gtmClient.listContainers(acc.accountId);
    for (const c of containers) {
      const id = (c.publicId || '').replace(/^GTM-/, '');
      if (id === normalized || c.publicId === targetPublicId) {
        return {
          accountId: acc.accountId,
          accountName: acc.name,
          containerId: c.containerId,
          container: c
        };
      }
    }
  }
  return null;
}

async function run() {
  const gtmClient = new GTMClient();
  console.log(`\n=== コンテナ確認: ${publicId} ===\n`);

  const found = await findContainerByPublicId(gtmClient, publicId);
  if (!found) {
    console.log(`コンテナ ${publicId} が見つかりませんでした。アカウントに存在しないか、権限がありません。\n`);
    process.exit(1);
  }

  const { accountId, accountName, containerId, container } = found;
  console.log('【アカウント】');
  console.log(`  ID: ${accountId}`);
  console.log(`  名前: ${accountName}\n`);

  console.log('【コンテナ概要】');
  console.log(`  Public ID: ${container.publicId || publicId}`);
  console.log(`  Container ID (API): ${containerId}`);
  console.log(`  名前: ${container.name || '-'}`);
  console.log(`  用途: ${container.usageContext || []}\n`);

  const fullContainer = await gtmClient.getContainer(accountId, containerId);
  console.log('【コンテナ詳細】');
  console.log(JSON.stringify(fullContainer, null, 2));
  console.log('');

  const workspaces = await gtmClient.listWorkspaces(accountId, containerId);
  console.log(`【ワークスペース一覧】(${workspaces.length} 件)`);
  for (const ws of workspaces) {
    console.log(`  - ${ws.name} (ID: ${ws.workspaceId}) ${ws.description ? `- ${ws.description}` : ''}`);
  }
  console.log('');

  if (workspaces.length > 0) {
    const defaultWorkspace = workspaces[0];
    console.log(`【デフォルトワークスペースのレビュー情報】${defaultWorkspace.name} (${defaultWorkspace.workspaceId})`);
    try {
      const reviewInfo = await gtmClient.getWorkspaceReviewInfo(accountId, containerId, defaultWorkspace.workspaceId);
      console.log(JSON.stringify(reviewInfo, null, 2));
    } catch (e) {
      console.log('  (取得エラー:', e.message, ')');
    }
  }

  console.log('\n=== 確認完了 ===\n');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
