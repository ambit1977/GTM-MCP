/**
 * レート制限を守りつつ短時間で大量のAPI呼び出しを実行するユーティリティ
 *
 * 戦略:
 * - 並列実行（concurrency）で同時に N 件まで実行
 * - 1分あたりの上限（quotaPerMinute）を超えたらその分だけ待機してから次を実行
 * - これにより「60/分」などの制限内で、可能な限り並列化して短時間に完了させる
 */

/**
 * 配列を chunk に分割
 * @param {Array} arr
 * @param {number} size
 * @returns {Array[]}
 */
export function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * レート制限付きでタスクを並列実行する
 *
 * @param {Array<() => Promise<any>>} tasks - 引数なしで Promise を返す関数の配列
 * @param {Object} options
 * @param {number} [options.concurrency=10] - 同時実行数
 * @param {number} [options.quotaPerMinute=55] - 1分あたりの想定クォータ（余裕を持たせる）
 * @param {function(number, any)} [options.onProgress] - (完了数, 直近の結果) が呼ばれる
 * @returns {Promise<any[]>} 各タスクの結果（入力順）
 */
export async function runRateLimited(tasks, options = {}) {
  const concurrency = Math.min(options.concurrency ?? 10, 55);
  const quotaPerMinute = options.quotaPerMinute ?? 55;
  const onProgress = options.onProgress;

  const resultByIndex = new Map();
  const windowState = { startOfMinute: Date.now(), countThisMinute: 0 };
  let completedCount = 0;
  let nextIndex = 0;

  async function waitIfNeeded() {
    if (windowState.countThisMinute >= quotaPerMinute) {
      const elapsed = Date.now() - windowState.startOfMinute;
      const waitMs = Math.max(0, 60000 - elapsed);
      if (waitMs > 0) {
        await new Promise((r) => setTimeout(r, waitMs));
      }
      windowState.countThisMinute = 0;
      windowState.startOfMinute = Date.now();
    }
  }

  async function runOne(taskIndex, fn) {
    const result = await fn();
    windowState.countThisMinute++;
    completedCount++;
    if (onProgress) onProgress(completedCount, result);
    return result;
  }

  const executing = new Set();
  const pending = tasks.map((fn, i) => ({ fn, taskIndex: i }));

  return new Promise((resolve, reject) => {
    function onComplete(taskIndex, result) {
      resultByIndex.set(taskIndex, result);
      executing.delete(taskIndex);
      runNext();
    }

    async function runNext() {
      while (pending.length > 0 && executing.size < concurrency) {
        await waitIfNeeded();
        const { fn, taskIndex } = pending.shift();
        runOne(taskIndex, fn)
          .then((r) => {
            onComplete(taskIndex, r);
            return r;
          })
          .catch((err) => {
            onComplete(taskIndex, null);
            reject(err);
          });
        executing.add(taskIndex);
      }
      if (pending.length === 0 && executing.size === 0) {
        resolve(Array.from({ length: tasks.length }, (_, i) => resultByIndex.get(i)));
      }
    }

    runNext();
  });
}

/**
 * 指定件数だけ並列実行し、1分の枠を使い切ったら待機する
 * 短時間で大量作成する場合は concurrency を上げ、quotaPerMinute を API の制限より少し下に設定する
 */
export default { chunk, runRateLimited };
