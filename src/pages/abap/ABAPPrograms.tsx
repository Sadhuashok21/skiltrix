import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  FileCode,
  Terminal,
  Download,
  Copy,
  Check,
  Code2,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from "lucide-react"

interface ABAPProgram {
  id: string
  title: string
  tcode: string
  category: "Reporting & ALV" | "Integration & BAPI" | "File Processing" | "Workflow & Alerts"
  description: string
  code: string
}

const ENTERPRISE_PROGRAMS: ABAPProgram[] = [
  {
    id: "alv-salv-report",
    title: "Modern ALV Grid Report with CL_SALV_TABLE",
    tcode: "ZSALV_FLIGHT",
    category: "Reporting & ALV",
    description:
      "Enterprise object-oriented ALV grid report utilizing SAP standard CL_SALV_TABLE class with automated column optimization, zebra striping, and standard toolbar functions.",
    code: `*&---------------------------------------------------------------------*
*& Report ZSALV_FLIGHT_DEMO
*& Description: Modern OO ALV Report via CL_SALV_TABLE
*&---------------------------------------------------------------------*
REPORT zsalv_flight_demo.

TABLES: sflight.

SELECT-OPTIONS: s_carrid FOR sflight-carrid NO INTERVALS.

START-OF-SELECTION.
  DATA: gt_flights TYPE STANDARD TABLE OF sflight,
        gr_salv    TYPE REF TO cl_salv_table.

  SELECT * FROM sflight
    INTO TABLE @gt_flights
    UP TO 100 ROWS
    WHERE carrid IN @s_carrid.

  IF sy-subrc <> 0.
    MESSAGE 'No flights found matching selection criteria.' TYPE 'I'.
    RETURN.
  ENDIF.

  TRY.
      " Factory instantiation
      cl_salv_table=>factory(
        IMPORTING
          r_salv_table = gr_salv
        CHANGING
          t_table      = gt_flights
      ).

      " Enable all standard ALV toolbar buttons (Sort, Filter, Export to Excel)
      DATA(lr_functions) = gr_salv->get_functions( ).
      lr_functions->set_all( abap_true ).

      " Optimize column widths automatically
      DATA(lr_columns) = gr_salv->get_columns( ).
      lr_columns->set_optimize( abap_true ).

      " Enable alternating row colors (zebra pattern)
      DATA(lr_display) = gr_salv->get_display_settings( ).
      lr_display->set_striped_pattern( abap_true ).
      lr_display->set_list_header( 'Flight Occupancy ALV Enterprise Report' ).

      " Display the interactive ALV Grid
      gr_salv->display( ).

    CATCH cx_salv_msg INTO DATA(lx_error).
      MESSAGE lx_error->get_text( ) TYPE 'E'.
  ENDTRY.`,
  },
  {
    id: "bapi-sales-order",
    title: "BAPI Wrapper for Sales Order Creation (BAPI_SALESORDER_CREATEFROMDAT2)",
    tcode: "ZBAPI_ORDER",
    category: "Integration & BAPI",
    description:
      "Full error-resilient wrapper that populates sales order header and item data, executes the standard SAP BAPI, and commits the database transaction via BAPI_TRANSACTION_COMMIT.",
    code: `*&---------------------------------------------------------------------*
*& Report ZBAPI_ORDER_CREATION
*& Description: Resilient BAPI Wrapper for Sales Order Creation
*&---------------------------------------------------------------------*
REPORT zbapi_order_creation.

DATA: ls_header   TYPE bapisdhd1,
      ls_header_x TYPE bapisdhd1x,
      lt_items    TYPE STANDARD TABLE OF bapisditm,
      lt_items_x  TYPE STANDARD TABLE OF bapisditmx,
      lt_partners TYPE STANDARD TABLE OF bapipartnr,
      lt_return   TYPE STANDARD TABLE OF bapiret2,
      lv_vbeln    TYPE vbeln_va.

" 1. Fill Header Information
ls_header-doc_type   = 'TA'.     " Standard Order
ls_header-sales_org  = '1000'.
ls_header-distr_chan = '10'.
ls_header-division   = '00'.

ls_header_x-doc_type   = 'X'.
ls_header_x-sales_org  = 'X'.
ls_header_x-distr_chan = 'X'.
ls_header_x-division   = 'X'.
ls_header_x-updateflag = 'I'.

" 2. Fill Partner Details (Sold-to party)
APPEND VALUE #( partn_role = 'AG' partn_numb = '0000001000' ) TO lt_partners.

" 3. Fill Line Items
APPEND VALUE #( itm_number = '000010' material = 'MAT-TURBINE-01' target_qty = 5 ) TO lt_items.
APPEND VALUE #( itm_number = '000010' updateflag = 'I' material = 'X' target_qty = 'X' ) TO lt_items_x.

" 4. Call standard SAP BAPI
CALL FUNCTION 'BAPI_SALESORDER_CREATEFROMDAT2'
  EXPORTING
    order_header_in  = ls_header
    order_header_inx = ls_header_x
  IMPORTING
    salesdocument    = lv_vbeln
  TABLES
    return           = lt_return
    order_items_in   = lt_items
    order_items_inx  = lt_items_x
    order_partners   = lt_partners.

" 5. Check return logs for error severity 'E' or 'A'
READ TABLE lt_return WITH KEY type = 'E' TRANSPORTING NO FIELDS.
IF sy-subrc <> 0.
  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING
      wait = 'X'.
  WRITE: / |Sales Order { lv_vbeln } created and committed successfully!|.
ELSE.
  CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
  WRITE: / 'Order creation failed. BAPI Errors:'.
  LOOP AT lt_return INTO DATA(ls_msg) WHERE type CA 'EA'.
    WRITE: / |[{ ls_msg-type }] { ls_msg-message }|.
  ENDLOOP.
ENDIF.`,
  },
  {
    id: "gui-file-upload",
    title: "Presentation Server CSV File Uploader (CL_GUI_FRONTEND_SERVICES)",
    tcode: "ZFILE_UPLOAD",
    category: "File Processing",
    description:
      "Interactive file picker dialog and file read routine that parses CSV data into internal tables on the client machine.",
    code: `*&---------------------------------------------------------------------*
*& Report ZFILE_CSV_UPLOADER
*& Description: Client-side CSV File Upload via CL_GUI_FRONTEND_SERVICES
*&---------------------------------------------------------------------*
REPORT zfile_csv_uploader.

DATA: lt_file_table TYPE filetable,
      lv_rc         TYPE i,
      lt_records    TYPE truxs_t_text_data.

PARAMETERS: p_file TYPE localfile OBLIGATORY.

AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_file.
  " Trigger Windows/Mac File Open Dialog
  cl_gui_frontend_services=>file_open_dialog(
    EXPORTING
      window_title            = 'Select CSV Data File'
      default_extension       = 'csv'
      file_filter             = 'CSV files (*.csv)|*.csv|All files (*.*)|*.*'
    CHANGING
      file_table              = lt_file_table
      rc                      = lv_rc
    EXCEPTIONS
      OTHERS                  = 1
  ).
  IF sy-subrc = 0 AND lines( lt_file_table ) > 0.
    p_file = lt_file_table[ 1 ]-filename.
  ENDIF.

START-OF-SELECTION.
  DATA(lv_filename) = CONV string( p_file ).

  cl_gui_frontend_services=>gui_upload(
    EXPORTING
      filename                = lv_filename
      filetype                = 'ASC'
    CHANGING
      data_tab                = lt_records
    EXCEPTIONS
      OTHERS                  = 1
  ).

  IF sy-subrc = 0.
    WRITE: / |Successfully loaded { lines( lt_records ) } raw text rows from file.|.
  ELSE.
    WRITE: / 'Failed to upload selected file.'.
  ENDIF.`,
  },
  {
    id: "bcs-email-dispatch",
    title: "Automated HTML Email Dispatch via CL_BCS",
    tcode: "ZSEND_MAIL",
    category: "Workflow & Alerts",
    description:
      "Enterprise notification dispatch utility formatting rich HTML emails with embedded tables and delivering them through SAP Business Communication Services.",
    code: `*&---------------------------------------------------------------------*
*& Report ZSEND_BCS_HTML_EMAIL
*& Description: Dispatch HTML Emails via CL_BCS
*&---------------------------------------------------------------------*
REPORT zsend_bcs_html_email.

PARAMETERS: p_email TYPE ad_smtpadr DEFAULT 'dev@skiltrix.com'.

START-OF-SELECTION.
  TRY.
      " 1. Create Send Request
      DATA(lo_send_req) = cl_bcs=>create_persistent( ).

      " 2. Build HTML Body
      DATA: lt_html TYPE soli_tab.
      APPEND '<html><body>' TO lt_html.
      APPEND '<h2>SkilTrix SAP System Alert</h2>' TO lt_html.
      APPEND '<p>Your batch reconciliation process completed with return code <b>0</b>.</p>' TO lt_html.
      APPEND '</body></html>' TO lt_html.

      DATA(lo_document) = cl_document_bcs=>create_document(
        i_type    = 'HTM'
        i_text    = lt_html
        i_subject = 'SkilTrix Automated Report Notification'
      ).
      lo_send_req->set_document( lo_document ).

      " 3. Set Recipient
      DATA(lo_recipient) = cl_cam_address_bcs=>create_internet_address( p_email ).
      lo_send_req->add_recipient( lo_recipient ).

      " 4. Transmit Mail
      DATA(lv_sent) = lo_send_req->send( i_with_error_screen = 'X' ).
      COMMIT WORK.

      IF lv_sent = abap_true.
        WRITE: / |Email queued for delivery to: { p_email }|.
      ENDIF.

    CATCH cx_bcs INTO DATA(lx_bcs).
      WRITE: / |BCS Delivery Error: { lx_bcs->get_text( ) }|.
  ENDTRY.`,
  },
]

export default function ABAPPrograms() {
  const [selectedProg, setSelectedProg] = useState<ABAPProgram>(ENTERPRISE_PROGRAMS[0])
  const [copied, setCopied] = useState(false)
  const [selectedCat, setSelectedCat] = useState<string>("All")

  const categories = [
    "All",
    "Reporting & ALV",
    "Integration & BAPI",
    "File Processing",
    "Workflow & Alerts",
  ]

  const filteredPrograms =
    selectedCat === "All"
      ? ENTERPRISE_PROGRAMS
      : ENTERPRISE_PROGRAMS.filter((p) => p.category === selectedCat)

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedProg.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([selectedProg.code], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${selectedProg.id}.abap`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Production Blueprints &amp; Templates
            </span>
            <span className="text-xs text-slate-400">Battle-Tested Enterprise Patterns</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
                Standard SAP ABAP Programs
              </h1>
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                Clean, modern code templates for ALV grids, BAPI integrations, presentation server file
                handling, and automated communication services.
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

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Categories Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2.5 mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
            Category:
          </span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCat === c
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Programs Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Select Template Blueprint
            </h2>
            <div className="space-y-2.5">
              {filteredPrograms.map((prog) => {
                const isActive = prog.id === selectedProg.id
                return (
                  <button
                    key={prog.id}
                    onClick={() => setSelectedProg(prog)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isActive
                        ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                          {prog.tcode}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {prog.category}
                        </span>
                      </div>
                      <h3
                        className={`text-sm font-bold ${
                          isActive ? "text-indigo-600" : "text-slate-900"
                        }`}
                      >
                        {prog.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {prog.description}
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
          </div>

          {/* Program Code & Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {selectedProg.tcode}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {selectedProg.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{selectedProg.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedProg.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
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
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download</span>
                  </button>
                  <Link
                    to="/compilers/abap-compiler"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Run in Compiler</span>
                  </Link>
                </div>
              </div>

              {/* Code Box */}
              <div className="mt-5">
                <div className="bg-slate-900 text-slate-300 px-4 py-2.5 rounded-t-xl border border-slate-800 text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-sky-400" />
                    <span>{selectedProg.id}.abap</span>
                  </div>
                  <span className="text-[11px] text-slate-400">SAP ABAP 7.40+</span>
                </div>
                <pre className="bg-slate-950 text-indigo-100 p-4 rounded-b-xl border-x border-b border-slate-800 font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>{selectedProg.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
