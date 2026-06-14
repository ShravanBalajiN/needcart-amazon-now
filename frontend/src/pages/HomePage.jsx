import { useNavigate } from "react-router-dom";
import { ShoppingCart, Brain, Users, Zap, Coffee, Thermometer, Flame, Moon, Package } from "lucide-react";

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "Situation-first shopping",
    desc: "Describe what happened. NeedCart identifies the urgent need and builds a complete cart matching budget, time and people count.",
  },
  {
    icon: Brain,
    title: "Deterministic cart optimizer",
    desc: "AI parses intent. Deterministic logic selects products, handles stockouts, finds substitutes and enforces budgets.",
  },
  {
    icon: Users,
    title: "Family personalization",
    desc: "Household profiles customize brand preferences, dietary choices and budget optimization without overriding safety rules.",
  },
];

const DEMOS = [
  { icon: Users, label: "Guests arriving", prompt: "Guests are coming in 30 minutes. Need snacks and drinks for 6 people under 500 rupees." },
  { icon: Zap, label: "Power cut", prompt: "Sudden power cut at home. Need emergency supplies immediately." },
  { icon: Thermometer, label: "Child fever", prompt: "My child has a fever. Need support essentials urgently." },
  { icon: Coffee, label: "Breakfast rush", prompt: "Kids need breakfast before school in 20 minutes. Nothing in the kitchen." },
  { icon: Flame, label: "Pooja items", prompt: "Pooja starting in 45 minutes. Need all essentials." },
  { icon: Moon, label: "Late night hunger", prompt: "It is 11 PM. I am hungry and everything is closed nearby." },
];

export default function HomePage({ onSelectPrompt }) {
  const navigate = useNavigate();

  const handleBuildCart = () => navigate("/build");
  const handleRoadmap = () => navigate("/roadmap");

  const handleDemo = (prompt) => {
    onSelectPrompt(prompt);
    navigate("/build");
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff9900]/10 text-[#ff9900] text-xs font-medium rounded-full mb-6 border border-[#ff9900]/20">
          <Package className="w-3.5 h-3.5" />
          Amazon Now Concept 
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Urgent shopping, built into a<br />
          <span className="text-[#ff9900]">cart in seconds.</span>
        </h1>
        <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
          NeedCart turns real-life situations into checkout-ready Amazon Now carts using intent understanding,
          budget logic, stock awareness and smart substitutions.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleBuildCart}
            className="px-6 py-3 bg-[#ff9900] hover:bg-[#e88a00] text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all"
          >
            Build My Cart
          </button>
          <button
            onClick={handleRoadmap}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 transition-all"
          >
            View Roadmap
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#ff9900]/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#ff9900]" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Demo Scenarios */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-center text-lg font-bold text-gray-900 mb-2">Try a demo situation</h2>
        <p className="text-center text-xs text-gray-500 mb-6">Click any scenario to jump straight into cart building.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DEMOS.map((d, i) => {
            const Icon = d.icon;
            return (
              <button
                key={i}
                onClick={() => handleDemo(d.prompt)}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#ff9900]/40 hover:shadow-sm transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">{d.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Architecture summary */}
      <section className="max-w-3xl mx-auto bg-[#131921] rounded-2xl p-6 text-center">
        <p className="text-[10px] font-semibold text-[#febd69] uppercase tracking-wider mb-2">Architecture</p>
        <p className="text-sm text-white font-medium mb-3">AI understands the situation. Deterministic commerce logic builds the cart.</p>
        <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] text-gray-400">
          {["User Need", "→", "LLM Intent Parser", "→", "Constraint Extractor", "→", "Preference Filter", "→", "Family Layer", "→", "Catalog + Stock + ETA", "→", "Cart Optimizer", "→", "Checkout-Ready Cart"].map((t, i) => (
            <span key={i} className={t === "→" ? "text-[#ff9900]" : "bg-[#232f3e] px-2 py-0.5 rounded"}>{t}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
