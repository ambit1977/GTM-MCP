#!/usr/bin/env node

/**
 * アカウント一覧取得の詳細テスト
 */

import { GTMClient } from './src/gtm-client.js';

async function testAccounts() {
  try {
    console.log('=== アカウント一覧取得テスト ===\n');
    
    const gtmClient = new GTMClient();
    const oauth2Auth = gtmClient.getOAuth2Auth();
    
    // 認証確認
    if (!oauth2Auth.isAuthenticated()) {
      console.log('✗ 認証が必要です。まず test-auth.js を実行してください。');
      process.exit(1);
    }
    
    console.log('✓ 認証済み\n');
    
    // アカウント一覧を取得
    console.log('アカウント一覧を取得中...\n');
    const accounts = await gtmClient.listAccounts();
    
    console.log(`✓ ${accounts.length}件のアカウントが見つかりました\n`);
    console.log('='.repeat(80));
    
    // 各アカウントの詳細情報を表示
    accounts.forEach((account, index) => {
      console.log(`\n【アカウント ${index + 1}】`);
      console.log(`  名前: ${account.name}`);
      console.log(`  ID: ${account.accountId}`);
      console.log(`  共有: ${account.shareData ? 'はい' : 'いいえ'}`);
      if (account.path) {
        console.log(`  パス: ${account.path}`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✓ テストが完了しました！\n');
    
    // 最初のアカウントのコンテナも取得してみる
    if (accounts.length > 0) {
      const firstAccount = accounts[0];
      console.log(`\n【追加テスト】アカウント "${firstAccount.name}" のコンテナ一覧を取得中...\n`);
      
      const containers = await gtmClient.listContainers(firstAccount.accountId);
      console.log(`✓ ${containers.length}件のコンテナが見つかりました\n`);
      
      if (containers.length > 0) {
        console.log('コンテナ一覧:');
        containers.slice(0, 5).forEach((container, index) => {
          console.log(`  ${index + 1}. ${container.name} (ID: ${container.containerId})`);
          console.log(`     公開ID: ${container.publicId || 'N/A'}`);
        });
        if (containers.length > 5) {
          console.log(`  ... 他 ${containers.length - 5}件`);
        }
      }
    }
    
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

testAccounts();


