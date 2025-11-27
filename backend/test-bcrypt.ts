import * as bcrypt from 'bcrypt';

async function testHash() {
    const password = '123456';
    const hash = await bcrypt.hash(password, 10);
    console.log('Generated Hash:', hash);

    const match = await bcrypt.compare(password, hash);
    console.log('Match Result:', match);
}

testHash();
