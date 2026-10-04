import { useEffect, useState } from "react"
import api from "../../api/client"

type PaymentRow = {
  order_id: string
  compiler: string
  coupon_code: string | null
  original_amount_paise: number
  discount_paise: number
  amount_paise: number
  currency: string
  status: string
  created_at: string
  paid_at: string | null
  access_expires_at: string | null
}

const money = (paise: number) => `₹${(paise / 100).toFixed(2)}`

export default function ABAPPaymentHistory() {
  const [rows, setRows] = useState<PaymentRow[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get<PaymentRow[]>("/abap/payments/history/")
      .then(({ data }) => setRows(data))
      .catch((reason) => setError(reason?.response?.data?.detail || "Unable to load payment history."))
      .finally(() => setLoading(false))
  }, [])
  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Compiler payment history</h1>
        <p className="mt-1 text-sm text-slate-600">Your SAP ABAP compiler orders and access status.</p>
        {error && <p role="alert" className="mt-5 text-sm text-rose-700">{error}</p>}
        {loading ? <p className="mt-6 text-slate-500">Loading payments…</p> : rows.length === 0 ? <p className="mt-6 text-slate-500">No compiler payments yet.</p> : (
          <div className="mt-6 space-y-4">
            {rows.map((row) => <article key={row.order_id} className="rounded-xl border border-slate-200 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="font-semibold text-slate-900">{row.compiler}</h2><p className="mt-1 break-all text-xs text-slate-500">Order {row.order_id}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.status === "paid" ? "bg-emerald-100 text-emerald-800" : row.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>{row.status}</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
                <div><dt className="text-slate-500">Original</dt><dd className="font-medium">{money(row.original_amount_paise)}</dd></div>
                <div><dt className="text-slate-500">Coupon</dt><dd className="font-medium">{row.coupon_code || "—"}</dd></div>
                <div><dt className="text-slate-500">Discount</dt><dd className="font-medium">{money(row.discount_paise)}</dd></div>
                <div><dt className="text-slate-500">Paid</dt><dd className="font-medium">{money(row.amount_paise)}</dd></div>
                <div><dt className="text-slate-500">Purchase date</dt><dd className="font-medium">{new Date(row.paid_at || row.created_at).toLocaleDateString()}</dd></div>
                <div><dt className="text-slate-500">Access expiry</dt><dd className="font-medium">{row.access_expires_at ? new Date(row.access_expires_at).toLocaleDateString() : row.status === "paid" ? "Permanent" : "—"}</dd></div>
              </dl>
            </article>)}
          </div>
        )}
      </section>
    </main>
  )
}
