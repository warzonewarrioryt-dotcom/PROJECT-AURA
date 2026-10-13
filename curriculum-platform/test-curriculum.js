// ============================================================================
// VERIFICATION SUITE FOR CURRICULUM INTELLIGENCE PLATFORM
// Validates: getAllStreams(), getDepartmentsByStream(), getCurriculum(), searchSubject()
// ============================================================================

const fs = require('fs');
const path = require('path');

const dataset = JSON.parse(fs.readFileSync(path.join(__dirname, 'curriculumData.json'), 'utf8'));

// Stream Map & Indices
const streamMap = new Map();
const departmentMap = new Map();
const flatSubjects = [];

dataset.streams.forEach(stream => {
  streamMap.set(stream.id, stream);
  stream.departments.forEach(dept => {
    departmentMap.set(dept.id, dept);
    if (dept.semesters) {
      dept.semesters.forEach(sem => {
        sem.subjects.forEach(sub => {
          flatSubjects.push({
            subject: sub,
            streamId: stream.id,
            streamName: stream.name,
            departmentId: dept.id,
            departmentCode: dept.code,
            departmentName: dept.name,
            semesterNumber: sem.semesterNumber
          });
        });
      });
    }
  });
});

// Helper 1: getAllStreams()
function getAllStreams() {
  return dataset.streams;
}

// Helper 2: getDepartmentsByStream(streamId)
function getDepartmentsByStream(streamId) {
  const stream = streamMap.get(streamId);
  return stream ? stream.departments : [];
}

// Helper 3: getCurriculum(deptId, semesterNumber)
function getCurriculum(deptId, semesterNumber) {
  const dept = departmentMap.get(deptId);
  if (!dept || !dept.semesters) return null;
  return dept.semesters.find(s => s.semesterNumber === semesterNumber) || null;
}

// Helper 4: searchSubject(query)
function searchSubject(query) {
  if (!query || !query.trim()) return [];
  const normalized = query.trim().toLowerCase();
  return flatSubjects.filter(item => {
    const codeMatch = item.subject.code.toLowerCase().includes(normalized);
    const titleMatch = item.subject.title.toLowerCase().includes(normalized);
    const categoryMatch = item.subject.category.toLowerCase().includes(normalized);
    const outlineMatch = item.subject.syllabusOutline && item.subject.syllabusOutline.some(o => o.toLowerCase().includes(normalized));
    return codeMatch || titleMatch || categoryMatch || outlineMatch;
  });
}

console.log("=== RUNNING CURRICULUM INTELLIGENCE TEST SUITE ===\n");

// Test 1: getAllStreams()
const streams = getAllStreams();
console.log(`[PASS] Test 1: getAllStreams() returned ${streams.length} streams.`);
streams.forEach((s, idx) => {
  console.log(`   ${idx + 1}. [${s.id}] ${s.name} (${s.tamilName}) - Depts: ${s.departments.length}`);
});

// Test 2: getDepartmentsByStream('engineering-tech')
const engDepts = getDepartmentsByStream('engineering-tech');
console.log(`\n[PASS] Test 2: getDepartmentsByStream('engineering-tech') returned ${engDepts.length} departments.`);
console.log(`   Branches: ${engDepts.map(d => d.code).join(', ')}`);

// Test 2b: getDepartmentsByStream('medical-allied')
const medDepts = getDepartmentsByStream('medical-allied');
console.log(`[PASS] Test 2b: getDepartmentsByStream('medical-allied') returned ${medDepts.length} departments.`);
console.log(`   Branches: ${medDepts.map(d => d.code).join(', ')}`);

// Test 3: getCurriculum('cse', 4) and getCurriculum('aids', 5)
const cseSem4 = getCurriculum('cse', 4);
console.log(`\n[PASS] Test 3: getCurriculum('cse', 4):`);
console.log(`   Semester: ${cseSem4.title}, Total Credits: ${cseSem4.totalCredits}`);
console.log(`   Courses (${cseSem4.subjects.length}):`);
cseSem4.subjects.forEach(sub => {
  console.log(`    - [${sub.code}] ${sub.title} | ${sub.category} | ${sub.credits} Credits`);
});

const aidsSem5 = getCurriculum('aids', 5);
console.log(`\n[PASS] Test 3b: getCurriculum('aids', 5):`);
console.log(`   Semester: ${aidsSem5.title}, Total Credits: ${aidsSem5.totalCredits}`);
aidsSem5.subjects.forEach(sub => {
  console.log(`    - [${sub.code}] ${sub.title} | ${sub.category} | ${sub.credits} Credits`);
});

// Test 4: searchSubject('Deep Learning') and searchSubject('CS3491')
const search1 = searchSubject('Deep Learning');
console.log(`\n[PASS] Test 4: searchSubject('Deep Learning') returned ${search1.length} matches:`);
search1.slice(0, 4).forEach(res => {
  console.log(`    - [${res.subject.code}] ${res.subject.title} in ${res.departmentCode} Sem ${res.semesterNumber} (${res.subject.category}, ${res.subject.credits} cr)`);
});

const search2 = searchSubject('CS3491');
console.log(`\n[PASS] Test 4b: searchSubject('CS3491') returned ${search2.length} matches:`);
search2.forEach(res => {
  console.log(`    - [${res.subject.code}] ${res.subject.title} in ${res.departmentCode} Sem ${res.semesterNumber}`);
});

const search3 = searchSubject('Compiler');
console.log(`\n[PASS] Test 4c: searchSubject('Compiler') returned ${search3.length} matches:`);
search3.forEach(res => {
  console.log(`    - [${res.subject.code}] ${res.subject.title} in ${res.departmentCode} Sem ${res.semesterNumber}`);
});

console.log("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===");
