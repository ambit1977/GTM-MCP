#!/usr/bin/env node

/**
 * MCPサーバーのcreate_trigger実装をシミュレートしてテスト
 * MCP経由で呼び出される際の引数の処理を再現
 */

import { GTMClient } from './src/gtm-client.js';

async function testMCPCreateTrigger() {
  try {
    console.log('=== MCP create_trigger シミュレーションテスト ===\n');
    
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
    
    console.log('MCP経由でlinkClickトリガーを作成中...\n');
    
    // MCP経由で渡される引数をシミュレート
    // MCPでは、filterとautoEventFilterはJSON文字列として渡される可能性がある
    const args = {
      name: `MCPテスト - filter/autoEventFilter - ${Date.now()}`,
      type: 'linkClick',
      // JSON文字列として渡される場合
      filter: JSON.stringify([
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
              value: 'test_click10'
            }
          ]
        }
      ]),
      autoEventFilter: JSON.stringify([
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
      ]),
      waitForTags: true,
      checkValidation: false,
      waitForTagsTimeout: 2000
    };
    
    console.log('MCP経由で受け取る引数:');
    console.log(JSON.stringify({
      name: args.name,
      type: args.type,
      filter: args.filter,
      autoEventFilter: args.autoEventFilter,
      waitForTags: args.waitForTags,
      checkValidation: args.checkValidation,
      waitForTagsTimeout: args.waitForTagsTimeout
    }, null, 2));
    console.log('');
    
    // MCPサーバーのcreate_triggerハンドラーのロジックを再現
    const triggerData = {
      name: args.name,
      type: args.type,
    };

    // フィルタ（linkClick、clickなどのタイプ用）
    if (args.filter) {
      // JSON文字列の場合は配列に変換
      if (typeof args.filter === 'string') {
        try {
          triggerData.filter = JSON.parse(args.filter);
        } catch (e) {
          triggerData.filter = args.filter;
        }
      } else {
        triggerData.filter = args.filter;
      }
    }

    // 自動イベントフィルタ（linkClickタイプ用）
    if (args.autoEventFilter) {
      // JSON文字列の場合は配列に変換
      if (typeof args.autoEventFilter === 'string') {
        try {
          triggerData.autoEventFilter = JSON.parse(args.autoEventFilter);
        } catch (e) {
          triggerData.autoEventFilter = args.autoEventFilter;
        }
      } else {
        triggerData.autoEventFilter = args.autoEventFilter;
      }
    }

    // タグ待機設定（linkClickタイプ用）
    if (args.waitForTags !== undefined) {
      triggerData.waitForTags = {
        type: 'boolean',
        value: String(args.waitForTags)
      };
    }

    // バリデーションチェック（linkClickタイプ用）
    if (args.checkValidation !== undefined) {
      triggerData.checkValidation = {
        type: 'boolean',
        value: String(args.checkValidation)
      };
    }

    // タグ待機タイムアウト（linkClickタイプ用）
    if (args.waitForTagsTimeout !== undefined) {
      triggerData.waitForTagsTimeout = {
        type: 'template',
        value: String(args.waitForTagsTimeout)
      };
    }
    
    console.log('MCPサーバーが処理したトリガーデータ:');
    console.log(JSON.stringify(triggerData, null, 2));
    console.log('');
    
    // GTM APIに送信
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
      console.log('\n✓ MCP経由でもfilterとautoEventFilterが正しく設定されています！');
      console.log('✓ MCPサーバーの実装は正常に動作しています！');
    } else {
      console.log('\n✗ filterまたはautoEventFilterが設定されていません。');
      console.log('問題の可能性:');
      console.log('  1. MCPサーバーの実装に問題がある');
      console.log('  2. JSON文字列のパースに失敗している');
      console.log('  3. GTM APIがfilter/autoEventFilterを受け付けていない');
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

testMCPCreateTrigger();




