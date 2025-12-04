#!/usr/bin/env node

/**
 * すべてのテストを実行するリグレッションテストスクリプト
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const tests = [
  { name: 'test-auth.js', description: '認証テスト' },
  { name: 'test-accounts.js', description: 'アカウント一覧取得テスト' },
  { name: 'test-gtm.js', description: '基本GTMテスト' },
  { name: 'test-details.js', description: '詳細情報取得テスト' },
  { name: 'test-linkclick-trigger.js', description: 'linkClickトリガー作成テスト' },
  { name: 'test-create-trigger-filter.js', description: 'filter/autoEventFilterテスト' },
  { name: 'test-detailed-filters.js', description: '詳細フィルタ設定テスト' }
];

async function runAllTests() {
  console.log('='.repeat(80));
  console.log('リグレッションテスト開始');
  console.log('='.repeat(80));
  console.log('');

  const results = [];
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`[${i + 1}/${tests.length}] ${test.description} (${test.name})`);
    console.log('-'.repeat(80));

    try {
      const { stdout, stderr } = await execAsync(`node ${test.name}`, {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });

      // 成功の判定（エラーメッセージがない、または成功メッセージがある）
      const hasError = stderr.includes('✗') || stdout.includes('✗ エラー');
      const hasSuccess = stdout.includes('✓') && !hasError;

      if (hasSuccess && !hasError) {
        console.log(`✓ ${test.description}: 成功\n`);
        results.push({ test: test.name, status: 'PASS', error: null });
        passed++;
      } else {
        console.log(`✗ ${test.description}: 失敗`);
        if (stderr) console.log(stderr);
        if (stdout.includes('✗')) {
          const errorMatch = stdout.match(/✗[^\n]+/);
          if (errorMatch) console.log(errorMatch[0]);
        }
        console.log('');
        results.push({ test: test.name, status: 'FAIL', error: stderr || 'Unknown error' });
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${test.description}: エラー`);
      console.log(error.message);
      console.log('');
      results.push({ test: test.name, status: 'FAIL', error: error.message });
      failed++;
    }
  }

  console.log('='.repeat(80));
  console.log('テスト結果まとめ');
  console.log('='.repeat(80));
  console.log(`総テスト数: ${tests.length}`);
  console.log(`成功: ${passed}`);
  console.log(`失敗: ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('失敗したテスト:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.test}`);
    });
    console.log('');
  }

  console.log('='.repeat(80));
  
  if (failed === 0) {
    console.log('✓ すべてのテストが成功しました！');
    process.exit(0);
  } else {
    console.log('✗ 一部のテストが失敗しました。');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('テスト実行中にエラーが発生しました:', error);
  process.exit(1);
});

