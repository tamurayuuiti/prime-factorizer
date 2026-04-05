import React, { useState, useEffect, useRef } from 'react';
import { isPrimeMillerRabin } from "./algorithms/miller-rabin.js";
import { trialDivision, loadPrimes } from './algorithms/trial-division.js';
import { pollardsRhoFactorization } from './algorithms/pollards-rho.js';
import { ecmFactorization } from './algorithms/ecm.js';

// ヘルパー関数: 利用可能なワーカー数を取得
const getWorkerCount = () => {
  const cpuCores = navigator.hardwareConcurrency || 4;
  if (cpuCores <= 8) return Math.max(1, cpuCores - 2);
  return Math.max(1, Math.floor(cpuCores * 0.6));
};

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("0.0");
  const [errorMessage, setErrorMessage] = useState("");
  const [finalResult, setFinalResult] = useState(null); // { factors: [], time: string }
  const [progressMsg, setProgressMsg] = useState("");

  const primesRef = useRef([]);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  // 初期化時に素数リストを読み込む
  useEffect(() => {
    const initPrimes = async () => {
      try {
        primesRef.current = await loadPrimes();
      } catch (e) {
        console.warn("素数リストの読み込みに失敗:", e);
      }
    };
    initPrimes();
  }, []);

  const updateProgress = () => {
    if (!startTimeRef.current) return;
    const elapsed = ((performance.now() - startTimeRef.current) / 1000).toFixed(1);
    setElapsedTime(elapsed);
    rafRef.current = requestAnimationFrame(updateProgress);
  };

  const getElapsedTimeStr = () => {
    if (!startTimeRef.current) return "0.000";
    return ((performance.now() - startTimeRef.current) / 1000).toFixed(3);
  };

  const startFactorization = async () => {
    if (isCalculating) return;

    setIsCalculating(true);
    setErrorMessage("");
    setFinalResult(null);
    setProgressMsg("");

    const inputValueTrimmed = String(inputValue).trim().replace(/[^0-9]/g, '');
    if (!inputValueTrimmed || BigInt(inputValueTrimmed) < 2n) {
      setErrorMessage("2以上の整数を入力してください");
      setIsCalculating(false);
      return;
    }

    const num = BigInt(inputValueTrimmed);
    console.log(`素因数分解を開始: ${num}`);

    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(updateProgress);

    try {
      if (isPrimeMillerRabin(num)) {
        const elapsed = getElapsedTimeStr();
        setFinalResult({ factors: [num], time: elapsed });
        console.log(`入力は素数: ${num}, 計算時間: ${elapsed} 秒`);
        return;
      }

      if (!Array.isArray(primesRef.current) || primesRef.current.length === 0) {
        primesRef.current = await loadPrimes();
      }
      if (!Array.isArray(primesRef.current) || primesRef.current.length === 0) {
        throw new Error("素数リストが空のため計算を続行できません");
      }

      console.log("試し割り法を実行します");
      // App.jsx 内の該当箇所
      let { factors, remainder } = trialDivision(num, primesRef.current, {
        progressCallback: (info) => {
          // オブジェクトから表示したい項目を抜き出して「文字列」にする
          if (info && typeof info === 'object') {
            const status = info.status || "計算中";
            const rem = info.remainder ? ` (残り: ${info.remainder})` : "";
            setProgressMsg(`${status}${rem}`); 
          } else {
            // もし文字列が渡された場合はそのままセット
            setProgressMsg(String(info));
          }
        }
      });

      console.log(`試し割り法完了。残りの数: ${remainder}`);

      if (remainder > 1n) {
        if (isPrimeMillerRabin(remainder)) {
          console.log(`残りの数: ${remainder} は素数と判定されました`);
          factors.push(remainder);
        } else {
          console.log(`残りの数: ${remainder} は合成数と判定されました`);
          const digitCount = remainder.toString().length;
          let extraFactors;
          const workerCount = getWorkerCount();
          console.log(`並列計算用のワーカー数: ${workerCount}`);

          if (digitCount <= 20) {
            console.log(`Pollard's rho を開始（残り ${digitCount} 桁）`);
            extraFactors = await pollardsRhoFactorization(remainder, workerCount);

            if (extraFactors === null) {
              console.warn(`Pollard's rho で因数を特定できませんでした。ECM に移行します`);
              extraFactors = await ecmFactorization(remainder, workerCount);
            }
          } else {
            console.log(`ECM を開始（残り ${digitCount} 桁）`);
            extraFactors = await ecmFactorization(remainder, workerCount);
          }

          if (!Array.isArray(extraFactors)) {
            const elapsed = getElapsedTimeStr();
            console.error(`内部エラー: アルゴリズムからの戻り値が不正です (経過時間: ${elapsed}s)`, extraFactors);
            setErrorMessage("計算に失敗しました");
            return;
          }

          if (extraFactors.includes("")) {
            const elapsed = getElapsedTimeStr();
            console.error(`計算中断: アルゴリズムが因数を特定できず終了しました (経過時間: ${elapsed}s)`);
            setErrorMessage("素因数を特定できませんでした");
            return;
          }

          factors = factors.concat(extraFactors);
        }
      }

      const elapsed = getElapsedTimeStr();
      setFinalResult({ factors, time: elapsed });
      console.log(`素因数分解完了: ${factors.join(" × ")}, 計算時間: ${elapsed} 秒`);

    } catch (error) {
      const elapsed = getElapsedTimeStr();
      console.error(`${error} (経過時間: ${elapsed}s)`);
      setErrorMessage("エラーが発生しました");
    } finally {
      setIsCalculating(false);
      cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 30);
    setInputValue(val);
    setErrorMessage("");
    setFinalResult(null);
  };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isButtonDisabled) startFactorization();
    }
  };

  // 結果のJSXフォーマット（X^Yの表現）
  const renderFactors = (factors) => {
    const strs = (Array.isArray(factors) ? factors : []).map(f => (typeof f === "bigint" ? f.toString() : String(f)));
    const numericStrs = strs.filter(s => /^[0-9]+$/.test(s));
    
    const counts = new Map();
    for (const s of numericStrs) counts.set(s, (counts.get(s) || 0) + 1);

    const sortedKeys = Array.from(counts.keys()).sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));

    const parts = sortedKeys.map((k) => {
      const c = counts.get(k);
      return (
        <React.Fragment key={k}>
          {k}{c > 1 && <sup>{c}</sup>}
        </React.Fragment>
      );
    });

    const nonNumeric = strs.filter(s => !/^[0-9]+$/.test(s));
    const allParts = [...parts, ...nonNumeric];

    return allParts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < allParts.length - 1 && <span aria-hidden="true"> × </span>}
      </React.Fragment>
    ));
  };

  const charCount = inputValue.length;
  let isButtonDisabled = isCalculating || charCount === 0;
  if (charCount > 0) {
    try {
      if (BigInt(inputValue) < 2n) isButtonDisabled = true;
    } catch {
      isButtonDisabled = true;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10 transition-all duration-300">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">素因数分解計算機</h2>

        <div className="mb-6">
          <label htmlFor="numberInput" className="block text-base font-medium text-gray-700 mb-2">
            計算したい数値を入力してください
          </label>
          <div className="relative">
            <input
              type="text"
              id="numberInput"
              placeholder="例: 123456789012345"
              className="w-full p-4 pr-24 border-2 border-gray-300 rounded-xl focus:ring-blue-600 focus:border-blue-600 transition duration-150 ease-in-out text-xl placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="30"
              autoComplete="off"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isCalculating}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
              <span>桁数:</span>&nbsp;
              <span className="font-semibold text-gray-700" aria-live="polite">{charCount}</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-yellow-800 bg-yellow-100 p-3 rounded-lg mb-6 border border-yellow-300">
          <p>※ 2以上の整数を入力してください。</p>
          <p>※ 入力可能な最大桁数は<strong>30桁</strong>です。</p>
          <p>※ 大きな数値は計算に時間がかかる場合があります。</p>
        </div>

        <button
          onClick={startFactorization}
          disabled={isButtonDisabled}
          className="w-full py-4 px-4 bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out disabled:opacity-50 disabled:bg-blue-400 disabled:cursor-not-allowed transform hover:scale-[1.005]"
        >
          素因数分解を実行
        </button>

        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded-xl" role="alert">
            {errorMessage}
          </div>
        )}

        {/* 計算中表示 */}
        {isCalculating && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-blue-600 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center">
              <div className="mr-3">
                <div className="animate-spin h-5 w-5 rounded-full border-4 border-blue-200 border-t-blue-600" aria-hidden="true"></div>
              </div>
              <span className="font-semibold">計算中...</span>
            </div>
            <div className="text-gray-600 text-sm whitespace-nowrap">
              （経過時間: <span className="font-mono">{elapsedTime}</span> 秒）
            </div>
            {/* 進行状況コールバックからのメッセージ（UIが許容すれば表示可能。元の仕様に合わせ非表示でも可） */}
            {progressMsg && <div className="text-xs text-gray-400 hidden">{progressMsg}</div>}
          </div>
        )}

        {/* 結果表示 */}
        {finalResult && !isCalculating && (
          <div className="mt-8 bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">計算結果</h3>
            <div className="mb-4 text-sm text-gray-600">
              <span className="font-medium text-gray-800">処理時間:</span>{" "}
              <span className="font-mono text-gray-900 font-bold">{finalResult.time}</span> 秒
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">素因数分解結果:</p>
              <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 shadow-inner">
                <p className="whitespace-pre-wrap font-mono text-lg text-gray-900 break-all max-h-62.5 overflow-y-auto">
                  {renderFactors(finalResult.factors)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}