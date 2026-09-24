# 104 Nest.js 員工資料管理

使用 Nest.js 實作員工資料管理、登入驗證與角色權限控制，並提供 Vue 3 前端與 Swagger 方便操作與測試。

## 技術

### Backend

- Nest.js
- TypeScript
- TypeORM
- better-sqlite3
- JWT
- bcryptjs
- class-validator
- Swagger
- Vitest

### Frontend

- Vue 3
- TypeScript
- Vue Router
- Element Plus
- Vite

## 功能

### 員工管理

- 員工列表
- 員工條件搜尋
- Pagination
- 員工詳細資料
- 新增員工
- 修改員工
- 員工狀態 `ACTIVE / INACTIVE`

搜尋條件：

- 姓名：模糊搜尋
- Email：模糊搜尋
- 部門：精確搜尋
- 職稱：模糊搜尋
- 狀態：精確搜尋

本專案不提供 DELETE API，離職員工以 `INACTIVE` 狀態保留資料。

## 登入與權限

使用 JWT Authentication。

Token 有效時間：

```text
Access Token  : 1 小時
Refresh Token : 30 天
```

提供兩種角色：

| Role       | 查詢 | 新增 | 修改 |
| ---------- | ---- | ---- | ---- |
| `readonly` | ✅   | ❌   | ❌   |
| `admin`    | ✅   | ✅   | ✅   |

Backend 使用 `AuthGuard` 與 `RolesGuard` 驗證權限。

Frontend 收到 `401` 時會使用 Refresh Token 重新取得 Access Token，再重新送出原本的 Request。

## Demo 帳號

```text
Admin
Email: admin@example.com
Password: Admin123!

Readonly
Email: readonly@example.com
Password: Readonly123!
```

## 專案結構

```text
src/
├─ auth/
├─ common/
├─ employees/
├─ users/
├─ app.module.ts
└─ main.ts

frontend/
docs/
test/
```

Backend 主要資料流程：

```text
Controller
    ↓
Guard / DTO Validation
    ↓
Service
    ↓
TypeORM Repository
    ↓
SQLite
```

## Validation

使用 Nest.js `ValidationPipe` 與 `class-validator`。

主要驗證：

- 必填欄位
- Email 格式
- 台灣身分證格式
- National ID 不可重複
- Email 不可重複
- 日期格式
- Status Enum
- Pagination 範圍

## HTTP Status

| Status | 說明                      |
| ------ | ------------------------- |
| `200`  | 查詢或修改成功            |
| `201`  | 新增成功                  |
| `400`  | Request / Validation 錯誤 |
| `401`  | 未登入或 Token 無效       |
| `403`  | 權限不足                  |
| `404`  | 找不到資料                |
| `409`  | 資料重複                  |

## 安裝

```bash
npm install
```

建立環境變數：

```powershell
Copy-Item .env.example .env
```

## 啟動 Backend

```bash
npm run start:dev
```

Backend：

```text
http://localhost:3000
```

Swagger：

```text
http://localhost:3000/api
```

## 啟動 Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend：

```text
http://localhost:5173
```

## 測試

Backend：

```bash
npm run build
npm run test
```

目前測試結果：

```text
Test Files  2 passed
Tests       12 passed
```

Frontend：

```bash
cd frontend
npm run build
```

## 閱讀順序

建議先從 API 入口了解功能，再往 Service 與資料層閱讀：

```text
employees.controller.ts
↓
employees/dto/
↓
employees.service.ts
↓
employee.entity.ts
↓
auth/
```

## API 文件

Swagger：

```text
http://localhost:3000/api
```

詳細文件：

```text
docs/API.md
docs/TESTING.md
```

## 補充說明

目前 SQLite 使用 `synchronize: true`，方便本機開發時快速建立資料表；正式環境應改用 Migration。

Refresh Token 目前採 Stateless JWT，正式環境可再加入 Token rotation、revoke 與持久化機制。

National ID 為敏感資料，正式環境應再考慮加密、權限與 Audit Log。
