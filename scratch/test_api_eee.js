const http = require('http');

async function testSemester(sem) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      groupType: "ENGINEERING",
      branch: "EEE",
      semester: sem
    });

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/quiz/curriculum/subjects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing /api/quiz/curriculum/subjects for EEE Semesters 1 to 8:');
  for (let s = 1; s <= 8; s++) {
    const res = await testSemester(s);
    console.log(`Semester ${s}: success=${res.success}, count=${res.subjectCount}`);
    if (res.subjects) {
      res.subjects.forEach(sub => console.log(`   - ${sub}`));
    }
  }
}

run().catch(console.error);
