```
├── src/
│ ├── app/ # 🚦 ROUTING: Chỉ lo chia route (page, layout, loading, error, api).
│ ├── components/ # 🧩 GLOBAL UI: Nơi chứa Dumb Components dùng chung toàn app (Button, Input, Layout... xài Shadcn UI hay thư viện thì thả vô đây).
│ ├── features/ # ❤️ TRÁI TIM CỦA APP: Chia theo Domain/Chức năng.
│ ├── lib/ # ⚙️ CONFIG THƯ VIỆN: Setup bên thứ 3 (prisma, axios, auth.ts, queryClient).
│ ├── hooks/ # 🎣 GLOBAL HOOKS: Mấy hook xài chung như useDebounce, useClickOutside.
│ ├── api/ # 🌐 API CALLS: Nơi chứa các hàm gọi API (REST/GraphQL), tách biệt hoàn toàn khỏi UI.
│ ├── store/ # 📦 GLOBAL STATE: Zustand, Redux, Jotai...
│ ├── types/ # 🏷️ TYPESCRIPT: Khai báo interface, type dùng chung.
│ ├── utils/ # 🛠️ HELPER: Các pure functions như format tiền, format ngày tháng.
│ └── constants/ # 📌 HẰNG SỐ: Lưu magic strings, config file, regex...
├── public/ # Ảnh, fonts, svg...
├── .env # Biến môi trường
├── middleware.ts # Chặn route, auth, redirect (chạy trên Edge).
└── next.config.mjs # File config ruột của Next.js
```

```-Ví dụ bên trong features/auth/:
features/auth/
├── components/ # (LoginForm, RegisterForm)
└── types/ # (AuthResponse, UserData)
```

npm install @mui/material @emotion/react @emotion/styled @mui/material-nextjs @mui/icons-material
