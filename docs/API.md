# API 規格

Base URL：

`http://localhost:3000`

## Swagger

啟動後端後，可透過 Swagger UI 查看 API：

`http://localhost:3000/api`

Swagger 提供目前專案 API endpoint 的互動式文件與測試介面。

## 驗證方式

所有員工 API 都需要 Access Token。

Request Header：

`Authorization: Bearer <accessToken>`

Token 有效時間：

- Access Token：1 小時
- Refresh Token：30 天

---

# Auth

## 登入

### POST `/auth/login`

使用 Email 與密碼登入。

### Request

```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

### Response

```json
{
  "accessToken": "<accessToken>",
  "refreshToken": "<refreshToken>",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### 錯誤

- `400 Bad Request`：Request 格式錯誤
- `401 Unauthorized`：Email 或密碼錯誤

---

## 更新 Token

### POST `/auth/refresh`

使用有效的 Refresh Token 取得新的 Access Token 與 Refresh Token。

### Request

```json
{
  "refreshToken": "<refreshToken>"
}
```

### Response

```json
{
  "accessToken": "<newAccessToken>",
  "refreshToken": "<newRefreshToken>",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### 錯誤

- `400 Bad Request`：Request 格式錯誤
- `401 Unauthorized`：Refresh Token 無效或已過期

---

# Employees

所有員工 API 都需要：

`Authorization: Bearer <accessToken>`

## 權限

| Role     | 員工列表 | 員工詳細資料 | 新增員工 | 修改員工 |
| -------- | -------- | ------------ | -------- | -------- |
| readonly | 可以     | 可以         | 不可以   | 不可以   |
| admin    | 可以     | 可以         | 可以     | 可以     |

---

## 員工列表

### GET `/employees`

取得員工列表，可搭配搜尋條件與分頁。

### Query Parameters

| 參數         | 型別                  | 說明              |
| ------------ | --------------------- | ----------------- |
| `name`       | string                | 模糊搜尋          |
| `email`      | string                | 模糊搜尋          |
| `department` | string                | 精確搜尋          |
| `jobTitle`   | string                | 模糊搜尋          |
| `status`     | `ACTIVE` / `INACTIVE` | 精確搜尋          |
| `page`       | number                | 預設 1            |
| `pageSize`   | number                | 預設 20，最大 100 |

### Example

`GET /employees?name=Test&department=RD&page=1&pageSize=20`

### Response

列表 API 僅回傳列表畫面需要使用的欄位。

```json
{
  "data": [
    {
      "employeeNo": "00001",
      "name": "Test User",
      "email": "test@example.com",
      "department": "RD",
      "jobTitle": "Frontend Engineer",
      "status": "ACTIVE",
      "hireDate": "2026-09-24"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Response

成功後回傳更新完成的員工完整資料，格式同：

`GET /employees/:employeeNo`

### 錯誤

- `400 Bad Request`：Query Parameter 格式錯誤
- `401 Unauthorized`：Access Token 不存在、無效或已過期

---

## 員工詳細資料

### GET `/employees/:employeeNo`

取得單一員工完整資料。

### Example

`GET /employees/00001`

### Response

```json
{
  "id": 1,
  "employeeNo": "00001",
  "name": "Test User",
  "nationalId": "A123456789",
  "email": "test@example.com",
  "department": "RD",
  "jobTitle": "Frontend Engineer",
  "status": "ACTIVE",
  "hireDate": "2026-09-24",
  "createdAt": "2026-09-24T00:05:42.000Z",
  "updatedAt": "2026-09-24T00:05:42.000Z"
}
```

`id` 為資料庫內部識別值。

前端操作員工資料時使用 `employeeNo` 作為識別值。

### 錯誤

- `401 Unauthorized`：Access Token 不存在、無效或已過期
- `404 Not Found`：找不到該員工

---

## 新增員工

### POST `/employees`

需要權限：

`admin`

`employeeNo` 由系統自動產生。

### 必填欄位

- `name`
- `nationalId`
- `hireDate`

### 選填欄位

- `email`
- `department`
- `jobTitle`
- `status`

如果沒有傳入 `status`，預設為：

`ACTIVE`

### Request

```json
{
  "name": "Test User",
  "nationalId": "A123456789",
  "email": "test@example.com",
  "department": "RD",
  "jobTitle": "Frontend Engineer",
  "status": "ACTIVE",
  "hireDate": "2026-09-24"
}
```

### Response

```json
{
  "id": 1,
  "employeeNo": "00001",
  "name": "Test User",
  "nationalId": "A123456789",
  "email": "test@example.com",
  "department": "RD",
  "jobTitle": "Frontend Engineer",
  "status": "ACTIVE",
  "hireDate": "2026-09-24",
  "createdAt": "2026-09-24T00:05:42.000Z",
  "updatedAt": "2026-09-24T00:05:42.000Z"
}
```

### Validation

- `nationalId` 必須為有效的台灣身分證字號
- `nationalId` 不可重複
- `email` 有填寫時必須符合 Email 格式
- `email` 不可重複
- `hireDate` 必須為有效日期格式
- DTO 未定義的欄位會被拒絕

### 錯誤

- `400 Bad Request`：資料驗證失敗
- `401 Unauthorized`：Access Token 不存在、無效或已過期
- `403 Forbidden`：角色沒有新增權限
- `409 Conflict`：`nationalId` 或 `email` 重複

---

## 修改員工

### PATCH `/employees/:employeeNo`

需要權限：

`admin`

只需要傳入要修改的欄位。

### Example

`PATCH /employees/00001`

### Request

```json
{
  "jobTitle": "Senior Frontend Engineer",
  "department": "Product Development"
}
```

選填欄位可以傳入 `null` 清除原本的值。

例如：

```json
{
  "jobTitle": null
}
```

### 錯誤

- `400 Bad Request`：資料驗證失敗
- `401 Unauthorized`：Access Token 不存在、無效或已過期
- `403 Forbidden`：角色沒有修改權限
- `404 Not Found`：找不到該員工
- `409 Conflict`：`nationalId` 或 `email` 重複

---

# 刪除員工

本系統刻意不提供 DELETE API。

考量員工資料可能需要保留歷史紀錄與稽核資訊，因此不直接刪除員工資料。

員工離職時保留資料，並將：

```json
{
  "status": "INACTIVE"
}
```

作為離職或停用狀態。
