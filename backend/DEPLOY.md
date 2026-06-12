# Hướng dẫn chạy Backend 

Phiên bản ngắn: cấu hình môi trường → chạy local (dev) → build & chạy bằng Docker.

## Yêu cầu trước khi bắt đầu
- Node.js >= 18
- npm hoặc pnpm
- Docker & Docker Compose (nếu muốn chạy bằng container)

## 1) Lấy mã nguồn
Mở terminal và chạy:

```bash
git clone <repo-url>
cd tts-vna/backend
```

## 2) Thiết lập biến môi trường
Sao chép mẫu và chỉnh sửa giá trị cần thiết:

```bash
cp .env.example .env (Copy .env.example và đổi tên thành .env, sau đó thay thông tin các biến bên trong đó)
# Hoặc trên Windows PowerShell
# Copy-Item .env.example .env
```

Các biến quan trọng (ví dụ):

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `JWT_SECRET`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`

Lưu ý: file mẫu có thể đặt ở [backend/.env.example](backend/.env.example) nếu có.

## 3) Chạy ở chế độ phát triển (local)
1. Cài phụ thuộc:

```bash
npm install
```

2. Chạy ứng dụng trong chế độ dev (hot-reload):

```bash
npm run start:dev
```

Mặc định API sẽ chạy ở `http://localhost:3001` (kiểm tra `src/main.ts` nếu khác).

## 4) Chạy bằng Docker (build & chạy)
Từ thư mục gốc của dự án (chứa `docker-compose.yml`):

```bash
docker compose up -d --build
```

Các service chính:
- `nest_backend`: service backend
- `postgres_db`: Postgres

Xem log của service `nest_backend`:

```bash
docker compose logs -f nest_backend
```

Dừng và gỡ:

```bash
docker compose down -v
```

## 5) Kiểm thử API
- Mở Swagger (nếu đã bật): `http://localhost:3001/api-docs/`
- Hoặc dùng Postman / Insomnia để gọi endpoint

## 6) Vấn đề thường gặp & xử lý nhanh
- Kết nối DB thất bại: kiểm tra `DATABASE_*` trong `.env`, khởi động lại container DB, chờ vài giây rồi khởi động lại `api`.
- Port bị chiếm: kiểm tra bằng `netstat` hoặc lệnh tương đương, thay đổi cổng trong `.env` hoặc `src/configurations/app.config.ts`.
- Email không gửi được: kiểm tra thông tin `MAIL_*`, có thể bật logs mailer để debug.

## 7) Tệp cấu hình chính
- Cấu hình ứng dụng: [backend/src/configurations/app.config.ts](backend/src/configurations/app.config.ts)
- Cấu hình TypeORM: trong `TypeOrmModule.forRootAsync` (xem [backend/src/app.module.ts](backend/src/app.module.ts))

---