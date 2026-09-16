import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { courses } from "../data/mockData";

const lessonList = [
  { title: "Introduction to Python", duration: "8 min", done: true },
  { title: "Variables & Data Types", duration: "12 min", done: true },
  { title: "Operators & Expressions", duration: "10 min", done: true },
  { title: "Conditional Statements", duration: "14 min", done: true },
  { title: "Loops: for & while", duration: "16 min", done: false, active: true },
  { title: "Functions & Scope", duration: "20 min", done: false },
  { title: "Lists & List Operations", duration: "18 min", done: false },
  { title: "Tuples & Sets", duration: "12 min", done: false },
  { title: "Dictionaries", duration: "15 min", done: false },
  { title: "String Methods", duration: "14 min", done: false },
  { title: "Object-Oriented Programming", duration: "25 min", done: false },
  { title: "Exception Handling", duration: "16 min", done: false },
  { title: "File Input & Output", duration: "14 min", done: false },
  { title: "Modules & Packages", duration: "12 min", done: false },
  { title: "Final Project", duration: "45 min", done: false },
];

const tabs = ["Overview", "Lessons", "Practice", "Quizzes", "Discussion"];

const sampleCode = `for i in range(1, 6):
    print(f"Iteration {i}")
    if i == 3:
        print("  → Reached the middle!")

# Output:
# Iteration 1
# Iteration 2
# Iteration 3
#   → Reached the middle!
# Iteration 4
# Iteration 5`;

export default function CourseDetail() {
  const { id } = useParams();
  const course = courses.find(c => c.id === id) || courses[0];
  const [activeTab, setActiveTab] = useState("Lessons");
  const [activeLesson, setActiveLesson] = useState(4);
  const lesson = lessonList[activeLesson];

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link to="/courses" className="hover:text-indigo-600">Courses</Link>
        <span>/</span>
        <span className="text-slate-700">{course.title}</span>
      </nav>

      {/* Course Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{course.icon}</span>
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{course.technology}</span>
                <div className={`inline-flex ml-3 items-center text-xs font-medium px-2 py-0.5 rounded-full ${course.difficulty === "Beginner" ? "bg-green-100 text-green-700" : course.difficulty === "Intermediate" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                  {course.difficulty}
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{course.title}</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
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
                {course.duration} total</span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                </svg>
                {course.rating} rating</span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                </svg>
                {(course.students / 1000).toFixed(0)}K students</span>
            </div>
          </div>
          <div className="lg:w-64 shrink-0">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900">Your Progress</span>
                <span className="text-sm font-bold text-indigo-600">{course.progress}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full mb-3">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${course.progress}%` }} />
              </div>
              <p className="text-xs text-slate-400 mb-4">{Math.floor(course.lessons * course.progress / 100)} of {course.lessons} lessons completed</p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                {course.progress > 0 ? "Continue Learning →" : "Start Course →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Lessons tab layout */}
      {activeTab === "Lessons" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar: lesson list */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden lg:col-span-1">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Course Lessons</h3>
              <p className="text-xs text-slate-400 mt-0.5">{lessonList.filter(l => l.done).length} of {lessonList.length} completed</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {lessonList.map((l, i) => (
                <button
                  key={i}
                  onClick={() => setActiveLesson(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${activeLesson === i ? "bg-indigo-50" : ""}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${l.done ? "bg-green-500 text-white" : activeLesson === i ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {l.done ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${activeLesson === i ? "text-indigo-700" : l.done ? "text-slate-500" : "text-slate-900"}`}>{l.title}</p>
                    <p className="text-xs text-slate-400">{l.duration}</p>
                  </div>
                  {l.done && <span className="text-green-500 text-xs shrink-0">✓</span>}
                  {activeLesson === i && !l.done && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Main lesson content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Lesson {activeLesson + 1}</div>
                  <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{lesson.title}</h2>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0">{lesson.duration}</span>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 space-y-4">
                <p>
                  Loops are fundamental control flow structures that allow you to execute a block of code repeatedly.
                  Python provides two types of loops: <strong>for</strong> loops and <strong>while</strong> loops.
                </p>
                <p>
                  A <strong>for loop</strong> iterates over a sequence (like a list, string, or range) and executes the body for each element.
                  A <strong>while loop</strong> continues executing as long as a condition remains true.
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-4">The for Loop</h3>
                <p>The most common pattern uses <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-700">range()</code> to iterate a fixed number of times:</p>
              </div>

              {/* Code block */}
              <div className="mt-5 bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                  <span className="text-slate-400 text-xs font-mono">example.py</span>
                  <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5" /></svg>
                    Copy
                  </button>
                </div>
                <pre className="p-4 text-sm font-mono leading-7 overflow-x-auto text-slate-100">{sampleCode}</pre>
              </div>

              <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-indigo-900 mb-1">💡 Key Takeaways</h4>
                <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
                  <li><code className="bg-indigo-100 px-1 rounded text-xs">range(n)</code> generates numbers from 0 to n-1</li>
                  <li>Use <code className="bg-indigo-100 px-1 rounded text-xs">range(start, stop, step)</code> for custom sequences</li>
                  <li>The loop variable is available inside the loop body</li>
                  <li>Use <code className="bg-indigo-100 px-1 rounded text-xs">break</code> to exit early and <code className="bg-indigo-100 px-1 rounded text-xs">continue</code> to skip iterations</li>
                </ul>
              </div>

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                <button
                  onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))}
                  disabled={activeLesson === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setActiveLesson(Math.min(lessonList.length - 1, activeLesson + 1))}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Mark Complete & Next →
                </button>
              </div>
            </div>

            {/* Quick practice */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Practice This Concept</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🧪</span>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Print Multiplication Table</h4>
                    <p className="text-xs text-slate-600 mt-1">Write a Python loop that prints the multiplication table for the number 5 (from 5×1 to 5×10).</p>
                    <Link to="/compiler" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                      💻 Try in Compiler →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview tab */}
      {activeTab === "Overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>What You'll Learn</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {course.topics.map(topic => (
                <div key={topic} className="flex items-center gap-2 text-sm text-slate-700">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {topic}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-3">Prerequisites</h3>
              <p className="text-sm text-slate-500">No prior programming experience required. Just bring your curiosity and a computer!</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Course Stats</h3>
            <div className="space-y-3">
              {[
                { label: "Skill Level", value: course.difficulty },
                { label: "Lessons", value: `${course.lessons}` },
                { label: "Duration", value: course.duration },
                { label: "Rating", value: `${course.rating} / 5.0` },
                { label: "Students", value: `${(course.students / 1000).toFixed(0)}K enrolled` },
                { label: "Language", value: "English" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="font-medium text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
