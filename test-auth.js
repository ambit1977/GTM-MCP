#!/usr/bin/env node

/**
 * OAuth2認証のテストスクリプト
 */

import { OAuth2Auth } from './src/oauth2-auth.js';

async function testAuth() {
  try {
    console.log('=== OAuth2認証テスト ===\n');
    
    // OAuth2認証オブジェクトの作成
    console.log('1. OAuth2認証オブジェクトを作成中...');
    const oauth2Auth = new OAuth2Auth();
    console.log('✓ OAuth2認証オブジェクトが作成されました\n');
    
    // 認証URLの取得
    console.log('2. 認証URLを取得中...');
    const authUrl = oauth2Auth.getAuthUrl();
    console.log('✓ 認証URLが取得されました');
    console.log(`\n認証URL:\n${authUrl}\n`);
    
    // 認証状態の確認
    console.log('3. 認証状態を確認中...');
    const isAuthenticated = oauth2Auth.isAuthenticated();
    console.log(`認証状態: ${isAuthenticated ? '認証済み' : '未認証'}\n`);
    
    if (!isAuthenticated) {
      console.log('認証が必要です。以下の手順で認証してください:');
      console.log('1. 上記の認証URLをブラウザで開く');
      console.log('2. Googleアカウントでログインして権限を承認');
      console.log('3. リダイレクト先のURLから認証コードを取得（code=の後の値）');
      console.log('4. 以下のコマンドで認証を完了:');
      console.log('   node test-auth.js <認証コード>');
    } else {
      console.log('✓ 既に認証済みです！');
    }
    
  } catch (error) {
    console.error('✗ エラーが発生しました:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nスタックトレース:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// コマンドライン引数から認証コードを取得
const authCode = process.argv[2];

if (authCode) {
  // 認証コードで認証を完了
  (async () => {
    try {
      const oauth2Auth = new OAuth2Auth();
      console.log('認証コードで認証を実行中...\n');
      const result = await oauth2Auth.authenticateWithCode(authCode);
      console.log('✓ 認証が完了しました！');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('✗ 認証に失敗しました:');
      console.error(error.message);
      process.exit(1);
    }
  })();
} else {
  // 認証URLの取得と状態確認
  testAuth();
}

