#!/usr/bin/env node

/**
 * GTM APIでアカウント管理機能（get）が利用可能か確認（updateはスキップ）
 */

import { GTMClient } from './src/gtm-client.js';

async function testAccountAPISimple() {
  try {
    console.log('=== GTM API アカウント管理機能の確認 ===\n');
    
    const gtmClient = new GTMClient();
    const oauth2Auth = gtmClient.getOAuth2Auth();
    
    if (!oauth2Auth.isAuthenticated()) {
      console.log('✗ 認証が必要です。');
      process.exit(1);
    }
    
    // まず、アカウント一覧を取得
    console.log('1. アカウント一覧を取得中...\n');
    const accounts = await gtmClient.listAccounts();
    
    if (accounts.length === 0) {
      console.log('✗ アカウントが見つかりませんでした。');
      process.exit(1);
    }
    
    const testAccount = accounts[0];
    const accountId = testAccount.accountId;
    
    console.log(`✓ テスト対象アカウント: ${testAccount.name} (ID: ${accountId})\n`);
    
    // get_account が利用可能か確認
    console.log('2. get_account が利用可能か確認中...\n');
    
    const tagmanager = gtmClient.getTagManager();
    
    if (tagmanager.accounts.get) {
      console.log('✓ tagmanager.accounts.get メソッドが存在します\n');
      
      // 実際にAPIを呼び出してみる
      console.log('3. get_account APIを呼び出し中...\n');
      const response = await tagmanager.accounts.get({
        path: `accounts/${accountId}`
      });
      
      console.log('✓ get_account APIが正常に動作しました！\n');
      console.log('取得したアカウント情報:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('');
      
      // 利用可能なメソッド一覧を表示
      console.log('4. accounts リソースで利用可能なメソッド一覧:\n');
      const accountMethods = Object.keys(tagmanager.accounts);
      console.log(accountMethods.join(', '));
      console.log('');
      
      console.log('=== 確認結果 ===\n');
      console.log('✓ get_account: 利用可能');
      console.log('✓ list_accounts: 利用可能（既に実装済み）');
      console.log('? update_account: メソッドは存在するが、現在のスコープでは権限不足');
      console.log('  注: アカウントの更新には追加のスコープが必要な可能性があります');
      
    } else {
      console.log('✗ tagmanager.accounts.get メソッドが存在しません\n');
    }
    
  } catch (error) {
    console.error('\n✗ エラーが発生しました:');
    console.error(error.message);
    if (error.response) {
      console.error('APIレスポンス:', error.response.data);
    }
    if (error.stack) {
      console.error('\nスタックトレース:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testAccountAPISimple();

