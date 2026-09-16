import { useState } from "react";
import { Link } from "react-router-dom";
import { courses, technologies } from "../data/mockData";

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const sortOptions = ["Popular", "Newest", "Highest Rated", "Most Students"];

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-amber-100 text-amber-700",
    Advanced: "bg-red-100 text-red-700",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[level] || "bg-slate-100 text-slate-600"}`}>{level}</span>;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Courses() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [tech, setTech] = useState("All");
  const [sort, setSort] = useState("Popular");

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.technology.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficulty === "All" || c.difficulty === difficulty;
    const matchTech = tech === "All" || c.technology === tech;
    return matchSearch && matchDiff && matchTech;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Courses</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Explore Courses</h1>
        <p className="text-slate-500">Learn at your pace with structured, beginner-friendly to advanced courses.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.804 7.5 7.5 0 0015.803 15.803z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses, technologies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {difficulties.map(d => <option key={d}>{d}</option>)}
          </select>
          <select
            value={tech}
            onChange={e => setTech(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Technologies</option>
            {technologies.map(t => <option key={t.name}>{t.name}</option>)}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {sortOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Tech filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setTech("All")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tech === "All" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"}`}
        >
          All
        </button>
        {technologies.map(t => (
          <button
            key={t.name}
            onClick={() => setTech(t.name)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tech === t.name ? "bg-indigo-600 text-white" : `${t.color} hover:opacity-80`}`}
          >
            <span>{t.icon}</span>
            {t.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-5">{filtered.length} course{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No courses found</h3>
          <p className="text-slate-500 text-sm">Try a different search or clear filters.</p>
          <button onClick={() => { setSearch(""); setDifficulty("All"); setTech("All"); }} className="mt-4 text-sm text-indigo-600 hover:underline">Clear all filters</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => (
            <Link key={course.id} to={`/courses/${course.id}`} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <DifficultyBadge level={course.difficulty} />
                </div>
                <div className="absolute bottom-3 left-3 text-2xl">{course.icon}</div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                   {course.rating}
                </div>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{course.technology}</span>
                <h3 className="font-bold text-slate-900 mt-1 mb-2 group-hover:text-indigo-600 transition-colors leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-book-half" viewBox="0 0 16 16">
                      <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
                    </svg>
                    {course.lessons} lessons</span>
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
                    </svg>
                    {course.duration}</span>
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                    </svg>
                    {(course.students / 1000).toFixed(0)}K</span>
                </div>
                {course.progress > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">In progress</span>
                      <span className="text-xs font-bold text-indigo-600">{course.progress}%</span>
                    </div>
                    <ProgressBar value={course.progress} />
                    <button className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">Continue →</button>
                  </div>
                ) : (
                  <button className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors">Start Course</button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
