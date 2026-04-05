// src/components/NumberInput.jsx
// 数値入力コンポーネント

export default function NumberInput({
  inputValue,
  handleInputChange,
  handleKeyDown,
  isCalculating,
  charCount,
  isButtonDisabled,
  startFactorization
}) {
  return (
    <>
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
    </>
  );
}