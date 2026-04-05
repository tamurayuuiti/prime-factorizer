// src/App.jsx
// メインアプリケーションコンポーネント

import NumberInput from './components/NumberInput.jsx';
import CalculatingStatus from './components/CalculatingStatus.jsx';
import ResultDisplay from './components/ResultDisplay.jsx';
import { useFactorization } from './hooks/useFactorization.js';

export default function App() {
  const {
    inputValue,
    isCalculating,
    elapsedTime,
    errorMessage,
    finalResult,
    progressMsg,
    charCount,
    isButtonDisabled,
    handleInputChange,
    handleKeyDown,
    startFactorization
  } = useFactorization();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10 transition-all duration-300">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          素因数分解計算機
        </h2>

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
          <div
            className="mt-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 rounded-xl"
            role="alert"
          >
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