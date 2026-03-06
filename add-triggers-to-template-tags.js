#!/usr/bin/env node

/**
 * GTMテンプレートタグにトリガーを追加
 */

import { GTMClient } from './src/gtm-client.js';

async function addTriggersToTemplateTags() {
  try {
    console.log('=== GTMテンプレートタグにトリガーを追加 ===\n');
    
    const gtmClient = new GTMClient();
    
    const accountId = '6255561314';
    const containerId = '236653436';
    const workspaceId = '16';
    
    // 1. 現在のタグ一覧を取得
    console.log('1. タグ一覧を取得中...');
    const tags = await gtmClient.listTags(accountId, containerId, workspaceId);
    
    console.log(`   取得したタグ数: ${tags.length}`);
    console.log('');
    
    // テンプレートタグを検索
    let enableTag = null;
    let disableTag = null;
    
    for (const tag of tags) {
      console.log(`   - ${tag.name} (ID: ${tag.tagId}, Type: ${tag.type})`);
      
      if (tag.name.includes('Enable') && tag.name.includes('template')) {
        enableTag = tag;
      }
      if (tag.name.includes('Disable') && tag.name.includes('template')) {
        disableTag = tag;
      }
    }
    
    console.log('');
    
    if (!enableTag) {
      console.log('警告: Enable版テンプレートタグが見つかりません');
    } else {
      console.log(`Enable版タグ: ${enableTag.name} (ID: ${enableTag.tagId})`);
    }
    
    if (!disableTag) {
      console.log('警告: Disable版テンプレートタグが見つかりません');
    } else {
      console.log(`Disable版タグ: ${disableTag.name} (ID: ${disableTag.tagId})`);
    }
    
    console.log('');
    
    // 2. Enable版タグにトリガーを追加
    if (enableTag) {
      console.log('2. Enable版タグにトリガーを追加中...');
      const existingTriggers = enableTag.firingTriggerId || [];
      const newTriggers = [...existingTriggers, '160']; // UET Template Enable - Page View
      
      await gtmClient.updateTag(accountId, containerId, workspaceId, enableTag.tagId, {
        ...enableTag,
        firingTriggerId: newTriggers
      });
      console.log(`✓ Enable版タグにトリガーID 160 を追加しました\n`);
    }
    
    // 3. Disable版タグにトリガーを追加
    if (disableTag) {
      console.log('3. Disable版タグにトリガーを追加中...');
      const existingTriggers = disableTag.firingTriggerId || [];
      const newTriggers = [...existingTriggers, '161']; // UET Template Disable - Page View
      
      await gtmClient.updateTag(accountId, containerId, workspaceId, disableTag.tagId, {
        ...disableTag,
        firingTriggerId: newTriggers
      });
      console.log(`✓ Disable版タグにトリガーID 161 を追加しました\n`);
    }
    
    console.log('=== 設定完了 ===');
    console.log('');
    console.log('テストページURL:');
    console.log('Enable版: https://ghe.misosiru.io/pages/akiyama/tag_test/testpage/microsoft_uet/uet_template_enable.html');
    console.log('Disable版: https://ghe.misosiru.io/pages/akiyama/tag_test/testpage/microsoft_uet/uet_template_disable.html');
    
  } catch (error) {
    console.error('エラー:', error.message);
    if (error.response) {
      console.error('レスポンス:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

addTriggersToTemplateTags();
