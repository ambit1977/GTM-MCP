#!/usr/bin/env node

/**
 * コンテナ、ワークスペース、タグなどの詳細テスト
 */

import { GTMClient } from './src/gtm-client.js';

async function testDetails() {
  try {
    console.log('=== 詳細情報取得テスト ===\n');
    
    const gtmClient = new GTMClient();
    const oauth2Auth = gtmClient.getOAuth2Auth();
    
    if (!oauth2Auth.isAuthenticated()) {
      console.log('✗ 認証が必要です。');
      process.exit(1);
    }
    
    // 最初のアカウントを取得
    const accounts = await gtmClient.listAccounts();
    if (accounts.length === 0) {
      console.log('アカウントが見つかりません。');
      return;
    }
    
    const account = accounts[0];
    console.log(`使用アカウント: ${account.name} (ID: ${account.accountId})\n`);
    
    // コンテナ一覧を取得
    console.log('1. コンテナ一覧を取得中...');
    const containers = await gtmClient.listContainers(account.accountId);
    console.log(`✓ ${containers.length}件のコンテナが見つかりました\n`);
    
    if (containers.length === 0) {
      console.log('コンテナが見つかりません。');
      return;
    }
    
    const container = containers[0];
    console.log(`使用コンテナ: ${container.name} (ID: ${container.containerId})\n`);
    
    // コンテナの詳細を取得
    console.log('2. コンテナの詳細情報を取得中...');
    const containerDetail = await gtmClient.getContainer(account.accountId, container.containerId);
    console.log('✓ コンテナの詳細情報を取得しました\n');
    console.log('コンテナ詳細:');
    console.log(`  名前: ${containerDetail.name}`);
    console.log(`  ID: ${containerDetail.containerId}`);
    console.log(`  公開ID: ${containerDetail.publicId || 'N/A'}`);
    console.log(`  使用コンテキスト: ${containerDetail.usageContext?.join(', ') || 'N/A'}`);
    console.log(`  ドメイン名: ${containerDetail.domainName?.join(', ') || 'N/A'}`);
    console.log(`  タイムゾーン: ${containerDetail.timeZoneId || 'N/A'}`);
    console.log(`  パス: ${containerDetail.path || 'N/A'}\n`);
    
    // ワークスペース一覧を取得
    console.log('3. ワークスペース一覧を取得中...');
    const workspaces = await gtmClient.listWorkspaces(account.accountId, container.containerId);
    console.log(`✓ ${workspaces.length}件のワークスペースが見つかりました\n`);
    
    if (workspaces.length === 0) {
      console.log('ワークスペースが見つかりません。');
      return;
    }
    
    const workspace = workspaces[0];
    console.log(`使用ワークスペース: ${workspace.name} (ID: ${workspace.workspaceId})\n`);
    
    // ワークスペースの詳細を取得
    console.log('4. ワークスペースの詳細情報を取得中...');
    const workspaceDetail = await gtmClient.getWorkspace(account.accountId, container.containerId, workspace.workspaceId);
    console.log('✓ ワークスペースの詳細情報を取得しました\n');
    console.log('ワークスペース詳細:');
    console.log(`  名前: ${workspaceDetail.name}`);
    console.log(`  ID: ${workspaceDetail.workspaceId}`);
    console.log(`  説明: ${workspaceDetail.description || 'N/A'}`);
    console.log(`  パス: ${workspaceDetail.path || 'N/A'}\n`);
    
    // タグ一覧を取得
    console.log('5. タグ一覧を取得中...');
    const tags = await gtmClient.listTags(account.accountId, container.containerId, workspace.workspaceId);
    console.log(`✓ ${tags.length}件のタグが見つかりました\n`);
    
    if (tags.length > 0) {
      console.log('タグ一覧（最初の5件）:');
      tags.slice(0, 5).forEach((tag, index) => {
        console.log(`  ${index + 1}. ${tag.name} (ID: ${tag.tagId}, タイプ: ${tag.type})`);
      });
      if (tags.length > 5) {
        console.log(`  ... 他 ${tags.length - 5}件`);
      }
      console.log('');
    }
    
    // トリガー一覧を取得
    console.log('6. トリガー一覧を取得中...');
    const triggers = await gtmClient.listTriggers(account.accountId, container.containerId, workspace.workspaceId);
    console.log(`✓ ${triggers.length}件のトリガーが見つかりました\n`);
    
    if (triggers.length > 0) {
      console.log('トリガー一覧（最初の5件）:');
      triggers.slice(0, 5).forEach((trigger, index) => {
        console.log(`  ${index + 1}. ${trigger.name} (ID: ${trigger.triggerId}, タイプ: ${trigger.type})`);
      });
      if (triggers.length > 5) {
        console.log(`  ... 他 ${triggers.length - 5}件`);
      }
      console.log('');
    }
    
    // 変数一覧を取得
    console.log('7. 変数一覧を取得中...');
    const variables = await gtmClient.listVariables(account.accountId, container.containerId, workspace.workspaceId);
    console.log(`✓ ${variables.length}件の変数が見つかりました\n`);
    
    if (variables.length > 0) {
      console.log('変数一覧（最初の5件）:');
      variables.slice(0, 5).forEach((variable, index) => {
        console.log(`  ${index + 1}. ${variable.name} (ID: ${variable.variableId}, タイプ: ${variable.type})`);
      });
      if (variables.length > 5) {
        console.log(`  ... 他 ${variables.length - 5}件`);
      }
      console.log('');
    }
    
    console.log('='.repeat(80));
    console.log('\n✓ すべてのテストが成功しました！\n');
    
  } catch (error) {
    console.error('\n✗ エラーが発生しました:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nスタックトレース:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testDetails();


