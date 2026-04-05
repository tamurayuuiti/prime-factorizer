# 素因数分解計算機

ブラウザ上で動作する素因数分解ツールです。  
試し割り法・ミラーラビン・Pollard's Rho・ECM法を組み合わせ、大きな整数の因数分解を行います。

---

## 概要

* **フロントエンド**: React + Vite
* **スタイル**: Tailwind CSS v4
* **計算**: BigInt + WebWorker（並列処理）
* **公開**: GitHub Pages（`docs/` を使用）

---

## ディレクトリ構成

```text
prime-factorizer/
├── src/                    # 開発用ソースコード
│   ├── main.jsx            # Reactのエントリポイント
│   ├── App.jsx             # 画面全体のレイアウト・司令塔
│   ├── hooks/              # ロジック（カスタムフック）
│   │   └── useFactorization.js # 素因数分解の制御ロジック
│   ├── components/         # UIコンポーネント
│   │   ├── NumberInput.jsx
│   │   ├── CalculatingStatus.jsx
│   │   └── ResultDisplay.jsx
│   ├── algorithms/         # 素因数分解アルゴリズム
│   │   ├── trial-division.js # 試し割り法
│   │   ├── miller-rabin.js  # 素数判定（ミラーラビン）
│   │   ├── pollards-rho.js  # Pollard's Rho法
│   │   └── ecm/
│   │       ├── ecm.js       # ECM本体
│   │       └── ecm.worker.js # 並列処理Worker
│   └── index.css           # Tailwind設定
├── public/                 # 静的リソース
│   └── data/
│       └── primes.txt      # 試し割り用素数リスト
├── docs/                   # ビルド成果物（GitHub Pages用）
│   ├── index.html          # 公開用エントリポイント
│   ├── assets/             # ビルド済みJS/CSS
│   └── data/               # 公開用データ
├── index.html              # 開発用エントリHTML
├── vite.config.js          # Vite設定
├── package.json            # 依存関係・スクリプト設定
└── README.md
````

---

## 動作フロー

1. primes.txt を読み込み（試し割り用）
2. 数値入力
3. 試し割りで小因数を除去
4. 素数判定（ミラーラビン）
5. 合成数の場合：

   * 20桁以下 → Pollard's Rho
   * 21桁以上 → ECM法
6. 結果を表示

---

## 使用アルゴリズム

* 試し割り法（Trial Division）
* ミラー・ラビン素数判定
* Pollard's Rho 法
* ECM 法（楕円曲線法）

---

## 開発

```bash
npm install
npm run dev
```

* `src/` を編集
* ブラウザで動作確認（ホットリロード）

---

## ビルド / 公開

```bash
npm run build
```

* `docs/` に出力される
* GitHub Pages で `docs` を指定すれば公開可能

---

## 入力仕様

* 整数のみ
* 2以上
* 最大30桁

---

## 注意

* `primes.txt` は fetch するため **HTTPサーバー経由で実行する必要があります**
* `docs/` はビルド成果物のため **直接編集しない**
* 変更は `src/` 側で行う