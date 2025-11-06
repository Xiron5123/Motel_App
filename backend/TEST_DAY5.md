# 🧪 HƯỚNG DẪN TEST DAY 5 - CHAT & SOCKET.IO

## 📋 Chuẩn bị

### User IDs để test:
- **Renter:** `cmhn245dg00007ek4fjztv7bk` (renter@test.com)
- **Landlord:** `cmhn245gt00037ek4lefgz14c` (landlord@test.com)

### Passwords:
- Tất cả test accounts: `password123`

---

## PHẦN 1: TEST REST API (Swagger)

### Bước 1: Login
1. Mở Swagger: http://localhost:3000/api/docs
2. Tìm **Auth** → `POST /auth/login`
3. Login với **renter@test.com**:
```json
{
  "email": "renter@test.com",
  "password": "password123"
}
```
4. Copy `accessToken`
5. Click **Authorize** (góc phải) → Paste: `Bearer <token>`

### Bước 2: Tạo Conversation
1. Tìm **Chat** section
2. `POST /chat/conversations`:
```json
{
  "participantId": "cmhn245gt00037ek4lefgz14c"
}
```
3. **Lưu lại `id` của conversation** (dùng cho Socket.IO test)

### Bước 3: Gửi Messages qua REST
1. `POST /chat/conversations/{id}/messages`:
```json
{
  "content": "Xin chào, phòng trọ 123 Test Street còn trống không?"
}
```

### Bước 4: Xem Messages
1. `GET /chat/conversations/{id}/messages?limit=50`
2. Kết quả: Danh sách messages với sender info

### Bước 5: Xem List Conversations
1. `GET /chat/conversations`
2. Kết quả: List conversations với `lastMessage`

---

## PHẦN 2: TEST SOCKET.IO REALTIME

### Bước 1: Mở Test Client
1. Mở file trong browser:
```
D:\BaoCaoThucTap\Motel\backend\test-socket.html
```

### Bước 2: Kết nối User 1 (Renter)
1. **User ID:** `cmhn245dg00007ek4fjztv7bk`
2. Click **Connect**
3. Thấy: `✅ Connected to Socket.IO`
4. **Conversation ID:** Paste ID từ Swagger (Bước 2 của REST API)
5. Click **Join**
6. Thấy: `✅ Joined conversation: ...`

### Bước 3: Kết nối User 2 (Landlord)
1. **Mở tab mới hoặc Incognito mode** cùng file HTML
2. **User ID:** `cmhn245gt00037ek4lefgz14c`
3. Click **Connect**
4. **Conversation ID:** Paste CÙNG ID với User 1
5. Click **Join**

### Bước 4: Test Realtime Messaging
**Tab 1 (Renter):**
- Nhập: "Cho em hỏi giá phòng ạ?"
- Click **Send** (hoặc Enter)
- **Kết quả:** Tab 2 sẽ nhận ngay lập tức!

**Tab 2 (Landlord):**
- Nhập: "Dạ giá 2.5 triệu/tháng ạ"
- Click **Send**
- **Kết quả:** Tab 1 nhận message

### Bước 5: Test Typing Indicator
**Tab 1:**
- Click **Start Typing**
- **Kết quả:** Tab 2 hiển thị "1 người đang gõ..."
- Đợi 3 giây hoặc click **Stop Typing**
- **Kết quả:** Typing indicator biến mất

**Tab 2:**
- Làm tương tự
- Tab 1 thấy typing indicator

### Bước 6: Test với 3+ Users (Optional)
1. Mở thêm tabs với User IDs khác
2. Join cùng conversation
3. Tất cả users sẽ thấy messages realtime

---

## PHẦN 3: KIỂM TRA DATABASE

### Query trong pgAdmin:
```sql
-- Xem conversations
SELECT 
  c.id,
  c."lastMessageAt",
  u1.name as user1,
  u2.name as user2
FROM "Conversation" c
JOIN "ConversationParticipant" cp1 ON c.id = cp1."conversationId"
JOIN "User" u1 ON cp1."userId" = u1.id
JOIN "ConversationParticipant" cp2 ON c.id = cp2."conversationId" AND cp2."userId" != cp1."userId"
JOIN "User" u2 ON cp2."userId" = u2.id
ORDER BY c."lastMessageAt" DESC;

-- Xem messages
SELECT 
  m.id,
  m.content,
  m."sentAt",
  u.name as sender,
  c.id as conversation_id
FROM "Message" m
JOIN "User" u ON m."senderId" = u.id
JOIN "Conversation" c ON m."conversationId" = c.id
ORDER BY m."sentAt" DESC
LIMIT 20;
```

---

## 🎯 CHECKLIST TEST

### REST API
- [ ] Login thành công
- [ ] Tạo conversation với participantId
- [ ] Gửi message qua REST
- [ ] Lấy messages với pagination
- [ ] Xem danh sách conversations
- [ ] LastMessage hiển thị đúng

### Socket.IO
- [ ] Kết nối Socket.IO thành công
- [ ] Register user tự động join conversations
- [ ] Join conversation thủ công
- [ ] Gửi message realtime
- [ ] Nhận message realtime từ user khác
- [ ] Typing indicator xuất hiện/biến mất
- [ ] Typing status cập nhật khi có nhiều users
- [ ] Messages auto-scroll
- [ ] Disconnect/reconnect hoạt động

### Database
- [ ] Conversations được tạo với 2 participants
- [ ] Messages được lưu vào database
- [ ] lastMessageAt được cập nhật
- [ ] sentAt timestamp chính xác

---

## 🐛 TROUBLESHOOTING

### Lỗi: Cannot connect Socket.IO
**Giải pháp:**
```bash
# Kiểm tra backend đang chạy
netstat -ano | findstr :3000

# Restart backend nếu cần
npm run start:dev
```

### Lỗi: User not found in conversation
**Nguyên nhân:** Sai User ID hoặc chưa join conversation  
**Giải pháp:** Kiểm tra User ID trong pgAdmin

### Messages không realtime
**Nguyên nhân:** Chưa join conversation  
**Giải pháp:** Click **Join** button trước khi send

---

## 📊 KẾT QUẢ MONG ĐỢI

✅ **2 users chat realtime**  
✅ **Typing indicator cập nhật ngay lập tức**  
✅ **Messages lưu vào database**  
✅ **Last message preview trong conversation list**  
✅ **Auto-join conversations khi register**  
✅ **Pagination messages hoạt động**

---

## 🎉 TEST HOÀN TẤT!

Nếu tất cả checklist đều pass → Day 5 thành công!

**Next:** Day 6 - Backend QA (Validation, Rate Limiting, Tests)
