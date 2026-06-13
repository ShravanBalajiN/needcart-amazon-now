import { useState } from "react";
import { ShoppingCart, CheckCircle2 } from "lucide-react";

export default function CheckoutMock({ checkoutReady, totalPrice }) {
  const [confirmed, setConfirmed] = useState(false);

  if (!checkoutReady) return null;

  if (confirmed) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-700/40 rounded-xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-emerald-400">Cart confirmed.</h3>
        <p className="text-sm text-slate-400 mt-1">Order simulated for Amazon Now.</p>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmed(true)}
      className="w-full flex items-center justify-center gap-3 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-lg rounded-xl transition-colors"
    >
      <ShoppingCart className="w-5 h-5" />
      Confirm Cart - ₹{totalPrice}
    </button>
  );
}
