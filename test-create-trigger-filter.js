#!/usr/bin/env node

/**
 * create_triggerでfilterとautoEventFilterが正しく設定されるかテスト
 */

import { GTMClient } from './src/gtm-client.js';

async function testCreateTriggerWithFilter() {
  try {
    console.log('=== create_trigger filter/autoEventFilter テスト ===\n');
    
    const gtmClient = new GTMClient();
    const oauth2Auth = gtmClient.getOAuth2Auth();
    
    if (!oauth2Auth.isAuthenticated()) {
      console.log('✗ 認証が必要です。');
      process.exit(1);
    }
    
    // テスト用のアカウント、コンテナ、ワークスペースID
    const accountId = '6255561314';
    const containerId = '236653436';
    const workspaceId = '7';
    
    console.log('linkClickトリガーを作成中（filterとautoEventFilter付き）...\n');
    
    // linkClickトリガーを作成（filterとautoEventFilterを指定）
    const triggerData = {
      name: `テスト - filter/autoEventFilter確認用 - ${Date.now()}`,
      type: 'linkClick',
      filter: [
        {
          type: 'contains',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Click URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'test_click9'
            }
          ]
        }
      ],
      autoEventFilter: [
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
              value: '20251202cvtest/test1.html'
            }
          ]
        }
      ],
      waitForTags: {
        type: 'boolean',
        value: 'true'
      },
      checkValidation: {
        type: 'boolean',
        value: 'false'
      },
      waitForTagsTimeout: {
        type: 'template',
        value: '2000'
      }
    };
    
    console.log('送信するトリガーデータ:');
    console.log(JSON.stringify(triggerData, null, 2));
    console.log('');
    
    const trigger = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData);
    
    console.log('✓ トリガーが作成されました！\n');
    console.log('作成されたトリガー情報:');
    console.log(`  名前: ${trigger.name}`);
    console.log(`  ID: ${trigger.triggerId}`);
    console.log(`  タイプ: ${trigger.type}`);
    console.log(`  フィルタ: ${JSON.stringify(trigger.filter || [], null, 2)}`);
    console.log(`  自動イベントフィルタ: ${JSON.stringify(trigger.autoEventFilter || [], null, 2)}`);
    console.log(`  waitForTags: ${JSON.stringify(trigger.waitForTags || {}, null, 2)}`);
    console.log(`\n詳細URL: ${trigger.tagManagerUrl || 'N/A'}\n`);
    
    // 作成されたトリガーを取得して確認
    console.log('作成されたトリガーを再取得して確認中...\n');
    const retrievedTrigger = await gtmClient.getTrigger(accountId, containerId, workspaceId, trigger.triggerId);
    
    console.log('再取得したトリガー情報:');
    console.log(`  フィルタ: ${JSON.stringify(retrievedTrigger.filter || [], null, 2)}`);
    console.log(`  自動イベントフィルタ: ${JSON.stringify(retrievedTrigger.autoEventFilter || [], null, 2)}`);
    console.log(`  waitForTags: ${JSON.stringify(retrievedTrigger.waitForTags || {}, null, 2)}`);
    
    if (retrievedTrigger.filter && retrievedTrigger.filter.length > 0 && 
        retrievedTrigger.autoEventFilter && retrievedTrigger.autoEventFilter.length > 0) {
      console.log('\n✓ filterとautoEventFilterが正しく設定されています！');
    } else {
      console.log('\n✗ filterまたはautoEventFilterが設定されていません。');
      console.log('問題の可能性:');
      console.log('  1. create_triggerの実装に問題がある');
      console.log('  2. GTM APIがfilter/autoEventFilterを受け付けていない');
      console.log('  3. トリガータイプがlinkClickではない');
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

testCreateTriggerWithFilter();

