#!/usr/bin/env node

/**
 * Microsoft Ads UET タグ (ID: 343223413) を GTM に作成
 * - カスタムHTMLタグ
 * - トリガー: ページURL含む uet_343223413.html
 */

import { GTMClient } from './src/gtm-client.js';

async function createUET343223413Tag() {
  try {
    console.log('=== Microsoft Ads UET タグ (343223413) - GTM設定作成 ===\n');
    
    const gtmClient = new GTMClient();
    
    // アカウント、コンテナID
    const accountId = '6255561314';
    const containerId = '236653436';
    
    // 既存のワークスペースを使用（ID: 16 - Microsoft UET - 2026-01-27）
    const workspaceId = '16';
    
    console.log('アカウントID:', accountId);
    console.log('コンテナID:', containerId);
    console.log('ワークスペースID:', workspaceId);
    console.log('');
    
    // 1. ページビュートリガーの作成（特定ページ）
    console.log('1. ページビュートリガー (uet_343223413.html) を作成中...');
    const triggerData = {
      name: 'UET 343223413 - Page View',
      type: 'pageview',
      filter: [
        {
          type: 'contains',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Page URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'uet_343223413.html'
            }
          ]
        }
      ]
    };
    
    const trigger = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData);
    console.log(`✓ トリガーが作成されました: ID=${trigger.triggerId}, 名前=${trigger.name}\n`);
    
    // 2. カスタムHTMLタグの作成
    console.log('2. カスタムHTMLタグ (UET 343223413) を作成中...');
    const uetScript = `<script>(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"343223413", enableAutoSpaTracking: true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");</script>`;
    
    const tagData = {
      name: 'Microsoft UET - 343223413',
      type: 'html',
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: uetScript
        },
        {
          type: 'boolean',
          key: 'supportDocumentWrite',
          value: 'false'
        }
      ],
      firingTriggerId: [trigger.triggerId]
    };
    
    const tag = await gtmClient.createTag(accountId, containerId, workspaceId, tagData);
    console.log(`✓ タグが作成されました: ID=${tag.tagId}, 名前=${tag.name}\n`);
    
    // 結果のサマリー
    console.log('=== 設定完了 ===');
    console.log(`ワークスペースID: ${workspaceId}`);
    console.log('');
    console.log('作成したトリガー:');
    console.log(`  - ${trigger.name} (ID: ${trigger.triggerId})`);
    console.log(`    条件: Page URL contains "uet_343223413.html"`);
    console.log('');
    console.log('作成したタグ:');
    console.log(`  - ${tag.name} (ID: ${tag.tagId})`);
    console.log(`    UET タグ ID: 343223413`);
    console.log(`    Auto SPA Tracking: 有効`);
    console.log('');
    console.log('GTM管理画面URL:');
    console.log(`https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
    console.log('');
    console.log('テストページURL:');
    console.log('https://ghe.misosiru.io/pages/akiyama/tag_test/testpage/microsoft_uet/uet_343223413.html');
    console.log('');
    console.log('次のステップ:');
    console.log('1. GTM管理画面で設定を確認');
    console.log('2. 「プレビュー」でテスト');
    console.log('3. 「提出」→「公開」');
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    if (error.response) {
      console.error('レスポンス:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

createUET343223413Tag();
