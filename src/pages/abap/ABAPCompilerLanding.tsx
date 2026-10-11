import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  Database,
  Sparkles,
  Zap,
  BookOpen,
  CheckCircle2,
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Download,
} from "lucide-react"

interface ABAPTemplate {
  id: string
  name: string
  tag: string
  code: string
  output: string
}

const TEMPLATES: ABAPTemplate[] = [
  {
    id: "hello-world",
    name: "Classic Hello World & Sy-Variables",
    tag: "Basic",
    code: `*&---------------------------------------------------------------------*
*& Report Z_HELLO_WORLD
*&---------------------------------------------------------------------*
REPORT z_hello_world.

DATA: lv_user_name TYPE string VALUE 'SkilTrix ABAP Developer',
      lv_date      TYPE d,
      lv_time      TYPE t.

lv_date = sy-datum.
lv_time = sy-uzeit.

WRITE: / '---------------------------------------------------------'.
WRITE: / '  Welcome to SkilTrix Cloud SAP ABAP Compiler!'.
WRITE: / '---------------------------------------------------------'.
WRITE: / 'Current User:     ', lv_user_name.
WRITE: / 'System Date:      ', lv_date.
WRITE: / 'System Time:      ', lv_time.
WRITE: / 'SAP Host System:  ', sy-host.
WRITE: / 'System Subrc:     ', sy-subrc.`,
    output: `---------------------------------------------------------
  Welcome to SkilTrix Cloud SAP ABAP Compiler!
---------------------------------------------------------
Current User:      SkilTrix ABAP Developer
System Date:       20261006
System Time:       123000
SAP Host System:   SKILTRIX-SAP-CLOUD
System Subrc:      0`,
  },
  {
    id: "itab-loop",
    name: "Internal Tables & Field Symbols",
    tag: "Data Structures",
    code: `REPORT z_itab_demo.

TYPES: BEGIN OF ty_employee,
         id     TYPE i,
         name   TYPE string,
         dept   TYPE string,
         salary TYPE p DECIMALS 2,
       END OF ty_employee.

DATA: gt_employees TYPE STANDARD TABLE OF ty_employee,
      gs_emp       TYPE ty_employee.

FIELD-SYMBOLS: <fs_emp> TYPE ty_employee.

" Populate employee table
gt_employees = VALUE #(
  ( id = 101 name = 'Elena Rostova' dept = 'SAP FI' salary = '85000.00' )
  ( id = 102 name = 'Marcus Vance'  dept = 'SAP MM' salary = '78000.00' )
  ( id = 103 name = 'Priya Sharma'  dept = 'SAP SD' salary = '92000.00' )
).

WRITE: / '=== EMPLOYEE PAYROLL REPORT (HIGH PERFORMANCE) ==='.
ULINE.

" Loop with Field Symbol (high performance, no memory copy)
LOOP AT gt_employees ASSIGNING <fs_emp>.
  WRITE: / |Emp ID: { <fs_emp>-id } | Name: { <fs_emp>-name WIDTH = 18 } | Dept: { <fs_emp>-dept } | Salary: \${ <fs_emp>-salary }|.
ENDLOOP.`,
    output: `=== EMPLOYEE PAYROLL REPORT (HIGH PERFORMANCE) ===
--------------------------------------------------------------------------------
Emp ID: 101 | Name: Elena Rostova      | Dept: SAP FI | Salary: $85000.00
Emp ID: 102 | Name: Marcus Vance       | Dept: SAP MM | Salary: $78000.00
Emp ID: 103 | Name: Priya Sharma       | Dept: SAP SD | Salary: $92000.00`,
  },
  {
    id: "opensql-query",
    name: "OpenSQL SELECT & SFLIGHT Join",
    tag: "Database",
    code: `REPORT z_opensql_sflight.

TYPES: BEGIN OF ty_flight_info,
         carrid   TYPE sflight-carrid,
         connid   TYPE sflight-connid,
         fldate   TYPE sflight-fldate,
         price    TYPE sflight-price,
         currency TYPE sflight-currency,
         planetype TYPE sflight-planetype,
       END OF ty_flight_info.

DATA: gt_flights TYPE STANDARD TABLE OF ty_flight_info.

" Emulated OpenSQL query on SAP SFLIGHT standard training table
SELECT carrid, connid, fldate, price, currency, planetype
  FROM sflight
  INTO TABLE @gt_flights
  UP TO 5 ROWS
  WHERE carrid = 'LH'
  ORDER BY fldate DESCENDING.

IF sy-subrc = 0.
  WRITE: / |Fetched { lines( gt_flights ) } flight records successfully.|.
  LOOP AT gt_flights INTO DATA(ls_flight).
    WRITE: / |Carrier: { ls_flight-carrid } | Flight: { ls_flight-connid } | Date: { ls_flight-fldate } | Fare: { ls_flight-price } { ls_flight-currency }|.
  ENDLOOP.
ELSE.
  WRITE: / 'No flight records found.'.
ENDIF.`,
    output: `Fetched 5 flight records successfully.
Carrier: LH | Flight: 0400 | Date: 20261101 | Fare: 950.00 EUR
Carrier: LH | Flight: 0402 | Date: 20261102 | Fare: 950.00 EUR
Carrier: LH | Flight: 0404 | Date: 20261103 | Fare: 1020.00 EUR
Carrier: LH | Flight: 0406 | Date: 20261104 | Fare: 890.00 EUR
Carrier: LH | Flight: 0408 | Date: 20261105 | Fare: 910.00 EUR`,
  },
  {
    id: "abap-oops-example",
    name: "ABAP Objects (OOPS) Class & Method",
    tag: "OOPS",
    code: `REPORT z_oops_demo.

CLASS lcl_calculator DEFINITION.
  PUBLIC SECTION.
    METHODS:
      add IMPORTING iv_a TYPE i iv_b TYPE i RETURNING VALUE(rv_res) TYPE i,
      multiply IMPORTING iv_a TYPE i iv_b TYPE i RETURNING VALUE(rv_res) TYPE i.
ENDCLASS.

CLASS lcl_calculator IMPLEMENTATION.
  METHOD add.
    rv_res = iv_a + iv_b.
  ENDMETHOD.

  METHOD multiply.
    rv_res = iv_a * iv_b.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA(lo_calc) = NEW lcl_calculator( ).
  
  DATA(lv_sum) = lo_calc->add( iv_a = 45 iv_b = 55 ).
  DATA(lv_prod) = lo_calc->multiply( iv_a = 12 iv_b = 8 ).

  WRITE: / |ABAP Objects Instance Created Successfully!|.
  WRITE: / |Calculated Sum (45 + 55): { lv_sum }|.
  WRITE: / |Calculated Product (12 * 8): { lv_prod }|.`,
    output: `ABAP Objects Instance Created Successfully!
Calculated Sum (45 + 55): 100
Calculated Product (12 * 8): 96`,
  },
]

export default function ABAPCompilerLanding() {
  const [selectedTemplate, setSelectedTemplate] = useState<ABAPTemplate>(TEMPLATES[0])
  const [activeCode, setActiveCode] = useState<string>(TEMPLATES[0].code)
  const [activeOutput, setActiveOutput] = useState<string>(TEMPLATES[0].output)
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const handleSelectTemplate = (t: ABAPTemplate) => {
    setSelectedTemplate(t)
    setActiveCode(t.code)
    setActiveOutput(t.output)
  }

  const handleRunCode = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setActiveOutput(selectedTemplate.output)
    }, 450)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Online SAP ABAP Compiler &amp; Simulator
            </span>
            <span className="text-xs text-slate-400">Zero SAP GUI Install • Instant In-Browser Execution</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
                Run SAP ABAP Code <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
                  Directly in Your Browser
                </span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed mb-6 max-w-3xl">
                The fastest way to learn and practice SAP ABAP. Write reports, test internal
                tables, execute OpenSQL queries, simulate ALV grids, and practice ABAP Objects (OOPS)
                with zero server configuration or SAP GUI licensing required.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/abap/editor"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                >
                  <Terminal className="w-5 h-5" />
                  Launch ABAP Studio IDE
                </Link>
                <Link
                  to="/compilers/abap-oops"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-xl border border-slate-700 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  ABAP Objects (OOPS) Guide
                </Link>
                <Link
                  to="/compilers/abap-practice"
                  className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-slate-300 font-semibold px-5 py-3 rounded-xl border border-slate-700 transition-all"
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Practice Exercises
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-800/80 rounded-2xl p-6 border border-slate-700 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Key Engine Capabilities
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Modern ABAP 7.40 / 7.50 syntax support (NEW, VALUE, COND)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>OpenSQL SELECT and SFLIGHT database simulation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Internal table operations with Field Symbols (<code className="text-indigo-300">&lt;fs&gt;</code>)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Live linter diagnostics and syntax error detection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive In-Browser Runner Playground */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-12">
          {/* Playground Top Bar */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">
                Select Template:
              </span>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedTemplate.id === t.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? "Running..." : "Run ABAP"}</span>
              </button>
              <Link
                to="/abap/editor"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Full Studio IDE</span>
              </Link>
            </div>
          </div>

          {/* Playground Code & Output Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-slate-950 min-h-[420px]">
            {/* Code Editor Pane */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="ml-2 text-slate-300">source.abap</span>
                </div>
                <span>ABAP 7.50</span>
              </div>
              <textarea
                value={activeCode}
                onChange={(e) => setActiveCode(e.target.value)}
                className="w-full flex-1 bg-slate-950 text-indigo-100 p-4 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-indigo-600 selection:text-white"
                spellCheck={false}
              />
            </div>

            {/* Output Console Pane */}
            <div className="lg:col-span-5 flex flex-col bg-slate-900/60">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">Standard List Output (WRITE:)</span>
                </div>
                <span className="text-emerald-400 text-[11px] font-semibold">SY-SUBRC = 0</span>
              </div>
              <div className="p-4 flex-1 font-mono text-xs text-slate-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-indigo-400 py-6">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span>Executing ABAP program in sandbox...</span>
                  </div>
                ) : (
                  activeOutput
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link
            to="/compilers/abap-oops"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
              ABAP Objects (OOPS)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Master classes, interfaces, inheritance, downcasting (?=), and design patterns with runnable code.
            </p>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore Guide <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/compilers/abap-practice"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
              ABAP Practice Coding
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Step-by-step programming problems from beginner internal tables to advanced OpenSQL join logic.
            </p>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Start Practice <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/compilers/abap-programs"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-sky-600 transition-colors">
              Enterprise Blueprints
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Real-world report templates, ALV grid displays, BAPI calls, file handlers, and interface code.
            </p>
            <span className="text-xs font-semibold text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Browse Programs <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/compilers/abap-interview-questions"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
              Top 50+ Interview Q&amp;A
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Ace your SAP developer recruitment tests with curated questions across Core ABAP, OOPS, and S/4HANA.
            </p>
            <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Review Q&amp;A <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* Why Learn ABAP Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Why Use SkilTrix for SAP ABAP Development?
          </h2>
          <p className="text-sm text-slate-500 mb-8 max-w-3xl">
            Setting up a traditional SAP NetWeaver AS ABAP server requires gigabytes of memory, complex licenses, and GUI installation. SkilTrix gives you immediate access to code, compile, and learn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Instant Cloud Simulator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Run standard reports, structure definitions, work areas, and WRITE statements in milliseconds.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Modern ABAP 7.40+ Syntax</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Practice clean inline declarations DATA(...), constructor operators VALUE #( ), and FOR iterations.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Real S/4HANA Readiness</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Build confidence for SAP developer certifications and placement technical interviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
