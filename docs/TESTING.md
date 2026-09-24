# 測試與驗證方式

本專案使用 Unit Test、Build Verification 與手動 API 驗證確認功能。

## Unit Test

測試框架：

```text
Vitest
```

執行：

```bash
npm run test
```

Windows PowerShell：

```powershell
npm.cmd run test
```

目前結果：

```text
Test Files  2 passed
Tests       12 passed
```

## EmployeesService

測試檔案：

```text
test/employees/employees.service.spec.ts
```

目前包含 6 個測試：

```text
建立員工成功並產生 employeeNo
National ID 重複時回傳 Conflict
使用 employeeNo 查詢員工
員工不存在時回傳 Not Found
修改為重複 Email 時回傳 Conflict
員工列表 Pagination
```

## AuthService

測試檔案：

```text
test/auth/auth.service.spec.ts
```

目前包含 6 個測試：

```text
登入成功
使用者不存在
密碼錯誤
Refresh Token 成功
Access Token 不可作為 Refresh Token
無效 Refresh Token
```

## Backend Build

執行：

```bash
npm run build
```

目前驗證結果：

```text
Build 成功
TypeScript 0 errors
```

## Frontend Build

執行：

```bash
cd frontend
npm run build
```

目前驗證結果：

```text
vue-tsc 成功
vite build 成功
```

Vite 目前有 bundle size warning，但不影響 Build 成功與本次作業功能。

## Authentication 手動驗證

已驗證：

```text
admin 登入成功
readonly 登入成功
錯誤登入資訊回傳 401
Refresh Token 可以取得新的 Token
Refresh 後角色保持正確
無效 Refresh Token 回傳 401
```

Token：

```text
Access Token  : 1 小時
Refresh Token : 30 天
```

## Authorization 手動驗證

| 情境                                    | 預期結果           |
| --------------------------------------- | ------------------ |
| 未登入 GET `/employees`                 | `401 Unauthorized` |
| readonly GET `/employees`               | `200 OK`           |
| readonly GET `/employees/:employeeNo`   | `200 OK`           |
| readonly POST `/employees`              | `403 Forbidden`    |
| readonly PATCH `/employees/:employeeNo` | `403 Forbidden`    |
| admin GET `/employees`                  | `200 OK`           |
| admin POST `/employees`                 | `201 Created`      |
| admin PATCH `/employees/:employeeNo`    | `200 OK`           |

權限由 Backend Guard 控制。

Frontend 的按鈕顯示僅作為 UI / UX 控制。

## Employee Validation

已驗證：

| 情境               | 預期結果          |
| ------------------ | ----------------- |
| 空 Request Body    | `400 Bad Request` |
| 無效台灣身分證字號 | `400 Bad Request` |
| National ID 重複   | `409 Conflict`    |
| Email 重複         | `409 Conflict`    |
| 找不到員工         | `404 Not Found`   |
| page = 0           | `400 Bad Request` |
| pageSize = 101     | `400 Bad Request` |

## 員工搜尋

姓名模糊搜尋：

```text
GET /employees?name=Test
```

Email 模糊搜尋：

```text
GET /employees?email=test
```

部門精確搜尋：

```text
GET /employees?department=RD
```

例如：

```text
department=R
```

不會匹配：

```text
department=RD
```

職稱模糊搜尋：

```text
GET /employees?jobTitle=Frontend
```

狀態精確搜尋：

```text
GET /employees?status=ACTIVE
```

## Pagination

已驗證：

```text
GET /employees?page=1&pageSize=1
```

Response pagination：

```json
{
  "page": 1,
  "pageSize": 1,
  "total": 1,
  "totalPages": 1
}
```

下一頁沒有資料時：

```text
GET /employees?page=2&pageSize=1
```

仍會正確保留：

```text
total
totalPages
```

## Swagger 驗證

Swagger：

```text
http://localhost:3000/api
```

已確認：

```text
Swagger UI 可以正常啟動
Login API 可以操作
Bearer Token Authorization 可以使用
Employee Query Parameter 可以使用 Try it out
page / pageSize 正確顯示為 number
```

## 前端驗證

已驗證：

```text
登入
員工列表
搜尋
Pagination
員工詳細資料
admin 新增員工
admin 修改員工
readonly 權限限制
登出
```

前端 API 已集中透過：

```text
frontend/src/api/http.ts
```

處理 Access Token。

收到 `401` 時會嘗試呼叫 Refresh API，成功後重新送出原 Request。

## HTTP Status

| Status | 說明                      |
| ------ | ------------------------- |
| `200`  | 查詢 / 修改成功           |
| `201`  | 新增成功                  |
| `400`  | Request / Validation 錯誤 |
| `401`  | Authentication 失敗       |
| `403`  | Authorization 權限不足    |
| `404`  | 找不到資料                |
| `409`  | Unique 欄位衝突           |

## 驗證策略

```text
Unit Test
    ↓
DTO Validation
    ↓
AuthGuard / RolesGuard
    ↓
Manual API Verification
    ↓
Swagger Verification
    ↓
Vue Frontend Verification
    ↓
Backend / Frontend Build
```

透過不同層級驗證 Service 商業邏輯、HTTP 行為、Authentication、Authorization 與實際使用流程。
