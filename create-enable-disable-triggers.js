#!/usr/bin/env node

/**
 * Enable版とDisable版の個別トリガーを作成
 */

import { GTMClient } from './src/gtm-client.js';

async function createEnableDisableTriggers() {
  try {
    console.log('=== Enable/Disable 個別トリガー作成 ===\n');
    
    const gtmClient = new GTMClient();
    
    const accountId = '6255561314';
    const containerId = '236653436';
    const workspaceId = '16';
    
    // 1. Enable版トリガー
    console.log('1. Enable版トリガーを作成中...');
    const triggerEnable = await gtmClient.createTrigger(accountId, containerId, workspaceId, {
      name: 'UET Template Enable - Page View',
      type: 'pageview',
      filter: [{
        type: 'contains',
        parameter: [
          { type: 'template', key: 'arg0', value: '{{Page URL}}' },
          { type: 'template', key: 'arg1', value: 'uet_template_enable.html' }
        ]
      }]
    });
    console.log(`✓ Enable版トリガー作成: ID=${triggerEnable.triggerId}\n`);
    
    // 2. Disable版トリガー
    console.log('2. Disable版トリガーを作成中...');
    const triggerDisable = await gtmClient.createTrigger(accountId, containerId, workspaceId, {
      name: 'UET Template Disable - Page View',
      type: 'pageview',
      filter: [{
        type: 'contains',
        parameter: [
          { type: 'template', key: 'arg0', value: '{{Page URL}}' },
          { type: 'template', key: 'arg1', value: 'uet_template_disable.html' }
        ]
      }]
    });
    console.log(`✓ Disable版トリガー作成: ID=${triggerDisable.triggerId}\n`);
    
    console.log('=== 設定完了 ===');
    console.log('');
    console.log('作成したトリガー:');
    console.log(`  - UET Template Enable - Page View (ID: ${triggerEnable.triggerId})`);
    console.log(`  - UET Template Disable - Page View (ID: ${triggerDisable.triggerId})`);
    console.log('');
    console.log('【重要】GTM管理画面で以下を設定してください:');
    console.log('');
    console.log('1. UET template TAG Enable automatic tracking:');
    console.log(`   → 「UET Template Enable - Page View」トリガーを追加`);
    console.log('');
    console.log('2. UET template TAG Disable automatic tracking:');
    console.log(`   → 「UET Template Disable - Page View」トリガーを追加`);
    console.log('');
    console.log('GTM管理画面:');
    console.log(`https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
    
  } catch (error) {
    console.error('エラー:', error.message);
    process.exit(1);
  }
}

createEnableDisableTriggers();
