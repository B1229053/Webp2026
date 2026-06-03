# 步步為盈 StepProfit

## 網頁程式期末專題

**專題名稱：** 步步為盈 StepProfit  
**學生姓名：** 顏羽婕  
**學號：** B1229053  

## 專題簡介

「步步為盈 StepProfit」是一個結合個人記帳、儲蓄目標、朋友監督與留言牆的網頁記帳系統。使用者可以在手機或電腦即時記錄收入與支出，設定想達成的目標物，例如新筆電、旅遊基金或生活預備金，並透過朋友圈功能讓朋友互相提醒與鼓勵。

本專題預計使用 React 建立前端介面，並使用 Firebase 作為後端服務，包含會員登入、雲端資料儲存與即時留言更新。

## 主要功能

### 1. 會員系統

- 使用者註冊帳號
- 使用者登入與登出
- 個人資料管理
- 設定每月預算
- 每位使用者只能查看與管理自己的完整記帳資料

### 2. 個人記帳

- 新增收入與支出
- 編輯交易紀錄
- 刪除交易紀錄
- 設定交易日期、金額、分類與備註
- 使用月份與分類篩選交易紀錄
- 手機端可即時新增記帳資料

### 3. 統計分析

- 顯示本月收入
- 顯示本月支出
- 顯示本月結餘
- 計算預算使用比例
- 顯示是否接近超支
- 顯示分類支出統計
- 顯示每日支出趨勢

### 4. 儲蓄目標

- 新增目標物，例如新筆電、旅遊基金
- 設定目標金額
- 記錄目前已存金額
- 顯示剩餘金額
- 顯示完成百分比
- 新增存款紀錄
- 編輯或刪除目標

### 5. 朋友圈監督

- 建立朋友圈
- 系統產生邀請碼
- 使用邀請碼加入朋友圈
- 查看圈內朋友的本月支出摘要
- 查看朋友的預算使用比例
- 只顯示統計摘要，不公開每筆明細

### 6. 留言牆

- 在朋友圈留言
- 對指定朋友留言
- 留言類型包含提醒、鼓勵與一般留言
- 顯示留言作者與留言時間
- 使用 Firebase 即時更新留言內容
- 使用者可刪除自己的留言

### 7. 匯出資料

- 匯出自己的記帳資料為 CSV
- 可使用 Excel 或 Google Sheets 開啟
- 方便備份與後續整理

### 8. 手機版使用

- 響應式網頁設計
- 手機版底部導覽列
- 快速記帳介面
- 可部署後由手機瀏覽器直接使用

## 預計使用技術

- React
- React Router
- Firebase Authentication
- Firebase Firestore
- Firebase Hosting 或 Vercel
- CSS RWD 響應式設計
- CSV 匯出

## 資料庫規劃

```txt
users
  uid
  name
  email
  monthlyBudget
  createdAt

transactions
  id
  userId
  type: income / expense
  amount
  category
  note
  date
  createdAt

goals
  id
  userId
  title
  targetAmount
  currentAmount
  targetDate
  note
  status
  createdAt
  updatedAt

circles
  id
  name
  inviteCode
  ownerId
  memberIds
  createdAt

comments
  id
  circleId
  targetUserId
  authorId
  authorName
  type: reminder / encouragement / normal
  content
  createdAt
```

## 活動圖

```mermaid
flowchart TD
  A([開始]) --> B{是否已登入}
  B -- 否 --> C[註冊或登入帳號]
  C --> D[進入首頁儀表板]
  B -- 是 --> D

  D --> E{選擇功能}

  E --> F[新增收入或支出]
  F --> G[寫入 Firestore transactions]
  G --> H[更新本月統計與圖表]
  H --> D

  E --> I[建立儲蓄目標]
  I --> J[輸入目標名稱與金額]
  J --> K[寫入 Firestore goals]
  K --> L[計算完成百分比與剩餘金額]
  L --> D

  E --> M[建立或加入朋友圈]
  M --> N{是否有邀請碼}
  N -- 有 --> O[加入指定朋友圈]
  N -- 無 --> P[建立新朋友圈並產生邀請碼]
  O --> Q[查看朋友支出摘要]
  P --> Q
  Q --> D

  E --> R[在留言牆留言]
  R --> S[選擇留言對象與留言類型]
  S --> T[寫入 Firestore comments]
  T --> U[即時更新朋友圈留言牆]
  U --> D

  E --> V[匯出 CSV]
  V --> W[下載個人記帳資料]
  W --> D

  D --> X([結束使用])
```

## 專題重點

本專題重點不只在完成畫面，而是說明每個功能如何實作：

- 如何使用 React Router 建立多頁式單頁應用
- 如何使用 Firebase Authentication 判斷登入狀態
- 如何使用 Firestore 儲存每位使用者的記帳資料
- 如何用 `userId` 隔離不同使用者資料
- 如何用 JavaScript 計算收入、支出、結餘與預算比例
- 如何設計朋友圈資料結構
- 如何只分享朋友的統計摘要，避免公開完整消費明細
- 如何用 Firestore 即時監聽留言牆
- 如何設計手機端也能使用的 RWD 介面
