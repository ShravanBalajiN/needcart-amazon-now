import { useState, useEffect } from "react";
import {
  ShoppingBag,
  AlertTriangle,
  IndianRupee,
  Users,
  Clock,
  Leaf,
  Truck,
  Package,
  Users as UsersIcon,
  Coffee,
  Thermometer,
  Zap,
  Flame,
  Moon,
  ShoppingCart,
} from "lucide-react";
import { healthCheck, generateCart } from "./api";
import NeedInput from "./components/NeedInput";
import ScenarioChips from "./components/ScenarioChips";
import CartModeSelector from "./components/CartModeSelector";
import StressTestPanel from "./components/StressTestPanel";
import CartHealthScore from "./components/CartHealthScore";
import CartItemCard from "./components/CartItemCard";
import ReplacementPanel from "./components/ReplacementPanel";
import SkippedItemsPanel from "./components/SkippedItemsPanel";
import CheckoutMock from "./components/CheckoutMock";

const DEFAULT_STRESS = {
  override_budget: null,
  override_urgency_minutes: null,
  simulate_stockout_product_ids: [],
  simulate_stockout_groups: [],
};

const INTENT_DISPLAY = {
  guests_arriving: { label: "Guests Arriving", icon: UsersIcon, color: "text-blue-600" },
  breakfast_rush: { label: "Breakfast Rush", icon: Coffee, color: "text-amber-600" },
  child_fever_essentials: { label: "Child Fever Essentials", icon: Thermometer, color: "text-red-600" },
  power_cut: { label: "Power Cut Emergency", icon: Zap, color: "text-yellow-600" },
  pooja_items: { label: "Pooja Items", icon: Flame, color: "text-orange-600" },
  late_night_hunger: { label: "Late Night Hunger", icon: Moon, color: "text-purple-600" },
  general_urgent_need: { label: "Urgent Household Need", icon: Package, color: "text-gray-600" },
};

export default function App() {
  const [need, setNeed] = useState("");
  const [mode, setMode] = useState("balanced");
  const [stress, setStress] = useState(DEFAULT_STRESS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendUp, setBackendUp] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    healthCheck()
      .then(() => setBackendUp(true))
      .catch(() => setBackendUp(false));
  }, []);

  const handleSubmit = async () => {
    if (!need.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateCart({ need: need.trim(), mode, stress });
      setResult(data);
    } catch {
      setError("Could not build cart right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRebuild = () => {
    if (need.trim()) handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#131921] border-b border-[#232f3e]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-[#ff9900]" />
            <span className="text-xl font-bold text-white tracking-tight">NeedCart</span>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-medium bg-[#232f3e] text-[#febd69] rounded-full border border-[#febd69]/30">
              Amazon Now Concept
            </span>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">Urgency-to-Cart Engine</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Backend error */}
        {!backendUp && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Backend is not reachable</p>
              <p className="text-xs text-red-600">Make sure the backend is running on port 8000.</p>
            </div>
          </div>
        )}

        {/* Hero Input Section */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Tell us what happened. We'll build the cart.
            </h1>
            <p className="text-sm text-gray-500 mb-5">
              NeedCart turns urgent situations into checkout-ready Amazon Now carts in seconds.
            </p>
            <NeedInput
              value={need}
              onChange={setNeed}
              onSubmit={handleSubmit}
              onVoice={(t) => setNeed(t)}
              loading={loading}
            />
          </div>
        </section>

        {/* Scenarios + Mode + Stress */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <ScenarioChips onSelect={(p) => setNeed(p)} disabled={loading} selected={need} />
            <CartModeSelector selected={mode} onChange={setMode} disabled={loading} />
          </div>
          <div className="lg:col-span-1">
            <StressTestPanel stress={stress} onChange={setStress} onRebuild={handleRebuild} disabled={loading || !need.trim()} />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center animate-fadeIn">
            <div className="inline-block w-10 h-10 border-3 border-[#ff9900] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-700 font-medium">Understanding need...</p>
            <p className="text-sm text-gray-400 mt-1">Checking budget, stock, ETA and essentials...</p>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Your urgent cart will appear here</p>
            <p className="text-sm text-gray-400 mt-1">Try one of the demo situations or describe your own.</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Detected intent */}
              <IntentCard result={result} />

              {/* Cart items */}
              {result.items && result.items.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">Cart Items ({result.items.length})</h3>
                  {result.items.map((item) => (
                    <CartItemCard key={item.id + item.name} item={item} />
                  ))}
                </div>
              )}

              {/* Replacements */}
              <ReplacementPanel replacements={result.replacements} />

              {/* Skipped */}
              <SkippedItemsPanel skippedItems={result.skipped_items} />
            </div>

            {/* Right column: Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <CartSummary result={result} />
                <CheckoutMock
                  checkoutReady={result.checkout_ready}
                  totalPrice={result.total_price}
                  eta={result.eta_minutes}
                  itemCount={result.items?.length || 0}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function IntentCard({ result }) {
  const intentInfo = INTENT_DISPLAY[result.detected_intent] || INTENT_DISPLAY.general_urgent_need;
  const Icon = intentInfo.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-gray-50`}>
          <Icon className={`w-5 h-5 ${intentInfo.color}`} />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Need Detected</p>
          <p className="text-sm font-bold text-gray-900">{intentInfo.label}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ConstraintPill icon={IndianRupee} label="Budget" value={result.constraints?.budget ? `₹${result.constraints.budget}` : "-"} />
        <ConstraintPill icon={Users} label="People" value={result.constraints?.people_count ?? "-"} />
        <ConstraintPill icon={Clock} label="Urgency" value={result.constraints?.urgency_minutes ? `${result.constraints.urgency_minutes} min` : "-"} />
        <ConstraintPill icon={Leaf} label="Diet" value={result.constraints?.dietary_preference || "Any"} />
      </div>
    </div>
  );
}

function ConstraintPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
      <div>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-xs font-semibold text-gray-700">{value}</p>
      </div>
    </div>
  );
}

function CartSummary({ result }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Cart Summary</h3>

      {/* Status badge */}
      <StatusBadge status={result.cart_status} />

      {/* Totals */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-lg font-bold text-gray-900">₹{result.total_price}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Delivery ETA</span>
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            {result.eta_minutes} min
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${result.checkout_ready ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {result.checkout_ready ? "Checkout Ready" : "Not Ready"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Mode</span>
          <span className="text-xs font-medium text-gray-700">{result.cart_mode}</span>
        </div>
      </div>

      {/* Summary text */}
      <p className="mt-4 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
        {result.summary}
      </p>

      {/* Scores */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Order Readiness</p>
        <CartHealthScore scores={result.scores} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Complete Cart": "bg-green-100 text-green-700 border-green-200",
    "Budget-Optimized Cart": "bg-blue-100 text-blue-700 border-blue-200",
    "Substituted Cart": "bg-amber-100 text-amber-700 border-amber-200",
    "Rescue Cart": "bg-orange-100 text-orange-700 border-orange-200",
    "Partial Cart": "bg-red-100 text-red-700 border-red-200",
  };
  const cls = styles[status] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${cls}`}>
      {status}
    </span>
  );
}
