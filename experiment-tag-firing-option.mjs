/**
 * tagFiringOption が未設定（ブランク）のタグの挙動検証
 * 検証用軽いコンテナ: accounts/4702826221/containers/12947576
 */
import { GTMClient } from './src/gtm-client.js';

const ACCOUNT = '4702826221';
const CONTAINER = '12947576';
const WS_NAME = '20260723_tagFiringOption_blank_test';

const htmlSnippet = (label) =>
  `<script>
(function(){
  window.__gtmFireLog = window.__gtmFireLog || [];
  var entry = { option: ${JSON.stringify(label)}, at: Date.now(), event: (window.dataLayer && window.dataLayer.slice(-1)[0] && window.dataLayer.slice(-1)[0].event) || 'unknown' };
  window.__gtmFireLog.push(entry);
  console.log('[tagFiringOption-test]', entry.option, entry);
})();
</script>`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const gtm = new GTMClient();

  // 既存の同名WSがあれば再利用
  let workspaces = await gtm.listWorkspaces(ACCOUNT, CONTAINER);
  let ws = workspaces.find((w) => w.name === WS_NAME);
  if (!ws) {
    ws = await gtm.createWorkspace(ACCOUNT, CONTAINER, {
      name: WS_NAME,
      description: 'tagFiringOption blank vs explicit options experiment'
    });
    console.log('Created workspace', ws.workspaceId, ws.name);
  } else {
    console.log('Reuse workspace', ws.workspaceId, ws.name);
  }
  const WS = ws.workspaceId;
  await sleep(1500);

  // カスタムイベント（同一ページで複数回発火可能）
  let triggers = await gtm.listTriggers(ACCOUNT, CONTAINER, WS);
  let customTrig = triggers.find((t) => t.name === 'CE - test_fire_multi');
  if (!customTrig) {
    customTrig = await gtm.createTrigger(ACCOUNT, CONTAINER, WS, {
      name: 'CE - test_fire_multi',
      type: 'customEvent',
      customEventFilter: [
        {
          type: 'equals',
          parameter: [
            { type: 'template', key: 'arg0', value: '{{_event}}' },
            { type: 'template', key: 'arg1', value: 'test_fire_multi' }
          ]
        }
      ]
    });
    console.log('Created trigger', customTrig.triggerId);
  } else {
    console.log('Reuse trigger', customTrig.triggerId);
  }
  await sleep(1500);

  const firingTriggerId = [customTrig.triggerId];

  const variants = [
    { name: '[EXP] fireOpt BLANK (omit field)', tagFiringOption: null },
    { name: '[EXP] fireOpt oncePerEvent', tagFiringOption: 'oncePerEvent' },
    { name: '[EXP] fireOpt unlimited', tagFiringOption: 'unlimited' },
    { name: '[EXP] fireOpt oncePerLoad', tagFiringOption: 'oncePerLoad' }
  ];

  const tags = await gtm.listTags(ACCOUNT, CONTAINER, WS);
  const results = [];

  for (const v of variants) {
    let existing = tags.find((t) => t.name === v.name);
    if (existing) {
      console.log('Reuse tag', v.name, existing.tagId, 'tagFiringOption=', existing.tagFiringOption ?? '(absent)');
      results.push(existing);
      continue;
    }
    const body = {
      name: v.name,
      type: 'html',
      parameter: [
        { type: 'template', key: 'html', value: htmlSnippet(v.tagFiringOption ?? 'BLANK_OMIT') },
        { type: 'boolean', key: 'supportDocumentWrite', value: 'false' }
      ],
      firingTriggerId
    };
    if (v.tagFiringOption != null) {
      body.tagFiringOption = v.tagFiringOption;
    }
    const created = await gtm.createTag(ACCOUNT, CONTAINER, WS, body);
    console.log(
      'Created',
      created.name,
      'id=',
      created.tagId,
      'returned tagFiringOption=',
      created.tagFiringOption === undefined ? '(undefined/absent)' : JSON.stringify(created.tagFiringOption)
    );
    results.push(created);
    await sleep(1500);
  }

  // 再取得してフィールド有無を確定
  console.log('\n=== GET each tag (API raw) ===');
  for (const t of results) {
    const full = await gtm.getTag(ACCOUNT, CONTAINER, WS, t.tagId);
    console.log({
      name: full.name,
      tagId: full.tagId,
      hasTagFiringOptionKey: Object.prototype.hasOwnProperty.call(full, 'tagFiringOption'),
      tagFiringOption: full.tagFiringOption ?? null,
      firingTriggerId: full.firingTriggerId
    });
    await sleep(800);
  }

  // Preview
  console.log('\n=== quick_preview ===');
  const preview = await gtm.quickPreview(ACCOUNT, CONTAINER, WS);
  console.log(JSON.stringify(preview, null, 2));

  console.log('\nWorkspace URL:');
  console.log(
    `https://tagmanager.google.com/#/container/accounts/${ACCOUNT}/containers/${CONTAINER}/workspaces/${WS}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
