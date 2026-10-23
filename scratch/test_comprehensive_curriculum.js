const fs = require('fs');
const http = require('http');

console.log('================================================================');
console.log('PROJECT AURA — COMPREHENSIVE CURRICULUM & SUBJECT TEST SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// 1. TEST CURRICULUM DATA JSON & DATA.JS
console.log('TEST 1: Verifying curriculumData.json & data.js files...');
const jsonPath = './curriculum-platform/curriculumData.json';
const jsPath = './curriculum-platform/data.js';

assert(fs.existsSync(jsonPath), 'curriculumData.json exists');
assert(fs.existsSync(jsPath), 'data.js exists');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
assert(data.platform === 'Tamil Nadu Higher Education Curriculum Intelligence Platform', 'Platform title is valid');
assert(data.primaryRegulation === 'Anna University Regulation 2021', 'Primary regulation is Regulation 2021');
assert(Array.isArray(data.streams) && data.streams.length === 7, 'All 7 academic streams are present');

// 2. TEST ENGINEERING STREAM & EEE SPECIFICATION
console.log('\nTEST 2: Verifying B.E. Electrical and Electronics Engineering (EEE)...');
const engStream = data.streams.find(s => s.id === 'engineering-tech');
assert(!!engStream, 'Engineering & Technology stream found');

const eeeDept = engStream.departments.find(d => d.id === 'eee');
assert(!!eeeDept, 'EEE department found in engineering-tech');
assert(eeeDept.isCurriculumPopulated === true, 'EEE curriculum is marked populated');
assert(eeeDept.totalSemesters === 8, 'EEE has 8 total semesters configured');
assert(eeeDept.semesters && eeeDept.semesters.length === 8, 'EEE contains exactly 8 semester objects');
assert(eeeDept.totalDegreeCredits === 166, `EEE total degree credits is 166 (got: ${eeeDept.totalDegreeCredits})`);
assert(eeeDept.institutionType === 'Affiliated Non-Autonomous Institutions', 'EEE institutionType is Affiliated Non-Autonomous');
assert(eeeDept.university === 'Anna University, Chennai', 'EEE university is Anna University');
assert(eeeDept.sourceUrl === 'https://cac.annauniv.edu/', 'EEE sourceUrl is cac.annauniv.edu');

// Expected core course markers per semester
const expectedMarkers = {
  1: { count: 10, credits: 22, code: 'HS3151', name: 'Professional English - I' },
  2: { count: 10, credits: 27, code: 'EE3251', name: 'Electric Circuit Analysis' },
  3: { count: 10, credits: 26.5, code: 'EE3301', name: 'Electromagnetic Fields' },
  4: { count: 9, credits: 21.5, code: 'EE3401', name: 'Transmission and Distribution' },
  5: { count: 9, credits: 22.5, code: 'EE3501', name: 'Power System Analysis' },
  6: { count: 7, credits: 20.5, code: 'EE3601', name: 'Protection and Switchgear' },
  7: { count: 6, credits: 16, code: 'EE3701', name: 'High Voltage Engineering' },
  8: { count: 1, credits: 10, code: 'EE3811', name: 'Project Work / Capstone Internship' }
};

let calculatedCredits = 0;
let calculatedCourses = 0;

for (let s = 1; s <= 8; s++) {
  const sem = eeeDept.semesters.find(item => item.semesterNumber === s);
  assert(!!sem, `EEE Semester ${s} exists`);
  if (!sem) continue;

  calculatedCredits += sem.totalCredits;
  calculatedCourses += sem.subjects.length;

  const exp = expectedMarkers[s];
  assert(sem.subjects.length === exp.count, `Semester ${s} has exactly ${exp.count} courses (found: ${sem.subjects.length})`);
  assert(sem.totalCredits === exp.credits, `Semester ${s} has ${exp.credits} credits (found: ${sem.totalCredits})`);

  const markerSubject = sem.subjects.find(sub => sub.code === exp.code);
  assert(!!markerSubject, `Semester ${s} contains benchmark course ${exp.code}`);
  if (markerSubject) {
    assert(markerSubject.title === exp.name, `Course ${exp.code} title is "${exp.name}"`);
    assert(markerSubject.credits > 0 || markerSubject.category === 'Mandatory', `Course ${exp.code} has valid credits: ${markerSubject.credits}`);
    assert(!!markerSubject.category, `Course ${exp.code} has category: ${markerSubject.category}`);
  }
}

assert(calculatedCourses === 62, `Total EEE courses across all 8 semesters is 62 (got: ${calculatedCourses})`);
assert(calculatedCredits === 166, `Total EEE calculated credits is 166 (got: ${calculatedCredits})`);

// 3. TEST OTHER ENGINEERING BRANCHES
console.log('\nTEST 3: Verifying other engineering branches are intact and working...');
const expectedPopulated = ['cse', 'it', 'aids', 'csbs', 'ece', 'eee'];
expectedPopulated.forEach(branchId => {
  const branch = engStream.departments.find(d => d.id === branchId);
  assert(!!branch && branch.isCurriculumPopulated && branch.semesters.length === 8, `Branch "${branchId.toUpperCase()}" is fully populated with 8 semesters`);
});

const unpopulatedBranches = ['mech', 'civil', 'bme', 'aero', 'che', 'mct'];
unpopulatedBranches.forEach(branchId => {
  const branch = engStream.departments.find(d => d.id === branchId);
  assert(!!branch && branch.isCurriculumPopulated === false, `Branch "${branchId.toUpperCase()}" correctly requires verification (not inventing fake data)`);
});

// 4. TEST BACKEND API ENDPOINTS
console.log('\nTEST 4: Testing /api/quiz/curriculum/subjects API for all 8 EEE semesters...');

function callApi(sem) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ groupType: 'ENGINEERING', branch: 'EEE', semester: sem });
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/quiz/curriculum/subjects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve({ success: false, error: e.message }); }
      });
    });
    req.on('error', err => resolve({ success: false, error: err.message }));
    req.write(postData);
    req.end();
  });
}

async function testBackendApi() {
  for (let s = 1; s <= 8; s++) {
    const res = await callApi(s);
    assert(res.success === true, `API Sem ${s} response success is true`);
    assert(Array.isArray(res.subjects) && res.subjects.length > 0, `API Sem ${s} returns subjects (count: ${res.subjects?.length})`);
  }

  // 5. TEST YOUTUBE VIDEO SERVICE FOR EEE
  console.log('\nTEST 5: Testing YouTube intelligence matching for EEE courses...');
  const ytService = require('../backend/services/youtube.js');
  const circuitMatch = await ytService.searchYouTube('Electric Circuit Analysis EE3251');
  assert(circuitMatch && circuitMatch.results && circuitMatch.results.length > 0, 'EE3251 returns relevant educational videos');
  
  const machinesMatch = await ytService.searchYouTube('Electrical Machines EE3303');
  assert(machinesMatch && machinesMatch.results && machinesMatch.results.length > 0, 'EE3303 returns relevant educational videos');

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED.`);
  console.log('================================================================');

  if (failCount > 0) process.exit(1);
}

testBackendApi();
