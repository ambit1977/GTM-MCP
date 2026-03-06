#!/usr/bin/env node

import { GTMClient } from './src/gtm-client.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const API_DELAY_MS = 2500;

async function run() {
  const gtmClient = new GTMClient();
  const accountId = '4702826221';
  const containerId = '244511494';
  const workspaceId = '4';

  try {
    const triggers = await gtmClient.listTriggers(accountId, containerId, workspaceId);
    const order = ['CS Test - All Pages', 'CS Test - DOM Ready', 'CS Test - Window Loaded', 'CS Test - Click All', 'CS Test - Custom event_1', 'CS Test - Custom event_2', 'CS Test - Form Submit', 'CS Test - History Change', 'CS Test - YouTube Start'];
    let triggerIds = order.map((name) => triggers.find((t) => t.name === name)?.triggerId).filter(Boolean);

    if (triggerIds.length === 9) {
      const r = await gtmClient.createTrigger(accountId, containerId, workspaceId, {
        name: 'CS Test - Custom event_3',
        type: 'customEvent',
        customEventFilter: [{ type: 'equals', parameter: [{ type: 'template', key: 'arg0', value: '{{_event}}' }, { type: 'template', key: 'arg1', value: 'test_event_3' }] }]
      });
      triggerIds.push(r.triggerId);
      console.log('トリガー作成: CS Test - Custom event_3 (ID: ' + r.triggerId + ')');
      await delay(API_DELAY_MS);
    }

    const tags = await gtmClient.listTags(accountId, containerId, workspaceId);
    if (tags.some((t) => t.name.startsWith('CS Test - HTML'))) {
      console.log('タグは既に作成済みです');
      return;
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
      '<script>console.log("[CS Tag 10] Custom event_3");</script>'
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
        firingTriggerId: [triggerIds[i]]
      };
      const r = await gtmClient.createTag(accountId, containerId, workspaceId, tagData);
      console.log(`  ✓ ${r.name} (ID: ${r.tagId})`);
      await delay(API_DELAY_MS);
    }
    console.log('\n完了');
  } catch (err) {
    console.error(err.message);
    if (err.response) console.error(err.response.data);
    process.exit(1);
  }
}

run();
