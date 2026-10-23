import React, { useState, useMemo, useEffect } from 'react';
import {
  Stream,
  Department,
  Semester,
  Subject,
  CourseCategory,
  SubjectSearchResult,
  CurriculumRootDataset
} from './types';
import curriculumJson from './curriculumData.json';

const defaultCurriculumDataset: CurriculumRootDataset = curriculumJson as unknown as CurriculumRootDataset;

// Icons using inline SVG for zero-dependency, guaranteed cross-environment compatibility
const Icons = {
  Cpu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
      <rect x="9" y="9" width="6" height="6" strokeWidth="2" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  FlaskConical: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M10 2v7.31L4.1 19.46A2 2 0 005.8 22h12.4a2 2 0 001.7-2.54L14 9.31V2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8.5" y1="2" x2="15.5" y2="2" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 16h11" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17 6 23 6 23 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  BookOpen: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Scale: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 21h10M5 8h14" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Sprout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M7 20h10M12 20v-8" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12a5 5 0 005-5c0-3-3-3-3-3s0 3-2 3c0 0-2 0-2-3s-3 0-3 3a5 5 0 005 5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Layers: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  GraduationCap: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Award: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="7" strokeWidth="2" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 12 11 14 15 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Building: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2" />
      <line x1="9" y1="6" x2="9" y2="6.01" strokeWidth="3" />
      <line x1="15" y1="6" x2="15" y2="6.01" strokeWidth="3" />
      <line x1="9" y1="12" x2="9" y2="12.01" strokeWidth="3" />
      <line x1="15" y1="12" x2="15" y2="12.01" strokeWidth="3" />
      <line x1="9" y1="18" x2="9" y2="18.01" strokeWidth="3" />
      <line x1="15" y1="18" x2="15" y2="18.01" strokeWidth="3" />
    </svg>
  )
};

interface CurriculumDashboardProps {
  initialDataset?: CurriculumRootDataset;
}

export const CurriculumDashboard: React.FC<CurriculumDashboardProps> = ({ initialDataset }) => {
  // Load dataset directly from props or default import
  const [dataset, setDataset] = useState<CurriculumRootDataset>(initialDataset || defaultCurriculumDataset);
  const [selectedStreamId, setSelectedStreamId] = useState<string>('engineering-tech');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('eee');
  const [selectedSemesterNumber, setSelectedSemesterNumber] = useState<number>(1);
  const [selectedInstitutionType, setSelectedInstitutionType] = useState<string>('Affiliated Non-Autonomous Institutions');
  const [selectedRegulation, setSelectedRegulation] = useState<string>('Regulation 2021');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalSubject, setActiveModalSubject] = useState<Subject | null>(null);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  useEffect(() => {
    if (initialDataset) {
      setDataset(initialDataset);
    }
  }, [initialDataset]);

  // Derived current stream
  const currentStream = useMemo<Stream | undefined>(() => {
    if (!dataset) return undefined;
    return dataset.streams.find((s) => s.id === selectedStreamId) || dataset.streams[0];
  }, [dataset, selectedStreamId]);

  // Derived current department with case-insensitive protection
  const currentDept = useMemo<Department | undefined>(() => {
    if (!currentStream) return undefined;
    const found = currentStream.departments.find(
      (d) => d.id.toLowerCase() === selectedDeptId.toLowerCase() || d.code.toLowerCase() === selectedDeptId.toLowerCase()
    );
    if (found) return found;
    const populated = currentStream.departments.find((d) => d.isCurriculumPopulated);
    return populated || currentStream.departments[0];
  }, [currentStream, selectedDeptId]);

  // Derived current semester
  const currentSemester = useMemo<Semester | undefined>(() => {
    if (!currentDept || !currentDept.semesters || currentDept.semesters.length === 0) return undefined;
    return (
      currentDept.semesters.find((s) => s.semesterNumber === selectedSemesterNumber) ||
      currentDept.semesters[0]
    );
  }, [currentDept, selectedSemesterNumber]);

  // State handlers ensuring complete synchronization
  const handleSelectStream = (streamId: string) => {
    setSelectedStreamId(streamId);
    const targetStream = dataset?.streams.find((s) => s.id === streamId);
    if (targetStream && targetStream.departments.length > 0) {
      const preferred = targetStream.departments.find((d) => d.isCurriculumPopulated) || targetStream.departments[0];
      setSelectedDeptId(preferred.id);
    }
    setSelectedSemesterNumber(1);
    setSelectedSubjectCode(null);
    setSelectedTopic('');
    setSearchQuery('');
  };

  const handleSelectDept = (deptId: string) => {
    setSelectedDeptId(deptId);
    setSelectedSemesterNumber(1);
    setSelectedSubjectCode(null);
    setSelectedTopic('');
  };

  const handleSelectSemester = (semNum: number) => {
    setSelectedSemesterNumber(semNum);
    setSelectedSubjectCode(null);
    setSelectedTopic('');
  };

  const handleSelectRegulation = (regCode: string) => {
    setSelectedRegulation(regCode);
    setSelectedSubjectCode(null);
    setSelectedTopic('');
  };

  const handleSelectInstitutionType = (instType: string) => {
    setSelectedInstitutionType(instType);
  };

  const notifyParentSubjectSelected = (sub: Subject, dept?: Department, sem?: number, topic?: string) => {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'AURA_ACADEMIC_SUBJECT_SELECTED',
          standardOrDept: dept?.name || dept?.code || currentDept?.name || 'Higher Education Degree',
          semester: sem || selectedSemesterNumber || 1,
          subjectName: sub.title,
          subjectCode: sub.code,
          currentTopic: topic || sub.syllabusOutline?.[0] || 'Full Syllabus'
        },
        '*'
      );
    }
  };

  // Search Results
  const searchResults = useMemo<SubjectSearchResult[]>(() => {
    if (!dataset || !searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    const results: SubjectSearchResult[] = [];

    for (const stream of dataset.streams) {
      for (const dept of stream.departments) {
        if (!dept.semesters) continue;
        for (const sem of dept.semesters) {
          for (const sub of sem.subjects) {
            const matchesCode = sub.code.toLowerCase().includes(query);
            const matchesTitle = sub.title.toLowerCase().includes(query);
            const matchesCategory = sub.category.toLowerCase().includes(query);
            const matchesSyllabus = sub.syllabusOutline?.some((line) =>
              line.toLowerCase().includes(query)
            );

            if (matchesCode || matchesTitle || matchesCategory || matchesSyllabus) {
              results.push({
                subject: sub,
                stream: { id: stream.id, name: stream.name },
                department: { id: dept.id, code: dept.code, name: dept.name },
                semesterNumber: sem.semesterNumber
              });
            }
          }
        }
      }
    }
    return results;
  }, [dataset, searchQuery]);

  // Displayed subjects for active semester
  const displayedSubjects = useMemo<Subject[]>(() => {
    if (!currentSemester) return [];
    if (selectedCategory === 'All') return currentSemester.subjects;
    return currentSemester.subjects.filter((s) => s.category === selectedCategory);
  }, [currentSemester, selectedCategory]);

  // Semester metrics
  const semesterMetrics = useMemo(() => {
    if (!currentSemester) return { totalCredits: 0, count: 0, theory: 0, lab: 0, elective: 0, project: 0 };
    const subs = currentSemester.subjects;
    return {
      totalCredits: currentSemester.totalCredits,
      count: subs.length,
      theory: subs.filter((s) => s.category === 'Theory').length,
      lab: subs.filter((s) => s.category === 'Lab').length,
      elective: subs.filter((s) => s.category === 'Elective').length,
      project: subs.filter((s) => s.category === 'Project').length
    };
  }, [currentSemester]);

  const getCategoryBadgeClass = (category: CourseCategory) => {
    switch (category) {
      case 'Theory':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Lab':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Elective':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Project':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Integrated':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'Mandatory':
        return 'bg-slate-700/40 text-slate-300 border border-slate-600/50';
      default:
        return 'bg-slate-700/30 text-slate-400 border border-slate-700/50';
    }
  };

  const renderStreamIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Icons.Cpu />;
      case 'Activity': return <Icons.Activity />;
      case 'FlaskConical': return <Icons.FlaskConical />;
      case 'TrendingUp': return <Icons.TrendingUp />;
      case 'BookOpen': return <Icons.BookOpen />;
      case 'Scale': return <Icons.Scale />;
      case 'Sprout': return <Icons.Sprout />;
      default: return <Icons.Layers />;
    }
  };

  const isR2021 = selectedRegulation.includes('2021');
  const isPopulatedForSelection = currentDept?.isCurriculumPopulated && isR2021 && currentDept.semesters.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <Icons.GraduationCap />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Tamil Nadu Curriculum Intelligence
                </h1>
                <span className="hidden md:inline-flex text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Anna Univ R2021 Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                தமிழ்நாடு உயர் கல்வி பாடத்திட்டத் தளம் • Choice Based Credit System (CAC Anna University)
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icons.Search />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code (EE3401, CS3491), topic, power systems..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="Clear search query"
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                <Icons.Close />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Breadcrumb Hierarchy Navigation Bar */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500">Tamil Nadu Higher Education</span>
          <Icons.ChevronRight />
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="hover:text-indigo-400 font-medium text-slate-300 transition-colors"
          >
            {currentStream?.name}
          </button>
          <Icons.ChevronRight />
          <span className="text-indigo-400 font-semibold">{currentDept?.code}</span>
          <Icons.ChevronRight />
          <span className="text-slate-300 font-medium">{selectedInstitutionType.split(' ')[0]}</span>
          <Icons.ChevronRight />
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
            {selectedRegulation}
          </span>
          {isPopulatedForSelection && currentSemester && (
            <>
              <Icons.ChevronRight />
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                {currentSemester.title} ({currentSemester.totalCredits} Cr)
              </span>
            </>
          )}
          <span className="ml-auto text-[11px] text-slate-500 hidden sm:inline">
            Affiliated to: <strong className="text-slate-400">{currentStream?.governingBody}</strong>
          </span>
        </div>

        {/* Level 1: Stream Selection Pills */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Icons.Layers />
              Level 1: Academic Streams ({dataset?.streams.length})
            </h2>
            <span className="text-xs text-slate-500">Master Stream Registry</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {dataset?.streams.map((stream) => {
              const isActive = stream.id === selectedStreamId;
              return (
                <button
                  key={stream.id}
                  type="button"
                  onClick={() => handleSelectStream(stream.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                    isActive
                      ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive
                          ? 'text-indigo-400 bg-indigo-500/10'
                          : 'text-slate-400 bg-slate-800/50 group-hover:text-slate-200'
                      }`}
                    >
                      {renderStreamIcon(stream.icon)}
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                      {stream.departments.length}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`text-xs font-semibold leading-snug line-clamp-1 ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {stream.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {stream.tamilName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Level 2: Department Selection Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Icons.GraduationCap />
              Level 2: Departments & Branches in {currentStream?.name} ({currentStream?.departments.length})
            </h2>
            <span className="text-xs text-slate-500">{currentStream?.governingBody}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentStream?.departments.map((dept) => {
              const isSelected = dept.id.toLowerCase() === currentDept?.id.toLowerCase();
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleSelectDept(dept.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/40 shadow-md shadow-indigo-950/40'
                      : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700/60">
                      {dept.code}
                    </span>
                    {dept.isCurriculumPopulated ? (
                      <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active R2021
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        In Verification
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1 mb-1">
                    {dept.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {dept.overview}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 mt-2.5 border-t border-slate-800/60">
                    <span>{dept.degreeType} • {dept.totalSemesters} Semesters</span>
                    {dept.totalDegreeCredits && (
                      <span className="font-mono text-indigo-400 font-semibold">
                        ~{dept.totalDegreeCredits} Cr
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Structured Governance & Regulation Strip */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  {currentDept?.code}
                </span>
                <h3 className="text-base font-bold text-white">
                  {currentDept?.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>University: <strong className="text-slate-300">Anna University, Chennai</strong></span>
                <span>•</span>
                <span>Degree: <strong className="text-slate-300">{currentDept?.degreeType} ({currentDept?.durationYears} Years)</strong></span>
                <span>•</span>
                <span>Official CAC Source: <a href="https://cac.annauniv.edu/" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">cac.annauniv.edu ↗</a></span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                <Icons.ShieldCheck />
                <span>Verified CAC CBCS Syllabus</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Icons.Building />
                Institution Type:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Affiliated Non-Autonomous Institutions',
                  'Autonomous Engineering Colleges',
                  'University Departments (CEG / MIT)'
                ].map((type) => {
                  const isActive = selectedInstitutionType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectInstitutionType(type)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all text-left ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      {type === 'Affiliated Non-Autonomous Institutions' ? '🏛️ Affiliated Non-Autonomous (CAC)' : type === 'Autonomous Engineering Colleges' ? '🏢 Autonomous Colleges' : '🎓 University Depts (CEG/MIT)'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Icons.Award />
                Academic Regulation:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'Regulation 2021', label: 'Regulation 2021 (CBCS)', status: 'Active Official' },
                  { code: 'Regulation 2025', label: 'Regulation 2025 (Draft)', status: 'In Preparation' }
                ].map((reg) => {
                  const isActive = selectedRegulation === reg.code;
                  return (
                    <button
                      key={reg.code}
                      type="button"
                      onClick={() => handleSelectRegulation(reg.code)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md ring-1 ring-indigo-400/50'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      <span>{reg.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        reg.code === 'Regulation 2021'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {reg.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Level 3 & Level 4: Curriculum Section */}
        {!isR2021 ? (
          <div className="p-8 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 text-xl font-bold">
                📜
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Anna University Regulation 2025 Status Advisory</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Draft Preview / Pending Academic Council Ratification
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              The official curriculum gazette for <strong>Regulation 2025</strong> for affiliated non-autonomous institutions is pending formal Academic Council ratification and Directorate of Technical Education gazetting by the Centre for Academic Courses (CAC). In compliance with academic integrity guidelines, subjects from prior regulations are not relabeled as 2025. The accredited, actively taught curriculum across Tamil Nadu colleges is <strong>Regulation 2021 (CBCS)</strong>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSelectRegulation('Regulation 2021')}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-950/40"
              >
                Switch to Active Verified Regulation 2021 (All 8 Semesters)
              </button>
              <a
                href="https://cac.annauniv.edu/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-300 hover:underline flex items-center gap-1"
              >
                View CAC Gazette Portal ↗
              </a>
            </div>
          </div>
        ) : isPopulatedForSelection ? (
          <div className="space-y-6 pt-2">
            {/* Level 3: Semester Tabs */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {currentDept.code}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {currentDept.name} • Semesters 1 to 8
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Governing Regulation: {currentDept.regulation} • Cumulative Degree Credits: <strong className="text-indigo-400">{currentDept.totalDegreeCredits} Credits</strong>
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {['All', 'Theory', 'Lab', 'Elective', 'Project', 'Mandatory'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester Tabs */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {currentDept.semesters.map((sem) => {
                  const isCurrent = sem.semesterNumber === selectedSemesterNumber;
                  return (
                    <button
                      key={sem.semesterNumber}
                      type="button"
                      onClick={() => handleSelectSemester(sem.semesterNumber)}
                      className={`py-2.5 px-2 rounded-xl text-center border transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        {sem.academicYear}
                      </div>
                      <div className="text-xs font-bold mt-0.5">Sem {sem.semesterNumber}</div>
                      <div className={`text-[10px] font-mono mt-1 ${isCurrent ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {sem.totalCredits} Cr
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Semester Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-slate-300">
                    {currentSemester?.title} Stats:
                  </span>
                  <span className="text-slate-400">
                    Total Courses: <strong className="text-white">{semesterMetrics.count}</strong>
                  </span>
                  <span className="text-slate-400">
                    Theory: <strong className="text-blue-400">{semesterMetrics.theory}</strong>
                  </span>
                  <span className="text-slate-400">
                    Labs: <strong className="text-emerald-400">{semesterMetrics.lab}</strong>
                  </span>
                  {semesterMetrics.elective > 0 && (
                    <span className="text-slate-400">
                      Electives: <strong className="text-amber-400">{semesterMetrics.elective}</strong>
                    </span>
                  )}
                  {semesterMetrics.project > 0 && (
                    <span className="text-slate-400">
                      Projects: <strong className="text-purple-400">{semesterMetrics.project}</strong>
                    </span>
                  )}
                </div>
                <div className="font-mono text-indigo-400 font-bold">
                  Semester Credits: {semesterMetrics.totalCredits} Cr
                </div>
              </div>
            </section>

            {/* Level 4: Subject Cards Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Icons.Award />
                  Level 4: Subject Cards for {currentSemester?.title} ({displayedSubjects.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Select any subject card to examine full syllabus breakdown
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSubjects.map((subject) => {
                  const isSelected = selectedSubjectCode === subject.code;
                  const currentTopicName = (subject.syllabusOutline && subject.syllabusOutline[0]) || 'Full Syllabus';

                  const handleSelectThisSubject = (topicOverride?: string) => {
                    const topicToUse = topicOverride || (isSelected && selectedTopic) || currentTopicName;
                    setSelectedSubjectCode(subject.code);
                    setSelectedTopic(topicToUse);
                    notifyParentSubjectSelected(subject, currentDept, currentSemester?.semesterNumber, topicToUse);
                  };

                  return (
                    <div
                      key={subject.code}
                      onClick={() => handleSelectThisSubject()}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group space-y-3 ${
                        isSelected
                          ? 'ring-2 ring-amber-500/80 bg-slate-800/90 border-amber-500/90 shadow-xl shadow-amber-950/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50 hover:bg-slate-850/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border transition-colors ${
                            isSelected
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                              : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                          }`}>
                            {subject.code}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {subject.electiveType && subject.electiveType !== 'None' && (
                              <span className="text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                {subject.electiveType}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryBadgeClass(subject.category)}`}>
                              {subject.category}
                            </span>
                          </div>
                        </div>

                        <h4 className={`text-sm font-bold transition-colors mt-2 leading-snug ${
                          isSelected ? 'text-amber-300' : 'text-slate-100 group-hover:text-amber-200'
                        }`}>
                          {subject.title}
                        </h4>

                        {subject.syllabusOutline && subject.syllabusOutline.length > 0 && (
                          <div className="mt-2.5 space-y-1">
                            {subject.syllabusOutline.slice(0, 2).map((topic, tIdx) => (
                              <p
                                key={tIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectThisSubject(topic);
                                }}
                                className={`text-[11px] line-clamp-1 flex items-center gap-1.5 transition-colors cursor-pointer rounded px-1.5 -mx-1.5 py-0.5 ${
                                  isSelected && selectedTopic === topic
                                    ? 'text-amber-300 bg-amber-500/15 font-semibold'
                                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
                                }`}
                                title="Click topic to load targeted lecture videos"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isSelected && selectedTopic === topic ? 'bg-amber-400' : 'bg-indigo-500/60'
                                }`} />
                                {topic}
                              </p>
                            ))}
                            {subject.syllabusOutline.length > 2 && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveModalSubject(subject);
                                }}
                                className="text-[10px] text-indigo-400 hover:text-amber-300 font-medium cursor-pointer block mt-1"
                              >
                                +{subject.syllabusOutline.length - 2} more syllabus units... (Inspect)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/70 text-slate-400">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Icons.Clock />
                          {subject.contactHours ? (
                            <span>L:{subject.contactHours.lecture} T:{subject.contactHours.tutorial} P:{subject.contactHours.practical}</span>
                          ) : (
                            <span>Credits: {subject.credits}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalSubject(subject);
                            }}
                            className="text-[10.5px] px-2 py-0.5 rounded text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                          >
                            Syllabus
                          </button>
                          <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {subject.credits} Cr
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 text-2xl">
              ⚠️
            </div>
            <div className="max-w-xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                <span>Curriculum Data Needs Verification</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {currentDept?.name} ({currentDept?.code})
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Official semester syllabi and course schemes for <strong>{currentDept?.name}</strong> under <strong>{selectedRegulation}</strong> are currently undergoing verified ingestion from the Centre for Academic Courses (CAC) repository (<a href="https://cac.annauniv.edu/" target="_blank" rel="noreferrer" className="text-indigo-400 underline">cac.annauniv.edu</a>). Academic Hub strictly validates all course codes against official gazettes before rendering to avoid placeholder data.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-left text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Degree</span>
                  <span className="font-semibold text-slate-200">{currentDept?.degreeType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Duration</span>
                  <span className="font-semibold text-slate-200">{currentDept?.durationYears} Years ({currentDept?.totalSemesters} Sem)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">University</span>
                  <span className="font-semibold text-slate-200">Anna University</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
                  <span className="font-semibold text-amber-400">In Verification</span>
                </div>
              </div>
              <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDataset(defaultCurriculumDataset);
                  }}
                  className="text-xs font-medium px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  🔄 Check for Verification Updates
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDept('eee')}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-colors"
                >
                  View Verified B.E. EEE (Sem 1-8) →
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDept('cse')}
                  className="text-xs font-medium px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  View B.E. CSE →
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDept('ece')}
                  className="text-xs font-medium px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  View B.E. ECE →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Syllabus Modal */}
      {activeModalSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {activeModalSubject.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryBadgeClass(activeModalSubject.category)}`}>
                    {activeModalSubject.category}
                  </span>
                  {activeModalSubject.electiveType && activeModalSubject.electiveType !== 'None' && (
                    <span className="text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {activeModalSubject.electiveType}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {activeModalSubject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalSubject(null)}
                title="Close syllabus modal"
                aria-label="Close syllabus modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Icons.Close />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Credits</span>
                <span className="font-mono text-indigo-400 font-bold text-sm">
                  {activeModalSubject.credits} Credits
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Contact Hours</span>
                <span className="font-mono text-slate-200">
                  {activeModalSubject.contactHours
                    ? `L:${activeModalSubject.contactHours.lecture} T:${activeModalSubject.contactHours.tutorial} P:${activeModalSubject.contactHours.practical}`
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Evaluation</span>
                <span className="text-slate-200 font-medium">Internal 40 / Univ 60</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Regulation</span>
                <span className="text-slate-200 font-medium">Anna Univ R2021</span>
              </div>
            </div>

            {activeModalSubject.syllabusOutline && activeModalSubject.syllabusOutline.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Icons.BookOpen />
                  Detailed Syllabus & Unit Modules
                </h4>
                <div className="space-y-2">
                  {activeModalSubject.syllabusOutline.map((unitText, uIdx) => (
                    <div
                      key={uIdx}
                      onClick={() => {
                        setSelectedSubjectCode(activeModalSubject.code);
                        setSelectedTopic(unitText);
                        notifyParentSubjectSelected(activeModalSubject, currentDept, currentSemester?.semesterNumber, unitText);
                      }}
                      className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 cursor-pointer transition-all ${
                        selectedSubjectCode === activeModalSubject.code && selectedTopic === unitText
                          ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                          : 'bg-slate-950/60 border-slate-800/70 text-slate-300 hover:border-amber-500/40 hover:bg-slate-850/60'
                      }`}
                      title="Click unit to select and load targeted YouTube lecture series"
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold shrink-0 text-[10px] border ${
                        selectedSubjectCode === activeModalSubject.code && selectedTopic === unitText
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {uIdx + 1}
                      </span>
                      <span className="flex-1">{unitText}</span>
                      <span className="text-[10px] text-amber-400/80 uppercase font-semibold shrink-0">▷ Select</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeModalSubject.title + ' ' + (selectedTopic || '') + ' lecture Tamil English')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-950/40 flex items-center gap-1.5 transition-all"
              >
                <span>▶</span> Watch Topic Deep-Dive on YouTube ↗
              </a>
              <button
                type="button"
                onClick={() => setActiveModalSubject(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                Close Syllabus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumDashboard;
