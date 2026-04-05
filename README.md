# 素因数分解計算機

ブラウザ上で動作する素因数分解ツールです。試し割り、ミラー・ラビン、Pollard's Rho、ECM法を組み合わせ、大きな整数の因数分解を行います。

## ディレクトリ構成

```text
prime-factorizer/
├── src/                    # 開発用ソースコード
│   ├── main.jsx            # Reactのエントリポイント
│   ├── App.jsx             # 状態管理・ロジック制御
│   ├── components/         # UIパーツ（コンポーネント）
│   │   ├── NumberInput.jsx
│   │   ├── CalculatingStatus.jsx
│   │   ├── ResultDisplay.jsx
│   │   └── ErrorMessage.jsx
│   ├── algorithms/         # 純粋な計算ロジック（JS）
│   │   ├── trial-division.js
│   │   ├── miller-rabin.js
│   │   ├── pollards-rho.js
│   │   └── ecm/
│   │       ├── ecm.js      # ECMメインロジック
│   │       └── ecm.worker.js # WebWorker実装
│   └── index.css           # Tailwind v4 設定
├── public/                 # 静的リソース
│   └── data/
│       └── primes.txt      # 試し割り用素数リスト
├── docs/                   # ビルド成果物（GitHub Pages用）
│   ├── index.html
│   ├── assets/
│   └── data/
├── index.html
├── vite.config.js
├── package.json
└── README.md
````

---

## 主要な挙動

### 概要

- **試し割り（小素数による除去）**
  - [`loadPrimes`](src/algorithms/trial-division.js) — primes.txt を読み込み素数配列を返す。
  - [`trialDivision`](src/algorithms/trial-division.js) — 素数 p に対し *p² > n* を停止条件に分解。

- **確率的素数判定（ミラー・ラビン）**
  - [`isPrimeMillerRabin`](src/algorithms/miller-rabin.js) — 確率的素数判定を実施。
  - [`powerMod`](src/algorithms/miller-rabin.js) — 高速累乗計算。

- **Pollard's Rho法（中規模な合成数向け）**
  - [`pollardsRhoFactorization`](src/algorithms/pollards-rho.js) — 再帰的な分解ループ管理。
  - Montgomery乗算による効率化。

- **ECM法（大規模な合成数向け）**
  - [`ecmFactorization`](src/algorithms/ecm.js) — 再帰的な因数分解。
  - [`ecmOneNumber`](src/algorithms/ecm.js) — ECM本体、複数ワーカーで並列実行。
  - 楕円曲線による確率的因数分解。

- **UI／制御フロー**
  - [`startFactorization`](src/main.js) — 因数分解の開始点。
  - 入力検証、進行状況表示、結果整形を担当。

### 起動フロー
1. `index.html` が読み込まれる。
2. `loadPrimes` が primes.txt を fetch して素数リストを準備。
3. ユーザーが数値を入力し「素因数分解を実行」を押す。
4. `startFactorization` が以下の順序で処理を実行：
   - 試し割り法で小因数を除去
   - 残りが素数なら終了、合成数なら次へ
   - 20桁以下ならPollard's Rho法、21桁以上ならECM法を実行
5. WebWorkerを並列稼働し、ECM法を高速化。
6. 結果と処理時間が UI に反映される。

## 注意点
- `primes.txt` は *fetch* するため、必ず **HTTP(s) サーバー経由**で開くこと（file:// では不可）。
- 大きな数は計算時間が大きく変動する。
- ECM法は WebWorker を利用するため、ブラウザによっては複数の Worker を起動できない場合がある。
- 入力可能な最大桁数は **30桁** です。