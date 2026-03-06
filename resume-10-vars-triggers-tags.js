#!/usr/bin/env node

/**
 * 既存ワークスペースに残りの変数・トリガー・タグを作成（レート制限対策で遅延あり）
 * 既に作成済み: ワークスペース4, 変数7個 → 残り 変数3, トリガー10, タグ10
 */

import { GTMClient } from './src/gtm-client.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const API_DELAY_MS = 2500;

async function run() {
  const gtmClient = new GTMClient();
  const accountId = '4702826221';
  const containerId = '244511494';
  const workspaceId = '4';

  try {
    console.log('=== 残り作成 (GTM-TSXHZXT7, ワークスペース4) ===\n');

    // 残り変数3個
    const remainingVars = [
      { name: 'DLV - user_id', type: 'v', parameter: [{ type: 'integer', key: 'dataLayerVersion', value: '2' }, { type: 'boolean', key: 'setDefaultValue', value: 'false' }, { type: 'template', key: 'name', value: 'user_id' }] },
      { name: 'Const - site_id', type: 'c', parameter: [{ type: 'template', key: 'value', value: 'site_001' }] },
      { name: 'DLV - revenue', type: 'v', parameter: [{ type: 'integer', key: 'dataLayerVersion', value: '2' }, { type: 'boolean', key: 'setDefaultValue', value: 'false' }, { type: 'template', key: 'name', value: 'revenue' }] }
    ];

    console.log('変数 3 個作成中...');
    for (const v of remainingVars) {
      await gtmClient.createVariable(accountId, containerId, workspaceId, v);
      console.log(`  ✓ ${v.name}`);
      await delay(API_DELAY_MS);
    }
    console.log('');

    // トリガー10個
    const triggers = [
      { name: 'CS Test - All Pages', type: 'pageview' },
      { name: 'CS Test - DOM Ready', type: 'domReady' },
      { name: 'CS Test - Window Loaded', type: 'windowLoaded' },
      { name: 'CS Test - Click All', type: 'click' },
      { name: 'CS Test - Custom event_1', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'template', key: 'arg0', value: '{{_event}}' }, { type: 'template', key: 'arg1', value: 'test_event_1' }] }] },
      { name: 'CS Test - Custom event_2', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'template', key: 'arg0', value: '{{_event}}' }, { type: 'template', key: 'arg1', value: 'test_event_2' }] }] },
      { name: 'CS Test - Form Submit', type: 'formSubmission' },
      { name: 'CS Test - History Change', type: 'historyChange' },
      { name: 'CS Test - YouTube Start', type: 'youtubeVideo', enableTriggerOnVideoStart: true },
      { name: 'CS Test - Timer 5s', type: 'timer', interval: 5000, limit: 1, startTimerOn: 'windowLoad' }
    ];

    console.log('トリガー 10 個作成中...');
    const createdTriggers = [];
    for (const t of triggers) {
      const payload = { name: t.name, type: t.type };
      if (t.filter) payload.filter = t.filter;
      if (t.customEventFilter) payload.customEventFilter = t.customEventFilter;
      if (t.interval != null) payload.interval = t.interval;
      if (t.limit != null) payload.limit = t.limit;
      if (t.startTimerOn) payload.startTimerOn = t.startTimerOn;
      if (t.enableTriggerOnVideoStart != null) payload.enableTriggerOnVideoStart = t.enableTriggerOnVideoStart;
      const r = await gtmClient.createTrigger(accountId, containerId, workspaceId, payload);
      createdTriggers.push(r);
      console.log(`  ✓ ${r.name} (ID: ${r.triggerId})`);
      await delay(API_DELAY_MS);
    }
    console.log('');

    // カスタムHTMLタグ10個
    const htmlSnippets = [
      '<script>console.log("[CS Tag 1] All Pages");</script>',
      '<script>console.log("[CS Tag 2] DOM Ready");</script>',
      '<script>console.log("[CS Tag 3] Window Loaded");</script>',
      '<script>console.log("[CS Tag 4] Click");</script>',
      '<script>console.log("[CS Tag 5] Custom event_1");</script>',
      '<script>console.log("[CS Tag 6] Custom event_2");</script>',
      '<script>console.log("[CS Tag 7] Form Submit");</script>',
      '<script>console.log("[CS Tag 8] History Change");</script>',
      '<script>console.log("[CS Tag 9] YouTube");</script>',
      '<script>console.log("[CS Tag 10] Timer");</script>'
    ];

    console.log('カスタムHTMLタグ 10 個作成中...');
    for (let i = 0; i < 10; i++) {
      const tagData = {
        name: `CS Test - HTML ${i + 1}`,
        type: 'html',
        parameter: [
          { type: 'template', key: 'html', value: htmlSnippets[i] },
          { type: 'boolean', key: 'supportDocumentWrite', value: 'false' }
        ],
        firingTriggerId: [createdTriggers[i].triggerId]
      };
      const r = await gtmClient.createTag(accountId, containerId, workspaceId, tagData);
      console.log(`  ✓ ${r.name} (ID: ${r.tagId})`);
      await delay(API_DELAY_MS);
    }

    console.log('\n=== 完了 ===');
    console.log(`管理画面: https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
  } catch (err) {
    console.error('エラー:', err.message);
    if (err.response) console.error(err.response.data);
    process.exit(1);
  }
}

run();
