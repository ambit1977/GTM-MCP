#!/usr/bin/env node

/**
 * GTM コンテナインポート用JSONを生成する（エクスポート形式に準拠）
 * 使い方:
 *   node generate-gtm-import-json.js [タグ数] [出力ファイル]           … トリガー1つ + タグ
 *   node generate-gtm-import-json.js [タグ数] [出力ファイル] tagsOnly  … タグのみ（トリガーなし）
 * 例:
 *   node generate-gtm-import-json.js 1000 gtm-import-1000-tags.json
 *   node generate-gtm-import-json.js 1000 gtm-import-1000-tags-only.json tagsOnly
 */

import fs from 'fs';
import path from 'path';

const count = Math.max(1, parseInt(process.argv[2], 10) || 100);
const outFile = process.argv[3] || `gtm-import-${count}-tags.json`;
const tagsOnly = process.argv[4] === 'tagsOnly' || process.argv[4] === '--tags-only';
const prefix = 'bulk';

// 既存ワークスペースのIDと競合しないよう大きめの基数を使用
const idBase = 900000;

let containerVersion;

if (tagsOnly) {
  // トリガーなし・タグのみ（GTM-MMN237BJ_workspace3.json 形式）
  // インポート後、ワークスペースの「All Pages」等の初期トリガーで紐付ける
  const tags = [];
  for (let i = 1; i <= count; i++) {
    const tagId = String(idBase + i);
    tags.push({
      tagId,
      name: `${prefix} - HTML Tag ${i}`,
      type: 'html',
      parameter: [
        { type: 'TEMPLATE', key: 'html', value: `<script>console.log("[${prefix} Tag ${i}]");</script>` },
        { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' },
      ],
      tagFiringOption: 'ONCE_PER_EVENT',
      monitoringMetadata: { type: 'MAP' },
      consentSettings: { consentStatus: 'NOT_SET' },
    });
  }
  containerVersion = {
    containerVersionId: '0',
    container: {
      name: `${prefix} Import (Tags Only)`,
      usageContext: ['WEB'],
    },
    tag: tags,
    variable: [],
  };
} else {
  // トリガー1つ + タグ（従来どおり）
  const singleTriggerId = String(idBase + 1);
  const triggers = [
    {
      triggerId: singleTriggerId,
      name: `${prefix} - All Pages`,
      type: 'PAGEVIEW',
    },
  ];
  const tags = [];
  for (let i = 1; i <= count; i++) {
    const tagId = String(idBase + i);
    tags.push({
      tagId,
      name: `${prefix} - HTML Tag ${i}`,
      type: 'html',
      parameter: [
        { type: 'TEMPLATE', key: 'html', value: `<script>console.log("[${prefix} Tag ${i}]");</script>` },
        { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' },
      ],
      firingTriggerId: [singleTriggerId],
      consentSettings: { consentStatus: 'NOT_SET' },
    });
  }
  containerVersion = {
    containerVersionId: '0',
    container: {
      name: `${prefix} Import`,
      usageContext: ['WEB'],
    },
    trigger: triggers,
    tag: tags,
    variable: [],
  };
}

const exportJson = {
  exportFormatVersion: 2,
  containerVersion,
};

const outPath = path.isAbsolute(outFile) ? outFile : path.join(process.cwd(), outFile);
fs.writeFileSync(outPath, JSON.stringify(exportJson, null, 2), 'utf8');

const triggerCount = containerVersion.trigger ? containerVersion.trigger.length : 0;
console.log(`Generated: ${outPath}`);
console.log(`  Tags: ${containerVersion.tag.length}, Triggers: ${triggerCount}, Variables: 0`);
if (tagsOnly) {
  console.log('  Mode: tags only (no triggers). Assign to "All Pages" etc. after import.');
} else {
  console.log(`  Tag ID range: ${idBase + 1} .. ${idBase + count}`);
}
