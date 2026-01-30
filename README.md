# 🎯 FocusFlow - Ứng dụng Quản lý Năng suất Thông minh

**FocusFlow** là một ứng dụng desktop mạnh mẽ giúp bạn tối ưu hóa thời gian làm việc, theo dõi hoạt động và cải thiện sự tập trung thông qua dữ liệu thực tế.

![FocusFlow Preview](public/logo.png)

## ✨ Tính năng chính

- **⏱️ Focus Sessions**: Chế độ làm việc tập trung (Pomodoro) tích hợp quản lý nhiệm vụ. Phân tích chính xác thời gian bạn đã dành cho từng công việc.
- **📊 Activity Tracking**: Tự động theo dõi các ứng dụng và cửa sổ bạn đang sử dụng theo thời gian thực để cung cấp cái nhìn toàn diện về thói quen làm việc.
- **📈 Insights & Analytics**: Biểu đồ trực quan về hoạt động hàng tuần, phân loại ứng dụng (Công việc, Giải trí, Liên lạc, v.v.) và tính điểm năng suất.
- **💡 AI Productivity Advice**: Cung cấp những lời khuyên cá nhân hóa dựa trên dữ liệu sử dụng thực tế của bạn để giúp bạn làm việc hiệu quả hơn.
- **🎨 Giao diện Hiện đại**: Thiết kế theo phong cách Dark Mode cao cấp, mượt mà với hiệu ứng Glassmorphism và micro-animations.

## 🚀 Công nghệ sử dụng

- **Frontend**: Vue 3, Vite, Pinia (State Management), Tailwind CSS, Lucide Icons.
- **Backend**: Electron (Desktop framework), Prisma (thao tác SQLite).
- **Cơ sở dữ liệu**: SQLite (Lưu trữ cục bộ, đảm bảo quyền riêng tư).
- **Activity Monitoring**: `active-win` để theo dõi tiến trình hệ thống.

## 🛠️ Cài đặt & Phát triển

### Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên)
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/Truong2005pt/FocusFlow.git
   cd FocusFlow
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Thiết lập cơ sở dữ liệu (Prisma):**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Chạy ứng dụng trong môi trường development:**
   ```bash
   npm run electron:dev
   ```

## 🔒 Quyền riêng tư
FocusFlow cam kết bảo vệ quyền riêng tư của bạn. Mọi dữ liệu về hoạt động ứng dụng và lịch sử làm việc đều được lưu trữ **cục bộ** trên máy tính của bạn thông qua cơ sở dữ liệu SQLite và không bao giờ được gửi lên máy chủ bên thứ ba.

## 📄 Giấy phép
Dự án này được phát hành dưới giấy phép ISC.

---
*Phát triển bởi [Bui Quang Truong](https://github.com/Truong2005pt)*