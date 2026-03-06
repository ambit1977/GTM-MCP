#!/usr/bin/env node

/**
 * CV ID 980994369 クリック発火パターン用のGTM設定を作成
 * - カスタムイベントトリガー: conversion_980994369
 * - コンバージョンタグ: CV - 980994369 (Click)
 */

import { GTMClient } from './src/gtm-client.js';

async function createCV980994369ClickSettings() {
  try {
    console.log('=== CV ID 980994369 クリック発火パターン - GTM設定作成 ===\n');
    
    const gtmClient = new GTMClient();
    
    // アカウント、コンテナ、ワークスペースID
    const accountId = '6255561314';
    const containerId = '236653436';
    const workspaceId = '13';
    
    console.log('アカウントID:', accountId);
    console.log('コンテナID:', containerId);
    console.log('ワークスペースID:', workspaceId);
    console.log('');
    
    // 1. カスタムイベントトリガーの作成
    console.log('1. カスタムイベントトリガーを作成中...');
    const triggerData = {
      name: 'CV 980994369 - Click Trigger',
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
              value: 'conversion_980994369'
            }
          ]
        }
      ]
    };
    
    const trigger = await gtmClient.createTrigger(accountId, containerId, workspaceId, triggerData);
    console.log(`✓ トリガーが作成されました: ID=${trigger.triggerId}, 名前=${trigger.name}\n`);
    
    // 2. コンバージョンタグの作成
    console.log('2. コンバージョンタグを作成中...');
    const tagData = {
      name: 'CV - 980994369 (Click)',
      type: 'awct', // Google Ads コンバージョン トラッキング
      parameter: [
        {
          type: 'boolean',
          key: 'enableNewCustomerReporting',
          value: 'false'
        },
        {
          type: 'boolean',
          key: 'enableConversionLinker',
          value: 'true'
        },
        {
          type: 'template',
          key: 'conversionValue',
          value: '1.0'
        },
        {
          type: 'boolean',
          key: 'enableProductReporting',
          value: 'false'
        },
        {
          type: 'template',
          key: 'conversionId',
          value: '980994369'
        },
        {
          type: 'template',
          key: 'currencyCode',
          value: 'JPY'
        },
        {
          type: 'boolean',
          key: 'enableShippingData',
          value: 'false'
        },
        {
          type: 'template',
          key: 'conversionLabel',
          value: 'LVWcCJvcp9cbEMGS49MD'
        },
        {
          type: 'boolean',
          key: 'rdp',
          value: 'false'
        }
      ],
      firingTriggerId: [trigger.triggerId]
    };
    
    const tag = await gtmClient.createTag(accountId, containerId, workspaceId, tagData);
    console.log(`✓ タグが作成されました: ID=${tag.tagId}, 名前=${tag.name}\n`);
    
    // 結果のサマリー
    console.log('=== 設定完了 ===');
    console.log(`トリガーID: ${trigger.triggerId}`);
    console.log(`トリガー名: ${trigger.name}`);
    console.log(`タグID: ${tag.tagId}`);
    console.log(`タグ名: ${tag.name}`);
    console.log(`コンバージョンID: 980994369`);
    console.log(`コンバージョンラベル: LVWcCJvcp9cbEMGS49MD`);
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

createCV980994369ClickSettings();
