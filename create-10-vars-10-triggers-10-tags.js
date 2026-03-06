#!/usr/bin/env node

/**
 * 変数10個、トリガー10個、カスタムHTMLタグ10個を作成
 * コンテナ: GTM-TSXHZXT7 を優先、なければ 6255561314/236653436
 * レート制限対策のため各API呼び出し間に待機あり
 */

import { GTMClient } from './src/gtm-client.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const API_DELAY_MS = 2500;

async function findContainerByPublicId(gtmClient, targetPublicId) {
  const accounts = await gtmClient.listAccounts();
  const normalized = targetPublicId.replace(/^GTM-/, '');
  for (const acc of accounts) {
    const containers = await gtmClient.listContainers(acc.accountId);
    for (const c of containers) {
      const id = (c.publicId || '').replace(/^GTM-/, '');
      if (id === normalized || c.publicId === targetPublicId) {
        return { accountId: acc.accountId, containerId: c.containerId, name: c.name };
      }
    }
  }
  return null;
}

async function run() {
  const gtmClient = new GTMClient();
  const targetContainer = 'GTM-TSXHZXT7';

  let accountId, containerId, workspaceId;

  try {
    console.log('=== 変数10・トリガー10・カスタムHTML10 作成 ===\n');

    const found = await findContainerByPublicId(gtmClient, targetContainer);
    if (found) {
      accountId = found.accountId;
      containerId = found.containerId;
      console.log(`コンテナ検出: ${targetContainer} (accountId: ${accountId}, containerId: ${containerId})\n`);
    } else {
      accountId = '6255561314';
      containerId = '236653436';
      console.log(`コンテナ: ${targetContainer} が見つからないため、既存コンテナを使用 (${accountId}/${containerId})\n`);
    }

    // ワークスペース作成
    const wsName = `Container size test - ${new Date().toISOString().slice(0, 10)}`;
    const workspace = await gtmClient.createWorkspace(accountId, containerId, {
      name: wsName,
      description: '変数10・トリガー10・カスタムHTML10 テスト用'
    });
    workspaceId = workspace.workspaceId;
    console.log(`ワークスペース作成: ${workspace.name} (ID: ${workspaceId})\n`);

    // ---------- 変数10個 ----------
    const vars = [
      { name: 'DLV - page_type', type: 'v', parameter: [{ type: 'integer', key: 'dataLayerVersion', value: '2' }, { type: 'boolean', key: 'setDefaultValue', value: 'false' }, { type: 'template', key: 'name', value: 'page_type' }] },
      { name: 'DLV - event_name', type: 'v', parameter: [{ type: 'integer', key: 'dataLayerVersion', value: '2' }, { type: 'boolean', key: 'setDefaultValue', value: 'false' }, { type: 'template', key: 'name', value: 'event' }] },
      { name: 'Const - env', type: 'c', parameter: [{ type: 'template', key: 'value', value: 'production' }] },
      { name: 'Const - version', type: 'c', parameter: [{ type: 'template', key: 'value', value: '1.0' }] },
      { name: 'JS - timestamp', type: 'j', parameter: [{ type: 'template', key: 'name', value: 'function(){ return new Date().getTime(); }' }] },
      { name: 'URL - hostname', type: 'u', parameter: [{ type: 'template', key: 'component', value: 'host' }] },
      { name: 'URL - path', type: 'u', parameter: [{ type: 'template', key: 'component', value: 'path' }] },
      { name: 'DLV - user_id', type: 'v', parameter: [{ type: 'integer', key: 'dataLayerVersion', value: '2' }, { type: 'boolean', key: 'setDefaultValue', value: 'false' }, { type: 'template', key: 'name', value: 'user_id' }] },
      { name: 'Const - site_id', type: 'c', parameter: [{ type: 'template', key: 'value', value: 'site_001' }] },
      { name: 'DLV - revenue', type: 'v', parameter: [{ type: 'integer', key: 'dataLayerVersion', value: '2' }, { type: 'boolean', key: 'setDefaultValue', value: 'false' }, { type: 'template', key: 'name', value: 'revenue' }] }
    ];

    console.log('変数 10 個作成中...');
    const createdVars = [];
    for (const v of vars) {
      const r = await gtmClient.createVariable(accountId, containerId, workspaceId, v);
      createdVars.push(r);
      console.log(`  ✓ ${r.name} (ID: ${r.variableId})`);
    }
    console.log('');

    // ---------- トリガー10個 ----------
    const triggers = [
      { name: 'CS Test - All Pages', type: 'pageview' },
      { name: 'CS Test - DOM Ready', type: 'domReady' },
      { name: 'CS Test - Window Loaded', type: 'windowLoaded' },
      { name: 'CS Test - Click All', type: 'click', filter: [{ type: 'match', parameter: [{ type: 'template', key: 'arg0', value: '{{Click URL}}' }, { type: 'template', key: 'arg1', value: '.*' }] }] },
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
    }
    console.log('');

    // ---------- カスタムHTMLタグ10個 ----------
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
      const triggerId = createdTriggers[i].triggerId;
      const tagData = {
        name: `CS Test - HTML ${i + 1}`,
        type: 'html',
        parameter: [
          { type: 'template', key: 'html', value: htmlSnippets[i] },
          { type: 'boolean', key: 'supportDocumentWrite', value: 'false' }
        ],
        firingTriggerId: [triggerId]
      };
      const r = await gtmClient.createTag(accountId, containerId, workspaceId, tagData);
      console.log(`  ✓ ${r.name} (ID: ${r.tagId}) → トリガー: ${createdTriggers[i].name}`);
    }

    console.log('\n=== 完了 ===');
    console.log(`変数: 10, トリガー: 10, タグ: 10`);
    console.log(`ワークスペースID: ${workspaceId}`);
    console.log(`管理画面: https://tagmanager.google.com/#/container/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`);
  } catch (err) {
    console.error('エラー:', err.message);
    if (err.response) console.error(err.response.data);
    process.exit(1);
  }
}

run();
