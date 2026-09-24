# 測試與驗證

## Unit Test

使用 Vitest。

```bash
npm run test
```

目前結果：

```text
Test Files  2 passed
Tests       12 passed
```

測試檔案：

```text
test/auth/auth.service.spec.ts
test/employees/employees.service.spec.ts
```

主要驗證：

- 登入成功與失敗
- Access Token / Refresh Token
- 無效 Refresh Token
- 建立員工與員工編號
- National ID 重複
- Email 重複
- 員工查詢
- 找不到員工
- Pagination

## Build

Backend：

```bash
npm run build
```

Frontend：

```bash
cd frontend
npm run build
```

Backend 與 Frontend 均已完成 Build 驗證。

## 權限驗證

| 情境                 | 結果               |
| -------------------- | ------------------ |
| 未登入查詢員工       | `401 Unauthorized` |
| readonly 查詢員工    | `200 OK`           |
| readonly 新增 / 修改 | `403 Forbidden`    |
| admin 查詢員工       | `200 OK`           |
| admin 新增員工       | `201 Created`      |
| admin 修改員工       | `200 OK`           |

## Validation 驗證

已驗證：

- 必填欄位
- 台灣身分證格式
- National ID 重複
- Email 格式與重複
- 找不到員工
- Pagination 範圍

## 手動功能驗證

已透過 API、Swagger 與 Vue 前端確認：

- Login
- Refresh Token
- 員工列表與搜尋
- Pagination
- 員工詳細資料
- 新增員工
- 修改員工
- admin / readonly 權限
- 登出

Swagger：

```text
http://localhost:3000/api
```
