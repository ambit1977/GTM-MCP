#!/usr/bin/env node

/**
 * SPA Tracking 比較テストページ用のGTMタグを作成
 * - ページビュートリガー（spa_tracking_comparison.html）
 * - カスタムHTMLタグ（enableAutoSpaTracking: true）
 */

import { GTMClient } from './src/gtm-client.js';

async function createSpaComparisonTags() {
  try {
    console.log('=== SPA Tracking 比較テストページ用 GTM設定作成 ===\n');
    
    const gtmClient = new GTMClient();
    
    // アカウント、コンテナID
    const accountId = '6255561314';
    const containerId = '236653436';
    const workspaceId = '16'; // Microsoft UET ワークスペース
    
    console.log('アカウントID:', accountId);
    console.log('コンテナID:', containerId);
    console.log('ワークスペースID:', workspaceId);
    console.log('');
    
    // 1. ページビュートリガーの作成（比較テストページ用）
    console.log('1. ページビュートリガー (spa_tracking_comparison.html) を作成中...');
    const triggerData = {
      name: 'UET SPA Comparison - Page View',
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
              value: 'spa_tracking_comparison.html'
            }
          ]
        }
      ]
    };
    
    const trigger = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData);
    console.log(`✓ トリガーが作成されました: ID=${trigger.triggerId}, 名前=${trigger.name}\n`);
    
    // 2. カスタムHTMLタグの作成（enableAutoSpaTracking: true）
    console.log('2. カスタムHTMLタグ (enableAutoSpaTracking: true) を作成中...');
    const uetScriptTrue = `<script>(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"343223413", enableAutoSpaTracking: true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");
console.log('[GTM] UET Tag loaded - enableAutoSpaTracking: true');</script>`;
    
    const tagDataTrue = {
      name: 'UET SPA Comparison - Auto SPA True',
      type: 'html',
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: uetScriptTrue
        },
        {
          type: 'boolean',
          key: 'supportDocumentWrite',
          value: 'false'
        }
      ],
      firingTriggerId: [trigger.triggerId]
    };
    
    const tagTrue = await gtmClient.createTag(accountId, containerId, workspaceId, tagDataTrue);
    console.log(`✓ タグが作成されました: ID=${tagTrue.tagId}, 名前=${tagTrue.name}\n`);
    
    // 結果のサマリー
    console.log('=== 設定完了 ===');
    console.log(`ワークスペースID: ${workspaceId}`);
    console.log('');
    console.log('作成したトリガー:');
    console.log(`  - ${trigger.name} (ID: ${trigger.triggerId})`);
    console.log(`    条件: Page URL contains "spa_tracking_comparison.html"`);
    console.log('');
    console.log('作成したタグ:');
    console.log(`  - ${tagTrue.name} (ID: ${tagTrue.tagId})`);
    console.log(`    enableAutoSpaTracking: true`);
    console.log('');
    console.log('GTM管理画面URL:');
    console.log(`https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
    console.log('');
    console.log('テストページURL:');
    console.log('https://ghe.misosiru.io/pages/akiyama/tag_test/testpage/microsoft_uet/spa_tracking_comparison.html');
    console.log('');
    console.log('次のステップ:');
    console.log('1. GTM管理画面で設定を確認');
    console.log('2. 「プレビュー」でテスト');
    console.log('3. 比較テストページでpushStateボタンをクリック');
    console.log('4. Network タブで bat.bing.com へのリクエストを確認');
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    if (error.response) {
      console.error('レスポンス:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

createSpaComparisonTags();
