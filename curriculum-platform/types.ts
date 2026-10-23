/**
 * ============================================================================
 * TAMIL NADU HIGHER EDUCATION CURRICULUM INTELLIGENCE PLATFORM
 * TypeScript Schema & Domain Models (Regulation 2021 Compliant)
 * ============================================================================
 * 
 * 4-Level Strict Nested Hierarchy:
 * Level 1: Stream / Group (Engineering, Medical, Science, Commerce, Arts, Law, Agriculture)
 * Level 2: Department / Degree Branch (CSE, CSBS, AI&DS, IT, ECE, MBBS, etc.)
 * Level 3: Semester (Sem 1 to Sem 8 / Sem 10)
 * Level 4: Courses / Subjects (Subject Code, Title, Category, Credits)
 */

export type CourseCategory =
  | 'Theory'
  | 'Lab'
  | 'Elective'
  | 'Project'
  | 'Integrated'
  | 'Mandatory';

export type ElectiveType =
  | 'Professional Elective'
  | 'Open Elective'
  | 'Humanities Elective'
  | 'None';

export type StreamId =
  | 'engineering-tech'
  | 'medical-allied'
  | 'science'
  | 'commerce-mgmt'
  | 'arts-humanities'
  | 'law-legal'
  | 'agriculture-allied';

export type DegreeLevel = 'Undergraduate' | 'Postgraduate' | 'Doctoral' | 'Integrated Master';

/**
 * Level 4: Subject / Course Specification
 */
export interface Subject {
  /** Official Course / Subject Code (e.g., CS3491, GE3151, AD3351) */
  code: string;
  /** Full Subject Title (e.g., "Artificial Intelligence and Machine Learning") */
  title: string;
  /** Course Classification */
  category: CourseCategory;
  /** Academic Credit Allocation (e.g., 4, 3, 2, 1.5, 10) */
  credits: number;
  /** Weekly Contact Hours: Lecture (L), Tutorial (T), Practical (P) */
  contactHours?: {
    lecture: number;
    tutorial: number;
    practical: number;
  };
  /** Elective classification if applicable */
  electiveType?: ElectiveType;
  /** List of key module / unit syllabus headings */
  syllabusOutline?: string[];
  /** Prerequisite subject codes if any */
  prerequisites?: string[];
  /** Regulation year (e.g., "Regulation 2021") */
  regulation?: string;
  /** Associated department ID */
  departmentId?: string;
  /** Associated semester number */
  semesterNumber?: number;
}

/**
 * Level 3: Semester Specification
 */
export interface Semester {
  /** Semester index number (1 through 8, or 10 for integrated law) */
  semesterNumber: number;
  /** Display label (e.g., "Semester 4") */
  title: string;
  /** Academic year tag (e.g., "Year 1", "Year 2") */
  academicYear: string;
  /** Aggregated credits for this semester */
  totalCredits: number;
  /** Curated list of subjects for this semester */
  subjects: Subject[];
}

/**
 * Level 2: Department / Degree Branch Specification
 */
export interface Department {
  /** Unique Department / Branch Identifier (e.g., "cse", "csbs", "aids", "ece") */
  id: string;
  /** Standard branch abbreviation (e.g., "CSE", "CSBS", "AI&DS", "ECE") */
  code: string;
  /** Full Degree Name (e.g., "B.E. Computer Science and Engineering") */
  name: string;
  /** Short Name for badges and mobile displays */
  shortName: string;
  /** Degree prefix / type (e.g., "B.E.", "B.Tech.", "MBBS", "B.Sc") */
  degreeType: string;
  /** Program duration in years */
  durationYears: number;
  /** Total number of semesters in curriculum */
  totalSemesters: number;
  /** Governing regulation (e.g., "Anna University Regulation 2021") */
  regulation: string;
  /** Affiliated or degree-granting institution category */
  institutionType?: string;
  /** Primary university granting accreditation / degree */
  university?: string;
  /** Available regulation variants and verification details */
  regulations?: {
    code: string;
    name: string;
    isVerified: boolean;
    source: string;
    version: string;
  }[];
  /** Specific curriculum version code */
  curriculumVersion?: string;
  /** Official syllabus repository or gazette link */
  sourceUrl?: string;
  /** Program overview and career pathways */
  overview: string;
  /** Total cumulative degree credits */
  totalDegreeCredits?: number;
  /** Parent Stream ID reference */
  streamId: StreamId | string;
  /** Whether the full Sem 1-8 curriculum is fully populated in dataset */
  isCurriculumPopulated: boolean;
  /** Ordered list of semesters */
  semesters: Semester[];
}

/**
 * Level 1: Stream / Group Specification
 */
export interface Stream {
  /** Unique Stream Identifier */
  id: StreamId | string;
  /** Full display name (e.g., "Engineering & Technology") */
  name: string;
  /** Tamil bilingual title for Tamil Nadu localization */
  tamilName: string;
  /** Primary state governing / affiliating body */
  governingBody: string;
  /** Stream description and scope */
  description: string;
  /** UI Icon identifier */
  icon: string;
  /** Accent color key for UI theming */
  accentColor: string;
  /** List of departments under this stream */
  departments: Department[];
}

/**
 * Root Curriculum Dataset Schema
 */
export interface CurriculumRootDataset {
  platform: string;
  version: string;
  lastUpdated: string;
  state: string;
  primaryRegulation: string;
  streams: Stream[];
}

/**
 * Search and Filter Results
 */
export interface SubjectSearchResult {
  subject: Subject;
  stream: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    code: string;
    name: string;
  };
  semesterNumber: number;
}

/**
 * Department Curriculum Summary
 */
export interface CurriculumSummary {
  department: Department;
  totalSemesters: number;
  totalCredits: number;
  totalSubjects: number;
  creditsPerSemester: {
    semesterNumber: number;
    credits: number;
    subjectCount: number;
  }[];
  categoryBreakdown: {
    category: CourseCategory;
    count: number;
    credits: number;
  }[];
}
