import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import dotenv from 'dotenv';
import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

dotenv.config();

/**
 * OAuth2認証管理クラス
 */
export class OAuth2Auth {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
    this.tokenPath = process.env.GTM_TOKEN_PATH || join(homedir(), '.gtm-mcp-token.json');
    this.scopes = [
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/tagmanager.delete.containers',
      'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
      'https://www.googleapis.com/auth/tagmanager.publish',
      'https://www.googleapis.com/auth/tagmanager.readonly'
    ];
    this.oAuth2Client = null;
    this.initializeClient();
  }

  /**
   * OAuth2クライアントを初期化
   */
  initializeClient() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET 環境変数を設定してください'
      );
    }

    this.oAuth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    // 保存されたトークンを読み込む
    this.loadToken();
  }

  /**
   * 保存されたトークンを読み込む
   */
  loadToken() {
    if (existsSync(this.tokenPath)) {
      try {
        const token = JSON.parse(readFileSync(this.tokenPath, 'utf8'));
        this.oAuth2Client.setCredentials(token);
        return true;
      } catch (error) {
        console.error('トークンの読み込みに失敗しました:', error.message);
        return false;
      }
    }
    return false;
  }

  /**
   * トークンを保存
   */
  saveToken(token) {
    try {
      writeFileSync(this.tokenPath, JSON.stringify(token, null, 2), 'utf8');
      this.oAuth2Client.setCredentials(token);
      return true;
    } catch (error) {
      console.error('トークンの保存に失敗しました:', error.message);
      return false;
    }
  }

  /**
   * 認証URLを生成
   */
  getAuthUrl() {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent' // リフレッシュトークンを確実に取得するため
    });
  }

  /**
   * 認証コードからトークンを取得
   */
  async getTokenFromCode(code) {
    try {
      const { tokens } = await this.oAuth2Client.getToken(code);
      this.saveToken(tokens);
      return tokens;
    } catch (error) {
      throw new Error(`トークンの取得に失敗しました: ${error.message}`);
    }
  }

  /**
   * トークンが有効か確認し、必要に応じて更新
   */
  async ensureValidToken() {
    if (!this.oAuth2Client.credentials.access_token) {
      throw new Error('認証が必要です。認証を実行してください。');
    }

    // トークンの有効期限をチェック（5分前に更新）
    const expiryDate = this.oAuth2Client.credentials.expiry_date;
    if (expiryDate && expiryDate < Date.now() + 5 * 60 * 1000) {
      try {
        const { credentials } = await this.oAuth2Client.refreshAccessToken();
        this.saveToken(credentials);
        return credentials;
      } catch (error) {
        throw new Error(`トークンの更新に失敗しました: ${error.message}`);
      }
    }

    return this.oAuth2Client.credentials;
  }

  /**
   * 認証フローを実行（対話型）
   */
  async authenticate() {
    const authUrl = this.getAuthUrl();
    
    console.error('\n=== Google Tag Manager 認証 ===');
    console.error('\n以下のURLにアクセスして認証を完了してください:');
    console.error(`\n${authUrl}\n`);
    
    // Macでブラウザを開く
    try {
      await execAsync(`open "${authUrl}"`);
      console.error('ブラウザが開きました。');
    } catch (error) {
      console.error('ブラウザを自動で開けませんでした。上記のURLを手動で開いてください。');
    }

    console.error('\n認証後、リダイレクト先のURLから「code=」の後の認証コードをコピーしてください。');
    console.error('（例: http://localhost:3000/oauth2callback?code=4/0A... の場合、「4/0A...」の部分）\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve, reject) => {
      rl.question('認証コードを入力してください: ', async (code) => {
        rl.close();
        try {
          const tokens = await this.getTokenFromCode(code.trim());
          console.error('\n認証が完了しました！');
          resolve(tokens);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * 認証コードから直接認証（非対話型、MCPツール用）
   */
  async authenticateWithCode(code) {
    const tokens = await this.getTokenFromCode(code);
    return { success: true, message: '認証が完了しました' };
  }

  /**
   * 認証状態を確認
   */
  isAuthenticated() {
    return !!this.oAuth2Client.credentials.access_token;
  }

  /**
   * 認証をリセット
   */
  async resetAuth() {
    if (existsSync(this.tokenPath)) {
      try {
        const fs = await import('fs/promises');
        await fs.unlink(this.tokenPath);
      } catch (error) {
        // ファイル削除に失敗しても続行
      }
    }
    this.oAuth2Client.setCredentials({});
    return { success: true, message: '認証情報をリセットしました' };
  }

  /**
   * OAuth2クライアントを取得
   */
  getClient() {
    return this.oAuth2Client;
  }
}

