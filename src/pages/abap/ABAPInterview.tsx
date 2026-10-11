import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Terminal,
  Sparkles,
  Zap,
  CheckCircle2,
  Code2,
  ExternalLink,
} from "lucide-react"

interface InterviewQA {
  id: string
  question: string
  category: "ABAP Objects (OOPS)" | "Core ABAP" | "S/4HANA & CDS" | "Performance" | "Enhancements"
  level: "Junior" | "Mid" | "Senior"
  answer: string
  codeSnippet?: string
}

const INTERVIEW_QUESTIONS: InterviewQA[] = [
  {
    id: "qa-1",
    question: "What is the difference between an Abstract Class and an Interface in ABAP OO?",
    category: "ABAP Objects (OOPS)",
    level: "Mid",
    answer:
      "An Interface contains only method declarations and cannot have any implementation or instance attributes. Any class that implements an interface must provide code for all of its methods. An Abstract Class can contain both implemented methods and abstract methods (methods without code that subclasses must override). While a class can implement multiple interfaces, it can only inherit from a single abstract or concrete superclass.",
    codeSnippet: `* Interface: Pure declaration
INTERFACE lif_renderer.
  METHODS render.
ENDINTERFACE.

* Abstract Class: Can provide default behavior
CLASS lcl_shape DEFINITION ABSTRACT.
  PUBLIC SECTION.
    METHODS:
      get_area ABSTRACT RETURNING VALUE(rv_area) TYPE f,
      print_info. " Concrete method implemented here
ENDCLASS.`,
  },
  {
    id: "qa-2",
    question: "Explain the difference between Upcasting (Narrowing) and Downcasting (Widening ?=).",
    category: "ABAP Objects (OOPS)",
    level: "Senior",
    answer:
      "Upcasting (Narrowing) assigns a subclass reference to a superclass reference variable (e.g., lo_super = lo_sub). It is always safe at compile-time because a subclass is guaranteed to have all components of the superclass. Downcasting (Widening) assigns a superclass reference to a subclass variable using the '?=' operator (e.g., lo_sub ?= lo_super). It is validated dynamically at runtime. If the underlying object is not an instance of the target subclass, the system raises CX_SY_MOVE_CAST_ERROR.",
    codeSnippet: `DATA: lo_vehicle TYPE REF TO lcl_vehicle,
      lo_car     TYPE REF TO lcl_car.

" Upcasting: Compile-time safe
lo_vehicle = NEW lcl_car( ).

" Downcasting: Dynamic runtime check
TRY.
    lo_car ?= lo_vehicle.
    lo_car->accelerate( ).
  CATCH cx_sy_move_cast_error.
    WRITE: / 'Downcast failed'.
ENDTRY.`,
  },
  {
    id: "qa-3",
    question: "What are the three internal table types in ABAP, and when should each be used?",
    category: "Core ABAP",
    level: "Junior",
    answer:
      "1. STANDARD TABLE: Stored with linear index. Read by index is O(1); search by non-key or key is O(N) unless sorted with BINARY SEARCH. Ideal for sequential data processing.\n2. SORTED TABLE: Always kept in sort order according to unique or non-unique key. Key lookups take O(log N). Ideal for master tables and binary lookups.\n3. HASHED TABLE: Managed via a hash algorithm. Key lookups are O(1) constant time regardless of table size. Must always have UNIQUE KEY. Ideal for large reference tables.",
    codeSnippet: `DATA: lt_standard TYPE STANDARD TABLE OF ty_row,
      lt_sorted   TYPE SORTED TABLE OF ty_row WITH UNIQUE KEY id,
      lt_hashed   TYPE HASHED TABLE OF ty_row WITH UNIQUE KEY id.`,
  },
  {
    id: "qa-4",
    question: "Why should you prefer Field Symbols (<fs>) over INTO work areas in large LOOPs?",
    category: "Performance",
    level: "Mid",
    answer:
      "When using 'LOOP AT itab INTO wa', the ABAP runtime performs a memory copy of each row into the work area buffer on every iteration, and modifying the row requires a secondary 'MODIFY itab FROM wa'. Using 'LOOP AT itab ASSIGNING <fs>' works via direct pointer referencing. No memory is duplicated, and changing fields on <fs> updates the table row in-place immediately, providing 2x–5x higher execution speeds on large datasets.",
    codeSnippet: `" High-performance pattern:
LOOP AT gt_large_dataset ASSIGNING FIELD-SYMBOL(<fs_row>).
  <fs_row>-status = 'PROCESSED'. " Direct in-place mutation
ENDLOOP.`,
  },
  {
    id: "qa-5",
    question: "What are the key prerequisites before using FOR ALL ENTRIES IN in OpenSQL?",
    category: "Performance",
    level: "Senior",
    answer:
      "1. Check that the driver table is NOT initial (IF itab IS NOT INITIAL). If itab is empty, OpenSQL bypasses the WHERE condition and performs a full table scan of the database table!\n2. Remove duplicate keys from the driver table (SORT itab BY key; DELETE ADJACENT DUPLICATES) because OpenSQL implicitly does duplicate suppression on the database result, which can cause severe overhead on large driver tables.\n3. Include all primary key fields in the SELECT list so SAP does not discard legitimately matching lines during result deduplication.",
  },
  {
    id: "qa-6",
    question: "What is a CDS View in SAP S/4HANA, and how does it differ from a classical database view?",
    category: "S/4HANA & CDS",
    level: "Mid",
    answer:
      "Classical database views (SE11) perform basic projection and inner joins on tables without SQL calculations or parameters. Core Data Services (CDS) Views are defined in the ABAP development layer using DDL. They support arithmetic expressions, CASE statements, associations, input parameters, built-in SQL functions, and authorization checks. CDS views push calculation down into the SAP HANA in-memory database engine for maximum throughput.",
  },
  {
    id: "qa-7",
    question: "What is the difference between a BAdI and a User Exit?",
    category: "Enhancements",
    level: "Mid",
    answer:
      "User Exits are procedural subroutines (FORM user_exit_...) implemented inside SAP standard include programs (found mostly in Sales & Distribution / SD). They are modification-prone and single-implementation only. BAdIs (Business Add-Ins) are object-oriented enhancement hooks based on interfaces. Modern New BAdIs (enhancement spots) support multiple implementations, filter criteria, and switch framework activation without touching SAP standard include files.",
  },
  {
    id: "qa-8",
    question: "What are the rules and restrictions for a CLASS_CONSTRUCTOR in ABAP?",
    category: "ABAP Objects (OOPS)",
    level: "Senior",
    answer:
      "A static constructor (CLASS_CONSTRUCTOR) is executed automatically exactly once when the class is first accessed in the current session. It must be declared in the PUBLIC SECTION, takes NO importing or exporting parameters, and cannot throw exceptions. It is commonly used to initialize static lookup tables or cache configurations.",
  },
]

export default function ABAPInterview() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ "qa-1": true, "qa-2": true })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCat, setSelectedCat] = useState<string>("All")

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const categories = [
    "All",
    "ABAP Objects (OOPS)",
    "Core ABAP",
    "S/4HANA & CDS",
    "Performance",
    "Enhancements",
  ]

  const filteredQuestions = INTERVIEW_QUESTIONS.filter((qa) => {
    const matchesCat = selectedCat === "All" || qa.category === selectedCat
    const matchesSearch =
      qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qa.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Recruitment Preparation Q&amp;A
            </span>
            <span className="text-xs text-slate-400">Enterprise Technical Assessments</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
                Top SAP ABAP Interview Questions
              </h1>
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                Master the most frequently asked technical interview questions across Core ABAP,
                Object-Oriented ABAP, Performance Tuning, and SAP S/4HANA.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/compilers/abap-oops"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                ABAP Objects Guide
              </Link>
              <Link
                to="/compilers/abap-compiler"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all"
              >
                <Terminal className="w-4 h-4 text-indigo-400" />
                Open ABAP Compiler
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Category Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search interview questions by keyword (e.g., cast, for all entries, cds)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCat === c
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-4">
          {filteredQuestions.map((qa) => {
            const isOpen = Boolean(openIds[qa.id])
            return (
              <div
                key={qa.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleAccordion(qa.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {qa.category}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          qa.level === "Junior"
                            ? "bg-emerald-50 text-emerald-700"
                            : qa.level === "Mid"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {qa.level}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                      {qa.question}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-1">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
                    <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {qa.answer}
                    </div>

                    {qa.codeSnippet && (
                      <div className="mt-3">
                        <div className="bg-slate-900 text-slate-400 px-3 py-1.5 rounded-t-lg text-[11px] font-mono flex items-center gap-2">
                          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Code Example</span>
                        </div>
                        <pre className="bg-slate-950 text-indigo-100 p-4 rounded-b-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                          <code>{qa.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
