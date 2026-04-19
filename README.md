# 代理購入 請求/領収 Webアプリ

代理購入で立替えた金額の請求書・領収書を作成し、URL共有できるシンプルな Web アプリです。

## 機能

- 管理ページ: `/admin`
  - 請求書/領収書を作成
  - 作成後に共有URLを表示
- 共有ページ: `/share/{id}`
  - 作成した書類を閲覧
- データ保存: `data/documents.json`

## Docker で起動（Mac本体を汚さない）

```bash
docker compose up --build
```

起動後: `http://localhost:3000`

## 停止

```bash
docker compose down
```
