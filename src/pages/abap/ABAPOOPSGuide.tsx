import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Code2,
  Terminal,
  Copy,
  Check,
  BookOpen,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Layers,
  Cpu,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileCode,
} from "lucide-react"

interface OOPSConcept {
  id: string
  title: string
  subtitle: string
  category: "Fundamentals" | "Advanced" | "Design Patterns" | "Modern ABAP"
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  summary: string
  keyPoints: string[]
  codeSnippet: string
  bestPractices: string
  pitfalls: string
}

const OOPS_CONCEPTS: OOPSConcept[] = [
  {
    id: "class-anatomy",
    title: "Class Definition & Implementation",
    subtitle: "Public, Protected, and Private Sections in ABAP OO",
    category: "Fundamentals",
    difficulty: "Beginner",
    summary:
      "ABAP Objects classes consist of two distinct blocks: the DEFINITION (where signatures, visibility sections, and data attributes are declared) and the IMPLEMENTATION (where method algorithms are coded).",
    keyPoints: [
      "PUBLIC SECTION: Visible to all programs and classes",
      "PROTECTED SECTION: Visible only within this class and subclasses",
      "PRIVATE SECTION: Encapsulated strictly inside this class",
      "METHODS declared with IMPORTING, EXPORTING, CHANGING, or RETURNING parameters",
    ],
    codeSnippet: `CLASS lcl_bank_account DEFINITION.
  PUBLIC SECTION.
    METHODS:
      constructor IMPORTING iv_account_id TYPE string
                            iv_initial_bal TYPE p DECIMALS 2,
      deposit IMPORTING iv_amount TYPE p DECIMALS 2,
      withdraw IMPORTING iv_amount TYPE p DECIMALS 2
               RETURNING VALUE(rv_success) TYPE abap_bool,
      get_balance RETURNING VALUE(rv_balance) TYPE p DECIMALS 2.

  PROTECTED SECTION.
    DATA: mv_account_id TYPE string.

  PRIVATE SECTION.
    DATA: mv_balance TYPE p DECIMALS 2.
    METHODS: log_transaction IMPORTING iv_action TYPE string
                                       iv_amount TYPE p DECIMALS 2.
ENDCLASS.

CLASS lcl_bank_account IMPLEMENTATION.
  METHOD constructor.
    mv_account_id = iv_account_id.
    mv_balance    = iv_initial_bal.
  ENDMETHOD.

  METHOD deposit.
    mv_balance = mv_balance + iv_amount.
    log_transaction( iv_action = 'DEPOSIT' iv_amount = iv_amount ).
  ENDMETHOD.

  METHOD withdraw.
    IF mv_balance >= iv_amount.
      mv_balance = mv_balance - iv_amount.
      rv_success = abap_true.
      log_transaction( iv_action = 'WITHDRAW' iv_amount = iv_amount ).
    ELSE.
      rv_success = abap_false.
    ENDIF.
  ENDMETHOD.

  METHOD get_balance.
    rv_balance = mv_balance.
  ENDMETHOD.

  METHOD log_transaction.
    WRITE: / |Account: { mv_account_id } | Action: { iv_action } | Amount: { iv_amount } |.
  ENDMETHOD.
ENDCLASS.`,
    bestPractices:
      "Always encapsulate internal state in the PRIVATE section. Prefer RETURNING parameters for query methods to enable functional call chaining.",
    pitfalls:
      "Avoid declaring public data attributes directly; use getter and setter methods to maintain encapsulation.",
  },
  {
    id: "inheritance-redefinition",
    title: "Inheritance & Method Redefinition",
    subtitle: "Extending Classes and Overriding Behavior with super->",
    category: "Fundamentals",
    difficulty: "Intermediate",
    summary:
      "ABAP supports single inheritance. A subclass extends a superclass using INHERITING FROM, inherits all public and protected components, and can redefine inherited methods using REDEFINITION.",
    keyPoints: [
      "Use INHERITING FROM to establish parent-child relationship",
      "METHODS ... REDEFINITION to alter inherited behavior",
      "Call super->method_name to invoke the parent implementation",
      "Subclass constructor must explicitly invoke super->constructor",
    ],
    codeSnippet: `CLASS lcl_savings_account DEFINITION INHERITING FROM lcl_bank_account.
  PUBLIC SECTION.
    METHODS:
      constructor IMPORTING iv_account_id TYPE string
                            iv_initial_bal TYPE p DECIMALS 2
                            iv_interest_rate TYPE p DECIMALS 4,
      withdraw REDEFINITION,
      apply_monthly_interest.

  PRIVATE SECTION.
    DATA: mv_interest_rate TYPE p DECIMALS 4.
ENDCLASS.

CLASS lcl_savings_account IMPLEMENTATION.
  METHOD constructor.
    super->constructor( iv_account_id  = iv_account_id
                        iv_initial_bal = iv_initial_bal ).
    mv_interest_rate = iv_interest_rate.
  ENDMETHOD.

  METHOD withdraw.
    " Enforce minimum balance rule for savings accounts
    IF get_balance( ) - iv_amount < 500.
      rv_success = abap_false.
      WRITE: / |Cannot withdraw: Minimum balance of $500 required.|.
      RETURN.
    ENDIF.
    " Delegate to parent class withdraw logic
    rv_success = super->withdraw( iv_amount ).
  ENDMETHOD.

  METHOD apply_monthly_interest.
    DATA(lv_interest) = get_balance( ) * ( mv_interest_rate / 12 ).
    deposit( lv_interest ).
    WRITE: / |Applied monthly interest: { lv_interest }|.
  ENDMETHOD.
ENDCLASS.`,
    bestPractices:
      "Always invoke super->constructor first in a subclass constructor. Favor composition over deep inheritance hierarchies.",
    pitfalls:
      "In REDEFINITION, do not re-specify the method signature (parameters); only write METHODS method_name REDEFINITION.",
  },
  {
    id: "interfaces",
    title: "ABAP Interfaces & Polymorphism",
    subtitle: "Contract-Driven Architecture and Multiple Interface Implementation",
    category: "Advanced",
    difficulty: "Intermediate",
    summary:
      "Interfaces declare a set of methods and constants without implementations. While ABAP does not allow multiple class inheritance, a class can implement multiple interfaces via INTERFACES <interface_name>.",
    keyPoints: [
      "Decouple caller from concrete implementation",
      "Component addressing via interface~method syntax",
      "Enables dependency injection and unit test mock generation",
      "Support for type casting: Narrowing (upcast) and Widening (downcast ?=)",
    ],
    codeSnippet: `INTERFACE lif_payment_gateway.
  METHODS:
    process_payment IMPORTING iv_amount TYPE p DECIMALS 2
                              iv_currency TYPE waers
                    RETURNING VALUE(rv_tx_id) TYPE string,
    refund_payment  IMPORTING iv_tx_id TYPE string
                    RETURNING VALUE(rv_status) TYPE abap_bool.
ENDINTERFACE.

CLASS lcl_stripe_gateway DEFINITION.
  PUBLIC SECTION.
    INTERFACES: lif_payment_gateway.
ENDCLASS.

CLASS lcl_stripe_gateway IMPLEMENTATION.
  METHOD lif_payment_gateway~process_payment.
    rv_tx_id = |STRIPE_TX_{ sy-uzeit }_{ iv_amount }|.
    WRITE: / |Processed { iv_currency } { iv_amount } via Stripe API Gateway. Tx: { rv_tx_id }|.
  ENDMETHOD.

  METHOD lif_payment_gateway~refund_payment.
    rv_status = abap_true.
    WRITE: / |Stripe Refund issued for Tx: { iv_tx_id }|.
  ENDMETHOD.
ENDCLASS.

" Polymorphic Consumer
FORM execute_checkout USING io_gateway TYPE REF TO lif_payment_gateway
                            iv_amount  TYPE p.
  DATA(lv_tx) = io_gateway->process_payment( iv_amount = iv_amount iv_currency = 'USD' ).
  WRITE: / |Order completed successfully. Payment Ref: { lv_tx }|.
ENDFORM.`,
    bestPractices:
      "Design small, focused interfaces adhering to the Interface Segregation Principle (ISP). Pass interface references rather than concrete classes to promote testability.",
    pitfalls:
      "When invoking through a class reference, remember to use lif_interface~method syntax, or assign the instance to an interface reference variable.",
  },
  {
    id: "casting-runtime",
    title: "Narrowing & Widening Casts (?=)",
    subtitle: "Upcasting vs Downcasting and Runtime Type Identification (RTTI)",
    category: "Advanced",
    difficulty: "Advanced",
    summary:
      "Casting lets you treat an object reference as a more general type (Upcast / Narrowing) or safely cast down to a specialized subtype (Downcast / Widening) using the ?= assignment operator.",
    keyPoints: [
      "Upcast (=): Always safe at compile time (e.g. Subclass -> Superclass)",
      "Downcast (?=): Checked at runtime; throws CX_SY_MOVE_CAST_ERROR on failure",
      "CL_ABAP_TYPEDESCR and CL_ABAP_CLASSDESCR for runtime introspection",
      "TRY ... CATCH cx_sy_move_cast_error prevents program dumps during casts",
    ],
    codeSnippet: `" Upcast (Narrowing Cast) - Always safe
DATA: lo_account TYPE REF TO lcl_bank_account,
      lo_savings TYPE REF TO lcl_savings_account.

CREATE OBJECT lo_savings
  EXPORTING
    iv_account_id    = 'ACC-9988'
    iv_initial_bal   = 1000
    iv_interest_rate = '0.045'.

lo_account = lo_savings. " Automatic upcast

" Downcast (Widening Cast) - Dynamic runtime check
DATA: lo_recovered_savings TYPE REF TO lcl_savings_account.

TRY.
    lo_recovered_savings ?= lo_account.
    " Now we can call specialized subclass methods
    lo_recovered_savings->apply_monthly_interest( ).
  CATCH cx_sy_move_cast_error.
    WRITE: / 'Downcast failed: lo_account is not an instance of lcl_savings_account'.
ENDTRY.`,
    bestPractices:
      "Always wrap downcast assignments in TRY ... CATCH cx_sy_move_cast_error blocks to safeguard production execution.",
    pitfalls:
      "Using standard assignment (=) instead of dynamic assignment (?=) for downcasting causes a syntax compile error.",
  },
  {
    id: "exception-classes",
    title: "Class-Based Exception Handling",
    subtitle: "CX_ROOT, CX_STATIC_CHECK, and Structured TRY ... CATCH",
    category: "Advanced",
    difficulty: "Intermediate",
    summary:
      "Modern ABAP replaces classical EXCEPTIONS return codes (sy-subrc) with object-oriented exception classes derived from CX_ROOT, categorized into static, dynamic, and no-check exceptions.",
    keyPoints: [
      "CX_STATIC_CHECK: Checked at compile time; must be declared in RAISING",
      "CX_DYNAMIC_CHECK: Checked at runtime (e.g., division by zero)",
      "CX_NO_CHECK: System-critical errors (e.g., out of memory)",
      "CLEANUP block executes cleanup code even when propagating upward",
    ],
    codeSnippet: `CLASS cx_insufficient_funds DEFINITION INHERITING FROM cx_static_check.
  PUBLIC SECTION.
    DATA: mv_available TYPE p DECIMALS 2,
          mv_requested TYPE p DECIMALS 2.
    METHODS: constructor IMPORTING iv_avail TYPE p DECIMALS 2
                                   iv_req   TYPE p DECIMALS 2
                                   previous LIKE previous OPTIONAL.
ENDCLASS.

CLASS cx_insufficient_funds IMPLEMENTATION.
  METHOD constructor.
    super->constructor( previous = previous ).
    mv_available = iv_avail.
    mv_requested = iv_req.
  ENDMETHOD.
ENDCLASS.

" Usage in Business Logic
FORM withdraw_safe USING iv_requested TYPE p.
  TRY.
      IF iv_requested > 500.
        RAISE EXCEPTION TYPE cx_insufficient_funds
          EXPORTING
            iv_avail = 500
            iv_req   = iv_requested.
      ENDIF.
      WRITE: / 'Funds disbursed successfully'.
    CATCH cx_insufficient_funds INTO DATA(lx_funds).
      WRITE: / |Error: Requested { lx_funds->mv_requested } exceeds available { lx_funds->mv_available }.|.
    CLEANUP.
      WRITE: / 'Audit cleanup transaction logged'.
  ENDTRY.
ENDFORM.`,
    bestPractices:
      "Inherit business domain exceptions from CX_STATIC_CHECK so calling signatures explicitly declare expected failure modes.",
    pitfalls:
      "Catching CX_ROOT blindly in library methods swallows critical runtime failures like null pointers without diagnosing the root cause.",
  },
  {
    id: "modern-syntax",
    title: "Modern ABAP 7.40+ OO Syntax",
    subtitle: "NEW Operator, VALUE Expressions, COND, and Method Chaining",
    category: "Modern ABAP",
    difficulty: "Advanced",
    summary:
      "SAP NetWeaver 7.40 and S/4HANA revolutionized ABAP OO with constructor operators, eliminating boilerplate CREATE OBJECT and intermediate temporary variables.",
    keyPoints: [
      "NEW operator: DATA(lo_obj) = NEW lcl_service( ) replaces CREATE OBJECT",
      "Method chaining: lo_client->get_session( )->get_user( )->get_name( )",
      "CORRESPONDING #( ) for deep structure and table mapping",
      "REDUCE & FILTER operators for expressive data processing",
    ],
    codeSnippet: `" Modern ABAP 7.40+ Object Instantiation & Chaining
CLASS lcl_report DEFINITION.
  PUBLIC SECTION.
    METHODS:
      set_title IMPORTING iv_title TYPE string RETURNING VALUE(ro_self) TYPE REF TO lcl_report,
      set_max_rows IMPORTING iv_rows TYPE i RETURNING VALUE(ro_self) TYPE REF TO lcl_report,
      render.
  PRIVATE SECTION.
    DATA: mv_title TYPE string,
          mv_rows  TYPE i.
ENDCLASS.

CLASS lcl_report IMPLEMENTATION.
  METHOD set_title.
    mv_title = iv_title.
    ro_self  = me. " Return self reference for method chaining (Fluent Builder)
  ENDMETHOD.

  METHOD set_max_rows.
    mv_rows = iv_rows.
    ro_self = me.
  ENDMETHOD.

  METHOD render.
    WRITE: / |Report: { mv_title } | Max Rows: { mv_rows }|.
  ENDMETHOD.
ENDCLASS.

" Modern execution in a single fluent line:
START-OF-SELECTION.
  NEW lcl_report( )->set_title( 'Executive Sales Dashboard'
                  )->set_max_rows( 250
                  )->render( ).`,
    bestPractices:
      "Leverage method chaining and the NEW constructor operator to produce concise, readable, self-documenting code.",
    pitfalls:
      "Excessive method chaining without null checks can trigger CX_SY_REF_IS_INITIAL if an intermediate method returns an uninstantiated reference.",
  },
]

export default function ABAPOOPSGuide() {
  const [selectedTopic, setSelectedTopic] = useState<OOPSConcept>(OOPS_CONCEPTS[0])
  const [copied, setCopied] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>("All")

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categories = ["All", "Fundamentals", "Advanced", "Modern ABAP"]

  const filteredTopics =
    filterCategory === "All"
      ? OOPS_CONCEPTS
      : OOPS_CONCEPTS.filter((t) => t.category === filterCategory)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              ABAP Objects (OOPS) Complete Guide
            </span>
            <span className="text-xs text-slate-400">SAP NetWeaver 7.40 / 7.5x / S/4HANA</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                Master Object-Oriented ABAP
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed mb-6 max-w-3xl">
                Comprehensive, practical guide to Classes, Interfaces, Inheritance, Dynamic
                Casting, Exception Classes, and modern 7.40+ constructor expressions. Practice
                directly in our cloud ABAP compiler.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/compilers/abap-compiler"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30"
                >
                  <Terminal className="w-4 h-4" />
                  Launch ABAP Compiler
                </Link>
                <Link
                  to="/abap/editor"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all"
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Interactive Studio IDE
                </Link>
                <Link
                  to="/compilers/abap-interview-questions"
                  className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-slate-300 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                  OOPS Interview Q&amp;A
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-800/80 rounded-2xl p-6 border border-slate-700 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ABAP OO Core Principles
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Encapsulation via Public, Protected &amp; Private sections</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Clean interfaces replacing legacy procedural function modules</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Robust CX_ROOT exception handling with TRY...CATCH</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>Modern ABAP 7.40+ NEW, VALUE &amp; COND inline operators</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Guide Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Category Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2.5 mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
            Filter Topics:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Topic Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider px-1">
              OOPS Curriculum Topics
            </h2>
            <div className="space-y-2">
              {filteredTopics.map((topic) => {
                const isActive = topic.id === selectedTopic.id
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isActive
                        ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            topic.difficulty === "Beginner"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : topic.difficulty === "Intermediate"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {topic.difficulty}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {topic.category}
                        </span>
                      </div>
                      <h3
                        className={`text-sm font-bold ${
                          isActive ? "text-indigo-600" : "text-slate-800"
                        }`}
                      >
                        {topic.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {topic.subtitle}
                      </p>
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

            {/* Quick Links Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 border border-slate-800 mt-6 shadow-sm">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Related ABAP Resources
              </h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Expand your knowledge with full enterprise blueprints and coding exercises.
              </p>
              <div className="space-y-2 text-xs">
                <Link
                  to="/compilers/abap-practice"
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
                >
                  <span>ABAP Practice Exercises</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  to="/compilers/abap-programs"
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
                >
                  <span>Enterprise ABAP Programs</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  to="/compilers/abap-interview-questions"
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
                >
                  <span>Top 50+ ABAP Interview Questions</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Topic Detail & Live Code Pane */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedTopic.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Level: {selectedTopic.difficulty}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedTopic.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{selectedTopic.subtitle}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCode(selectedTopic.codeSnippet)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <Link
                    to="/compilers/abap-compiler"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Run in Compiler</span>
                  </Link>
                </div>
              </div>

              {/* Summary Description */}
              <div className="mt-5 text-sm text-slate-700 leading-relaxed">
                {selectedTopic.summary}
              </div>

              {/* Key Takeaways */}
              <div className="mt-5 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Key Architecture Points
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {selectedTopic.keyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code Snippet Box */}
              <div className="mt-6">
                <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2.5 rounded-t-xl border border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span>ABAP OO Executable Pattern</span>
                  </div>
                  <span className="text-[11px] text-slate-400">ABAP 7.40+</span>
                </div>
                <pre className="bg-slate-950 text-slate-100 p-5 rounded-b-xl border-x border-b border-slate-800 font-mono text-xs overflow-x-auto leading-relaxed selection:bg-indigo-600 selection:text-white">
                  <code>{selectedTopic.codeSnippet}</code>
                </pre>
              </div>

              {/* Best Practices & Common Pitfalls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Production Best Practice
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {selectedTopic.bestPractices}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Common Interview / Code Pitfall
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {selectedTopic.pitfalls}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Callout Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg font-bold">Ready to write and test your ABAP code?</h3>
                <p className="text-xs text-indigo-200">
                  Practice with syntax highlighting, instant compiler diagnostics, and OpenSQL table simulations.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link
                  to="/compilers/abap-compiler"
                  className="bg-white hover:bg-slate-100 text-indigo-900 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Open ABAP Compiler
                </Link>
                <Link
                  to="/compilers/abap-practice"
                  className="bg-indigo-700/80 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-indigo-500/50 transition-colors"
                >
                  View Coding Problems
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
