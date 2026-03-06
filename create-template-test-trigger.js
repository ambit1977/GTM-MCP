#!/usr/bin/env node

/**
 * uet_template_test.html 用のページビュートリガーを作成
 * 既存のGTMテンプレートタグ（Enable/Disable）にこのトリガーを追加
 */

import { GTMClient } from './src/gtm-client.js';

async function createTemplateTestTrigger() {
  try {
    console.log('=== uet_template_test.html 用トリガー作成 ===\n');
    
    const gtmClient = new GTMClient();
    
    const accountId = '6255561314';
    const containerId = '236653436';
    const workspaceId = '16';
    
    console.log('アカウントID:', accountId);
    console.log('コンテナID:', containerId);
    console.log('ワークスペースID:', workspaceId);
    console.log('');
    
    // 1. ページビュートリガーの作成
    console.log('1. ページビュートリガー (uet_template_test.html) を作成中...');
    const triggerData = {
      name: 'UET Template Test - Page View',
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
              value: 'uet_template_test.html'
            }
          ]
        }
      ]
    };
    
    const trigger = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData);
    console.log(`✓ トリガーが作成されました: ID=${trigger.triggerId}, 名前=${trigger.name}\n`);
    
    // 結果のサマリー
    console.log('=== 設定完了 ===');
    console.log(`トリガーID: ${trigger.triggerId}`);
    console.log(`トリガー名: ${trigger.name}`);
    console.log('');
    console.log('【重要】次のステップ:');
    console.log('GTM管理画面で、以下のタグにこのトリガーを追加してください:');
    console.log('  - UET template TAG Enable automatic tracking');
    console.log('  - UET template TAG Disable automatic tracking');
    console.log('');
    console.log('手順:');
    console.log('1. GTM管理画面でタグを開く');
    console.log('2. 「トリガー」セクションで「+」をクリック');
    console.log(`3. 「${trigger.name}」を選択して追加`);
    console.log('4. 保存');
    console.log('');
    console.log('GTM管理画面URL:');
    console.log(`https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    if (error.response) {
      console.error('レスポンス:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

createTemplateTestTrigger();
