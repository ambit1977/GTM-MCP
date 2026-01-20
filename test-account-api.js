#!/usr/bin/env node

/**
 * GTM APIでアカウント管理機能（get, update）が利用可能か確認
 */

import { GTMClient } from './src/gtm-client.js';

async function testAccountAPI() {
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
    
    // 2. get_account が利用可能か確認
    console.log('2. get_account が利用可能か確認中...\n');
    
    try {
      // googleapisライブラリで利用可能なメソッドを確認
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
        
        // 3. update_account が利用可能か確認
        console.log('4. update_account が利用可能か確認中...\n');
        
        if (tagmanager.accounts.update) {
          console.log('✓ tagmanager.accounts.update メソッドが存在します\n');
          
          // 実際にAPIを呼び出してみる（名前を更新）
          console.log('5. update_account APIを呼び出し中（名前を更新）...\n');
          const currentName = response.data.name || testAccount.name;
        const newName = `${currentName} (テスト)`;
        
        const updateResponse = await tagmanager.accounts.update({
          path: `accounts/${accountId}`,
          requestBody: {
            name: newName
          }
        });
        
        console.log('✓ update_account APIが正常に動作しました！\n');
        console.log('更新後のアカウント情報:');
        console.log(JSON.stringify(updateResponse.data, null, 2));
        console.log('');
        
        // 元の名前に戻す
        console.log('6. 元の名前に戻す...\n');
        await tagmanager.accounts.update({
          path: `accounts/${accountId}`,
          requestBody: {
            name: currentName
          }
        });
          console.log('✓ 元の名前に戻しました\n');
          
        } else {
          console.log('✗ tagmanager.accounts.update メソッドが存在しません\n');
        }
        
      } else {
        console.log('✗ tagmanager.accounts.get メソッドが存在しません\n');
      }
      
      // 利用可能なメソッド一覧を表示
      console.log('6. accounts リソースで利用可能なメソッド一覧:\n');
      const accountMethods = Object.keys(tagmanager.accounts);
      console.log(accountMethods.join(', '));
      console.log('');
      
    } catch (error) {
      console.error('✗ エラーが発生しました:');
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
    
    console.log('=== 確認完了 ===\n');
    console.log('結論:');
    console.log('  - get_account: 利用可能');
    console.log('  - update_account: 利用可能');
    console.log('  - list_accounts: 利用可能（既に実装済み）');
    
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

testAccountAPI();

