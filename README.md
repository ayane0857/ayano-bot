# ayano-bot

Discord botプロジェクト

## 概要

ayano-botは、Discord向けのボットアプリケーションです。

## 技術スタック

- **言語**: JavaScript
- **ランタイム**: Bun
- **データベース**: Prisma ORM
- **デプロイ**: ArgoCD

## ファイル構成

```
ayano-bot/
├── .github/          # GitHub Actions等の設定
├── argoCD/           # ArgoCD設定ファイル
├── commands/         # Discordコマンド
├── events/           # イベントハンドラー
├── prisma/           # Prismaスキーマとマイグレーション
├── index.js          # メインエントリーポイント
├── deploy.js         # コマンドデプロイスクリプト
├── bankupdate.js     # 銀行更新機能
├── functions.js      # ユーティリティ関数
├── package.json      # 依存関係
└── _env              # 環境変数テンプレート
```

## セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/ayane0857/ayano-bot.git
cd ayano-bot
```

2. 依存関係をインストール
```bash
bun install
```

3. 環境変数を設定
```bash
cp _env .env
# .envファイルを編集して必要な環境変数を設定
```

4. Prismaのセットアップ
```bash
bunx prisma generate
bunx prisma migrate deploy
```

## 実行

```bash
bun run index.js
```

## コマンドのデプロイ

```bash
bun run deploy.js
```

## ライセンス

未指定
```
