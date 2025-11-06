# HƯỚNG DẪN TEST API - MOTEL APP DAY 4

Làm theo từng bước để test toàn bộ tính năng đã phát triển.

---

## 📋 CHUẨN BỊ

### Bước 1: Kiểm tra Database
```powershell
# Kiểm tra Docker container có đang chạy không
docker ps

# Nếu chưa có container nào, start database
docker-compose up -d

# Đợi 5 giây để database khởi động
Start-Sleep -Seconds 5

# Chạy migrations
npx prisma migrate deploy
```

### Bước 2: Start Backend Server
```powershell
# Mở terminal 1 (để chạy server)
npm run start:dev

# Đợi đến khi thấy:
# ✅ Database connected
# 🚀 Application is running on: http://localhost:3000
# 📚 Swagger docs: http://localhost:3000/api/docs
```

**⚠️ LƯU Ý:** Giữ terminal này mở, KHÔNG tắt server.

---

## 🧪 TESTING

### Bước 3: Tạo Test Users (Terminal 2)
Mở terminal mới (Ctrl+Shift+` trong VS Code hoặc terminal mới)

```powershell
# Chạy script tạo users
.\seed-test-users.ps1
```

**Kết quả mong đợi:**
- ✅ Renter created: renter@test.com
- ✅ Upgraded to LANDLORD

**Nếu báo lỗi "already exist":** Không sao, users đã có sẵn rồi.

---

### Bước 4: Test APIs
Vẫn ở terminal 2, chạy:

```powershell
.\test-day4.ps1
```

**Script này sẽ test:**
1. ✅ Login RENTER
2. ✅ Login LANDLORD  
3. ✅ Landlord tạo listing
4. ✅ Renter thêm vào favorites
5. ✅ Lấy danh sách favorites
6. ✅ Renter tạo booking request
7. ✅ Landlord xem bookings
8. ✅ Landlord xem notifications
9. ✅ Landlord ACCEPT booking
10. ✅ Renter xem notifications
11. ✅ Check unread count
12. ✅ Mark all as read
13. ✅ Test REJECT flow
14. ✅ Xóa khỏi favorites

**Kết quả mong đợi:**
Mỗi bước hiển thị kết quả với màu xanh (Green) nếu thành công.

---

## 🔍 KIỂM TRA CHI TIẾT TỪNG API

### A. Test Auth APIs

#### 1. Register (Tạo user mới)
```powershell
$register = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -ContentType "application/json" -Body (@{
    email = "newuser@test.com"
    password = "password123"
    name = "New User"
    phone = "0912345678"
} | ConvertTo-Json)

# Xem kết quả
$register | ConvertTo-Json
```

**Kết quả:** Trả về user object với role RENTER mặc định.

---

#### 2. Login
```powershell
$login = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "renter@test.com"
    password = "password123"
} | ConvertTo-Json)

# Lưu token để dùng cho các request sau
$token = $login.accessToken
Write-Host "Token: $token"
```

**Kết quả:** Trả về accessToken và refreshToken.

---

### B. Test Listings APIs

#### 3. Tạo Listing (LANDLORD only)
```powershell
# Login landlord trước
$landlordLogin = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "landlord@test.com"
    password = "password123"
} | ConvertTo-Json)
$landlordToken = $landlordLogin.accessToken

# Tạo listing
$listing = Invoke-RestMethod -Uri "http://localhost:3000/listings" -Method Post -Headers @{
    Authorization = "Bearer $landlordToken"
} -ContentType "application/json" -Body (@{
    title = "Phòng trọ cao cấp Quận 1"
    description = "Phòng đầy đủ tiện nghi, gần trường ĐH"
    price = 3500000
    deposit = 3500000
    area = 30
    address = "123 Lê Lợi, Quận 1, TP.HCM"
    lat = 10.762622
    lng = 106.660172
    amenities = @("wifi", "parking", "elevator", "security")
} | ConvertTo-Json)

# Lưu listing ID
$listingId = $listing.id
Write-Host "Listing ID: $listingId"
```

---

#### 4. Xem danh sách Listings (Public)
```powershell
# Không cần token, public API
$listings = Invoke-RestMethod -Uri "http://localhost:3000/listings" -Method Get

Write-Host "Tổng số listings: $($listings.data.Count)"
$listings.data | Select-Object id, title, price | Format-Table
```

---

#### 5. Search & Filter
```powershell
# Tìm kiếm theo giá và amenities
$filtered = Invoke-RestMethod -Uri "http://localhost:3000/listings?minPrice=2000000&maxPrice=4000000&amenities=wifi,parking" -Method Get

$filtered.data | Select-Object title, price, amenities | Format-Table
```

---

### C. Test Favorites APIs

#### 6. Thêm vào Favorites (RENTER)
```powershell
# Login renter
$renterLogin = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "renter@test.com"
    password = "password123"
} | ConvertTo-Json)
$renterToken = $renterLogin.accessToken

# Thêm favorite
$favorite = Invoke-RestMethod -Uri "http://localhost:3000/favorites" -Method Post -Headers @{
    Authorization = "Bearer $renterToken"
} -ContentType "application/json" -Body (@{
    listingId = $listingId
} | ConvertTo-Json)

Write-Host "✅ Đã thêm vào favorites!"
```

---

#### 7. Xem Favorites
```powershell
$myFavorites = Invoke-RestMethod -Uri "http://localhost:3000/favorites" -Method Get -Headers @{
    Authorization = "Bearer $renterToken"
}

Write-Host "Số lượng favorites: $($myFavorites.Count)"
$myFavorites | Select-Object title, price, address | Format-Table
```

---

#### 8. Kiểm tra đã Favorite chưa
```powershell
$check = Invoke-RestMethod -Uri "http://localhost:3000/favorites/check/$listingId" -Method Get -Headers @{
    Authorization = "Bearer $renterToken"
}

Write-Host "Đã favorite: $($check.isFavorited)"
```

---

#### 9. Xóa khỏi Favorites
```powershell
$remove = Invoke-RestMethod -Uri "http://localhost:3000/favorites/$listingId" -Method Delete -Headers @{
    Authorization = "Bearer $renterToken"
}

Write-Host $remove.message
```

---

### D. Test Bookings APIs

#### 10. Tạo Booking Request (RENTER)
```powershell
$booking = Invoke-RestMethod -Uri "http://localhost:3000/bookings" -Method Post -Headers @{
    Authorization = "Bearer $renterToken"
} -ContentType "application/json" -Body (@{
    listingId = $listingId
    note = "Tôi muốn xem phòng vào thứ 7 tuần này. Liên hệ số 0901234567"
} | ConvertTo-Json)

$bookingId = $booking.id
Write-Host "Booking ID: $bookingId"
Write-Host "Status: $($booking.status)"
Write-Host "Listing: $($booking.listing.title)"
```

**Kết quả:** Status sẽ là PENDING.

---

#### 11. Renter xem Bookings của mình
```powershell
$renterBookings = Invoke-RestMethod -Uri "http://localhost:3000/bookings" -Method Get -Headers @{
    Authorization = "Bearer $renterToken"
}

Write-Host "Bookings của tôi: $($renterBookings.Count)"
$renterBookings | Select-Object id, status, @{N='Listing';E={$_.listing.title}} | Format-Table
```

---

#### 12. Landlord xem Bookings (cho listings của mình)
```powershell
$landlordBookings = Invoke-RestMethod -Uri "http://localhost:3000/bookings" -Method Get -Headers @{
    Authorization = "Bearer $landlordToken"
}

Write-Host "Bookings nhận được: $($landlordBookings.Count)"
$landlordBookings | Select-Object id, status, @{N='Renter';E={$_.renter.name}} | Format-Table
```

---

#### 13. Landlord ACCEPT Booking
```powershell
$accept = Invoke-RestMethod -Uri "http://localhost:3000/bookings/$bookingId/status" -Method Patch -Headers @{
    Authorization = "Bearer $landlordToken"
} -ContentType "application/json" -Body (@{
    status = "ACCEPTED"
} | ConvertTo-Json)

Write-Host "✅ Booking đã ACCEPT: $($accept.status)"
```

---

#### 14. Test State Machine - REJECT
```powershell
# Tạo booking mới
$booking2 = Invoke-RestMethod -Uri "http://localhost:3000/bookings" -Method Post -Headers @{
    Authorization = "Bearer $renterToken"
} -ContentType "application/json" -Body (@{
    listingId = $listingId
    note = "Booking thứ 2"
} | ConvertTo-Json)

# Landlord reject
$reject = Invoke-RestMethod -Uri "http://localhost:3000/bookings/$($booking2.id)/status" -Method Patch -Headers @{
    Authorization = "Bearer $landlordToken"
} -ContentType "application/json" -Body (@{
    status = "REJECTED"
} | ConvertTo-Json)

Write-Host "❌ Booking đã REJECT: $($reject.status)"
```

---

#### 15. Test State Machine Error (không cho thay đổi ACCEPTED)
```powershell
# Thử thay đổi booking đã ACCEPTED (sẽ fail)
try {
    $invalid = Invoke-RestMethod -Uri "http://localhost:3000/bookings/$bookingId/status" -Method Patch -Headers @{
        Authorization = "Bearer $landlordToken"
    } -ContentType "application/json" -Body (@{
        status = "REJECTED"
    } | ConvertTo-Json)
} catch {
    Write-Host "✅ Đúng! Không thể thay đổi status từ ACCEPTED" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)"
}
```

---

### E. Test Notifications APIs

#### 16. Landlord xem Notifications (sau khi renter tạo booking)
```powershell
$landlordNotifs = Invoke-RestMethod -Uri "http://localhost:3000/notifications" -Method Get -Headers @{
    Authorization = "Bearer $landlordToken"
}

Write-Host "Notifications: $($landlordNotifs.Count)"
$landlordNotifs | Select-Object type, @{N='message';E={$_.data.message}}, createdAt | Format-Table
```

---

#### 17. Renter xem Notifications (sau khi landlord accept/reject)
```powershell
$renterNotifs = Invoke-RestMethod -Uri "http://localhost:3000/notifications" -Method Get -Headers @{
    Authorization = "Bearer $renterToken"
}

Write-Host "Notifications: $($renterNotifs.Count)"
$renterNotifs | Select-Object type, @{N='message';E={$_.data.message}}, readAt | Format-Table
```

---

#### 18. Check Unread Count
```powershell
$unread = Invoke-RestMethod -Uri "http://localhost:3000/notifications/unread-count" -Method Get -Headers @{
    Authorization = "Bearer $renterToken"
}

Write-Host "Unread notifications: $($unread.unreadCount)"
```

---

#### 19. Mark Single Notification as Read
```powershell
# Lấy ID notification đầu tiên
$notifId = $renterNotifs[0].id

$markOne = Invoke-RestMethod -Uri "http://localhost:3000/notifications/$notifId/read" -Method Patch -Headers @{
    Authorization = "Bearer $renterToken"
}

Write-Host "✅ Marked as read"
```

---

#### 20. Mark All as Read
```powershell
$markAll = Invoke-RestMethod -Uri "http://localhost:3000/notifications/read-all" -Method Patch -Headers @{
    Authorization = "Bearer $renterToken"
}

Write-Host $markAll.message

# Kiểm tra lại unread count
$unreadAfter = Invoke-RestMethod -Uri "http://localhost:3000/notifications/unread-count" -Method Get -Headers @{
    Authorization = "Bearer $renterToken"
}
Write-Host "Unread sau khi mark all: $($unreadAfter.unreadCount)"
```

---

## 🌐 TEST VỚI SWAGGER UI

Nếu muốn test bằng giao diện web:

1. Mở browser: http://localhost:3000/api/docs
2. Click **Authorize** ở góc phải trên
3. Nhập token (Bearer <token>)
4. Test từng endpoint bằng cách click **Try it out**

---

## 🔌 TEST REALTIME SOCKET.IO (Optional)

### Cách 1: Dùng Socket.IO Client trong Browser Console

1. Mở http://localhost:3000 trong Chrome
2. Mở DevTools (F12) → Console tab
3. Load Socket.IO client:
```javascript
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
document.head.appendChild(script);
```

4. Sau vài giây, connect:
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

// Listen for booking events
socket.on('booking_created', (data) => {
  console.log('🔔 New booking:', data);
});

socket.on('booking_accepted', (data) => {
  console.log('✅ Booking accepted:', data);
});

socket.on('booking_rejected', (data) => {
  console.log('❌ Booking rejected:', data);
});
```

5. Bây giờ test bằng PowerShell (tạo booking, accept, reject)
6. Xem console sẽ nhận được realtime events!

---

### Cách 2: Dùng Postman (WebSocket)

1. Mở Postman → New → WebSocket Request
2. URL: `ws://localhost:3000/socket.io/?EIO=4&transport=websocket`
3. Connect
4. Gửi message để register user (cần implement thêm)

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: "EADDRINUSE: address already in use :::3000"
**Nguyên nhân:** Port 3000 đang được dùng

**Giải pháp:**
```powershell
# Tìm process
netstat -ano | findstr :3000

# Kill process (thay PID bằng số tìm được)
taskkill /PID <PID> /F

# Hoặc đổi port trong .env
PORT=3001
```

---

### Lỗi 2: "Cannot connect to database"
**Giải pháp:**
```powershell
# Restart Docker
docker-compose down
docker-compose up -d
Start-Sleep -Seconds 5
```

---

### Lỗi 3: "User already exists"
**Giải pháp:** Đổi email khác hoặc reset database:
```powershell
npx prisma migrate reset --force
.\seed-test-users.ps1
```

---

### Lỗi 4: "Unauthorized"
**Nguyên nhân:** Token hết hạn (15 phút)

**Giải pháp:** Login lại để lấy token mới.

---

## ✅ CHECKLIST

Sau khi test xong, bạn nên thấy:

- [x] Tạo được user RENTER và LANDLORD
- [x] Login và nhận được token
- [x] Landlord tạo được listing
- [x] Renter thêm được vào favorites
- [x] Renter tạo được booking request (status: PENDING)
- [x] Landlord nhận được notification
- [x] Landlord accept/reject được booking
- [x] Renter nhận được notification
- [x] State machine hoạt động đúng (không thay đổi được final states)
- [x] Mark notifications as read

---

## 📊 KIỂM TRA DATABASE

Muốn xem data trong database:

```powershell
# Mở Prisma Studio
npx prisma studio
```

Trình duyệt sẽ mở http://localhost:5555

Hoặc dùng pgAdmin: http://localhost:5050
- Email: admin@motel.com
- Password: admin123
- Server: postgres (host.docker.internal:5432)

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi chạy `.\test-day4.ps1`, bạn sẽ thấy:

```
=== TEST DAY 4: FAVORITES, BOOKINGS & NOTIFICATIONS ===

1. Login as RENTER...
Renter Token: eyJhbGc...

2. Login as LANDLORD...
Landlord Token: eyJhbGc...

3. Landlord tạo listing...
Created Listing ID: clx123abc

4. Renter thêm listing vào favorites...
Added to favorites!

5. Lấy danh sách favorites...
Favorites count: 1

6. Renter tạo booking request...
Created Booking ID: clx456def
Status: PENDING

7. Landlord xem bookings...
Landlord bookings count: 1

8. Landlord xem notifications...
Notifications count: 1

9. Landlord ACCEPT booking...
Booking status updated: ACCEPTED

10. Renter xem notifications...
Renter notifications count: 1

11. Check unread notifications...
Unread count: 1

12. Mark all notifications as read...
Result: Đã đánh dấu tất cả đã đọc

13. Test REJECT flow...
Created Booking 2 ID: clx789ghi
Booking 2 status: REJECTED

14. Renter xóa khỏi favorites...
Result: Đã xóa khỏi danh sách yêu thích

=== TEST COMPLETED ===

Summary:
- Favorites API: ✅
- Bookings CRUD: ✅
- State machine (PENDING → ACCEPTED/REJECTED): ✅
- Notifications records: ✅
```

---

## 🚀 NEXT

Sau khi test xong, bạn có thể:
1. Xem Swagger docs: http://localhost:3000/api/docs
2. Xem database: npx prisma studio
3. Tiếp tục Day 5: Chat Backend

---

**Chúc bạn test thành công! 🎉**
