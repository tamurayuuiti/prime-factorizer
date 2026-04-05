import { useState, useEffect, useRef } from 'react';
import { isPrimeMillerRabin } from "./algorithms/miller-rabin.js";
import { trialDivision, loadPrimes } from './algorithms/trial-division.js';
import { pollardsRhoFactorization } from './algorithms/pollards-rho.js';
import { ecmFactorization } from './algorithms/ecm/ecm.js';

import NumberInput from './components/NumberInput.jsx';
import CalculatingStatus from './components/CalculatingStatus.jsx';
import ResultDisplay from './components/ResultDisplay.jsx';

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
  const [finalResult, setFinalResult] = useState(null);
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
      let { factors, remainder } = trialDivision(num, primesRef.current, {
        progressCallback: (info) => {
          if (info && typeof info === 'object') {
            const status = info.status || "計算中";
            const rem = info.remainder ? ` (残り: ${info.remainder})` : "";
            setProgressMsg(`${status}${rem}`); 
          } else {
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

        <NumberInput
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          isCalculating={isCalculating}
          charCount={charCount}
          isButtonDisabled={isButtonDisabled}
          startFactorization={startFactorization}
        />

        {errorMessage && (
          <div className="mt-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded-xl" role="alert">
            {errorMessage}
          </div>
        )}

        <CalculatingStatus
          isCalculating={isCalculating}
          elapsedTime={elapsedTime}
          progressMsg={progressMsg}
        />

        <ResultDisplay
          finalResult={finalResult}
          isCalculating={isCalculating}
        />
      </div>
    </div>
  );
}