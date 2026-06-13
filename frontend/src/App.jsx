import { useState, useEffect } from "react";
import {
  ShoppingBag,
  AlertTriangle,
  Brain,
  IndianRupee,
  Users,
  Clock,
  Leaf,
  Tag,
  Truck,
} from "lucide-react";
import { healthCheck, generateCart } from "./api";
import NeedInput from "./components/NeedInput";
import VoiceInputButton from "./components/VoiceInputButton";
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
      const payload = {
        need: need.trim(),
        mode,
        stress,
      };
      const data = await generateCart(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRebuild = () => {
    if (need.trim()) handleSubmit();
  };

  const handleScenarioSelect = (prompt) => {
    setNeed(prompt);
  };

  const handleVoiceTranscript = (transcript) => {
    setNeed(transcript);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-amber-500" />
            <h1 className="text-4xl font-bold text-white tracking-tight">NeedCart</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Tell Amazon what happened. Get the cart.
          </p>
        </header>

        {/* Backend error */}
        {!backendUp && (
          <div className="mb-6 bg-red-950/40 border border-red-800/50 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-sm text-red-300 font-medium">Backend is not reachable</p>
              <p className="text-xs text-red-400/70">Make sure the backend is running on port 8000.</p>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={loading} />
            </div>
            <NeedInput
              value={need}
              onChange={setNeed}
              onSubmit={handleSubmit}
              loading={loading}
            />
            <ScenarioChips onSelect={handleScenarioSelect} disabled={loading} />
            <CartModeSelector selected={mode} onChange={setMode} disabled={loading} />
          </div>

          <div className="lg:col-span-1">
            <StressTestPanel
              stress={stress}
              onChange={setStress}
              onRebuild={handleRebuild}
              disabled={loading || !need.trim()}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-950/40 border border-red-800/50 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 mt-3 text-sm">Building your cart...</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Meta row */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <MetaItem icon={Brain} label="Intent" value={result.detected_intent} />
                <MetaItem icon={IndianRupee} label="Budget" value={result.constraints?.budget ? `₹${result.constraints.budget}` : "-"} />
                <MetaItem icon={Users} label="People" value={result.constraints?.people_count ?? "-"} />
                <MetaItem icon={Clock} label="Urgency" value={result.constraints?.urgency_minutes ? `${result.constraints.urgency_minutes} min` : "-"} />
                <MetaItem icon={Leaf} label="Dietary" value={result.constraints?.dietary_preference || "-"} />
                <MetaItem icon={Tag} label="Mode" value={result.cart_mode} />
              </div>
            </div>

            {/* Status and Summary */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <StatusBadge status={result.cart_status} />
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    ₹{result.total_price}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    {result.eta_minutes} min
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${result.checkout_ready ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                    {result.checkout_ready ? "Checkout Ready" : "Not Ready"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
            </div>

            {/* Scores */}
            <CartHealthScore scores={result.scores} />

            {/* Cart items */}
            {result.items && result.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">
                  Cart Items ({result.items.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.items.map((item) => (
                    <CartItemCard key={item.id + item.name} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Replacements */}
            <ReplacementPanel replacements={result.replacements} />

            {/* Skipped */}
            <SkippedItemsPanel skippedItems={result.skipped_items} />

            {/* Checkout */}
            <CheckoutMock
              checkoutReady={result.checkout_ready}
              totalPrice={result.total_price}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="text-center">
      <Icon className="w-4 h-4 text-slate-500 mx-auto mb-1" />
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-200 truncate">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colorMap = {
    "Complete Cart": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "Budget-Optimized Cart": "bg-blue-500/15 text-blue-400 border-blue-500/30",
    "Substituted Cart": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "Rescue Cart": "bg-orange-500/15 text-orange-400 border-orange-500/30",
    "Partial Cart": "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const colors = colorMap[status] || "bg-slate-500/15 text-slate-400 border-slate-500/30";

  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${colors}`}>
      {status}
    </span>
  );
}
