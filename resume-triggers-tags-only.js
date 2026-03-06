#!/usr/bin/env node

/**
 * 既存トリガー3個を使い、残りトリガー7個 + タグ10個を作成
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
    console.log('=== 残りトリガー7 + タグ10 作成 ===\n');

    const triggers = await gtmClient.listTriggers(accountId, containerId, workspaceId);
    const existingNames = ['CS Test - All Pages', 'CS Test - DOM Ready', 'CS Test - Window Loaded'];
    const existingTriggers = triggers.filter((t) => existingNames.includes(t.name)).sort((a, b) => existingNames.indexOf(a.name) - existingNames.indexOf(b.name));
    const triggerIds = existingTriggers.map((t) => t.triggerId);
    console.log('既存トリガーID:', triggerIds.join(', '));

    const remainingTriggers = [
      { name: 'CS Test - Click All', type: 'click' },
      { name: 'CS Test - Custom event_1', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'template', key: 'arg0', value: '{{_event}}' }, { type: 'template', key: 'arg1', value: 'test_event_1' }] }] },
      { name: 'CS Test - Custom event_2', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'template', key: 'arg0', value: '{{_event}}' }, { type: 'template', key: 'arg1', value: 'test_event_2' }] }] },
      { name: 'CS Test - Form Submit', type: 'formSubmission' },
      { name: 'CS Test - History Change', type: 'historyChange' },
      { name: 'CS Test - YouTube Start', type: 'youtubeVideo', enableTriggerOnVideoStart: true },
      { name: 'CS Test - Custom event_3', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'template', key: 'arg0', value: '{{_event}}' }, { type: 'template', key: 'arg1', value: 'test_event_3' }] }] }
    ];

    console.log('\nトリガー 7 個作成中...');
    for (const t of remainingTriggers) {
      const payload = { name: t.name, type: t.type };
      if (t.customEventFilter) payload.customEventFilter = t.customEventFilter;
      if (t.interval != null) payload.interval = t.interval;
      if (t.limit != null) payload.limit = t.limit;
      if (t.startTimerOn) payload.startTimerOn = t.startTimerOn;
      if (t.enableTriggerOnVideoStart != null) payload.enableTriggerOnVideoStart = t.enableTriggerOnVideoStart;
      const r = await gtmClient.createTrigger(accountId, containerId, workspaceId, payload);
      triggerIds.push(r.triggerId);
      console.log(`  ✓ ${r.name} (ID: ${r.triggerId})`);
      await delay(API_DELAY_MS);
    }

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

    console.log('\nカスタムHTMLタグ 10 個作成中...');
    for (let i = 0; i < 10; i++) {
      const tagData = {
        name: `CS Test - HTML ${i + 1}`,
        type: 'html',
        parameter: [
          { type: 'template', key: 'html', value: htmlSnippets[i] },
          { type: 'boolean', key: 'supportDocumentWrite', value: 'false' }
        ],
        firingTriggerId: [triggerIds[i]]
      };
      const r = await gtmClient.createTag(accountId, containerId, workspaceId, tagData);
      console.log(`  ✓ ${r.name} (ID: ${r.tagId})`);
      await delay(API_DELAY_MS);
    }

    console.log('\n=== 完了 ===');
    console.log(`変数10, トリガー10, タグ10 が揃いました`);
    console.log(`https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
  } catch (err) {
    console.error('エラー:', err.message);
    if (err.response) console.error(err.response.data);
    process.exit(1);
  }
}

run();
