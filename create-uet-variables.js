#!/usr/bin/env node

/**
 * UET Placeholder タグで使用するデータレイヤー変数を作成
 * - DLV - event_category
 * - DLV - event_action
 * - DLV - revenue
 * - DLV - page_type
 */

import { GTMClient } from './src/gtm-client.js';

async function createUETVariables() {
  try {
    console.log('=== UET 用データレイヤー変数を作成 ===\n');
    
    const gtmClient = new GTMClient();
    
    // アカウント、コンテナID、ワークスペースID
    const accountId = '6255561314';
    const containerId = '236653436';
    const workspaceId = '16'; // Microsoft UET ワークスペース
    
    console.log('アカウントID:', accountId);
    console.log('コンテナID:', containerId);
    console.log('ワークスペースID:', workspaceId);
    console.log('');
    
    // 作成する変数のリスト
    const variablesToCreate = [
      {
        name: 'DLV - event_category',
        dataLayerVariableName: 'event_category'
      },
      {
        name: 'DLV - event_action',
        dataLayerVariableName: 'event_action'
      },
      {
        name: 'DLV - revenue',
        dataLayerVariableName: 'revenue'
      },
      {
        name: 'DLV - page_type',
        dataLayerVariableName: 'page_type'
      }
    ];
    
    for (let i = 0; i < variablesToCreate.length; i++) {
      const varConfig = variablesToCreate[i];
      console.log(`${i + 1}. 変数 "${varConfig.name}" を作成中...`);
      
      const variableData = {
        name: varConfig.name,
        type: 'v', // データレイヤー変数
        parameter: [
          {
            type: 'integer',
            key: 'dataLayerVersion',
            value: '2'
          },
          {
            type: 'boolean',
            key: 'setDefaultValue',
            value: 'false'
          },
          {
            type: 'template',
            key: 'name',
            value: varConfig.dataLayerVariableName
          }
        ]
      };
      
      const variable = await gtmClient.createVariable(accountId, containerId, workspaceId, variableData);
      console.log(`✓ 変数が作成されました: ID=${variable.variableId}, 名前=${variable.name}\n`);
    }
    
    console.log('=== 設定完了 ===');
    console.log('すべてのデータレイヤー変数が作成されました。');
    console.log('');
    console.log('GTM管理画面URL:');
    console.log(`https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
    console.log('');
    console.log('再度プレビューを実行してください。');
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    if (error.response) {
      console.error('レスポンス:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

createUETVariables();
