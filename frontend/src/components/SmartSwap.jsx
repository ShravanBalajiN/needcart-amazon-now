import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";

// Category-safe alternatives (no medicines, no cross-category swaps)
const SWAP_OPTIONS = {
  snacks: [
    { name: "Lays Classic 100g", price: 20 },
    { name: "Kurkure Masala 100g", price: 20 },
    { name: "Biscuits Marie 200g", price: 25 },
    { name: "Peanuts Salted 200g", price: 60 },
    { name: "Mixture Namkeen 200g", price: 60 },
  ],
  beverages: [
    { name: "Pepsi 1.5L", price: 75 },
    { name: "Sprite 1.25L", price: 65 },
    { name: "Mango Juice 1L", price: 90 },
    { name: "Coconut Water 1L", price: 60 },
    { name: "Mineral Water 5L", price: 50 },
  ],
  disposables: [
    { name: "Paper Plates 20pc", price: 50 },
    { name: "Plastic Spoons 50pc", price: 35 },
    { name: "Paper Napkins 100pc", price: 30 },
  ],
  breakfast: [
    { name: "Bread Multigrain", price: 55 },
    { name: "Oats 500g", price: 95 },
    { name: "Poha 500g", price: 38 },
    { name: "Cornflakes 500g", price: 120 },
  ],
  emergency: [
    { name: "LED Torch", price: 120 },
    { name: "AA Batteries 4pc", price: 80 },
    { name: "Candles Pack of 6", price: 40 },
  ],
  pooja: [
    { name: "Camphor Tablets 50g", price: 35 },
    { name: "Agarbatti Pack", price: 50 },
    { name: "Cotton Wicks 50pc", price: 20 },
    { name: "Diya Oil 200ml", price: 45 },
  ],
  sweet_snacks: [
    { name: "Cookies Butter 200g", price: 55 },
    { name: "Cake Rusk Pack", price: 40 },
    { name: "Chocolate Bar 50g", price: 50 },
  ],
  // No swaps for health_essentials - safety first
};

export default function SmartSwapButton({ item, onSwap }) {
  const [showPanel, setShowPanel] = useState(false);
  const alternatives = (SWAP_OPTIONS[item.category] || []).filter(
    (alt) => alt.name !== item.name
  );

  // Don't show swap for health essentials or if no alternatives
  if (item.category === "health_essentials" || item.category === "baby" || alternatives.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
      >
        <ArrowRightLeft className="w-3 h-3" />
        Swap
      </button>

      {showPanel && (
        <div className="absolute right-0 top-7 z-10 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 animate-fadeIn">
          <p className="text-[10px] text-gray-500 mb-2">Choose a backup option</p>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {alternatives.slice(0, 4).map((alt, i) => (
              <button
                key={i}
                onClick={() => { onSwap(item, alt); setShowPanel(false); }}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-left rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700 truncate">{alt.name}</span>
                <span className="text-gray-500 shrink-0 ml-2">₹{alt.price}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
