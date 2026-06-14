import { useNavigate } from "react-router-dom";
import {
  Search, Clock, RefreshCw, Star, CheckCircle, LayoutGrid, Shield, Truck,
  ShoppingCart, Users, TrendingUp, ArrowRight, Package, Heart, Zap,
} from "lucide-react";

const TIME_ESTIMATES = {
  guests_arriving: "3–5 min",
  breakfast_rush: "2–4 min",
  child_fever_essentials: "3–5 min",
  power_cut: "3–6 min",
  pooja_items: "2–4 min",
  late_night_hunger: "2–3 min",
  general_urgent_need: "2–4 min",
};

function computeMetrics(result, cartItems) {
  const items = cartItems || result?.items || [];
  const forgottenCount = items.filter((i) => i.is_forgotten_essential).length;
  const itemCount = items.length;
  const replacementsCount = result?.replacements?.length || 0;
  const intent = result?.detected_intent || "general_urgent_need";
  const budget = result?.constraints?.budget;
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const etaMinutes = result?.eta_minutes || 0;
  const urgencyMinutes = result?.constraints?.urgency_minutes;
  const categories = [...new Set(items.map((i) => i.category))];

  return {
    searchSteps: Math.min(10, Math.max(3, itemCount + forgottenCount)),
    timeSaved: TIME_ESTIMATES[intent] || "2–4 min",
    stockoutRecovery: replacementsCount > 0 ? `Handled ${replacementsCount} substitution${replacementsCount > 1 ? "s" : ""}` : "No stockout issues",
    forgottenEssentials: forgottenCount > 0 ? `${forgottenCount} essential${forgottenCount > 1 ? "s" : ""} added` : "None needed",
    checkoutReady: result?.checkout_ready ? "Ready for checkout" : "Needs review",
    categories,
    budgetUsed: budget ? `₹${Math.round(totalPrice)} / ₹${Math.round(budget)} used` : "No budget set",
    urgencyFit: urgencyMinutes ? `ETA ${etaMinutes} min inside ${urgencyMinutes} min window` : `ETA ${etaMinutes} min`,
  };
}

export default function ImpactPage({ result, cartItems }) {
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="py-16 text-center">
        <TrendingUp className="w-14 h-14 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-700 mb-2">No cart to analyze</h2>
        <p className="text-sm text-gray-500 mb-6">Build a cart first to see impact metrics.</p>
        <button
          onClick={() => navigate("/build")}
          className="px-5 py-2.5 bg-[#ff9900] hover:bg-[#e88a00] text-white text-sm font-semibold rounded-xl transition-all"
        >
          Build My Cart
        </button>
      </div>
    );
  }

  const m = computeMetrics(result, cartItems);

  return (
    <div className="py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Impact & Operations</h1>
        <p className="text-sm text-gray-500">
          How NeedCart improves urgent shopping for customers and Amazon Now operations.
        </p>
      </div>

      {/* Impact Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <MetricCard icon={Search} label="Search Steps Avoided" value={`${m.searchSteps} manual searches avoided`} color="blue" />
        <MetricCard icon={Clock} label="Estimated Time Saved" value={m.timeSaved} color="green" />
        <MetricCard icon={RefreshCw} label="Stockout Recovery" value={m.stockoutRecovery} color="amber" />
        <MetricCard icon={Star} label="Forgotten Essentials" value={m.forgottenEssentials} color="purple" />
        <MetricCard icon={CheckCircle} label="Checkout Readiness" value={m.checkoutReady} color="emerald" />
        <MetricCard icon={LayoutGrid} label="Picker-Friendly Cart" value={`${m.categories.length} categories grouped`} color="indigo" />
        <MetricCard icon={Shield} label="Budget Protection" value={m.budgetUsed} color="orange" />
        <MetricCard icon={Truck} label="Urgency Fit" value={m.urgencyFit} color="teal" />
      </section>

      <p className="text-center text-[10px] text-gray-400 max-w-xl mx-auto">
        Prototype estimates based on generated cart size, substitutions, forgotten essentials and urgency constraints.
      </p>

      {/* Why This Matters */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-1 text-center">Why this matters for Amazon Now</h2>
        <p className="text-xs text-gray-500 text-center mb-6">Operational value from situation-first cart generation.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <OpsCard icon={Users} title="Customer Experience" desc="Customers describe situations instead of searching product-by-product." />
          <OpsCard icon={TrendingUp} title="Conversion" desc="Checkout-ready carts reduce decision friction during urgent shopping." />
          <OpsCard icon={RefreshCw} title="Stockout Handling" desc="Substitution logic prevents users from restarting the shopping journey." />
          <OpsCard icon={Truck} title="Delivery Feasibility" desc="ETA-aware carting keeps urgency visible before checkout." />
          <OpsCard icon={Heart} title="Trust & Safety" desc="Health-sensitive scenarios avoid medicine/prescription-sensitive recommendations." />
          <OpsCard icon={Package} title="Picker Efficiency" desc="Grouped carts can support faster store picking and fulfilment workflows." />
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="max-w-4xl mx-auto bg-[#131921] rounded-2xl p-6 text-center">
        <p className="text-[10px] font-semibold text-[#febd69] uppercase tracking-wider mb-3">System Flow</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
          {["Need", "→", "Intent", "→", "Constraints", "→", "Preferences", "→", "Stock/ETA", "→", "Optimizer", "→", "Checkout-Ready Cart"].map((t, i) => (
            <span key={i} className={t === "→" ? "text-[#ff9900] text-xs" : "bg-[#232f3e] px-2.5 py-1 rounded-md text-[11px] text-gray-300 font-medium"}>{t}</span>
          ))}
        </div>
        <p className="text-xs text-gray-400">AI understands the situation. Deterministic commerce logic builds the cart.</p>
      </section>

      {/* CTA */}
      <section className="text-center">
        <button
          onClick={() => navigate("/cart")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          Back to Cart
        </button>
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  const bgMap = {
    blue: "bg-blue-50 border-blue-100", green: "bg-green-50 border-green-100",
    amber: "bg-amber-50 border-amber-100", purple: "bg-purple-50 border-purple-100",
    emerald: "bg-emerald-50 border-emerald-100", indigo: "bg-indigo-50 border-indigo-100",
    orange: "bg-orange-50 border-orange-100", teal: "bg-teal-50 border-teal-100",
  };
  const iconMap = {
    blue: "text-blue-600", green: "text-green-600", amber: "text-amber-600",
    purple: "text-purple-600", emerald: "text-emerald-600", indigo: "text-indigo-600",
    orange: "text-orange-600", teal: "text-teal-600",
  };

  return (
    <div className={`rounded-xl border p-4 ${bgMap[color] || "bg-gray-50 border-gray-100"}`}>
      <Icon className={`w-5 h-5 mb-2 ${iconMap[color] || "text-gray-600"}`} />
      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xs font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function OpsCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <Icon className="w-5 h-5 text-[#ff9900] mb-3" />
      <h4 className="text-xs font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// Exported for use as compact snapshot on Cart page
export function ImpactSnapshot({ result, cartItems }) {
  if (!result) return null;
  const m = computeMetrics(result, cartItems);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-gray-800">Impact Snapshot</h4>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MiniMetric icon={Search} value={`${m.searchSteps} searches avoided`} />
        <MiniMetric icon={Clock} value={`~${m.timeSaved} saved`} />
        <MiniMetric icon={Star} value={m.forgottenEssentials} />
        <MiniMetric icon={RefreshCw} value={m.stockoutRecovery} />
      </div>
      <p className="text-[9px] text-gray-400 mt-2">Prototype estimates based on cart analysis.</p>
    </div>
  );
}

function MiniMetric({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
      <span className="text-[10px] text-gray-700 font-medium">{value}</span>
    </div>
  );
}
