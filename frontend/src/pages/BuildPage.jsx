import { useNavigate } from "react-router-dom";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import NeedInput from "../components/NeedInput";
import ScenarioChips from "../components/ScenarioChips";
import CartModeSelector from "../components/CartModeSelector";
import FamilyProfileSelector from "../components/FamilyProfileSelector";
import StressTestPanel from "../components/StressTestPanel";
import PredictiveCards from "../components/PredictiveCards";

export default function BuildPage({
  need, onNeedChange,
  mode, onModeChange,
  profile, onProfileChange,
  stress, onStressChange,
  loading, error, backendUp,
  onSubmit, onRebuild,
}) {
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const success = await onSubmit();
    if (success) navigate("/cart");
  };

  return (
    <div className="py-6 space-y-6">
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

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Build Your Cart</h1>
        <p className="text-sm text-gray-500 mt-1">
          Describe your urgent situation. NeedCart will understand the need and build a checkout-ready cart.
        </p>
      </div>

      {/* Main Input Section */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">What happened?</p>
            <NeedInput
              value={need}
              onChange={onNeedChange}
              onSubmit={handleSubmit}
              onVoice={(t) => onNeedChange(t)}
              loading={loading}
            />
            <p className="text-[10px] text-gray-400 mt-2">
              Tip: Include budget, time, people count and preferences like "don't add Sprite" or "add Pepsi extra".
            </p>
          </div>
          <div className="lg:col-span-2 lg:border-l lg:border-gray-100 lg:pl-6">
            <PredictiveCards onSelect={(p) => onNeedChange(p)} disabled={loading} />
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <ScenarioChips onSelect={(p) => onNeedChange(p)} disabled={loading} selected={need} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CartModeSelector selected={mode} onChange={onModeChange} disabled={loading} />
            <FamilyProfileSelector selected={profile} onChange={onProfileChange} disabled={loading} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <StressTestPanel stress={stress} onChange={onStressChange} onRebuild={onRebuild} disabled={loading || !need.trim()} />
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="inline-block w-10 h-10 border-3 border-[#ff9900] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-700 font-medium">Understanding your need...</p>
          <p className="text-sm text-gray-400 mt-1">Checking budget, stock, ETA and essentials...</p>
        </div>
      )}

      {/* Empty state hint */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Ready to build your cart</p>
          <p className="text-sm text-gray-400 mt-1">Enter a situation above or pick a demo scenario, then press Build.</p>
        </div>
      )}
    </div>
  );
}
