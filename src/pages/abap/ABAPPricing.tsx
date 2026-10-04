import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, LockKeyhole, Tag } from "lucide-react"
import api from "../../api/client"
import { getGlobalSignInUrl } from "../../api/auth"

type Quote = {
  compiler: string
  currency: string
  original_amount_paise: number
  discount_amount_paise: number
  final_amount_paise: number
  coupon_code: string
  pricing_version: string
}

type Pricing = { compiler: string; name: string; currency: string; price_paise: number; is_free?: boolean; active: boolean; access: boolean; pricing_version: string }

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => { open: () => void; on: (event: string, callback: (event: any) => void) => void }
  }
}

const rupees = (paise: number) => `₹${(paise / 100).toFixed(2)}`

export default function ABAPPricing() {
  const navigate = useNavigate()
  const [code, setCode] = useState("")
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [pricePaise, setPricePaise] = useState<number | null>(null)
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [paying, setPaying] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState("")

  useEffect(() => {
    api.get<Pricing>("/abap/pricing/").then(({ data }) => {
      setPricing(data)
      setPricePaise(data.price_paise)
      if (data.access || data.price_paise === 0 || data.is_free) {
        const token = localStorage.getItem("skiltrix_access_token") || localStorage.getItem("access_token")
        if (token) {
          navigate("/abap", { replace: true })
        } else {
          window.location.assign(getGlobalSignInUrl("/abap"))
        }
      }
    }).catch(() => setError("Could not load current pricing. Please refresh and try again."))
  }, [navigate])

  const applyCoupon = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setQuote(null)
    setLoading(true)
    try {
      const { data } = await api.post<Quote>("/abap/coupons/validate/", { code, compiler: "abap" })
      setQuote(data)
      setPricing((current) => current ? { ...current, pricing_version: data.pricing_version } : current)
    } catch (reason: any) {
      setError(reason?.response?.data?.detail || "Could not validate this coupon. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const removeCoupon = () => {
    setCode("")
    setQuote(null)
    setError("")
  }

  const payNow = async () => {
    if (!localStorage.getItem("skiltrix_access_token") && !localStorage.getItem("access_token")) {
      window.location.assign(getGlobalSignInUrl("/abap/pricing"))
      return
    }
    if (!pricing || pricePaise === null || !pricing.active || paying) return
    setPaying(true)
    setPaymentMessage("")
    try {
      const price = quote?.final_amount_paise ?? pricePaise
      const version = quote?.pricing_version ?? pricing.pricing_version
      const idempotencyKey = window.crypto.randomUUID()
      const { data: order } = await api.post("/abap/payments/create-order/", {
        coupon_code: quote?.coupon_code || "",
        expected_amount_paise: price,
        pricing_version: version,
      }, { headers: { "Idempotency-Key": idempotencyKey } })
      if (order.free_purchase) {
        setPaymentMessage("Coupon applied. Your ABAP access is active.")
        navigate("/abap", { replace: true })
        return
      }
      const scriptUrl = "https://checkout.razorpay.com/v1/checkout.js"
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script")
          script.src = scriptUrl
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error("Razorpay Checkout could not be loaded."))
          document.body.appendChild(script)
        })
      }
      if (!window.Razorpay) throw new Error("Razorpay Checkout is unavailable.")
      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount_paise,
        currency: order.currency,
        name: "SkilTrix",
        description: "SAP ABAP Compiler access",
        order_id: order.order_id,
        handler: async (result: any) => {
          try {
            const verified = await api.post("/abap/payments/verify/", result)
            if (verified.data.access) navigate("/abap", { replace: true })
            else setPaymentMessage("Payment is being confirmed. Refresh access status in a moment.")
          } catch (err: any) {
            setPaymentMessage(err?.response?.data?.detail || "Checking payment status…")
            for (let attempt = 0; attempt < 5; attempt += 1) {
              await new Promise((resolve) => window.setTimeout(resolve, 2000))
              try {
                const current = await api.get(`/abap/payments/status/${encodeURIComponent(order.order_id)}/`)
                if (current.data.access) { navigate("/abap", { replace: true }); return }
              } catch { /* Continue polling; access stays locked on errors. */ }
            }
            setPaymentMessage("Payment is still being confirmed. Access remains locked until the server verifies it; refresh this page to check again.")
          } finally {
            setPaying(false)
          }
        },
        modal: { ondismiss: () => {
          api.post("/abap/payments/cancel/", { order_id: order.order_id, reason: "Checkout closed by user" }).catch(() => undefined)
          setPaying(false)
          setPaymentMessage("Checkout was closed. No access was granted.")
        } },
        theme: { color: "#4f46e5" },
      })
      checkout.on("payment.failed", (failure: any) => {
        const failedOrder = failure?.error?.metadata?.order_id
        if (failedOrder) api.post("/abap/payments/cancel/", { order_id: failedOrder, reason: failure?.error?.description || "Payment failed" }).catch(() => undefined)
        setPaying(false)
        setPaymentMessage(failure?.error?.description || "Payment failed. No access was granted.")
      })
      checkout.open()
    } catch (reason: any) {
      const data = reason?.response?.data
      if (reason?.response?.status === 409 && data?.quote) {
        setPricePaise(data.quote.original_amount_paise)
        setQuote(data.quote.coupon_code ? data.quote : null)
        setPricing((current) => current ? { ...current, pricing_version: data.quote.pricing_version } : current)
        setPaymentMessage(`${data.detail} Review the updated total and press Pay Now again to confirm.`)
      } else {
        setPaymentMessage(data?.detail || reason?.message || "Unable to start checkout. Please try again.")
      }
      setPaying(false)
    }
  }

  // If free access has activated, do not show pricing details — just open editor / show redirecting spinner
  if (pricing?.price_paise === 0 || pricing?.is_free || pricing?.access) {
    return (
      <main className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-600">Free access active. Opening SAP ABAP Editor…</span>
        </div>
      </main>
    )
  }

  if (!pricing && !error) {
    return (
      <main className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Checking compiler pricing…</span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <button className="mb-6 text-sm font-medium text-indigo-700 hover:underline" onClick={() => navigate("/abap")}>← Back to ABAP Studio</button>
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-600"><LockKeyhole className="h-4 w-4" /> SAP ABAP Compiler · Locked</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Unlock compiler access</h1>
        <p className="mt-2 text-slate-600">One-time access price</p>
        <div className="mt-5 flex items-baseline gap-3">
          <span className="text-4xl font-bold text-slate-900">{quote ? rupees(quote.final_amount_paise) : pricePaise === null ? "Loading price…" : pricePaise === 0 ? "Free Access (₹0.00)" : rupees(pricePaise)}</span>
          {quote && <span className="text-slate-400 line-through">{rupees(quote.original_amount_paise)}</span>}
        </div>
        <div className="mt-4 space-y-1 text-sm text-slate-600">
          <p>Original price: {pricePaise === null ? "Loading…" : rupees(quote?.original_amount_paise ?? pricePaise)}</p>
          <p>Discount: −{rupees(quote?.discount_amount_paise ?? 0)}</p>
          {quote && <p className="font-medium text-emerald-700">{quote.coupon_code} applied</p>}
        </div>
        <form onSubmit={applyCoupon} className="mt-8">
          <label htmlFor="coupon" className="mb-2 block text-sm font-semibold text-slate-700">Coupon code</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input id="coupon" value={code} onChange={(event) => { setCode(event.target.value); setQuote(null); setError("") }} placeholder="Enter coupon code" className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-indigo-500" />
            </div>
            <button disabled={loading || !code.trim()} className="rounded-lg bg-slate-900 px-5 font-semibold text-white disabled:opacity-50">{loading ? "Checking…" : "Apply"}</button>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
          {quote && <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Coupon validated. Final price {rupees(quote.final_amount_paise)}.</p>}
          {quote && <button type="button" onClick={removeCoupon} className="mt-2 text-sm text-slate-600 underline">Remove coupon</button>}
        </form>
        <p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"><LockKeyhole className="mr-1 inline h-4 w-4" />The ABAP workspace, execution, and project APIs stay locked until the server verifies a successful payment.</p>
        <button type="button" onClick={pricePaise === 0 ? () => navigate("/abap") : payNow} disabled={paying || !pricing?.active || pricePaise === null} className="mt-4 w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{pricePaise === 0 ? "Launch ABAP Studio (Free Access)" : paying ? "Starting secure checkout…" : `Pay Now · ${quote ? rupees(quote.final_amount_paise) : pricePaise === null ? "…" : rupees(pricePaise)}`}</button>
        {paymentMessage && <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{paymentMessage}</p>}
        {!pricing?.active && <p className="mt-3 text-sm text-rose-600">Purchases are currently unavailable.</p>}
        <p className="mt-4 text-center text-xs text-slate-500">Access unlocks only after the server confirms your payment.</p>
      </section>
    </main>
  )
}
