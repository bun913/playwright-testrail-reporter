---
name: release
description: "Create a new release by proposing a version bump, then tagging and pushing to trigger GitHub Actions."
allowed-tools: Bash(git:*)
---

# Release Skill

## Overview

バージョンを提案してユーザーに確認後、git タグを作成してプッシュする。
タグのプッシュで GitHub Actions（`.github/workflows/release.yml`）が起動し、
Takumi Guard でセキュアにした環境でビルド・publish が自動で行われる。

ローカルから `npm publish` は実行しない。publish は CI のみ。

## Step 1: 現状確認

以下を並行して確認する:

```bash
git describe --tags --abbrev=0
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

## Step 2: バージョン提案

コミット内容を分析して次のバージョンを提案し、**ユーザーの承認を得てから先に進む**。

| 変更内容 | バージョン種別 |
|---|---|
| breaking change / 大機能追加 | minor bump (例: 0.10.x → 0.11.0) |
| 機能追加・バグ修正・依存関係更新 | patch bump (例: 0.10.0 → 0.10.1) |

例:
```
直近のコミット:
- feat: support multiple TestRail case IDs
- chore: deps bump

提案バージョン: v0.11.0 (minor)
進めてよいですか？
```

## Step 3: タグ & プッシュ

承認後に実行:

```bash
git tag v<NEW_VERSION>
git push origin v<NEW_VERSION>
```

## Step 4: 完了報告

タグのプッシュで GitHub Actions（Release workflow）が起動することを伝える。
ビルド・publish は Takumi Guard 環境内で自動実行される。
