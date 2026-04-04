# 🎌 animeViewer

個人のアニメ視聴リストを管理するWebアプリです。ブラウザだけで動作し、サーバー不要で使えます。

🌐 **[アプリを開く](https://hogehoge315.github.io/animeViewer/)**

---

## 📋 主な機能

- **アニメ管理** — タイトル・シーズン・評価・視聴ステータスなどを記録
- **AniList連携** — タイトルで検索してアニメ情報を自動入力
- **声優検索** — 声優名で検索して出演作品を一覧表示、そのままリストに追加可能
- **シーズン別表示** — 放送シーズンごとにアニメをグループ化して統計表示
- **絞り込み検索** — タイトル・声優・シーズン・視聴状態・評価などで絞り込み
- **データのエクスポート／インポート** — JSONファイルでバックアップ・復元
- **ローカル保存** — データはブラウザのlocalStorageに保存（サーバー不要）

---

## 🖥️ 画面一覧

| ページ | 説明 |
|--------|------|
| **ホーム** | アニメ一覧の表示・絞り込み検索 |
| **追加** | 新しいアニメを登録（AniList検索で自動入力対応） |
| **シーズン** | 放送シーズン別の一覧と統計情報 |
| **声優検索** | 声優名で検索して出演作品をリストに追加 |
| **設定** | JSONファイルへのエクスポート・インポート |

---

## 📝 視聴ステータス

- 👀 **視聴中** — 現在視聴しているアニメ
- ✅ **視聴済** — 見終わったアニメ
- ⏸ **視聴中断** — 途中でやめたアニメ
- 📋 **視聴予定** — これから見るアニメ

---

## 🚀 ローカルで動かす

```bash
# リポジトリをクローン
git clone https://github.com/hogehoge315/animeViewer.git
cd animeViewer

# 依存パッケージをインストール
npm install

# 開発サーバーを起動（http://localhost:5173）
npm run dev
```

---

## 🛠️ ビルド

```bash
npm run build
```

`dist/` フォルダにビルド済みファイルが生成されます。

---

## 🌐 デプロイ（GitHub Pages）

`main` ブランチにプッシュすると、GitHub Actionsが自動的にビルドして [GitHub Pages](https://hogehoge315.github.io/animeViewer/) にデプロイします。

---

## 🔧 技術スタック

- [React](https://react.dev/) 18
- [TypeScript](https://www.typescriptlang.org/) 5
- [Vite](https://vite.dev/) 6
- [React Router](https://reactrouter.com/) 6
- [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/)
