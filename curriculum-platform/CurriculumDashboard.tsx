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
  )
};

interface CurriculumDashboardProps {
  initialDataset?: CurriculumRootDataset;
}

export const CurriculumDashboard: React.FC<CurriculumDashboardProps> = ({ initialDataset }) => {
  // Load dataset directly from props or default import
  const [dataset, setDataset] = useState<CurriculumRootDataset>(initialDataset || defaultCurriculumDataset);
  const [selectedStreamId, setSelectedStreamId] = useState<string>('engineering-tech');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('cse');
  const [selectedSemesterNumber, setSelectedSemesterNumber] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalSubject, setActiveModalSubject] = useState<Subject | null>(null);

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

  // Derived current department
  const currentDept = useMemo<Department | undefined>(() => {
    if (!currentStream) return undefined;
    const found = currentStream.departments.find((d) => d.id === selectedDeptId);
    if (found) return found;
    // Default to first populated or first dept
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

  // Filtered subjects in the active semester
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

  if (!dataset) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-semibold tracking-wide text-slate-300">
            Loading Tamil Nadu Curriculum Hierarchy...
          </h2>
        </div>
      </div>
    );
  }

  // Category Badge Pill Styling
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
      default:
        return 'bg-slate-700/30 text-slate-400 border border-slate-700/50';
    }
  };

  const renderStreamIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Icons.Cpu />;
      case 'Activity':
        return <Icons.Activity />;
      case 'FlaskConical':
        return <Icons.FlaskConical />;
      case 'TrendingUp':
        return <Icons.TrendingUp />;
      case 'BookOpen':
        return <Icons.BookOpen />;
      case 'Scale':
        return <Icons.Scale />;
      case 'Sprout':
        return <Icons.Sprout />;
      default:
        return <Icons.Layers />;
    }
  };

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
                <span className="hidden md:inline-flex text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  R2021
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                தமிழ்நாடு உயர் கல்வி பாடத்திட்டத் தளம் • Anna University & Higher Ed Portal
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
              placeholder="Search code (CS3491), topic, machine learning..."
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Breadcrumb Hierarchy Bar */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500">Tamil Nadu Higher Education</span>
          <Icons.ChevronRight />
          <button
            onClick={() => setSearchQuery('')}
            className="hover:text-indigo-400 font-medium text-slate-300 transition-colors"
          >
            {currentStream?.name}
          </button>
          <Icons.ChevronRight />
          <span className="text-indigo-400 font-semibold">{currentDept?.code}</span>
          {currentDept?.isCurriculumPopulated && currentSemester && (
            <>
              <Icons.ChevronRight />
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                {currentSemester.title} ({currentSemester.totalCredits} Credits)
              </span>
            </>
          )}
          <span className="ml-auto text-[11px] text-slate-500 hidden sm:inline">
            Governed by: <strong className="text-slate-400">{currentStream?.governingBody}</strong>
          </span>
        </div>

        {/* Search Results Dropdown Overlay / Panel if search active */}
        {searchQuery.trim().length > 0 ? (
          <div className="bg-slate-900/90 rounded-2xl border border-indigo-500/30 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">
                  Search Results for &ldquo;{searchQuery}&rdquo;
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {searchResults.length} matches
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No matching courses found across streams and syllabus outlines.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto pr-1">
                {searchResults.map((result, idx) => (
                  <div
                    key={`${result.department.code}-${result.subject.code}-${idx}`}
                    onClick={() => {
                      setSelectedStreamId(result.stream.id);
                      setSelectedDeptId(result.department.id);
                      setSelectedSemesterNumber(result.semesterNumber);
                      setActiveModalSubject(result.subject);
                    }}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/40 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {result.subject.code}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCategoryBadgeClass(result.subject.category)}`}>
                        {result.subject.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {result.subject.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                      <span>{result.department.code} • Sem {result.semesterNumber}</span>
                      <span className="font-mono text-indigo-400">{result.subject.credits} Credits</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Level 1: Stream Selection Pills */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Icons.Layers />
              Level 1: Academic Streams ({dataset.streams.length})
            </h2>
            <span className="text-xs text-slate-500">Tamil Nadu Higher Education Matrix</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {dataset.streams.map((stream) => {
              const isActive = stream.id === selectedStreamId;
              return (
                <button
                  key={stream.id}
                  onClick={() => {
                    setSelectedStreamId(stream.id);
                    // Automatically choose first branch
                    if (stream.departments.length > 0) {
                      const preferred = stream.departments.find((d) => d.isCurriculumPopulated) || stream.departments[0];
                      setSelectedDeptId(preferred.id);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                    isActive
                      ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 bg-slate-800/50 group-hover:text-slate-200'
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
                        isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
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
              const isSelected = dept.id === currentDept?.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => {
                    setSelectedDeptId(dept.id);
                    setSelectedSemesterNumber(1);
                  }}
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
                      <span className="text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                        {dept.durationYears} Years
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

        {/* Level 3 & Level 4: Curriculum View for Populated Branches */}
        {currentDept?.isCurriculumPopulated ? (
          <div className="space-y-6 pt-2">
            {/* Level 3: Semester Tabs & Metrics Bar */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {currentDept.code}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {currentDept.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Regulation: {currentDept.regulation} • Cumulative Credits: <strong className="text-indigo-400">{currentDept.totalDegreeCredits} Credits</strong>
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {['All', 'Theory', 'Lab', 'Elective', 'Project'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester Grid Navigation Pills */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {currentDept.semesters.map((sem) => {
                  const isCurrent = sem.semesterNumber === selectedSemesterNumber;
                  return (
                    <button
                      key={sem.semesterNumber}
                      onClick={() => setSelectedSemesterNumber(sem.semesterNumber)}
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

              {/* Semester Credit Load Metrics */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3">
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
                  Semester Credits: {semesterMetrics.totalCredits} / 163.0
                </div>
              </div>
            </section>

            {/* Level 4: Courses / Subjects Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Icons.Award />
                  Level 4: Courses & Syllabus Headings ({displayedSubjects.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Click any course card to inspect full unit syllabus & contact hours
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSubjects.map((subject) => (
                  <div
                    key={subject.code}
                    onClick={() => setActiveModalSubject(subject)}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-3"
                  >
                    <div>
                      {/* Card Header: Code & Category Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
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

                      {/* Course Title */}
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mt-2 leading-snug">
                        {subject.title}
                      </h4>

                      {/* Syllabus Outline Snippet */}
                      {subject.syllabusOutline && subject.syllabusOutline.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          {subject.syllabusOutline.slice(0, 2).map((topic, tIdx) => (
                            <p key={tIdx} className="text-[11px] text-slate-400 line-clamp-1 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-indigo-500/60 shrink-0" />
                              {topic}
                            </p>
                          ))}
                          {subject.syllabusOutline.length > 2 && (
                            <span className="text-[10px] text-indigo-400/80 font-medium">
                              +{subject.syllabusOutline.length - 2} more syllabus units...
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Credits & Hours */}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/70 text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Icons.Clock />
                        {subject.contactHours ? (
                          <span>L:{subject.contactHours.lecture} T:{subject.contactHours.tutorial} P:{subject.contactHours.practical}</span>
                        ) : (
                          <span>Credits: {subject.credits}</span>
                        )}
                      </div>
                      <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {subject.credits} Cr
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Non-Populated Standardized Stream Overview */
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Icons.GraduationCap />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold text-white">
                {currentDept?.name} ({currentDept?.code})
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standardized Tamil Nadu curriculum framework under <strong>{currentDept?.regulation}</strong>.
                Program Duration: {currentDept?.durationYears} Years ({currentDept?.totalSemesters} Semesters).
              </p>
              <div className="pt-2">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Degree Hierarchy Standard Master Record
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Level 4 Detail Modal: Complete Course Syllabus & Specifications */}
      {activeModalSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
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
                    <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
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

            {/* Modal Quick Meta Grid */}
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

            {/* Syllabus Outline Units */}
            {activeModalSubject.syllabusOutline && activeModalSubject.syllabusOutline.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Icons.BookOpen />
                  Detailed Syllabus & Unit Topics
                </h4>
                <div className="space-y-2">
                  {activeModalSubject.syllabusOutline.map((unitText, uIdx) => (
                    <div
                      key={uIdx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-bold shrink-0 text-[10px] border border-indigo-500/20">
                        {uIdx + 1}
                      </span>
                      <span>{unitText}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
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
