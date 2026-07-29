#!/usr/bin/env bash
# GitHub Actions の deploy.yml を発火して Xserver へ反映する。
# ローカルで npm run build する必要はない（Actions 側で Sanity から取得してビルドする）。
set -euo pipefail

REPO="tjworld-nft/umigaku-blog"

echo "🚀 デプロイを発火します（$REPO / deploy.yml）"
gh workflow run deploy.yml -R "$REPO"

# 起動直後は run が API に現れないことがあるので少し待つ
for _ in 1 2 3 4 5 6 7 8 9 10; do
  RUN_ID=$(gh run list -R "$REPO" -w deploy.yml -L 1 --json databaseId,status \
    --jq '.[] | select(.status != "completed") | .databaseId' 2>/dev/null || true)
  [ -n "${RUN_ID:-}" ] && break
  sleep 3
done

if [ -z "${RUN_ID:-}" ]; then
  echo "⚠️  実行中の run を特定できませんでした。手元で確認してください:"
  echo "    gh run list -R $REPO -L 3"
  exit 0
fi

echo "⏳ run #$RUN_ID を監視中..."
gh run watch "$RUN_ID" -R "$REPO" --exit-status

echo "✅ 反映完了: https://miura-diving.com/blog/"
