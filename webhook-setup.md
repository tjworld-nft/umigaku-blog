# Sanity Webhook Setup

## 1. Sanityでwebhookを設定

1. Sanity Studio にアクセス
2. **Manage** → **API** → **Webhooks** 
3. **Create webhook** をクリック
4. 以下を設定:
   - **Name**: `GitHub Actions Deploy`
   - **URL**: `https://api.github.com/repos/[ユーザー名]/[リポジトリ名]/dispatches`
   - **Dataset**: `production`
   - **HTTP method**: `POST`
   - **HTTP headers**:
     ```
     Authorization: token [GitHub Personal Access Token]
     Accept: application/vnd.github.v3+json
     Content-Type: application/json
     ```
   - **Payload**:
     ```json
     {
       "event_type": "sanity-update",
       "client_payload": {
         "dataset": "production"
       }
     }
     ```

## 2. GitHub Personal Access Token作成

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. **repo** スコープにチェック
4. トークンをコピーしてSanityのwebhook設定で使用

## 3. トリガー設定

- **Filter**: `_type == "post"`
- **Trigger on**: `create`, `update`, `delete`