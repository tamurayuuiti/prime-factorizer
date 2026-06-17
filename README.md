# 素因数分解計算機

React + Vite による素因数分解アプリケーションです。

試し割り法・ミラーラビン素数判定・Pollard's Rho 法・ECM 法を組み合わせ、大きな整数の素因数分解をブラウザ上で実行します。

---

## 技術スタック

* React
* Vite
* Tailwind CSS
* BigInt
* Web Worker

---

## ディレクトリ構成

```text
prime-factorizer/
├── public/
│   └── data/          # 素数データ
│
├── src/
│   ├── algorithms/    # 素因数分解アルゴリズム
│   ├── components/    # UIコンポーネント
│   ├── hooks/         # カスタムフック
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── vite.config.js
└── README.md
```

---

## セットアップ

### 1. 依存関係インストール

```bash
npm install
```

### 2. 開発サーバ起動

```bash
npm run dev
```

デフォルト

```text
http://localhost:5173
```

---

## ビルド

```bash
npm run build
```

ビルド成果物は

```text
dist/
```

へ出力されます。

---

## 動作フロー

1. 素数データを読み込み
2. 入力値を検証
3. 試し割り法で小因数を除去
4. ミラーラビン法で素数判定
5. 合成数の場合は因数分解アルゴリズムを実行
6. 素因数分解結果を表示

---

## 使用アルゴリズム

### Trial Division

小さな素因数を高速に除去するための試し割り法。

### Miller–Rabin

確率的素数判定アルゴリズム。

### Pollard's Rho

比較的小さな合成数に対して効率的な因数分解アルゴリズム。

### ECM (Elliptic Curve Method)

大きな整数の因数分解を目的とした楕円曲線法。

Web Worker を利用して並列実行されます。

---

## 入力仕様

* 整数のみ
* 2以上
* 最大30桁

---

## デプロイ

Vercel を想定しています。

GitHub リポジトリと連携することで、Push 時に自動ビルド・自動デプロイが実行されます。

---

## 開発メモ

* 素因数分解アルゴリズムは `src/algorithms` に配置する
* UI コンポーネントは `src/components` に配置する
* 計算制御ロジックは `src/hooks` に集約する
* 素数データは `public/data` に配置する
* Web Worker 関連処理はアルゴリズム実装の近くに配置する