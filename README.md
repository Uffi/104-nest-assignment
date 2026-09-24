# 104 Nest.js 員工資料管理作業

使用 Nest.js 實作員工資料管理、登入驗證與角色權限控制，並額外提供 Vue 3 前端與 Swagger，方便實際操作與驗證 API。

## 技術

### Backend

- Nest.js
- TypeScript
- TypeORM
- better-sqlite3
- JWT
- bcryptjs
- class-validator
- taiwan-id-validator
- Swagger
- Vitest

### Frontend

- Vue 3
- TypeScript
- Vue Router
- Element Plus
- Vite

## 專案結構

```text
src/
├─ auth/
│  ├─ decorators/
│  ├─ dto/
│  ├─ guards/
│  ├─ auth.controller.ts
│  ├─ auth.module.ts
│  └─ auth.service.ts
│
├─ employees/
│  ├─ dto/
│  ├─ entities/
│  ├─ employees.controller.ts
│  ├─ employees.module.ts
│  └─ employees.service.ts
│
├─ users/
│  ├─ entities/
│  ├─ enums/
│  ├─ users.module.ts
│  └─ users.service.ts
│
├─ common/
│  └─ validators/
│
├─ app.module.ts
└─ main.ts

frontend/
docs/
test/
```

## 架構與資料流程

主要 Request Flow：

```text
Vue Frontend
    ↓
HTTP API
    ↓
Controller
    ↓
AuthGuard / RolesGuard
    ↓
DTO Validation
    ↓
Service
    ↓
TypeORM Repository
    ↓
SQLite
```

### Module

以功能為單位拆分：

- `AuthModule`：登入、JWT、Refresh Token、權限驗證
- `EmployeesModule`：員工查詢、新增、修改
- `UsersModule`：登入帳號與角色資料

只有跨功能共用的內容放在 `common`，例如台灣身分證驗證器。

### Controller

負責接收 HTTP Request、取得 Body / Query / Param，並將資料交給 Service。

Controller 不處理主要商業邏輯。

### DTO

DTO（Data Transfer Object）用來描述 API 可以接收的資料格式。

搭配 `class-validator` 進行欄位驗證，例如：

- 必填欄位
- Email 格式
- 日期格式
- Enum
- Pagination 範圍
- 台灣身分證格式

### Service

負責主要商業邏輯，例如：

- 員工編號產生
- 重複資料檢查
- 搜尋條件
- 分頁
- 員工資料更新
- 登入驗證
- Token 產生

### Repository

透過 TypeORM Repository 存取 SQLite。

Controller 不直接操作資料庫。

## Employee 設計

資料欄位：

| 欄位         | 說明                             |
| ------------ | -------------------------------- |
| `id`         | DB internal primary key          |
| `employeeNo` | 對外使用的員工編號，例如 `00001` |
| `name`       | 姓名                             |
| `nationalId` | 台灣身分證字號                   |
| `email`      | Email                            |
| `department` | 部門                             |
| `jobTitle`   | 職稱                             |
| `status`     | `ACTIVE` / `INACTIVE`            |
| `hireDate`   | 到職日                           |
| `createdAt`  | 建立時間                         |
| `updatedAt`  | 更新時間                         |

`id` 為資料庫內部識別值。

API route 與前端操作使用 `employeeNo` 作為員工識別值。

`employeeNo` 在建立資料取得 DB id 後產生，例如：

```text
1 → 00001
2 → 00002
```

## 員工刪除策略

本專案不提供 DELETE API。

考量員工資料可能需要保留歷史與稽核紀錄，離職員工不直接刪除，而是將：

```json
{
  "status": "INACTIVE"
}
```

作為停用狀態。

## 搜尋

員工列表目前支援：

| 欄位         | 搜尋方式 |
| ------------ | -------- |
| `name`       | 模糊搜尋 |
| `email`      | 模糊搜尋 |
| `department` | 精確搜尋 |
| `jobTitle`   | 模糊搜尋 |
| `status`     | 精確搜尋 |

同時支援：

```text
page
pageSize
```

`pageSize` 最大為 100。

## Authentication

登入 API：

```text
POST /auth/login
```

登入成功後取得：

```text
Access Token
Refresh Token
```

Token 有效時間：

```text
Access Token  : 1 小時
Refresh Token : 30 天
```

Access Token 用於呼叫受保護 API。

Access Token 過期時，可使用：

```text
POST /auth/refresh
```

取得新的 Access Token 與 Refresh Token。

Vue 前端透過共用的 `apiFetch()` 處理 API Request。

當 API 回傳 `401` 時，會嘗試使用 Refresh Token 更新 Token，再重新送出原本的 Request。

若 Refresh Token 也失效，會清除登入資訊並回到登入頁。

## Authorization

系統提供兩種角色：

| Role       | 查看列表 | 查看詳細資料 | 新增 | 修改 |
| ---------- | -------- | ------------ | ---- | ---- |
| `readonly` | ✅       | ✅           | ❌   | ❌   |
| `admin`    | ✅       | ✅           | ✅   | ✅   |

權限由 Nest.js Guard 控制：

```text
AuthGuard
RolesGuard
```

前端依角色隱藏新增與修改按鈕只是 UX。

真正的權限判斷仍由 Backend Guard 負責。

## Demo 帳號

預設會建立：

```text
Admin
Email: admin@example.com
Password: Admin123!

Readonly
Email: readonly@example.com
Password: Readonly123!
```

密碼可以透過環境變數覆蓋。

密碼存入資料庫前會使用 bcrypt hash。

## Validation

Global `ValidationPipe` 設定：

```text
whitelist: true
forbidNonWhitelisted: true
transform: true
```

主要驗證包含：

- 姓名必填
- 身分證字號必填
- 台灣身分證格式與 checksum
- National ID 不可重複
- Email 格式
- Email 不可重複
- 到職日格式
- Status Enum
- Pagination 範圍
- 未定義欄位禁止傳入

## HTTP Status

| Status | 說明                      |
| ------ | ------------------------- |
| `200`  | 查詢或修改成功            |
| `201`  | 新增成功                  |
| `400`  | Request / Validation 錯誤 |
| `401`  | 未登入、Token 無效或過期  |
| `403`  | 已登入但權限不足          |
| `404`  | 找不到員工                |
| `409`  | National ID / Email 重複  |

## Swagger

啟動 Backend 後：

```text
http://localhost:3000/api
```

Swagger 可以查看：

- Endpoint
- Request Body
- Query Parameter
- 必填 / 選填欄位
- Enum
- HTTP Status
- Bearer Authentication

也可以直接使用 `Try it out` 測試 API。

詳細 API 規格：

```text
docs/API.md
```

## 環境變數

先建立 `.env`：

```bash
cp .env.example .env
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

環境變數範例請參考：

```text
.env.example
```

## 啟動 Backend

專案根目錄：

```bash
npm install
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

Backend Unit Test：

```bash
npm run test
```

目前：

```text
Test Files  2 passed
Tests       12 passed
```

Backend Build：

```bash
npm run build
```

Frontend Build：

```bash
cd frontend
npm run build
```

詳細測試項目：

```text
docs/TESTING.md
```

## 建議閱讀順序

第一次閱讀專案可以依照：

```text
README.md
↓
docs/API.md
↓
src/app.module.ts
↓
src/employees/employees.controller.ts
↓
src/employees/dto/
↓
src/employees/employees.service.ts
↓
src/employees/entities/employee.entity.ts
↓
src/auth/
↓
test/
↓
frontend/
```

可以先從 Controller 了解提供哪些 API，再從 DTO 看資料格式與驗證，最後進入 Service 看商業邏輯。

## 目前設計限制

此專案以作業展示與功能驗證為目的。

### Database

目前使用：

```text
synchronize: true
```

方便本機快速建立 SQLite schema。

正式環境應改用 Migration 管理資料庫版本。

### Refresh Token

目前 Refresh Token 採 Stateless JWT。

尚未實作：

```text
Refresh Token 儲存
Token rotation
Token revoke
登出後主動失效
```

正式環境可以將 Refresh Token hash 後保存於資料庫，並實作 rotation / revoke。

### National ID

本作業目前直接儲存 National ID。

正式環境處理個人敏感資料時，應進一步考量：

```text
Encryption at rest
Key management
存取權限
Audit log
資料遮罩
```

### Employee Number

目前使用 DB id 產生五碼 `employeeNo`。

這種方式適合作業展示。

正式系統若有跨系統、分散式建立資料或特定編碼規則，應改用獨立的員工編號產生策略。

## Bonus

本作業另外完成：

- 可執行 Nest.js 專案
- SQLite Database
- Swagger
- Unit Test
- Vue 3 操作介面
- Access Token / Refresh Token
- 前端自動 Refresh Token 流程
