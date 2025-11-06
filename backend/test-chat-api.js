const axios = require('axios');

const baseURL = 'http://localhost:3000';
let renterToken, landlordToken;
let conversationId;

const api = axios.create({ baseURL });

async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.accessToken;
}

async function test() {
  console.log('🧪 TESTING CHAT REST API\n');

  try {
    // 1. Login
    console.log('1️⃣ Login users...');
    renterToken = await login('renter@test.com', 'password123');
    landlordToken = await login('landlord@test.com', 'password123');
    console.log('✅ Logged in\n');

    // 2. Create conversation (renter)
    console.log('2️⃣ Create conversation...');
    const createRes = await api.post(
      '/chat/conversations',
      { participantId: 'cmhn245gt00037ek4lefgz14c' },
      { headers: { Authorization: `Bearer ${renterToken}` } }
    );
    conversationId = createRes.data.id;
    console.log(`✅ Created: ${conversationId}`);
    console.log(`   Participants: ${createRes.data.participants.length}\n`);

    // 3. Get conversations (renter)
    console.log('3️⃣ Get conversations list...');
    const listRes = await api.get('/chat/conversations', {
      headers: { Authorization: `Bearer ${renterToken}` }
    });
    console.log(`✅ Found ${listRes.data.length} conversation(s)\n`);

    // 4. Send message (renter)
    console.log('4️⃣ Send message from renter...');
    const msgRes1 = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      { content: 'Xin chào, phòng còn trống không?' },
      { headers: { Authorization: `Bearer ${renterToken}` } }
    );
    console.log(`✅ Sent: "${msgRes1.data.content}"\n`);

    // 5. Send message (landlord)
    console.log('5️⃣ Send message from landlord...');
    const msgRes2 = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      { content: 'Dạ còn trống ạ, giá 2.5 triệu/tháng' },
      { headers: { Authorization: `Bearer ${landlordToken}` } }
    );
    console.log(`✅ Sent: "${msgRes2.data.content}"\n`);

    // 6. Get messages
    console.log('6️⃣ Get messages...');
    const messagesRes = await api.get(
      `/chat/conversations/${conversationId}/messages?limit=10`,
      { headers: { Authorization: `Bearer ${renterToken}` } }
    );
    console.log(`✅ Retrieved ${messagesRes.data.length} messages:`);
    messagesRes.data.forEach((msg, i) => {
      console.log(`   ${i + 1}. ${msg.sender.name}: ${msg.content}`);
    });
    console.log('');

    // 7. Get conversation detail
    console.log('7️⃣ Get conversation detail...');
    const detailRes = await api.get(`/chat/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${renterToken}` }
    });
    console.log(`✅ Conversation ID: ${detailRes.data.id}`);
    console.log(`   Participants: ${detailRes.data.participants.map(p => p.name).join(', ')}\n`);

    // 8. Mark as read
    console.log('8️⃣ Mark as read...');
    await api.patch(
      `/chat/conversations/${conversationId}/read`,
      {},
      { headers: { Authorization: `Bearer ${landlordToken}` } }
    );
    console.log('✅ Marked as read\n');

    // 9. Test duplicate conversation (should return existing)
    console.log('9️⃣ Test duplicate conversation...');
    const dupRes = await api.post(
      '/chat/conversations',
      { participantId: 'cmhn245gt00037ek4lefgz14c' },
      { headers: { Authorization: `Bearer ${renterToken}` } }
    );
    if (dupRes.data.id === conversationId) {
      console.log('✅ Returned existing conversation (no duplicate)\n');
    } else {
      console.log('❌ Created duplicate conversation!\n');
    }

    console.log('🎉 ALL TESTS PASSED!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Conversation ID: ${conversationId}`);
    console.log(`   - Messages sent: 2`);
    console.log(`   - Participants: 2 (Renter + Landlord)\n`);

  } catch (error) {
    console.error('❌ TEST FAILED:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

test();
