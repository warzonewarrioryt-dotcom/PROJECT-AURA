/**
 * ============================================================================
 * TAMIL NADU HIGHER EDUCATION CURRICULUM INTELLIGENCE PLATFORM
 * Query Helper Utility Functions & Indexation Service
 * ============================================================================
 */

import {
  Stream,
  Department,
  Semester,
  Subject,
  CourseCategory,
  CurriculumRootDataset,
  SubjectSearchResult,
  CurriculumSummary
} from './types';

import curriculumJson from './curriculumData.json';

// Typed curriculum dataset
const rawDataset: CurriculumRootDataset = curriculumJson as unknown as CurriculumRootDataset;

/**
 * In-memory index cache for fast O(1) & O(log N) lookups
 */
interface CacheIndices {
  streamMap: Map<string, Stream>;
  departmentMap: Map<string, Department>;
  deptStreamMap: Map<string, string>; // deptId -> streamId
  flatSubjects: {
    subject: Subject;
    streamId: string;
    streamName: string;
    departmentId: string;
    departmentCode: string;
    departmentName: string;
    semesterNumber: number;
  }[];
}

let indices: CacheIndices | null = null;

function getIndices(): CacheIndices {
  if (indices) return indices;

  const streamMap = new Map<string, Stream>();
  const departmentMap = new Map<string, Department>();
  const deptStreamMap = new Map<string, string>();
  const flatSubjects: CacheIndices['flatSubjects'] = [];

  for (const stream of rawDataset.streams) {
    streamMap.set(stream.id, stream);
    for (const dept of stream.departments) {
      departmentMap.set(dept.id, dept);
      deptStreamMap.set(dept.id, stream.id);

      if (dept.semesters && dept.semesters.length > 0) {
        for (const sem of dept.semesters) {
          for (const sub of sem.subjects) {
            flatSubjects.push({
              subject: {
                ...sub,
                departmentId: dept.id,
                semesterNumber: sem.semesterNumber,
                regulation: dept.regulation
              },
              streamId: stream.id,
              streamName: stream.name,
              departmentId: dept.id,
              departmentCode: dept.code,
              departmentName: dept.name,
              semesterNumber: sem.semesterNumber
            });
          }
        }
      }
    }
  }

  indices = { streamMap, departmentMap, deptStreamMap, flatSubjects };
  return indices;
}

/**
 * 1. Retrieve all streams in the Tamil Nadu higher education hierarchy.
 * @returns Array of Level 1 Streams
 */
export function getAllStreams(): Stream[] {
  return rawDataset.streams;
}

/**
 * Retrieve a specific stream by its identifier.
 * @param streamId e.g., 'engineering-tech', 'medical-allied'
 */
export function getStreamById(streamId: string): Stream | undefined {
  const { streamMap } = getIndices();
  return streamMap.get(streamId);
}

/**
 * 2. Retrieve all departments / degree branches under a specific stream.
 * @param streamId Level 1 Stream identifier (e.g. 'engineering-tech')
 * @returns Array of Level 2 Departments
 */
export function getDepartmentsByStream(streamId: string): Department[] {
  const stream = getStreamById(streamId);
  return stream ? stream.departments : [];
}

/**
 * Retrieve a specific department by its branch ID.
 * @param deptId Branch identifier (e.g., 'cse', 'csbs', 'aids', 'ece', 'it')
 */
export function getDepartmentById(deptId: string): Department | undefined {
  const { departmentMap } = getIndices();
  return departmentMap.get(deptId);
}

/**
 * 3. Retrieve curriculum subjects for a specific branch and semester.
 * @param deptId Branch identifier (e.g. 'cse', 'csbs')
 * @param semesterNumber Semester number (1 through 8)
 * @returns Level 3 Semester object with subjects, or undefined if not found
 */
export function getCurriculum(deptId: string, semesterNumber: number): Semester | undefined {
  const dept = getDepartmentById(deptId);
  if (!dept || !dept.semesters) return undefined;
  return dept.semesters.find((s) => s.semesterNumber === semesterNumber);
}

/**
 * 4. Search subjects across all streams, departments, and semesters.
 * Supports partial matching by:
 * - Subject Code (e.g. "CS3491", "MA3151")
 * - Subject Title (e.g. "Data Science", "Machine Learning", "Operating Systems")
 * - Category (e.g. "Lab", "Elective")
 * - Syllabus Outline topics (e.g. "Docker", "Transformer", "Solidity")
 *
 * @param query Search query string
 * @returns Array of matching results with full breadcrumb context
 */
export function searchSubject(query: string): SubjectSearchResult[] {
  if (!query || !query.trim()) return [];

  const normalized = query.trim().toLowerCase();
  const { flatSubjects } = getIndices();

  const results: SubjectSearchResult[] = [];

  for (const item of flatSubjects) {
    const codeMatch = item.subject.code.toLowerCase().includes(normalized);
    const titleMatch = item.subject.title.toLowerCase().includes(normalized);
    const categoryMatch = item.subject.category.toLowerCase().includes(normalized);
    const outlineMatch = item.subject.syllabusOutline?.some((topic) =>
      topic.toLowerCase().includes(normalized)
    );

    if (codeMatch || titleMatch || categoryMatch || outlineMatch) {
      results.push({
        subject: item.subject,
        stream: {
          id: item.streamId,
          name: item.streamName
        },
        department: {
          id: item.departmentId,
          code: item.departmentCode,
          name: item.departmentName
        },
        semesterNumber: item.semesterNumber
      });
    }
  }

  return results;
}

/**
 * Find a specific subject by its official Anna University code.
 * @param code e.g. "CS3491"
 */
export function getSubjectByCode(code: string): SubjectSearchResult | undefined {
  const results = searchSubject(code);
  return results.find((r) => r.subject.code.toUpperCase() === code.trim().toUpperCase());
}

/**
 * Filter subjects within a semester by category (Theory, Lab, Elective, Project).
 */
export function filterSubjectsByCategory(
  deptId: string,
  semesterNumber: number,
  category: CourseCategory
): Subject[] {
  const semester = getCurriculum(deptId, semesterNumber);
  if (!semester) return [];
  return semester.subjects.filter((s) => s.category === category);
}

/**
 * Compute comprehensive analytics and credit summary for a department.
 */
export function getCurriculumSummary(deptId: string): CurriculumSummary | undefined {
  const dept = getDepartmentById(deptId);
  if (!dept) return undefined;

  const totalSemesters = dept.semesters?.length || 0;
  let totalCredits = 0;
  let totalSubjects = 0;

  const categoryMap = new Map<CourseCategory, { count: number; credits: number }>();

  const creditsPerSemester = (dept.semesters || []).map((sem) => {
    const semCredits = sem.subjects.reduce((sum, s) => sum + s.credits, 0);
    totalCredits += semCredits;
    totalSubjects += sem.subjects.length;

    for (const sub of sem.subjects) {
      const existing = categoryMap.get(sub.category) || { count: 0, credits: 0 };
      existing.count += 1;
      existing.credits += sub.credits;
      categoryMap.set(sub.category, existing);
    }

    return {
      semesterNumber: sem.semesterNumber,
      credits: parseFloat(semCredits.toFixed(1)),
      subjectCount: sem.subjects.length
    };
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, val]) => ({
    category,
    count: val.count,
    credits: parseFloat(val.credits.toFixed(1))
  }));

  return {
    department: dept,
    totalSemesters,
    totalCredits: parseFloat(totalCredits.toFixed(1)),
    totalSubjects,
    creditsPerSemester,
    categoryBreakdown
  };
}

/**
 * Get all primary tech branches with complete 8-semester curricula.
 */
export function getAllPopulatedDepartments(): Department[] {
  const { departmentMap } = getIndices();
  return Array.from(departmentMap.values()).filter((d) => d.isCurriculumPopulated);
}
