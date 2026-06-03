# 步步為盈 StepProfit 設計書

## 專題定位

步步為盈 StepProfit 是網頁程式期末專題，主題為個人記帳、儲蓄目標、朋友圈監督與留言牆。

## 核心資料

- `users`：使用者資料與每月預算
- `transactions`：收入與支出紀錄
- `goals`：儲蓄目標
- `goalDeposits`：目標存款紀錄
- `circles`：朋友圈
- `comments`：朋友圈留言牆

## 預計頁面

- 首頁儀表板
- 登入 / 註冊
- 交易紀錄
- 新增記帳
- 統計分析
- 儲蓄目標
- 朋友圈
- 留言牆
- 個人設定

## 實作重點

- React component 拆分
- Firebase Authentication 登入
- Firestore CRUD
- 使用 `userId` 區分每個人的資料
- 使用 `reduce` 計算統計資料
- 使用 Firestore 即時監聽留言
- RWD 手機版介面
