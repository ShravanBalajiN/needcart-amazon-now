import { Mic, Heart, CreditCard, Wifi, Brain, ShoppingCart, Users, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PHASES = [
  { label: "Phase 1", title: "Urgency-to-Cart MVP", status: "active", desc: "Intent detection, budget fitting, stockout handling, rescue mode, forgotten essentials." },
  { label: "Phase 2", title: "Family Preferences", status: "active", desc: "Household profiles, dietary preferences, brand preferences, budget optimization per family." },
  { label: "Phase 3", title: "Predictive Shopping Intelligence", status: "planned", desc: "Time-of-day predictions, repeat pattern detection, contextual suggestions." },
  { label: "Phase 4", title: "Alexa, Prime & Amazon Pay", status: "planned", desc: "Voice-first ordering, purchase history personalization, one-tap checkout." },
];

const INTEGRATIONS = [
  { icon: Mic, title: "Alexa Trigger", desc: "\"Alexa, guests are arriving.\" Hands-free cart generation from voice commands." },
  { icon: Heart, title: "Prime Personalization", desc: "Leverage household purchase history and Prime preferences for better picks." },
  { icon: CreditCard, title: "Amazon Pay", desc: "One-tap checkout with saved payment methods and delivery addresses." },
  { icon: Wifi, title: "Smart Home Signals", desc: "Power cut detected by smart home. Pantry sensors. Calendar-triggered carts." },
];

const ARCHITECTURE_STEPS = [
  "User Need / Voice Input",
  "LLM Intent Parser + Rule Fallback",
  "Constraint Extractor",
  "Explicit Preference Filter",
  "Family Preference Layer",
  "Catalog + Stock + ETA",
  "Deterministic Cart Optimizer",
  "Substitution + Rescue Mode",
  "Explainable Checkout-Ready Cart",
];

export default function RoadmapPage() {
  const navigate = useNavigate();

  return (
    <div className="py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Vision & Roadmap</h1>
        <p className="text-sm text-gray-500">
          From urgency-to-cart MVP to full Amazon ecosystem integration. Future integrations shown for product vision.
        </p>
      </div>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {PHASES.map((phase, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full shrink-0 ${phase.status === "active" ? "bg-[#ff9900]" : "bg-gray-300"}`} />
                {i < PHASES.length - 1 && <div className={`w-0.5 h-12 ${i < 2 ? "bg-[#ff9900]" : "bg-gray-200"}`} />}
              </div>
              <div className={`pb-4 ${phase.status === "active" ? "" : "opacity-60"}`}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{phase.label}</p>
                <h3 className="text-sm font-bold text-gray-900">{phase.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{phase.desc}</p>
                {phase.status === "active" && (
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-semibold bg-green-100 text-green-700 rounded-full">Live</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integration Cards */}
      <section className="bg-[#131921] rounded-2xl p-8 max-w-5xl mx-auto">
        <h2 className="text-sm font-bold text-[#febd69] mb-1">Amazon Ecosystem Integrations</h2>
        <p className="text-xs text-gray-400 mb-6">Future integrations shown for product vision.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INTEGRATIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-[#232f3e] rounded-xl p-4">
                <Icon className="w-5 h-5 text-[#febd69] mb-3" />
                <p className="text-xs font-semibold text-white mb-1">{item.title}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-center text-lg font-bold text-gray-900 mb-2">System Architecture</h2>
        <p className="text-center text-xs text-gray-500 mb-6">AI understands the situation. Deterministic commerce logic builds the cart.</p>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ARCHITECTURE_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="px-3 py-1.5 text-[11px] font-medium bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {step}
                </span>
                {i < ARCHITECTURE_STEPS.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-[#ff9900] shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <button
          onClick={() => navigate("/build")}
          className="px-6 py-3 bg-[#ff9900] hover:bg-[#e88a00] text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all"
        >
          Try NeedCart Now
        </button>
      </section>
    </div>
  );
}
