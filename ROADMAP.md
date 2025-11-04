# ROADMAP - Ứng Dụng Cho Thuê Trọ
**Timeline:** 14 ngày | **Cập nhật:** 04/11/2025

---

## 📊 TIẾN ĐỘ

**Phase:** Backend Development  
**Hoàn thành:** Day 3/14 (21%)  
**Repository:** [github.com/Xiron5123/Motel_App](https://github.com/Xiron5123/Motel_App)

✅ Day 1-3 | ⏳ Day 4-14

---

## 🗓️ KẾ HOẠCH 14 NGÀY

### **✅ TUẦN 1: Backend Core**

#### **Day 1 - Project Setup**
- ✅ Monorepo structure (backend + mobile)
- ✅ NestJS + Prisma + PostgreSQL
- ✅ Database schema (10 models)
- ✅ Docker Compose

#### **Day 2 - Authentication**
- ✅ Register/Login/Refresh Token
- ✅ JWT Guards + Role-based access
- ✅ Users module
- ✅ **Become Landlord flow** (upgrade RENTER → LANDLORD)

#### **Day 3 - Listings**
- ✅ CRUD operations (LANDLORD only)
- ✅ Search & Filter (text, price, amenities, geo-distance)
- ✅ Photos management
- ✅ Pagination
- ⏳ **Sort by distance & price** (UX improvement)

#### **Day 4 - Favorites & Booking**
- ⏳ Favorites API (save/remove/list)
- ⏳ BookingRequest CRUD
- ⏳ State machine (PENDING → ACCEPTED/REJECTED)
- ⏳ Notifications records
- ⏳ **Realtime notification** (socket.io)
- ⏳ **Status UI states** (pending, accepted, rejected)

#### **Day 5 - Chat Backend**
- ⏳ Conversation + Message REST API
- ⏳ Socket.IO gateway
- ⏳ Realtime events (join, send, **typing**, **read**)
- ⏳ **Typing indicator & seen status**
- ⏳ **Auto-scroll & last message preview**

#### **Day 6 - Backend QA**
- ⏳ Validation & error handling
- ⏳ Rate limiting
- ⏳ Test coverage (unit + e2e)
- ⏳ API documentation finalization

---

### **⏳ TUẦN 2: Mobile App**

#### **Day 7 - Mobile Setup**
- ⏳ Expo + React Native init
- ⏳ Auth screens (Login/Register)
- ⏳ API client (React Query)
- ⏳ Navigation (Expo Router)

#### **Day 8 - Listings UI**
- ⏳ Listings catalog (FlatList)
- ⏳ **Clean cards (Airbnb-style): large images, price, distance**
- ⏳ **Bottom sheet filter modal** (amenities, price range)
- ⏳ Listing detail screen
- ⏳ Image carousel

#### **Day 9 - User Actions**
- ⏳ Favorites UI (**swipe to remove**)
- ⏳ Booking request form
- ⏳ **My bookings: tabs (Upcoming/Past/Pending)**
- ⏳ Become Landlord flow (mobile)

#### **Day 10 - Landlord Features**
- ⏳ **Multi-step listing form** (wizard UI)
- ⏳ **Photo preview before upload**
- ⏳ Photo picker & upload (Cloudinary)
- ⏳ My listings management
- ⏳ Booking requests management

#### **Day 11 - Chat UI**
- ⏳ Conversations list
- ⏳ Chat screen (GiftedChat)
- ⏳ **Custom bubble style, timestamp, avatar**
- ⏳ **Online/offline status**
- ⏳ Socket.IO client
- ⏳ Realtime messaging

#### **Day 12 - Notifications**
- ⏳ Expo Notifications setup
- ⏳ Push tokens handling
- ⏳ Notification triggers (booking, messages)
- ⏳ **Deep linking to Booking/Chat**
- ⏳ **Background push notifications**

#### **Day 13 - Polish**
- ⏳ **Skeleton loading states**
- ⏳ **Consistent theme** (font, colors, spacing)
- ⏳ Empty states
- ⏳ Error handling & retry
- ⏳ Bug fixes

#### **Day 14 - Deploy & Demo**
- ⏳ Backend deploy (Railway/Render)
- ⏳ Mobile build (EAS Build)
- ⏳ Demo video
- ⏳ Documentation

---

## 🎯 MVP FEATURES

### Người dùng (RENTER)
- ✅ Đăng ký/Đăng nhập (default role)
- ✅ Xem & tìm kiếm listings
- ⏳ Lưu favorites
- ⏳ Gửi booking requests
- ⏳ Chat với landlord

### Chủ trọ (LANDLORD)
- ✅ Upgrade từ RENTER
- ✅ CRUD listings
- ⏳ Quản lý bookings
- ⏳ Chat với renters
- ⏳ Upload photos

---

## 📦 BACKLOG (Post-MVP)

- Thanh toán online (Stripe/VNPay)
- Review & Rating
- KYC/Verification
- Google Maps integration
- Analytics dashboard
- Admin CMS
- Web frontend

---

**Tech Stack:** NestJS + PostgreSQL + Prisma + React Native + Expo + Socket.IO  
**Details:** Xem [TECHNICAL.md](./TECHNICAL.md) để biết chi tiết kỹ thuật
