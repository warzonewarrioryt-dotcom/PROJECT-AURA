const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./curriculum-platform/curriculumData.json', 'utf8'));
const eng = data.streams.find(s => s.id === 'engineering-tech');

console.log('--- ENGINEERING DEPARTMENTS ---');
eng.departments.forEach(d => {
  console.log(`${d.id.padEnd(8)} | ${d.name.padEnd(45)} | Populated: ${d.isCurriculumPopulated ? 'YES' : 'NO'} | Sems: ${d.semesters ? d.semesters.length : 0}`);
});

const eee = eng.departments.find(d => d.id === 'eee');
console.log('\n--- EEE DEPARTMENT DETAILS ---');
console.log('ID:', eee.id);
console.log('Name:', eee.name);
console.log('Degree:', eee.degree);
console.log('Institution Type:', eee.institutionType);
console.log('University:', eee.university);
console.log('Regulation:', eee.regulation);
console.log('Regulations:', eee.regulations);
console.log('Source:', eee.sourceUrl);
console.log('Total Degree Credits:', eee.totalDegreeCredits);
console.log('Semesters count:', eee.semesters.length);

let totalCreditsCalculated = 0;
let totalCoursesCalculated = 0;

eee.semesters.forEach(sem => {
  console.log(`\nSemester ${sem.semesterNumber} (Credits: ${sem.totalCredits}, Courses: ${sem.subjects.length}):`);
  totalCreditsCalculated += sem.totalCredits;
  totalCoursesCalculated += sem.subjects.length;
  sem.subjects.forEach(sub => {
    const ltp = sub.contactHours ? `${sub.contactHours.lecture}-${sub.contactHours.tutorial}-${sub.contactHours.practical}` : 'N/A';
    console.log(`  - [${sub.code}] ${sub.title} | Cat: ${sub.category} | Cr: ${sub.credits} | L-T-P: ${ltp} | Units: ${sub.syllabusOutline ? sub.syllabusOutline.length : 0}`);
  });
});

console.log(`\nTOTAL CALCULATED: ${totalCoursesCalculated} Courses, ${totalCreditsCalculated} Credits across 8 Semesters.`);
