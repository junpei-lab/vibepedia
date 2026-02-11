# Vibepedia

Vibepedia は Astro で構築した Wikipedia 風サイトです。

## 開発

```bash
npm install
npm run dev
```

ローカル確認:

```bash
npm run build
npm run preview
```

## GitHub Pages 公開

このリポジトリには GitHub Pages 用の workflow を追加済みです。

- ファイル: `.github/workflows/deploy.yml`
- トリガー: `main` / `master` ブランチへの `push`（および手動実行）
- デプロイ先: GitHub Pages (`dist` をアップロード)

### GitHub 側で必要な設定

1. GitHub の `Settings` を開く
2. `Pages` を開く
3. `Build and deployment` の `Source` を `GitHub Actions` にする

これで `main` または `master` への push 後に自動公開されます。

### 公開 URL

- プロジェクトページ: `https://<owner>.github.io/<repo>/`
- ユーザーページ (`<owner>.github.io` リポジトリ): `https://<owner>.github.io/`

`astro.config.mjs` は `GITHUB_REPOSITORY` から `site` / `base` を自動計算するため、通常は追加設定不要です。

## 記事作成ルール

記事フォーマットや執筆規約は `docs/article-writing-rules.md` を参照してください。
