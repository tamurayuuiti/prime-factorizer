// src/components/AuthGate.jsx
// 計算中のステータス表示コンポーネント

export default function CalculatingStatus({ isCalculating, elapsedTime, progressMsg }) {
  if (!isCalculating) return null;

  return (
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
      {/* 進行状況コールバックからのメッセージ */}
      {progressMsg && <div className="text-xs text-gray-400 hidden">{progressMsg}</div>}
    </div>
  );
}