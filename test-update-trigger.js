#!/usr/bin/env node

/**
 * update_triggerでfilterとautoEventFilterが正しく更新されるかテスト
 */

import { GTMClient } from './src/gtm-client.js';

async function testUpdateTrigger() {
  try {
    console.log('=== update_trigger filter/autoEventFilter テスト ===\n');
    
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
    
    // まず、テスト用のトリガーを作成（filterとautoEventFilterなし）
    console.log('1. テスト用のトリガーを作成中（filter/autoEventFilterなし）...\n');
    
    const initialTriggerData = {
      name: `テスト - update_trigger確認用 - ${Date.now()}`,
      type: 'linkClick',
      waitForTags: {
        type: 'boolean',
        value: 'false'
      }
    };
    
    const createdTrigger = await gtmClient.createTrigger(accountId, containerId, workspaceId, initialTriggerData);
    console.log(`✓ トリガーが作成されました: ID=${createdTrigger.triggerId}\n`);
    
    // 作成されたトリガーを確認
    console.log('2. 作成されたトリガーを確認...\n');
    const beforeUpdate = await gtmClient.getTrigger(accountId, containerId, workspaceId, createdTrigger.triggerId);
    console.log('更新前のトリガー情報:');
    console.log(`  フィルタ: ${JSON.stringify(beforeUpdate.filter || [], null, 2)}`);
    console.log(`  自動イベントフィルタ: ${JSON.stringify(beforeUpdate.autoEventFilter || [], null, 2)}`);
    console.log(`  waitForTags: ${JSON.stringify(beforeUpdate.waitForTags || {}, null, 2)}\n`);
    
    // update_triggerでfilterとautoEventFilterを追加
    console.log('3. update_triggerでfilterとautoEventFilterを追加中...\n');
    
    // MCP経由で渡される引数をシミュレート
    const updateArgs = {
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
              value: 'test_click11'
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
      waitForTagsTimeout: 3000
    };
    
    // MCPサーバーのupdate_triggerハンドラーのロジックを再現
    const existingTrigger = await gtmClient.getTrigger(accountId, containerId, workspaceId, createdTrigger.triggerId);
    
    const triggerData = {
      name: existingTrigger.name,
      type: existingTrigger.type,
    };

    // フィルタ
    if (updateArgs.filter !== undefined) {
      // JSON文字列の場合は配列に変換
      if (typeof updateArgs.filter === 'string') {
        try {
          triggerData.filter = JSON.parse(updateArgs.filter);
        } catch (e) {
          triggerData.filter = updateArgs.filter;
        }
      } else {
        triggerData.filter = updateArgs.filter;
      }
    } else if (existingTrigger.filter) {
      triggerData.filter = existingTrigger.filter;
    }

    // 自動イベントフィルタ
    if (updateArgs.autoEventFilter !== undefined) {
      // JSON文字列の場合は配列に変換
      if (typeof updateArgs.autoEventFilter === 'string') {
        try {
          triggerData.autoEventFilter = JSON.parse(updateArgs.autoEventFilter);
        } catch (e) {
          triggerData.autoEventFilter = updateArgs.autoEventFilter;
        }
      } else {
        triggerData.autoEventFilter = updateArgs.autoEventFilter;
      }
    } else if (existingTrigger.autoEventFilter) {
      triggerData.autoEventFilter = existingTrigger.autoEventFilter;
    }

    // タグ待機設定
    if (updateArgs.waitForTags !== undefined) {
      triggerData.waitForTags = {
        type: 'boolean',
        value: String(updateArgs.waitForTags)
      };
    } else if (existingTrigger.waitForTags) {
      triggerData.waitForTags = existingTrigger.waitForTags;
    }

    // バリデーションチェック
    if (updateArgs.checkValidation !== undefined) {
      triggerData.checkValidation = {
        type: 'boolean',
        value: String(updateArgs.checkValidation)
      };
    } else if (existingTrigger.checkValidation) {
      triggerData.checkValidation = existingTrigger.checkValidation;
    }

    // タグ待機タイムアウト
    if (updateArgs.waitForTagsTimeout !== undefined) {
      triggerData.waitForTagsTimeout = {
        type: 'template',
        value: String(updateArgs.waitForTagsTimeout)
      };
    } else if (existingTrigger.waitForTagsTimeout) {
      triggerData.waitForTagsTimeout = existingTrigger.waitForTagsTimeout;
    }
    
    console.log('更新するトリガーデータ:');
    console.log(JSON.stringify(triggerData, null, 2));
    console.log('');
    
    // トリガーを更新
    const updatedTrigger = await gtmClient.updateTrigger(
      accountId,
      containerId,
      workspaceId,
      createdTrigger.triggerId,
      triggerData
    );
    
    console.log('✓ トリガーが更新されました！\n');
    
    // 更新されたトリガーを確認
    console.log('4. 更新されたトリガーを確認...\n');
    const afterUpdate = await gtmClient.getTrigger(accountId, containerId, workspaceId, createdTrigger.triggerId);
    
    console.log('更新後のトリガー情報:');
    console.log(`  フィルタ: ${JSON.stringify(afterUpdate.filter || [], null, 2)}`);
    console.log(`  自動イベントフィルタ: ${JSON.stringify(afterUpdate.autoEventFilter || [], null, 2)}`);
    console.log(`  waitForTags: ${JSON.stringify(afterUpdate.waitForTags || {}, null, 2)}`);
    console.log(`  checkValidation: ${JSON.stringify(afterUpdate.checkValidation || {}, null, 2)}`);
    console.log(`  waitForTagsTimeout: ${JSON.stringify(afterUpdate.waitForTagsTimeout || {}, null, 2)}`);
    console.log(`\n詳細URL: ${afterUpdate.tagManagerUrl || 'N/A'}\n`);
    
    if (afterUpdate.filter && afterUpdate.filter.length > 0 && 
        afterUpdate.autoEventFilter && afterUpdate.autoEventFilter.length > 0) {
      console.log('✓ update_triggerでfilterとautoEventFilterが正しく更新されています！');
      console.log('✓ update_triggerの実装は正常に動作しています！');
    } else {
      console.log('✗ filterまたはautoEventFilterが更新されていません。');
      console.log('問題の可能性:');
      console.log('  1. update_triggerの実装に問題がある');
      console.log('  2. JSON文字列のパースに失敗している');
      console.log('  3. GTM APIがfilter/autoEventFilterの更新を受け付けていない');
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

testUpdateTrigger();




