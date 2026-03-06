#!/usr/bin/env node

/**
 * ワンショット認証: ブラウザを開いてログインするだけで完了。
 * コールバック用の一時サーバーを立て、code を受け取ってトークン保存まで自動で行う。
 */

import http from 'http';
import { OAuth2Auth } from './src/oauth2-auth.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PORT = 3000;
const REDIRECT_PATH = '/oauth2callback';

const successHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>認証完了</title></head>
<body style="font-family:sans-serif;text-align:center;padding:3rem;">
  <h1>認証が完了しました</h1>
  <p>このタブを閉じてかまいません。</p>
</body>
</html>
`;

const errorHtml = (msg) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>エラー</title></head>
<body style="font-family:sans-serif;text-align:center;padding:3rem;">
  <h1>認証エラー</h1>
  <p>${msg}</p>
</body>
</html>
`;

async function run() {
  const oauth2Auth = new OAuth2Auth();
  const authUrl = oauth2Auth.getAuthUrl();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '', `http://localhost:${PORT}`);
    if (url.pathname !== REDIRECT_PATH) {
      res.writeHead(404);
      res.end();
      return;
    }
    const code = url.searchParams.get('code');
    if (!code) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(errorHtml('認証コードがありません。'));
      server.close();
      process.exit(1);
      return;
    }
    try {
      await oauth2Auth.getTokenFromCode(code);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(successHtml);
      console.log('認証が完了しました。');
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(errorHtml(`トークン取得に失敗しました: ${e.message}`));
      console.error(e.message);
      process.exit(1);
    } finally {
      server.close();
      process.exit(0);
    }
  });

  server.listen(PORT, () => {
    console.log(`コールバック用サーバーを localhost:${PORT} で起動しました。`);
    console.log('ブラウザを開きます。Googleでログインして権限を承認してください。');
    try {
      await execAsync('open ' + JSON.stringify(authUrl));
    } catch (_) {
      console.log('認証URL:', authUrl);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`ポート ${PORT} は使用中です。別のターミナルでサーバーが動いていないか確認してください。`);
      console.log('代わりに次のコマンドで認証できます: node test-auth.js');
      console.log('表示された認証URLを開き、リダイレクト先の code= の値をコピーして:');
      console.log('  node test-auth.js "認証コード"');
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
