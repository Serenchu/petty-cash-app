# 零用金管理系統

## 🚀 Vercel 部署教學（三步驟）

### 步驟一：建立 GitHub 帳號並上傳專案

1. 前往 https://github.com 註冊帳號（免費）
2. 登入後點右上角「+」→「New repository」
3. Repository name 填入：`petty-cash-app`
4. 選擇「Public」，按「Create repository」
5. 下一頁按「uploading an existing file」
6. 把這個資料夾內的**所有檔案與資料夾**拖曳上去（包含 src 資料夾）
7. 按「Commit changes」

### 步驟二：部署到 Vercel

1. 前往 https://vercel.com 用 GitHub 帳號登入
2. 點「Add New Project」
3. 選擇剛剛建立的 `petty-cash-app` → 點「Import」
4. Framework Preset 選「Vite」
5. 按「Deploy」

等待約 1-2 分鐘，完成後會獲得一個網址，例如：
`https://petty-cash-app-xxxxx.vercel.app`

### 步驟三：分享給財務同仁

把網址傳給財務同仁即可，所有人用同一個網址開啟。

---

## ⚠️ 資料儲存說明

目前資料儲存在**各自瀏覽器的 localStorage**，如需多人共用同一份資料：
- 建議使用「⬇ 匯出 CSV」功能，將資料存成檔案分享
- 或告訴我，我可以幫你加入 Google Sheets 或 Firebase 後端實現真正的多人共用

## 功能說明

- 🔴 **紫焰有限公司**：所有非「創命」類別，含待撥補差額即時計算
- 🔵 **終極有限公司**：「創命」類別，含已撥補結餘計算
- 📦 **LALA運費儲值**：現金/信用卡預儲分開計算
- 新增/編輯/刪除紀錄
- 自訂類別
- 類別小計點擊篩選
- 搜尋功能
- 匯出 CSV
