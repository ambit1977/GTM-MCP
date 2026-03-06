#!/usr/bin/env node

/**
 * Microsoft Ads UET タグ (ID: 343223413) - Auto SPA Tracking 無効版
 * - カスタムHTMLタグ（enableAutoSpaTracking: false）
 * - トリガー: ページURL含む uet_343223413_no_spa.html
 */

import { GTMClient } from './src/gtm-client.js';

async function createUET343223413NoSpaTag() {
  try {
    console.log('=== Microsoft Ads UET タグ (343223413) Auto SPA Tracking 無効版 ===\n');
    
    const gtmClient = new GTMClient();
    
    // アカウント、コンテナID
    const accountId = '6255561314';
    const containerId = '236653436';
    const workspaceId = '16'; // Microsoft UET ワークスペース
    
    console.log('アカウントID:', accountId);
    console.log('コンテナID:', containerId);
    console.log('ワークスペースID:', workspaceId);
    console.log('');
    
    // 1. ページビュートリガーの作成（特定ページ）
    console.log('1. ページビュートリガー (uet_343223413_no_spa.html) を作成中...');
    const triggerData = {
      name: 'UET 343223413 No SPA - Page View',
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
              value: 'uet_343223413_no_spa.html'
            }
          ]
        }
      ]
    };
    
    const trigger = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData);
    console.log(`✓ トリガーが作成されました: ID=${trigger.triggerId}, 名前=${trigger.name}\n`);
    
    // 2. カスタムHTMLタグの作成（Auto SPA Tracking 無効）
    console.log('2. カスタムHTMLタグ (UET 343223413 - No SPA) を作成中...');
    const uetScript = `<script>(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"343223413", enableAutoSpaTracking: false};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");</script>`;
    
    const tagData = {
      name: 'Microsoft UET - 343223413 (No SPA)',
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
    console.log(`    条件: Page URL contains "uet_343223413_no_spa.html"`);
    console.log('');
    console.log('作成したタグ:');
    console.log(`  - ${tag.name} (ID: ${tag.tagId})`);
    console.log(`    UET タグ ID: 343223413`);
    console.log(`    Auto SPA Tracking: 無効 (false)`);
    console.log('');
    console.log('GTM管理画面URL:');
    console.log(`https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
    console.log('');
    console.log('テストページURL:');
    console.log('https://ghe.misosiru.io/pages/akiyama/tag_test/testpage/microsoft_uet/uet_343223413_no_spa.html');
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    if (error.response) {
      console.error('レスポンス:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

createUET343223413NoSpaTag();
