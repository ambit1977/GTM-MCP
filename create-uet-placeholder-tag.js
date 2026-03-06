#!/usr/bin/env node

/**
 * Microsoft Ads UET テストページ用の仮タグを作成
 * - カスタムイベントトリガー: uet_conversion
 * - カスタムイベントトリガー: uet_page_conversion
 * - 仮タグ: カスタムHTMLでコンソールログ出力
 */

import { GTMClient } from './src/gtm-client.js';

async function createUETPlaceholderTag() {
  try {
    console.log('=== Microsoft Ads UET 仮タグ - GTM設定作成 ===\n');
    
    const gtmClient = new GTMClient();
    
    // アカウント、コンテナID
    const accountId = '6255561314';
    const containerId = '236653436';
    
    console.log('アカウントID:', accountId);
    console.log('コンテナID:', containerId);
    console.log('');
    
    // 1. 新しいワークスペースを作成
    console.log('1. 新しいワークスペースを作成中...');
    const workspaceName = `Microsoft UET - ${new Date().toISOString().split('T')[0]}`;
    const workspaceData = {
      name: workspaceName,
      description: 'Microsoft Ads UET テスト用のワークスペース'
    };
    
    const workspace = await gtmClient.createWorkspace(accountId, containerId, workspaceData);
    const workspaceId = workspace.workspaceId;
    console.log(`✓ ワークスペースが作成されました: ID=${workspaceId}, 名前=${workspace.name}\n`);
    
    // 2. カスタムイベントトリガーの作成（uet_conversion）
    console.log('2. カスタムイベントトリガー (uet_conversion) を作成中...');
    const triggerData1 = {
      name: 'UET - Custom Event Trigger',
      type: 'customEvent',
      customEventFilter: [
        {
          type: 'equals',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{_event}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'uet_conversion'
            }
          ]
        }
      ]
    };
    
    const trigger1 = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData1);
    console.log(`✓ トリガーが作成されました: ID=${trigger1.triggerId}, 名前=${trigger1.name}\n`);
    
    // 3. カスタムイベントトリガーの作成（uet_page_conversion）
    console.log('3. カスタムイベントトリガー (uet_page_conversion) を作成中...');
    const triggerData2 = {
      name: 'UET - Page Conversion Trigger',
      type: 'customEvent',
      customEventFilter: [
        {
          type: 'equals',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{_event}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'uet_page_conversion'
            }
          ]
        }
      ]
    };
    
    const trigger2 = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData2);
    console.log(`✓ トリガーが作成されました: ID=${trigger2.triggerId}, 名前=${trigger2.name}\n`);
    
    // 4. 仮タグ（カスタムHTML）の作成 - uet_conversion用
    console.log('4. 仮タグ (UET Placeholder - Custom Event) を作成中...');
    const tagData1 = {
      name: 'UET Placeholder - Custom Event',
      type: 'html', // カスタムHTML
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: `<script>
  // Microsoft Ads UET 仮タグ - Custom Event
  // このタグは後でMicrosoft UETタグに置き換えてください
  console.log('[UET Placeholder] Custom Event fired');
  console.log('[UET Placeholder] Event Category:', {{DLV - event_category}} || 'N/A');
  console.log('[UET Placeholder] Event Action:', {{DLV - event_action}} || 'N/A');
  console.log('[UET Placeholder] Revenue:', {{DLV - revenue}} || 'N/A');
  
  // dataLayerにログを追加
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'uet_placeholder_fired',
    'uet_event_type': 'custom_event',
    'timestamp': new Date().toISOString()
  });
</script>`
        },
        {
          type: 'boolean',
          key: 'supportDocumentWrite',
          value: 'false'
        }
      ],
      firingTriggerId: [trigger1.triggerId]
    };
    
    const tag1 = await gtmClient.createTag(accountId, containerId, workspaceId, tagData1);
    console.log(`✓ タグが作成されました: ID=${tag1.tagId}, 名前=${tag1.name}\n`);
    
    // 5. 仮タグ（カスタムHTML）の作成 - uet_page_conversion用
    console.log('5. 仮タグ (UET Placeholder - Page Conversion) を作成中...');
    const tagData2 = {
      name: 'UET Placeholder - Page Conversion',
      type: 'html', // カスタムHTML
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: `<script>
  // Microsoft Ads UET 仮タグ - Page Conversion
  // このタグは後でMicrosoft UETタグに置き換えてください
  console.log('[UET Placeholder] Page Conversion fired');
  console.log('[UET Placeholder] Page Type:', {{DLV - page_type}} || 'N/A');
  
  // dataLayerにログを追加
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'uet_placeholder_fired',
    'uet_event_type': 'page_conversion',
    'timestamp': new Date().toISOString()
  });
</script>`
        },
        {
          type: 'boolean',
          key: 'supportDocumentWrite',
          value: 'false'
        }
      ],
      firingTriggerId: [trigger2.triggerId]
    };
    
    const tag2 = await gtmClient.createTag(accountId, containerId, workspaceId, tagData2);
    console.log(`✓ タグが作成されました: ID=${tag2.tagId}, 名前=${tag2.name}\n`);
    
    // 結果のサマリー
    console.log('=== 設定完了 ===');
    console.log(`ワークスペースID: ${workspaceId}`);
    console.log(`ワークスペース名: ${workspace.name}`);
    console.log('');
    console.log('作成したトリガー:');
    console.log(`  - ${trigger1.name} (ID: ${trigger1.triggerId}) - イベント: uet_conversion`);
    console.log(`  - ${trigger2.name} (ID: ${trigger2.triggerId}) - イベント: uet_page_conversion`);
    console.log('');
    console.log('作成したタグ:');
    console.log(`  - ${tag1.name} (ID: ${tag1.tagId})`);
    console.log(`  - ${tag2.name} (ID: ${tag2.tagId})`);
    console.log('');
    console.log('GTM管理画面URL:');
    console.log(`https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
    console.log('');
    console.log('テストページURL:');
    console.log('https://ghe.misosiru.io/pages/akiyama/tag_test/testpage/microsoft_uet/index.html');
    console.log('');
    console.log('次のステップ:');
    console.log('1. 上記のGTM URLにアクセスして設定を確認');
    console.log('2. 「プレビュー」をクリックしてテスト');
    console.log('3. テストページでイベントを発火させて確認');
    console.log('4. 問題がなければ「提出」→「公開」');
    console.log('5. 後でMicrosoft UETタグに置き換え');
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    if (error.response) {
      console.error('レスポンス:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

createUETPlaceholderTag();
