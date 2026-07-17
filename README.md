# HỆ THỐNG TTS-VNA

---

## 1. Tổng quan dự án
Hệ thống quản lý thông tin và báo cáo chuyên dụng cho dự án **TTS-VNA**. 

Dự án được xây dựng theo hướng **Full-stack**, sử dụng **TypeScript** kết hợp với **NestJS** cho backend và **NextJS** cho frontend để code ổn định và hiệu quả hơn. Hệ thống có thể chạy cả trên môi trường máy cá nhân (Local) lẫn Docker, giúp việc quản lý, theo dõi dữ liệu và xử lý báo cáo trở nên thuận tiện và rõ ràng.

---

## 2. Yêu cầu hệ thống
*   **Node.js**: Phiên bản >= 18.
*   **npm** hoặc **pnpm**.
*   **Docker** & **Docker Compose** (Khuyên dùng cho môi trường Backend & Database).

---

## 3. Cấu hình môi trường (.env)

Hệ thống yêu cầu biến môi trường để kết nối Database và các dịch vụ thứ ba.

### A. Backend (`backend/.env`)
1. Di chuyển vào thư mục `backend/`.
2. Sao chép file mẫu: `cp .env.example .env`.
3. Cập nhật các thông tin cấu hình trong `.env`:

# Lưu ý: Khi chạy Docker, DB_HOST=postgres | Khi chạy Local, DB_HOST=localhost
```text
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_db_password
DB_NAME=VNADatabase

# App Configuration
PORT=3001
JWT_SECRET=your_jwt_secret_key

# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=vna_support@gmail.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### B. Frontend (`client/.env`)
1. Di chuyển vào thư mục `client/`.
2. Tạo file `.env` (hiện tại đã có sẵn file .env):
```text
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 4. Hướng dẫn chạy hệ thống

### A. Chạy Backend (`backend/`)
*   **Cách 1: Chạy bằng Docker (Khuyên dùng - Đây là cách mà nhóm áp dụng)**
    Cách này giúp đồng bộ Database và Backend giữa các thành viên.
    1. Tại thư mục gốc, chạy lệnh:
    ```bash
    docker-compose up -d --build
    ```
    2. Kiểm tra log của backend:
    ```bash
    docker-compose logs -f nest_backend
    ```

*   **Cách 2: Chạy Local (Phát triển/Debug)**
    1. Cài đặt PostgreSQL trên máy host và tạo database `VNADatabase`.
    2. Import file `backend/VNADatabase.sql` vào database.
    3. Di chuyển vào thư mục backend và cấu hình `DB_HOST=localhost` cùng mật khẩu database trong file `.env`:
    ```bash
    cd backend
    ```
    4. Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
    5. Khởi chạy server:
    ```bash
    npm run dev
    ```

### B. Chạy Frontend (`client/`)
Mặc dù dự án có sẵn Dockerfile trong thư mục client/ nhưng hệ thống hiện tại được thiết lập để chạy Frontend trực tiếp trên máy host nhằm thuận tiện cho việc phát triển và thay đổi giao diện.

Sau khi Backend đã hoạt động, thực hiện chạy Client như sau:

*   Mở Terminal mới và di chuyển vào thư mục `client/`:
    ```bash
    cd client
    ```

*   Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```

*   Khởi chạy ứng dụng:
    ```bash
    npm run dev
    ```

*   Truy cập hệ thống tại: `http://localhost:3000/login`

## 5. Build & Chạy Production (Triển khai thực tế)

> **Lưu ý:** 
>   Hiện tại đang comment dịch vụ **frontend** trong file **docker-compose.yml**. Nếu đã bỏ comment dịch vụ **frontend** trong file **docker-compose.yml**, Docker sẽ tự động build và chạy cả Backend lẫn Frontend. Khi đó, có thể bỏ qua toàn bộ các bước bên dưới.
>   Các bước dưới đây chỉ dành cho trường hợp chạy hệ thống trực tiếp trên máy chủ (không dùng Docker hoặc chỉ dùng Docker cho Backend & Database).

### A. Backend (`backend/`)
* Di chuyển vào thư mục backend, cài đặt gói và build mã nguồn:
    ```bash
    cd backend
    npm install
    npm run build
    ```
* Sau khi build xong (thư mục `dist/` được tạo), khởi chạy server:
    ```bash
    npm run start:prod
    ```

### B. Frontend (`client/`)
* Di chuyển vào thư mục client, cài đặt gói và build ứng dụng:
    ```bash
    cd client
    npm install
    npm run build
    ```
* Sau khi hoàn tất (thư mục `.next/` được tạo), khởi chạy server:
    ```bash
    npm run start
    ```

## 6. Kiểm thử & Thông tin bổ sung

*   **Tài liệu API:** 
    Sử dụng file `backend/docs/api-backend.json` để import vào **Postman** nhằm kiểm tra và gọi trực tiếp các endpoint của hệ thống.

*   **Dọn dẹp hệ thống:** 
    Để dừng và xóa toàn bộ các container đã khởi chạy bằng Docker, sử dụng lệnh:
    ```bash
    docker-compose down -v
    ```

## 7. Khắc phục sự cố thường gặp

*   **Backend không kết nối Database:** 
    Kiểm tra biến `DB_HOST` trong file `.env`: phải là `postgres` khi chạy **Docker**, hoặc `localhost` khi chạy **Local**. Hãy chắc chắn rằng Database đã được khởi chạy thành công.

*   **Cổng bị chiếm (Port conflict):** 
    Hệ thống yêu cầu cổng `3001` cho Backend. Nếu xảy ra lỗi, hãy kiểm tra xem có tiến trình nào đang sử dụng cổng này không (dùng lệnh `netstat` hoặc `lsof`), sau đó tắt tiến trình đó đi.

*   **Lỗi gửi Mail:** 
    Xác nhận `MAIL_PASS` trong `.env` là **App Password** (được tạo trong cài đặt Bảo mật của Google), không phải mật khẩu đăng nhập Gmail thông thường.

*   **Docker Build bị lỗi:** 
    Đảm bảo Docker Desktop đã khởi động. Nếu có thay đổi cấu trúc file, hãy chạy lại lệnh `docker-compose up -d --build` để hệ thống đồng bộ các thay đổi mới nhất.

*   **Không truy cập được trang `/login`:** 
    Đảm bảo Backend đã chạy ổn định và cổng `3001` không bị chặn bởi tường lửa. Sau đó, truy cập trực tiếp địa chỉ: `http://localhost:3000/login`