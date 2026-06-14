import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#131921] border-t border-[#232f3e] mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-5 h-5 text-[#ff9900]" />
              <span className="text-base font-bold text-white">NeedCart</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Urgency-to-Cart Engine for Amazon Now. Turns real-life situations into checkout-ready carts in seconds.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Navigation</p>
            <div className="space-y-2">
              <Link to="/" className="block text-xs text-gray-400 hover:text-[#ff9900] transition-colors">Home</Link>
              <Link to="/build" className="block text-xs text-gray-400 hover:text-[#ff9900] transition-colors">Build Cart</Link>
              <Link to="/cart" className="block text-xs text-gray-400 hover:text-[#ff9900] transition-colors">Cart Review</Link>
              <Link to="/impact" className="block text-xs text-gray-400 hover:text-[#ff9900] transition-colors">Impact</Link>
              <Link to="/roadmap" className="block text-xs text-gray-400 hover:text-[#ff9900] transition-colors">Roadmap</Link>
            </div>
          </div>

          {/* Product Layers */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Product Layers</p>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">MVP: Urgency-to-Cart</p>
              <p className="text-xs text-gray-400">Family Preferences</p>
              <p className="text-xs text-gray-400">Predictive NeedCart</p>
              <p className="text-xs text-gray-400">Smart Substitutions</p>
              <p className="text-xs text-gray-400">Explicit User Preferences</p>
            </div>
          </div>

          {/* Architecture */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">How It Works</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              AI understands the situation. Deterministic logic builds the cart. LLM parses intent and constraints. Rule engine selects products.
            </p>
          </div>
        </div>

        <div className="border-t border-[#232f3e] mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[10px] text-gray-500">
            Prototype built for HackOn with Amazon. Future Amazon ecosystem integrations shown as product vision.
          </p>
          <p className="text-[10px] text-gray-600">
            AI for intent understanding · Deterministic logic for cart generation
          </p>
        </div>
      </div>
    </footer>
  );
}
