# Huong Dan Su Dung BCTTG API

Tai lieu nay huong dan van hanh, su dung va khai thac API BCTTG theo cach thuc te de ban co the:
- chay he thong nhanh bang Docker Compose,
- dang nhap bang `phone + password`,
- test API bang Swagger/cURL,
- quan ly du lieu (content, song, profile, note, media, user),
- xu ly cac loi van hanh thuong gap.

---

## 1) Tong quan he thong

Ung dung gom 2 thanh phan chinh:

1. `api` (Spring Boot 4, Java 17)
2. `mysql` (MySQL 8.3)

Chuc nang chinh:
- Quan ly tai khoan nguoi dung (role, trang thai, cap lai mat khau).
- Quan ly danh muc/noi dung truyen thong.
- Quan ly danh muc/bai hat.
- Quan ly ho so du lieu (`THU_TRUONG`, `CHIEN_SI`, `ANH_HUNG`).
- Quan ly ghi chu ca nhan theo tung tai khoan.
- Dashboard admin tong hop so lieu va trang thai he thong.
- Upload va quan ly media.
- Xac thuc JWT bang so dien thoai.
- Tai lieu API qua Swagger.

Cong nghe:
- Spring Boot, Spring Security, Spring Data JPA
- Flyway migration
- MySQL
- springdoc-openapi
- Docker Compose

---

## 2) URL truy cap mac dinh

Sau khi chay thanh cong:
- API base: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui`
- OpenAPI JSON: `http://localhost:8080/api-docs`
- MySQL host port: `localhost:3306`

Luu y:
- Swagger co the redirect sang `http://localhost:8080/swagger-ui/index.html`.

---

## 3) Chay nhanh bang Docker Compose (khuyen nghi)

### 3.1. Dieu kien
- Docker Engine
- Docker Compose

### 3.2. Chay lan dau

```bash
docker-compose down -v
docker-compose up -d --build
```

Kiem tra trang thai:

```bash
docker-compose ps
docker-compose logs --tail=200 api
```

Dieu kien thanh cong:
- `bcttg-api` o trang thai `Up`
- log co dong: `Started BcttgApplication`

### 3.3. Kiem tra DB da tao bang

```bash
docker exec -it bcttg-mysql mysql -ubcttg -pBcttg@2026 -D bcttg -e "SHOW TABLES;"
```

Ky vong co cac bang:
- `content_categories`
- `content_items`
- `data_profiles`
- `media_assets`
- `personal_notes`
- `song_categories`
- `songs`
- `system_audit_logs`
- `user_accounts`
- `user_profiles`
- `flyway_schema_history`

### 3.4. Kiem tra migration Flyway

```bash
docker exec -it bcttg-mysql mysql -ubcttg -pBcttg@2026 -D bcttg -e "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"
```

Luu y quan trong:
- Bang `flyway_schema_history` la bang bat buoc cua Flyway.
- Neu bang nay khong ton tai, migration chua chay.

---

## 4) Bien moi truong quan trong

File: `docker-compose.yml`

### MySQL
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

### API
- `SPRING_PROFILES_ACTIVE=docker`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=none`
- `SPRING_FLYWAY_ENABLED=true`
- `BCTTG_DB_NAME`
- `BCTTG_DB_USER`
- `BCTTG_DB_PASS`
- `BCTTG_JWT_SECRET`
- `BCTTG_MEDIA_ROOT`
- `BCTTG_MEDIA_BASE_URL`

Khuyen nghi production:
- doi toan bo password/secret.
- khong de gia tri mac dinh.

---

## 5) Co so du lieu va migration

Thu muc migration:
- `src/main/resources/db/migration/V1__init.sql`
- `src/main/resources/db/migration/V2__seed.sql`
- `src/main/resources/db/migration/V3__seed_update.sql`
- `src/main/resources/db/migration/V4__user_schema.sql`
- `src/main/resources/db/migration/V5__user_seed.sql`
- `src/main/resources/db/migration/V6__seed_real_data.sql`
- `src/main/resources/db/migration/V7__profile_note_dashboard_schema.sql`
- `src/main/resources/db/migration/V8__profile_note_dashboard_seed.sql`

Nguyen tac lam viec voi migration:
1. Khong sua file migration da chay tren moi truong dung.
2. Muon bo sung du lieu/schema thi tao file moi: `V7__...sql`, `V8__...sql`.
3. Sau khi tao file moi, restart `api` (hoac `docker-compose up -d --build`) de Flyway ap dung.

Reset du lieu local:

```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 6) Tai khoan dang nhap mac dinh (seed)

Du lieu seed trong `V5__user_seed.sql`:

| Role    | Phone       | Password      |
|---------|-------------|---------------|
| ADMIN   | 0900000001  | Admin@2026    |
| MANAGER | 0900000002  | Manager@2026  |
| USER    | 0900000003  | User@2026     |
| USER    | 0900000004  | User@2026     |
| USER    | 0900000005  | User@2026     |
| USER    | 0900000006  | User@2026     |

Luu y:
- He thong dang nhap theo `phone`, khong phai `username`.
- Mat khau seed dang de dang test, can doi truoc khi dua production.

---

## 7) Co che xac thuc va phan quyen

### 7.1. Dang nhap
Endpoint:
- `POST /api/v1/auth/login`

Request:

```json
{
  "phone": "0900000001",
  "password": "Admin@2026"
}
```

Response mau:

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "expiresInMinutes": 120,
    "roles": ["ROLE_ADMIN"]
  },
  "meta": null,
  "error": null
}
```

### 7.2. Gui token cho API can auth

Header:

```http
Authorization: Bearer <jwt_token>
```

### 7.3. Nhom endpoint khong can token
- `/api/v1/public/**`
- `/api/v1/auth/**`
- `/files/**`
- `/swagger-ui/**`
- `/api-docs/**`

### 7.4. Role thuc te
- `ADMIN`, `MANAGER`, `USER`
- Da so endpoint `admin`:
  - `GET` list/detail: cho phep `ADMIN`, `MANAGER`, `USER`.
  - `POST/PUT/PATCH/DELETE`: cho phep `ADMIN`, `MANAGER`.
- Rieng module `admin/users`:
  - `GET` list/detail: `ADMIN`, `MANAGER`.
  - `POST/PUT/PATCH/DELETE`: chi `ADMIN`.

---

## 8) Cau truc response chung

API tra ve format thong nhat:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "error": null
}
```

Khi loi:

```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Noi dung loi",
    "details": []
  }
}
```

Pagination (`meta`) khi list:
- `page`
- `page_size`
- `total_elements`
- `total_pages`

---

## 9) Danh sach endpoint theo nhom

## 9.1 Auth

| Method | Path | Auth | Mo ta |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Dang nhap bang phone/password, nhan JWT |

## 9.2 Public - Content

| Method | Path | Auth | Mo ta |
|---|---|---|---|
| GET | `/api/v1/public/content-categories` | Public | Danh sach danh muc noi dung cong khai |
| GET | `/api/v1/public/content-categories/{id}` | Public | Chi tiet danh muc cong khai |
| GET | `/api/v1/public/content-items` | Public | Danh sach bai viet cong khai |
| GET | `/api/v1/public/content-items/{id}` | Public | Chi tiet bai viet cong khai (tu tang view_count) |

## 9.3 Public - Song

| Method | Path | Auth | Mo ta |
|---|---|---|---|
| GET | `/api/v1/public/song-categories` | Public | Danh sach danh muc bai hat cong khai |
| GET | `/api/v1/public/song-categories/{id}` | Public | Chi tiet danh muc bai hat cong khai |
| GET | `/api/v1/public/songs` | Public | Danh sach bai hat cong khai |
| GET | `/api/v1/public/songs/{id}` | Public | Chi tiet bai hat cong khai |

## 9.4 Public - Data profile

| Method | Path | Auth | Mo ta |
|---|---|---|---|
| GET | `/api/v1/public/data-profiles` | Public | Liet ke ho so du lieu dang hien thi |
| GET | `/api/v1/public/data-profiles/{id}` | Public | Chi tiet ho so du lieu dang hien thi |

## 9.5 Public - Media file

| Method | Path | Auth | Mo ta |
|---|---|---|---|
| GET | `/files/**` | Public | Tai file media theo storage key |

## 9.6 Admin - Content category

| Method | Path | Role | Mo ta |
|---|---|---|---|
| GET | `/api/v1/admin/content-categories` | ADMIN/MANAGER/USER | Liet ke danh muc |
| POST | `/api/v1/admin/content-categories` | ADMIN/MANAGER | Tao danh muc |
| GET | `/api/v1/admin/content-categories/{id}` | ADMIN/MANAGER/USER | Chi tiet danh muc |
| PUT | `/api/v1/admin/content-categories/{id}` | ADMIN/MANAGER | Cap nhat danh muc |
| DELETE | `/api/v1/admin/content-categories/{id}` | ADMIN/MANAGER | Xoa danh muc |
| PATCH | `/api/v1/admin/content-categories/{id}/visibility` | ADMIN/MANAGER | Bat/tat hien thi |
| PATCH | `/api/v1/admin/content-categories/reorder` | ADMIN/MANAGER | Sap xep thu tu |

## 9.7 Admin - Content item

| Method | Path | Role | Mo ta |
|---|---|---|---|
| GET | `/api/v1/admin/content-items` | ADMIN/MANAGER/USER | Liet ke noi dung |
| POST | `/api/v1/admin/content-items` | ADMIN/MANAGER | Tao noi dung |
| GET | `/api/v1/admin/content-items/{id}` | ADMIN/MANAGER/USER | Chi tiet noi dung |
| PUT | `/api/v1/admin/content-items/{id}` | ADMIN/MANAGER | Cap nhat noi dung |
| DELETE | `/api/v1/admin/content-items/{id}` | ADMIN/MANAGER | Xoa noi dung |
| PATCH | `/api/v1/admin/content-items/{id}/visibility` | ADMIN/MANAGER | Bat/tat hien thi |
| PATCH | `/api/v1/admin/content-items/reorder` | ADMIN/MANAGER | Sap xep thu tu |
| POST | `/api/v1/admin/content-items/{id}/media` | ADMIN/MANAGER | Upload media lien quan |

## 9.8 Admin - Song category

| Method | Path | Role | Mo ta |
|---|---|---|---|
| GET | `/api/v1/admin/song-categories` | ADMIN/MANAGER/USER | Liet ke danh muc bai hat |
| POST | `/api/v1/admin/song-categories` | ADMIN/MANAGER | Tao danh muc bai hat |
| GET | `/api/v1/admin/song-categories/{id}` | ADMIN/MANAGER/USER | Chi tiet danh muc |
| PUT | `/api/v1/admin/song-categories/{id}` | ADMIN/MANAGER | Cap nhat danh muc |
| DELETE | `/api/v1/admin/song-categories/{id}` | ADMIN/MANAGER | Xoa danh muc |
| PATCH | `/api/v1/admin/song-categories/{id}/visibility` | ADMIN/MANAGER | Bat/tat hien thi |
| PATCH | `/api/v1/admin/song-categories/reorder` | ADMIN/MANAGER | Sap xep thu tu |

## 9.9 Admin - Song

| Method | Path | Role | Mo ta |
|---|---|---|---|
| GET | `/api/v1/admin/songs` | ADMIN/MANAGER/USER | Liet ke bai hat |
| POST | `/api/v1/admin/songs` | ADMIN/MANAGER | Tao bai hat |
| GET | `/api/v1/admin/songs/{id}` | ADMIN/MANAGER/USER | Chi tiet bai hat |
| PUT | `/api/v1/admin/songs/{id}` | ADMIN/MANAGER | Cap nhat bai hat |
| DELETE | `/api/v1/admin/songs/{id}` | ADMIN/MANAGER | Xoa bai hat |
| PATCH | `/api/v1/admin/songs/{id}/visibility` | ADMIN/MANAGER | Bat/tat hien thi |
| PATCH | `/api/v1/admin/songs/reorder` | ADMIN/MANAGER | Sap xep thu tu |

## 9.10 Admin - Media

| Method | Path | Role | Mo ta |
|---|---|---|---|
| POST | `/api/v1/admin/media` | ADMIN/MANAGER | Upload file media |
| GET | `/api/v1/admin/media/{id}` | ADMIN/MANAGER/USER | Lay thong tin media |
| DELETE | `/api/v1/admin/media/{id}` | ADMIN/MANAGER | Xoa media |

## 9.11 Admin - Data profile

| Method | Path | Role | Mo ta |
|---|---|---|---|
| GET | `/api/v1/admin/data-profiles` | ADMIN/MANAGER/USER | Liet ke ho so du lieu |
| POST | `/api/v1/admin/data-profiles` | ADMIN/MANAGER | Tao ho so du lieu |
| GET | `/api/v1/admin/data-profiles/{id}` | ADMIN/MANAGER/USER | Chi tiet ho so |
| PUT | `/api/v1/admin/data-profiles/{id}` | ADMIN/MANAGER | Cap nhat ho so |
| DELETE | `/api/v1/admin/data-profiles/{id}` | ADMIN/MANAGER | Xoa ho so |
| PATCH | `/api/v1/admin/data-profiles/{id}/visibility` | ADMIN/MANAGER | Bat/tat hien thi ho so |
| PATCH | `/api/v1/admin/data-profiles/reorder` | ADMIN/MANAGER | Sap xep thu tu ho so theo tung `profileType` |

## 9.12 Personal Notes

| Method | Path | Role | Mo ta |
|---|---|---|---|
| GET | `/api/v1/notes` | ADMIN/MANAGER/USER | Liet ke ghi chu cua chinh user dang dang nhap |
| POST | `/api/v1/notes` | ADMIN/MANAGER/USER | Tao ghi chu ca nhan |
| GET | `/api/v1/notes/{id}` | ADMIN/MANAGER/USER | Chi tiet ghi chu cua minh |
| PUT | `/api/v1/notes/{id}` | ADMIN/MANAGER/USER | Cap nhat ghi chu cua minh |
| DELETE | `/api/v1/notes/{id}` | ADMIN/MANAGER/USER | Xoa ghi chu cua minh |
| PATCH | `/api/v1/notes/{id}/pin` | ADMIN/MANAGER/USER | Ghim/bo ghim ghi chu |
| PATCH | `/api/v1/notes/{id}/archive` | ADMIN/MANAGER/USER | Luu tru/bo luu tru ghi chu |

## 9.13 Admin - Dashboard

| Method | Path | Role | Mo ta |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard/overview` | ADMIN/MANAGER | Tong hop so lieu dashboard admin |

## 9.14 Admin - Users

| Method | Path | Role | Mo ta |
|---|---|---|---|
| GET | `/api/v1/admin/users` | ADMIN/MANAGER | Liet ke tai khoan nguoi dung |
| GET | `/api/v1/admin/users/{id}` | ADMIN/MANAGER | Chi tiet tai khoan |
| POST | `/api/v1/admin/users` | ADMIN | Tao tai khoan moi |
| PUT | `/api/v1/admin/users/{id}` | ADMIN | Cap nhat thong tin tai khoan + profile |
| PATCH | `/api/v1/admin/users/{id}/active` | ADMIN | Khoa/mo khoa tai khoan |
| PATCH | `/api/v1/admin/users/{id}/role` | ADMIN | Doi role tai khoan |
| PATCH | `/api/v1/admin/users/{id}/reset-password` | ADMIN | Cap lai mat khau |
| DELETE | `/api/v1/admin/users/{id}` | ADMIN | Xoa mem tai khoan |

---

## 10) Query param dung chung cho list API

Nhieu endpoint list dung cung co che:
- `page` (bat dau tu 1, mac dinh 1)
- `page_size` (mac dinh 20, toi da 100)
- `sort` (ten field)
- `order` (`asc` | `desc`)

Query rieng theo module:
- Content/Song list: `q`, `is_visible`, `category_id`, `type` (tuy endpoint)
- Data profile list: `profileType` (`THU_TRUONG|CHIEN_SI|ANH_HUNG`), `q`, `is_visible`
- Personal notes list: `q`, `is_archived`
- User list: `q`, `role` (`ADMIN|MANAGER|USER`), `is_active`

Vi du:

```bash
curl "http://localhost:8080/api/v1/public/songs?page=1&page_size=10&sort=createdAt&order=desc"
```

---

## 11) Mau payload quan trong

### 11.1 Tao content category

```json
{
  "type": "TRUYEN_THONG",
  "parentId": null,
  "name": "Tin noi bo",
  "slug": "tin-noi-bo",
  "description": "Thong bao noi bo",
  "isVisible": true,
  "sortOrder": 1
}
```

Rule:
- Toi da 2 tang category.
- `slug` unique trong cung scope (`type + parent`).

### 11.2 Tao content item

```json
{
  "categoryId": 3,
  "title": "Thong bao so 01",
  "summary": "Noi dung tom tat",
  "bodyHtml": "<p>Noi dung day du</p>",
  "coverMediaId": 1,
  "isVisible": true,
  "sortOrder": 1,
  "publishedAt": "2026-02-06T07:00:00Z"
}
```

Rule:
- `categoryId` phai la category cap con (khong duoc la root).

### 11.3 Tao song

```json
{
  "categoryId": 2,
  "title": "Bai hat moi",
  "lyric": "Noi dung loi bai hat...",
  "audioMediaId": 4,
  "audioUrl": null,
  "durationSec": 180,
  "isVisible": true,
  "sortOrder": 1
}
```

Rule bat buoc:
- Chi duoc cung cap dung 1 trong 2 truong:
  - `audioMediaId`
  - `audioUrl`

Neu gui ca 2 hoac khong gui cai nao -> `BAD_REQUEST`.

### 11.4 Reorder (vi du song)

```json
{
  "categoryId": 2,
  "orders": [
    { "id": 10, "sortOrder": 1 },
    { "id": 12, "sortOrder": 2 }
  ]
}
```

### 11.5 Bat/tat hien thi

```json
{
  "isVisible": false
}
```

Neu tat category, he thong se tat hien thi cac muc con lien quan theo rule service.

### 11.6 Tao data profile

```json
{
  "profileType": "THU_TRUONG",
  "fullName": "Nguyen Van A",
  "position": "Chi huy truong",
  "unitName": "Bo chi huy trung doan",
  "rankName": "Thieu tuong",
  "heroTitle": null,
  "contactPhone": "0901222333",
  "birthDate": "1975-03-10",
  "hometown": "Ha Noi",
  "summary": "Thong tin tom tat",
  "biography": "<p>Tieu su day du</p>",
  "achievements": "<ul><li>Bang khen...</li></ul>",
  "avatarMediaId": 1,
  "isVisible": true,
  "sortOrder": 1
}
```

Rule:
- `profileType` bat buoc thuoc 1 trong 3 gia tri: `THU_TRUONG`, `CHIEN_SI`, `ANH_HUNG`.
- Neu khong truyen `sortOrder`, he thong tu gan max+1 theo `profileType`.

### 11.7 Reorder data profile

```json
{
  "profileType": "CHIEN_SI",
  "orders": [
    { "id": 3, "sortOrder": 1 },
    { "id": 4, "sortOrder": 2 }
  ]
}
```

Rule:
- Tat ca `id` trong `orders` phai cung `profileType`.

### 11.8 Tao personal note

```json
{
  "title": "Viec can lam trong tuan",
  "content": "Ra soat noi dung cho duyet.",
  "colorCode": "#FDE68A",
  "reminderAt": "2026-03-10T01:00:00Z",
  "isPinned": true
}
```

### 11.9 Patch pin/archive personal note

```json
{
  "value": true
}
```

### 11.10 Mau response dashboard overview (rut gon)

```json
{
  "summary": {
    "totalPosts": 156,
    "totalProfiles": 89,
    "totalSongs": 24,
    "totalAccounts": 42,
    "viewsToday": 1247,
    "editsToday": 18
  },
  "monthlyContent": [
    { "label": "T1", "value": 45 },
    { "label": "T2", "value": 52 }
  ],
  "contentDistribution": [
    { "label": "Truyen thong", "value": 31 },
    { "label": "Net tieu bieu", "value": 22 },
    { "label": "Ho so thu truong", "value": 12 },
    { "label": "Ho so chien si", "value": 37 },
    { "label": "Ho so anh hung", "value": 8 },
    { "label": "Ca khuc", "value": 24 }
  ],
  "weeklyVisits": [
    { "label": "T2", "value": 120 },
    { "label": "T3", "value": 145 }
  ],
  "recentActivities": [],
  "systemStatuses": [],
  "pendingItems": []
}
```

### 11.11 Tao user (admin)

```json
{
  "phone": "0900000010",
  "password": "User@2026",
  "role": "USER",
  "isActive": true,
  "profile": {
    "fullName": "Nguyen Van Moi",
    "position": "Chuyen vien",
    "unitName": "Phong Tong hop",
    "rankName": "Trung uy",
    "email": "moi.nguyen@bcttg.local",
    "address": "Ha Noi",
    "birthDate": "1995-10-20"
  }
}
```

Rule:
- `phone`: chi gom so, do dai 8-15.
- `password`: toi thieu 8 ky tu, phai co chu hoa + chu thuong + so.
- `profile.fullName` bat buoc.

### 11.12 Khoa/mo khoa user

```json
{
  "value": false
}
```

### 11.13 Doi role user

```json
{
  "role": "MANAGER"
}
```

### 11.14 Cap lai mat khau user

```json
{
  "newPassword": "Reset@2026"
}
```

Rule:
- Password moi cung dung policy nhu luc tao tai khoan.

---

## 12) Upload va phuc vu media

### 12.1 Upload media

```bash
curl -X POST "http://localhost:8080/api/v1/admin/media" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/path/to/file.jpg"
```

Response tra ve `id`, `url`, `storageKey`, `mimeType`, `sizeBytes`.

### 12.2 Truy cap file

File tra qua endpoint:
- `GET /files/{storageKey}`

Vi du:
- `http://localhost:8080/files/2026/02/06/uuid_file.jpg`

---

## 13) Su dung Swagger hieu qua

1. Mo `http://localhost:8080/swagger-ui`
2. Goi `POST /api/v1/auth/login` de lay token.
3. Bam `Authorize`.
4. Nhap JWT token vao truong bearer.
5. Thu cac endpoint admin.

Cac nhom tag hien thi:
- Auth
- Content Categories (Public/Admin)
- Content Items (Public/Admin)
- Data Profiles (Public/Admin)
- Song Categories (Public/Admin)
- Songs (Public/Admin)
- Media (Public/Admin)
- Personal Notes
- Dashboard (Admin)
- Users (Admin)

---

## 14) Kiem tra nhanh bang cURL

### 14.1 Dang nhap

```bash
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"0900000001\",\"password\":\"Admin@2026\"}"
```

### 14.2 Lay danh sach bai hat public

```bash
curl -i http://localhost:8080/api/v1/public/songs
```

### 14.3 Kiem tra user seed

```bash
docker exec -it bcttg-mysql mysql -ubcttg -pBcttg@2026 -D bcttg -e "SELECT phone, role, is_active FROM user_accounts;"
```

### 14.4 Lay danh sach data profile public

```bash
curl -i "http://localhost:8080/api/v1/public/data-profiles?profileType=THU_TRUONG&page=1&page_size=10"
```

### 14.5 Tao personal note (can token)

```bash
curl -i -X POST http://localhost:8080/api/v1/notes \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Viec can lam\",\"content\":\"Ra soat dashboard\",\"colorCode\":\"#BFDBFE\",\"isPinned\":true}"
```

### 14.6 Lay dashboard admin overview

```bash
curl -i http://localhost:8080/api/v1/admin/dashboard/overview \
  -H "Authorization: Bearer <TOKEN>"
```

### 14.7 Liet ke user (admin/manager)

```bash
curl -i "http://localhost:8080/api/v1/admin/users?page=1&page_size=20&role=USER&is_active=true" \
  -H "Authorization: Bearer <TOKEN>"
```

### 14.8 Tao user (admin)

```bash
curl -i -X POST http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"0900000010\",\"password\":\"User@2026\",\"role\":\"USER\",\"isActive\":true,\"profile\":{\"fullName\":\"Nguyen Van Moi\"}}"
```

### 14.9 Cap lai mat khau user (admin)

```bash
curl -i -X PATCH http://localhost:8080/api/v1/admin/users/10/reset-password \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"newPassword\":\"Reset@2026\"}"
```

---

## 15) Troubleshooting (cac loi thuong gap)

## 15.1 Loi `Schema validation: missing table ...`

Dau hieu:
- API `Exit 1`
- log co `missing table [content_categories]`

Nguyen nhan thuong gap:
- API validate schema truoc khi migration.
- DB volume cu/khong dong bo.

Xu ly:
1. Dam bao profile docker dang dung `ddl-auto: none` trong `application-docker.yml`.
2. Dam bao `SPRING_FLYWAY_ENABLED=true`.
3. Reset local:

```bash
docker-compose down -v
docker-compose up -d --build
```

## 15.2 Loi `Can't connect to MySQL server ...`

Kiem tra:
```bash
docker-compose ps
docker-compose logs --tail=200 mysql
```

Cho MySQL khoi dong xong roi moi query.

## 15.3 Loi login `User not found`

Kiem tra du lieu seed:

```bash
docker exec -it bcttg-mysql mysql -ubcttg -pBcttg@2026 -D bcttg -e "SELECT phone, role FROM user_accounts;"
```

Neu rong -> migration chua chay, quay lai muc 15.1.

## 15.4 Loi `Invalid character found in method name`

Nguyen nhan:
- Gui request HTTPS/TLS vao cong HTTP (8080).

Xu ly:
- dung `http://...:8080` khi goi truc tiep.
- neu dung HTTPS thi dat reverse proxy (Nginx) o truoc.

## 15.5 Loi compile `illegal character: '\ufeff'`

Nguyen nhan:
- File Java duoc luu dang UTF-8 BOM.

Xu ly:
- Luu lai file dang UTF-8 khong BOM.

## 15.6 Swagger tra 500 `/api-docs`

Kiem tra:
- log `api` de xem stack trace that.
- dam bao dependency springdoc tuong thich trong `pom.xml`.
- dam bao app khoi dong hoan toan truoc khi mo swagger.

## 15.7 Loi `Access denied for user 'root'@'localhost'`

Nguyen nhan:
- Mat khau root truyen vao lenh khong dung.
- Dang ket noi bang user `root` trong khi user app la `bcttg`.

Xu ly nhanh:
```bash
docker exec -it bcttg-mysql mysql -ubcttg -pBcttg@2026 -D bcttg -e "SHOW TABLES;"
```

Neu can dung root:
```bash
docker exec -it bcttg-mysql mysql -uroot -p<MYSQL_ROOT_PASSWORD> -e "SHOW DATABASES;"
```

## 15.8 Loi module Users (`403` / `400`)

Truong hop thuong gap:
- `MANAGER` goi API ghi (`POST/PUT/PATCH/DELETE`) cua `/api/v1/admin/users` -> `403`.
- `ADMIN` tu khoa/xoa/chuyen role chinh minh -> `403`.
- Password khong dat policy (thieu chu hoa/thuong/so, < 8 ky tu) -> `400`.
- `phone` khong hop le (khong phai so hoac do dai khong nam trong 8-15) -> `400`.

---

## 16) Van hanh production (khuyen nghi)

1. Dat JWT secret manh, khong commit secret that.
2. Doi toan bo password DB/seed user.
3. Chi mo cong cong khai can thiet:
   - mo `80/443` (neu dung Nginx),
   - han che/moi truong noi bo cho `3306`,
   - co the khong can mo `8080` ra internet neu da reverse proxy.
4. Bat HTTPS (Nginx + Let's Encrypt).
5. Backup dinh ky volume MySQL.
6. Theo doi log va canh bao tai nguyen container.

---

## 17) Lenh van hanh nhanh (cheat sheet)

```bash
# Build + start
docker-compose up -d --build

# Xem trang thai
docker-compose ps

# Xem log API
docker-compose logs --tail=200 api

# Xem log MySQL
docker-compose logs --tail=200 mysql

# Kiem tra bang DB
docker exec -it bcttg-mysql mysql -ubcttg -pBcttg@2026 -D bcttg -e "SHOW TABLES;"

# Reset sach du lieu local
docker-compose down -v
docker-compose up -d --build
```

---

Neu ban muon, toi co the viet them:
- bo tai lieu rieng cho Frontend (map endpoint + payload theo man hinh),
- bo Postman Collection,
- checklist release (dev -> staging -> production) theo quy trinh CI/CD.
