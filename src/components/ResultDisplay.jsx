// src/components/ResultDisplay.jsx
// 計算結果表示コンポーネント

import { Fragment } from "react";

export default function ResultDisplay({ finalResult, isCalculating }) {
  if (!finalResult || isCalculating) return null;

  // 結果のJSXフォーマット（X^Yの表現）
  const renderFactors = (factors) => {
    const strs = (Array.isArray(factors) ? factors : []).map(f =>
      typeof f === "bigint" ? f.toString() : String(f)
    );

    const numericStrs = strs.filter(s => /^[0-9]+$/.test(s));

    const counts = new Map();
    for (const s of numericStrs) {
      counts.set(s, (counts.get(s) || 0) + 1);
    }

    const sortedKeys = Array.from(counts.keys()).sort((a, b) =>
      BigInt(a) < BigInt(b) ? -1 : 1
    );

    const parts = sortedKeys.map((k) => {
      const c = counts.get(k);
      return (
        <Fragment key={k}>
          {k}{c > 1 && <sup>{c}</sup>}
        </Fragment>
      );
    });

    const nonNumeric = strs.filter(s => !/^[0-9]+$/.test(s));
    const allParts = [...parts, ...nonNumeric];

    return allParts.map((part, index) => (
      <Fragment key={index}>
        {part}
        {index < allParts.length - 1 && (
          <span aria-hidden="true"> × </span>
        )}
      </Fragment>
    ));
  };

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 animate-fade-in">
      <h3 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
        計算結果
      </h3>

      <div className="mb-4 text-sm text-gray-600">
        <span className="font-medium text-gray-800">
          処理時間:
        </span>{" "}
        <span className="font-mono text-gray-900 font-bold">
          {finalResult.time}
        </span>{" "}
        秒
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          素因数分解結果:
        </p>

        <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 shadow-inner">
          <p className="whitespace-pre-wrap font-mono text-lg text-gray-900 break-all max-h-62.5 overflow-y-auto">
            {renderFactors(finalResult.factors)}
          </p>
        </div>
      </div>
    </div>
  );
}