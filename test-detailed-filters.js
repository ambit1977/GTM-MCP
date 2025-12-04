#!/usr/bin/env node

/**
 * 詳細なフィルタ設定のテストスクリプト
 * - 複数のfilter条件（AND条件）
 * - 複数のautoEventFilter条件（AND条件）
 * - 異なるフィルタタイプ（contains, equals, startsWith, endsWith, matchesRegexなど）
 */

import { GTMClient } from './src/gtm-client.js';

async function testDetailedFilters() {
  try {
    console.log('=== 詳細なフィルタ設定テスト ===\n');
    
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
    
    console.log('【テスト1】複数のfilter条件（AND条件）のテスト\n');
    
    // テスト1: 複数のfilter条件
    const triggerData1 = {
      name: `テスト - 複数filter条件 - ${Date.now()}`,
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
        },
        {
          type: 'startsWith',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Click URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'https://'
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
              value: '20251202cvtest'
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
    
    console.log('送信するトリガーデータ（テスト1）:');
    console.log(JSON.stringify(triggerData1, null, 2));
    console.log('');
    
    const trigger1 = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData1);
    
    console.log('✓ トリガーが作成されました！');
    console.log(`  名前: ${trigger1.name}`);
    console.log(`  ID: ${trigger1.triggerId}`);
    console.log(`  フィルタ数: ${trigger1.filter?.length || 0}`);
    console.log(`  自動イベントフィルタ数: ${trigger1.autoEventFilter?.length || 0}\n`);
    
    // 再取得して確認
    const retrievedTrigger1 = await gtmClient.getTrigger(accountId, containerId, workspaceId, trigger1.triggerId);
    
    console.log('再取得したトリガー情報（テスト1）:');
    console.log(`  フィルタ数: ${retrievedTrigger1.filter?.length || 0}`);
    if (retrievedTrigger1.filter && retrievedTrigger1.filter.length > 0) {
      retrievedTrigger1.filter.forEach((filter, index) => {
        console.log(`    フィルタ${index + 1}: ${filter.type}`);
        console.log(`      パラメータ: ${JSON.stringify(filter.parameter, null, 6)}`);
      });
    }
    console.log(`  自動イベントフィルタ数: ${retrievedTrigger1.autoEventFilter?.length || 0}`);
    if (retrievedTrigger1.autoEventFilter && retrievedTrigger1.autoEventFilter.length > 0) {
      retrievedTrigger1.autoEventFilter.forEach((filter, index) => {
        console.log(`    自動イベントフィルタ${index + 1}: ${filter.type}`);
        console.log(`      パラメータ: ${JSON.stringify(filter.parameter, null, 6)}`);
      });
    }
    console.log('');
    
    // 検証
    if (retrievedTrigger1.filter && retrievedTrigger1.filter.length >= 2) {
      console.log('✓ 複数のfilter条件が正しく設定されています！\n');
    } else {
      console.log('✗ 複数のfilter条件が正しく設定されていません。\n');
    }
    
    console.log('='.repeat(80));
    console.log('\n【テスト2】複数のautoEventFilter条件（AND条件）のテスト\n');
    
    // テスト2: 複数のautoEventFilter条件
    const triggerData2 = {
      name: `テスト - 複数autoEventFilter条件 - ${Date.now()}`,
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
              value: '20251202cvtest'
            }
          ]
        },
        {
          type: 'endsWith',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Page URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'test1.html'
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
    
    console.log('送信するトリガーデータ（テスト2）:');
    console.log(JSON.stringify(triggerData2, null, 2));
    console.log('');
    
    const trigger2 = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData2);
    
    console.log('✓ トリガーが作成されました！');
    console.log(`  名前: ${trigger2.name}`);
    console.log(`  ID: ${trigger2.triggerId}`);
    console.log(`  フィルタ数: ${trigger2.filter?.length || 0}`);
    console.log(`  自動イベントフィルタ数: ${trigger2.autoEventFilter?.length || 0}\n`);
    
    // 再取得して確認
    const retrievedTrigger2 = await gtmClient.getTrigger(accountId, containerId, workspaceId, trigger2.triggerId);
    
    console.log('再取得したトリガー情報（テスト2）:');
    console.log(`  フィルタ数: ${retrievedTrigger2.filter?.length || 0}`);
    console.log(`  自動イベントフィルタ数: ${retrievedTrigger2.autoEventFilter?.length || 0}`);
    if (retrievedTrigger2.autoEventFilter && retrievedTrigger2.autoEventFilter.length > 0) {
      retrievedTrigger2.autoEventFilter.forEach((filter, index) => {
        console.log(`    自動イベントフィルタ${index + 1}: ${filter.type}`);
        console.log(`      パラメータ: ${JSON.stringify(filter.parameter, null, 6)}`);
      });
    }
    console.log('');
    
    // 検証
    if (retrievedTrigger2.autoEventFilter && retrievedTrigger2.autoEventFilter.length >= 2) {
      console.log('✓ 複数のautoEventFilter条件が正しく設定されています！\n');
    } else {
      console.log('✗ 複数のautoEventFilter条件が正しく設定されていません。\n');
    }
    
    console.log('='.repeat(80));
    console.log('\n【テスト3】異なるフィルタタイプのテスト\n');
    
    // テスト3: 異なるフィルタタイプ（equals, startsWith, endsWith）
    const triggerData3 = {
      name: `テスト - 異なるフィルタタイプ - ${Date.now()}`,
      type: 'linkClick',
      filter: [
        {
          type: 'equals',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Click Element}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'button'
            }
          ]
        },
        {
          type: 'startsWith',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Click URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'https://example.com'
            }
          ]
        },
        {
          type: 'endsWith',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Click URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: '.html'
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
              value: 'test'
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
    
    console.log('送信するトリガーデータ（テスト3）:');
    console.log(JSON.stringify(triggerData3, null, 2));
    console.log('');
    
    const trigger3 = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData3);
    
    console.log('✓ トリガーが作成されました！');
    console.log(`  名前: ${trigger3.name}`);
    console.log(`  ID: ${trigger3.triggerId}`);
    console.log(`  フィルタ数: ${trigger3.filter?.length || 0}\n`);
    
    // 再取得して確認
    const retrievedTrigger3 = await gtmClient.getTrigger(accountId, containerId, workspaceId, trigger3.triggerId);
    
    console.log('再取得したトリガー情報（テスト3）:');
    if (retrievedTrigger3.filter && retrievedTrigger3.filter.length > 0) {
      retrievedTrigger3.filter.forEach((filter, index) => {
        console.log(`  フィルタ${index + 1}: ${filter.type}`);
        console.log(`    パラメータ: ${JSON.stringify(filter.parameter, null, 6)}`);
      });
    }
    console.log('');
    
    // 検証
    const filterTypes = retrievedTrigger3.filter?.map(f => f.type) || [];
    const expectedTypes = ['equals', 'startsWith', 'endsWith'];
    const hasAllTypes = expectedTypes.every(type => filterTypes.includes(type));
    
    if (hasAllTypes && retrievedTrigger3.filter.length >= 3) {
      console.log('✓ 異なるフィルタタイプが正しく設定されています！\n');
    } else {
      console.log('✗ 異なるフィルタタイプが正しく設定されていません。');
      console.log(`  期待されるタイプ: ${expectedTypes.join(', ')}`);
      console.log(`  実際のタイプ: ${filterTypes.join(', ')}\n`);
    }
    
    console.log('='.repeat(80));
    console.log('\n【テスト4】複雑な条件の組み合わせテスト\n');
    
    // テスト4: 複雑な条件の組み合わせ（複数のfilter + 複数のautoEventFilter）
    const triggerData4 = {
      name: `テスト - 複雑な条件組み合わせ - ${Date.now()}`,
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
        },
        {
          type: 'startsWith',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Click URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'https://'
            }
          ]
        },
        {
          type: 'endsWith',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Click URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: '.html'
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
              value: '20251202cvtest'
            }
          ]
        },
        {
          type: 'endsWith',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Page URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'test1.html'
            }
          ]
        },
        {
          type: 'startsWith',
          parameter: [
            {
              type: 'template',
              key: 'arg0',
              value: '{{Page URL}}'
            },
            {
              type: 'template',
              key: 'arg1',
              value: 'https://example.com'
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
    
    console.log('送信するトリガーデータ（テスト4）:');
    console.log(JSON.stringify(triggerData4, null, 2));
    console.log('');
    
    const trigger4 = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData4);
    
    console.log('✓ トリガーが作成されました！');
    console.log(`  名前: ${trigger4.name}`);
    console.log(`  ID: ${trigger4.triggerId}`);
    console.log(`  フィルタ数: ${trigger4.filter?.length || 0}`);
    console.log(`  自動イベントフィルタ数: ${trigger4.autoEventFilter?.length || 0}\n`);
    
    // 再取得して確認
    const retrievedTrigger4 = await gtmClient.getTrigger(accountId, containerId, workspaceId, trigger4.triggerId);
    
    console.log('再取得したトリガー情報（テスト4）:');
    console.log(`  フィルタ数: ${retrievedTrigger4.filter?.length || 0}`);
    if (retrievedTrigger4.filter && retrievedTrigger4.filter.length > 0) {
      retrievedTrigger4.filter.forEach((filter, index) => {
        console.log(`    フィルタ${index + 1}: ${filter.type}`);
      });
    }
    console.log(`  自動イベントフィルタ数: ${retrievedTrigger4.autoEventFilter?.length || 0}`);
    if (retrievedTrigger4.autoEventFilter && retrievedTrigger4.autoEventFilter.length > 0) {
      retrievedTrigger4.autoEventFilter.forEach((filter, index) => {
        console.log(`    自動イベントフィルタ${index + 1}: ${filter.type}`);
      });
    }
    console.log('');
    
    // 検証
    const hasMultipleFilters = retrievedTrigger4.filter && retrievedTrigger4.filter.length >= 3;
    const hasMultipleAutoEventFilters = retrievedTrigger4.autoEventFilter && retrievedTrigger4.autoEventFilter.length >= 3;
    
    if (hasMultipleFilters && hasMultipleAutoEventFilters) {
      console.log('✓ 複雑な条件の組み合わせが正しく設定されています！\n');
    } else {
      console.log('✗ 複雑な条件の組み合わせが正しく設定されていません。');
      console.log(`  filter数: ${retrievedTrigger4.filter?.length || 0} (期待: 3以上)`);
      console.log(`  autoEventFilter数: ${retrievedTrigger4.autoEventFilter?.length || 0} (期待: 3以上)\n`);
    }
    
    console.log('='.repeat(80));
    console.log('\n【テスト結果まとめ】\n');
    console.log(`テスト1（複数filter）: ${retrievedTrigger1.filter?.length >= 2 ? '✓ 成功' : '✗ 失敗'}`);
    console.log(`テスト2（複数autoEventFilter）: ${retrievedTrigger2.autoEventFilter?.length >= 2 ? '✓ 成功' : '✗ 失敗'}`);
    console.log(`テスト3（異なるフィルタタイプ）: ${hasAllTypes && retrievedTrigger3.filter.length >= 3 ? '✓ 成功' : '✗ 失敗'}`);
    console.log(`テスト4（複雑な条件組み合わせ）: ${hasMultipleFilters && hasMultipleAutoEventFilters ? '✓ 成功' : '✗ 失敗'}`);
    console.log('\n✓ すべての詳細フィルタ設定テストが完了しました！\n');
    
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

testDetailedFilters();

