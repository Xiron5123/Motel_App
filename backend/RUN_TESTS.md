# 🧪 CHAT API TESTING

## ✅ REST API Test (Automated)

### Chạy backend:
```bash
npm run start:dev
```

### Chạy test:
```bash
node test-chat-api.js
```

**Test coverage:**
1. ✅ Login 2 users (renter + landlord)
2. ✅ Create conversation
3. ✅ Get conversations list
4. ✅ Send messages (both users)
5. ✅ Get messages with pagination
6. ✅ Get conversation detail
7. ✅ Mark as read
8. ✅ Test duplicate prevention

---

## 🔥 Socket.IO Test (Manual)

### Mở test client:
```
D:\BaoCaoThucTap\Motel\backend\test-socket.html
```

### User IDs:
- **Renter:** `cmhn245dg00007ek4fjztv7bk`
- **Landlord:** `cmhn245gt00037ek4lefgz14c`

### Test flow:
1. Mở 2 tabs browser
2. Tab 1: Connect với Renter ID
3. Tab 2: Connect với Landlord ID
4. Cả 2 tabs paste conversation ID từ API test
5. Join conversation
6. Test realtime messaging & typing indicator

**Features:**
- ✅ Realtime messaging
- ✅ Typing indicator
- ✅ Read receipts
- ✅ Auto-join conversations on register
- ✅ Multi-user support

---

## 📊 Database Verification

### Query trong pgAdmin:
```sql
-- Conversations
SELECT c.id, c."lastMessageAt", 
       COUNT(cp."userId") as participants,
       COUNT(m.id) as messages
FROM "Conversation" c
LEFT JOIN "ConversationParticipant" cp ON c.id = cp."conversationId"
LEFT JOIN "Message" m ON c.id = m."conversationId"
GROUP BY c.id
ORDER BY c."lastMessageAt" DESC;

-- Messages
SELECT m.content, m."sentAt",
       u.name as sender,
       c.id as conversation_id
FROM "Message" m
JOIN "User" u ON m."senderId" = u.id
JOIN "Conversation" c ON m."conversationId" = c.id
ORDER BY m."sentAt" DESC
LIMIT 10;
```

---

## 🎯 Expected Results

**After REST API test:**
- 1 conversation created
- 2 messages sent
- No duplicate conversations
- lastMessageAt updated correctly

**After Socket.IO test:**
- Realtime messages received instantly
- Typing indicator shows/hides correctly
- All messages saved to database

---

## 🐛 Troubleshooting

**Backend not running:**
```bash
npm run start:dev
```

**Port 3000 occupied:**
```bash
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

**Socket.IO connection failed:**
- Check backend logs
- Verify URL: `ws://localhost:3000/chat`
- Try reconnect

---

✅ **ALL SYSTEMS READY FOR TESTING!**
