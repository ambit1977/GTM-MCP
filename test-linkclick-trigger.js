#!/usr/bin/env node

/**
 * linkClickトリガー作成のテストスクリプト
 */

import { GTMClient } from './src/gtm-client.js';

async function testLinkClickTrigger() {
  try {
    console.log('=== linkClickトリガー作成テスト ===\n');
    
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
    
    console.log('linkClickトリガーを作成中...\n');
    
    // linkClickトリガーを作成
    const triggerData = {
      name: `テストリンククリック - test_click9 - ${Date.now()}`,
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
    
    const trigger = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData);
    
    console.log('✓ linkClickトリガーが作成されました！\n');
    console.log('トリガー情報:');
    console.log(`  名前: ${trigger.name}`);
    console.log(`  ID: ${trigger.triggerId}`);
    console.log(`  タイプ: ${trigger.type}`);
    console.log(`  パス: ${trigger.path || 'N/A'}`);
    console.log(`\n詳細URL: ${trigger.tagManagerUrl || 'N/A'}\n`);
    
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

testLinkClickTrigger();


