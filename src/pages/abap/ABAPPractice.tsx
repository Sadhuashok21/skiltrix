import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Code2,
  Terminal,
  Search,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Zap,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react"

interface ABAPPracticeProblem {
  id: string
  title: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  topic: "Syntax & Types" | "Internal Tables" | "OpenSQL" | "ABAP OOPS" | "Performance"
  description: string
  inputSample: string
  expectedOutput: string
  starterCode: string
  solutionCode: string
  hint: string
}

const PRACTICE_PROBLEMS: ABAPPracticeProblem[] = [
  {
    id: "abap-p1",
    title: "Calculate Average and Sum from Internal Table",
    difficulty: "Beginner",
    topic: "Internal Tables",
    description:
      "Given an internal table containing student exam scores, write a program to calculate the total sum, record count, and floating-point average score using a LOOP AT statement.",
    inputSample: "Scores: 85, 92, 78, 90, 88",
    expectedOutput: "Total: 433 | Count: 5 | Average: 86.60",
    starterCode: `REPORT z_score_calc.

TYPES: ty_score TYPE i.
DATA: gt_scores TYPE STANDARD TABLE OF ty_score,
      gv_sum    TYPE i,
      gv_avg    TYPE p DECIMALS 2.

" Populate sample scores
gt_scores = VALUE #( ( 85 ) ( 92 ) ( 78 ) ( 90 ) ( 88 ) ).

" TODO: Calculate gv_sum and gv_avg

WRITE: / |Total: { gv_sum } | Count: { lines( gt_scores ) } | Average: { gv_avg }|.`,
    solutionCode: `REPORT z_score_calc.

TYPES: ty_score TYPE i.
DATA: gt_scores TYPE STANDARD TABLE OF ty_score,
      gv_sum    TYPE i,
      gv_avg    TYPE p DECIMALS 2.

gt_scores = VALUE #( ( 85 ) ( 92 ) ( 78 ) ( 90 ) ( 88 ) ).

LOOP AT gt_scores INTO DATA(lv_score).
  gv_sum = gv_sum + lv_score.
ENDLOOP.

IF lines( gt_scores ) > 0.
  gv_avg = gv_sum / lines( gt_scores ).
ENDIF.

WRITE: / |Total: { gv_sum } | Count: { lines( gt_scores ) } | Average: { gv_avg }|.`,
    hint: "Use lines( gt_scores ) to retrieve the number of entries and guard against division by zero.",
  },
  {
    id: "abap-p2",
    title: "Filter and Remove Duplicate Records using Field Symbols",
    difficulty: "Intermediate",
    topic: "Internal Tables",
    description:
      "Given a list of customer invoice IDs with potential duplicates, sort the internal table and remove adjacent duplicate entries, printing out only unique high-value invoices (amount >= 5000).",
    inputSample: "Invoices: [INV-1: 3000, INV-2: 6500, INV-2: 6500, INV-3: 12000]",
    expectedOutput: "INV-2 ($6500.00), INV-3 ($12000.00)",
    starterCode: `REPORT z_filter_invoices.

TYPES: BEGIN OF ty_inv,
         id     TYPE string,
         amount TYPE p DECIMALS 2,
       END OF ty_inv.

DATA: gt_inv TYPE STANDARD TABLE OF ty_inv.

gt_inv = VALUE #(
  ( id = 'INV-1' amount = '3000.00' )
  ( id = 'INV-2' amount = '6500.00' )
  ( id = 'INV-2' amount = '6500.00' )
  ( id = 'INV-3' amount = '12000.00' )
).

" TODO: Sort, remove adjacent duplicates, and filter amounts >= 5000`,
    solutionCode: `REPORT z_filter_invoices.

TYPES: BEGIN OF ty_inv,
         id     TYPE string,
         amount TYPE p DECIMALS 2,
       END OF ty_inv.

DATA: gt_inv TYPE STANDARD TABLE OF ty_inv.

gt_inv = VALUE #(
  ( id = 'INV-1' amount = '3000.00' )
  ( id = 'INV-2' amount = '6500.00' )
  ( id = 'INV-2' amount = '6500.00' )
  ( id = 'INV-3' amount = '12000.00' )
).

SORT gt_inv BY id.
DELETE ADJACENT DUPLICATES FROM gt_inv COMPARING id.

LOOP AT gt_inv ASSIGNING FIELD-SYMBOL(<fs>) WHERE amount >= 5000.
  WRITE: / |{ <fs>-id } (\${ <fs>-amount })|.
ENDLOOP.`,
    hint: "Remember to SORT before DELETE ADJACENT DUPLICATES, and use FIELD-SYMBOLS to avoid extra row copies.",
  },
  {
    id: "abap-p3",
    title: "Implement Bank Account Class in ABAP Objects",
    difficulty: "Intermediate",
    topic: "ABAP OOPS",
    description:
      "Design a local class LCL_ACCOUNT with private attributes mv_balance and mv_acc_no. Provide methods DEPOSIT, WITHDRAW (which returns a boolean indicating whether sufficient funds were available), and GET_BALANCE.",
    inputSample: "Deposit 1000, Withdraw 400, Withdraw 800",
    expectedOutput: "Withdraw 1: SUCCESS (Bal: 600) | Withdraw 2: FAILED (Bal: 600)",
    starterCode: `REPORT z_oops_bank.

CLASS lcl_account DEFINITION.
  PUBLIC SECTION.
    " TODO: Declare constructor and methods
  PRIVATE SECTION.
    " TODO: Declare attributes
ENDCLASS.

CLASS lcl_account IMPLEMENTATION.
  " TODO: Implement methods
ENDCLASS.

START-OF-SELECTION.
  " Test your class here`,
    solutionCode: `REPORT z_oops_bank.

CLASS lcl_account DEFINITION.
  PUBLIC SECTION.
    METHODS:
      constructor IMPORTING iv_acc_no TYPE string,
      deposit IMPORTING iv_amt TYPE p DECIMALS 2,
      withdraw IMPORTING iv_amt TYPE p DECIMALS 2 RETURNING VALUE(rv_ok) TYPE abap_bool,
      get_balance RETURNING VALUE(rv_bal) TYPE p DECIMALS 2.
  PRIVATE SECTION.
    DATA: mv_acc_no  TYPE string,
          mv_balance TYPE p DECIMALS 2.
ENDCLASS.

CLASS lcl_account IMPLEMENTATION.
  METHOD constructor.
    mv_acc_no = iv_acc_no.
    mv_balance = 0.
  ENDMETHOD.

  METHOD deposit.
    mv_balance = mv_balance + iv_amt.
  ENDMETHOD.

  METHOD withdraw.
    IF mv_balance >= iv_amt.
      mv_balance = mv_balance - iv_amt.
      rv_ok = abap_true.
    ELSE.
      rv_ok = abap_false.
    ENDIF.
  ENDMETHOD.

  METHOD get_balance.
    rv_bal = mv_balance.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA(lo_acc) = NEW lcl_account( 'ACC-1001' ).
  lo_acc->deposit( 1000 ).
  DATA(lv_ok1) = lo_acc->withdraw( 400 ).
  WRITE: / |Withdraw 1: { COND string( WHEN lv_ok1 = abap_true THEN 'SUCCESS' ELSE 'FAILED' ) } (Bal: { lo_acc->get_balance( ) })|.
  DATA(lv_ok2) = lo_acc->withdraw( 800 ).
  WRITE: / |Withdraw 2: { COND string( WHEN lv_ok2 = abap_true THEN 'SUCCESS' ELSE 'FAILED' ) } (Bal: { lo_acc->get_balance( ) })|.`,
    hint: "Use RETURNING VALUE(rv_ok) TYPE abap_bool in your method declaration to return clean boolean statuses.",
  },
  {
    id: "abap-p4",
    title: "Join Emulation: Match Sales Orders with Line Items",
    difficulty: "Advanced",
    topic: "OpenSQL",
    description:
      "Emulate a master-detail relational join in ABAP between Header table (VBAK: vbeln, erdat, netwr) and Item table (VBAP: vbeln, posnr, matnr, kwmeng). Output consolidated order lines.",
    inputSample: "VBAK 1001 ($500), VBAP 1001 Pos 10 (MAT-A, 2 pcs), Pos 20 (MAT-B, 1 pc)",
    expectedOutput: "Order 1001 | Item 10 | Mat MAT-A | Qty 2 | Total $500",
    starterCode: `REPORT z_join_emulation.

" Declare header and item structures, then combine using modern FOR iteration or READ TABLE BINARY SEARCH.`,
    solutionCode: `REPORT z_join_emulation.

TYPES: BEGIN OF ty_vbak,
         vbeln TYPE string,
         netwr TYPE p DECIMALS 2,
       END OF ty_vbak,
       BEGIN OF ty_vbap,
         vbeln TYPE string,
         posnr TYPE n LENGTH 6,
         matnr TYPE string,
         kwmeng TYPE i,
       END OF ty_vbap.

DATA: lt_vbak TYPE SORTED TABLE OF ty_vbak WITH UNIQUE KEY vbeln,
      lt_vbap TYPE STANDARD TABLE OF ty_vbap.

lt_vbak = VALUE #( ( vbeln = '1001' netwr = '500.00' ) ).
lt_vbap = VALUE #(
  ( vbeln = '1001' posnr = '000010' matnr = 'MAT-A' kwmeng = 2 )
  ( vbeln = '1001' posnr = '000020' matnr = 'MAT-B' kwmeng = 1 )
).

LOOP AT lt_vbap ASSIGNING FIELD-SYMBOL(<item>).
  READ TABLE lt_vbak ASSIGNING FIELD-SYMBOL(<hdr>) WITH TABLE KEY vbeln = <item>-vbeln.
  IF sy-subrc = 0.
    WRITE: / |Order { <item>-vbeln } | Item { <item>-posnr } | Mat { <item>-matnr } | Qty { <item>-kwmeng } | Header Total: \${ <hdr>-netwr }|.
  ENDIF.
ENDLOOP.`,
    hint: "Using a SORTED TABLE with UNIQUE KEY for the header table gives O(log N) lookup speeds during internal table joins.",
  },
]

export default function ABAPPractice() {
  const [selectedProblem, setSelectedProblem] = useState<ABAPPracticeProblem>(PRACTICE_PROBLEMS[0])
  const [activeTab, setActiveTab] = useState<"starter" | "solution">("starter")
  const [searchQuery, setSearchQuery] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All")
  const [copied, setCopied] = useState(false)

  const filteredProblems = PRACTICE_PROBLEMS.filter((p) => {
    const matchesDiff = difficultyFilter === "All" || p.difficulty === difficultyFilter
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDiff && matchesSearch
  })

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              ABAP Hands-on Coding Practice
            </span>
            <span className="text-xs text-slate-400">Master Real-World SAP Problem Solving</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
                SAP ABAP Coding Challenges
              </h1>
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                Tackle interactive practice exercises designed to sharpen your ABAP skills for enterprise projects and technical interviews.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/compilers/abap-compiler"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                <Terminal className="w-4 h-4" />
                Open ABAP Compiler
              </Link>
              <Link
                to="/compilers/abap-oops"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                ABAP Objects Guide
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problem title or topic (e.g. OOPS, OpenSQL, Table)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Difficulty:</span>
            {["All", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficultyFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  difficultyFilter === lvl
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Problem List Pane */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Select Challenge ({filteredProblems.length})
            </h2>
            <div className="space-y-2.5">
              {filteredProblems.map((p) => {
                const isActive = p.id === selectedProblem.id
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProblem(p)
                      setActiveTab("starter")
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isActive
                        ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            p.difficulty === "Beginner"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : p.difficulty === "Intermediate"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {p.difficulty}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{p.topic}</span>
                      </div>
                      <h3
                        className={`text-sm font-bold ${
                          isActive ? "text-indigo-600" : "text-slate-900"
                        }`}
                      >
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 mt-1 transition-transform ${
                        isActive ? "text-indigo-600 translate-x-1" : "text-slate-400"
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Problem Workspace & Details Pane */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedProblem.topic}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Level: {selectedProblem.difficulty}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{selectedProblem.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/compilers/abap-compiler"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Run in Compiler</span>
                  </Link>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedProblem.description}
              </div>

              {/* Samples */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-sans font-bold text-slate-500 block mb-1">
                    Sample Input:
                  </span>
                  <span className="text-slate-800">{selectedProblem.inputSample}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-sans font-bold text-slate-500 block mb-1">
                    Expected Output:
                  </span>
                  <span className="text-slate-800">{selectedProblem.expectedOutput}</span>
                </div>
              </div>

              {/* Hint Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Pro Developer Tip: </span>
                  {selectedProblem.hint}
                </div>
              </div>

              {/* Code Editor Header & Switcher */}
              <div className="mt-6">
                <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("starter")}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                        activeTab === "starter"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Starter Code
                    </button>
                    <button
                      onClick={() => setActiveTab("solution")}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                        activeTab === "solution"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      View Solution
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      handleCopyCode(
                        activeTab === "starter"
                          ? selectedProblem.starterCode
                          : selectedProblem.solutionCode
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-950 text-indigo-100 p-4 rounded-b-xl font-mono text-xs overflow-x-auto leading-relaxed border-x border-b border-slate-800">
                  <code>
                    {activeTab === "starter"
                      ? selectedProblem.starterCode
                      : selectedProblem.solutionCode}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
