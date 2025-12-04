#!/usr/bin/env node

/**
 * Google Tag Manager API クライアントのテストスクリプト
 */

import { GTMClient } from './src/gtm-client.js';

async function testGTM() {
  try {
    console.log('=== Google Tag Manager API テスト ===\n');
    
    // GTMクライアントの作成
    console.log('1. GTMクライアントを作成中...');
    const gtmClient = new GTMClient();
    console.log('✓ GTMクライアントが作成されました\n');
    
    // 認証状態の確認
    console.log('2. 認証状態を確認中...');
    const oauth2Auth = gtmClient.getOAuth2Auth();
    const isAuthenticated = oauth2Auth.isAuthenticated();
    
    if (!isAuthenticated) {
      console.log('✗ 認証が必要です。');
      console.log('まず test-auth.js を実行して認証を完了してください。\n');
      process.exit(1);
    }
    
    console.log('✓ 認証済みです\n');
    
    // アカウント一覧の取得
    console.log('3. アカウント一覧を取得中...');
    const accounts = await gtmClient.listAccounts();
    console.log(`✓ ${accounts.length}件のアカウントが見つかりました\n`);
    
    if (accounts.length === 0) {
      console.log('アカウントが見つかりませんでした。');
      return;
    }
    
    // 最初のアカウントの情報を表示
    console.log('アカウント情報:');
    accounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.name} (ID: ${account.accountId})`);
    });
    console.log('');
    
    // 最初のアカウントのコンテナ一覧を取得
    if (accounts.length > 0) {
      const firstAccount = accounts[0];
      console.log(`4. アカウント "${firstAccount.name}" のコンテナ一覧を取得中...`);
      const containers = await gtmClient.listContainers(firstAccount.accountId);
      console.log(`✓ ${containers.length}件のコンテナが見つかりました\n`);
      
      if (containers.length > 0) {
        console.log('コンテナ情報:');
        containers.forEach((container, index) => {
          console.log(`  ${index + 1}. ${container.name} (ID: ${container.containerId})`);
          console.log(`     公開ID: ${container.publicId || 'N/A'}`);
          console.log(`     使用コンテキスト: ${container.usageContext?.join(', ') || 'N/A'}`);
        });
        console.log('');
        
        // 最初のコンテナのワークスペース一覧を取得
        const firstContainer = containers[0];
        console.log(`5. コンテナ "${firstContainer.name}" のワークスペース一覧を取得中...`);
        const workspaces = await gtmClient.listWorkspaces(firstAccount.accountId, firstContainer.containerId);
        console.log(`✓ ${workspaces.length}件のワークスペースが見つかりました\n`);
        
        if (workspaces.length > 0) {
          console.log('ワークスペース情報:');
          workspaces.forEach((workspace, index) => {
            console.log(`  ${index + 1}. ${workspace.name} (ID: ${workspace.workspaceId})`);
            console.log(`     説明: ${workspace.description || 'N/A'}`);
          });
        }
      }
    }
    
    console.log('\n✓ すべてのテストが成功しました！');
    
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

testGTM();


