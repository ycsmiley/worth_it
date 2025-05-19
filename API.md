# 值不值 Bot API 互動機制

## 概述

值不值 Bot 使用 Supabase Edge Functions 作為後端 API，並整合了 Perplexity API 來進行產品分析。系統支援中文和英文雙語操作，會根據使用者的語言設定提供對應的分析結果。

## API 端點

### 產品分析 API

**端點**: `${SUPABASE_URL}/functions/v1/analyze-product`

#### 請求 (Request)

- **方法**: POST
- **標頭 (Headers)**:
  ```json
  {
    "Authorization": "Bearer ${SUPABASE_ANON_KEY}",
    "Content-Type": "application/json"
  }
  ```
- **請求內容 (Body)**:
  ```json
  {
    "query": "產品名稱或描述",
    "filter": "price" | "features" | "reviews" | null,
    "language": "zh" | "en"
  }
  ```

#### 回應 (Response)

- **成功回應 (200 OK)**:
  ```json
  {
    "name": "產品名稱",
    "category": "產品類別",
    "overview": "產品概述",
    "pros": ["優點1", "優點2"],
    "cons": ["缺點1", "缺點2"],
    "marketSentiment": {
      "score": 8.5,
      "description": "市場評價描述"
    },
    "bestFor": ["適用族群1", "適用族群2"],
    "considerations": ["考慮因素1", "考慮因素2"],
    "tags": ["price", "features", "reviews"]
  }
  ```

- **錯誤回應**:
  ```json
  {
    "error": "錯誤類型",
    "details": "錯誤詳細訊息",
    "type": "錯誤代碼"
  }
  ```

## 使用流程

1. **使用者輸入**:
   - 使用者在搜尋欄輸入產品名稱
   - 可選擇篩選標籤（價格/功能/評價）
   - 系統自動檢測當前使用語言

2. **前端處理**:
   - 驗證輸入內容
   - 設置載入狀態
   - 準備 API 請求

3. **API 呼叫**:
   - 發送 POST 請求到 Edge Function
   - 包含產品查詢、篩選條件和語言設定

4. **後端處理**:
   - Edge Function 接收請求
   - 驗證輸入參數
   - 呼叫 Perplexity API 進行分析
   - 根據語言設定格式化回應

5. **結果呈現**:
   - 前端接收 API 回應
   - 解析並顯示分析結果
   - 如果發生錯誤，顯示錯誤訊息

## 錯誤處理

- **400**: 無效的請求參數
- **401**: 未授權的 API 存取
- **429**: 超過 API 呼叫限制
- **500**: 伺服器內部錯誤

## 語言支援

系統會根據使用者界面的語言設定（`i18n.language`）自動調整：
- 中文界面：產生中文分析結果
- 英文界面：產生英文分析結果

## 安全性考量

- 使用 Supabase 提供的認證機制
- API 金鑰保護在環境變數中
- 請求參數驗證和清理
- 回應內容格式化和驗證