import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, ArrowLeft, IndianRupee, Users, Clock, Leaf, Truck,
  Users as UsersIcon, Coffee, Thermometer, Zap, Flame, Moon, Package,
} from "lucide-react";
import CartItemCard from "../components/CartItemCard";
import CartHealthScore from "../components/CartHealthScore";
import ReplacementPanel from "../components/ReplacementPanel";
import SkippedItemsPanel from "../components/SkippedItemsPanel";
import CheckoutMock from "../components/CheckoutMock";
import WhyThisCart from "../components/WhyThisCart";

const INTENT_DISPLAY = {
  guests_arriving: { label: "Guests Arriving", icon: UsersIcon, color: "text-blue-600" },
  breakfast_rush: { label: "Breakfast Rush", icon: Coffee, color: "text-amber-600" },
  child_fever_essentials: { label: "Child Fever Essentials", icon: Thermometer, color: "text-red-600" },
  power_cut: { label: "Power Cut Emergency", icon: Zap, color: "text-yellow-600" },
  pooja_items: { label: "Pooja Items", icon: Flame, color: "text-orange-600" },
  late_night_hunger: { label: "Late Night Hunger", icon: Moon, color: "text-purple-600" },
  general_urgent_need: { label: "Urgent Household Need", icon: Package, color: "text-gray-600" },
};

export default function CartPage({
  result, cartItems, removedItems,
  onSwap, onRemove, onUndoRemove, cartTotal,
}) {
  const navigate = useNavigate();

  // Empty state
  if (!result) {
    return (
      <div className="py-16 text-center">
        <ShoppingCart className="w-14 h-14 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-700 mb-2">No cart generated yet</h2>
        <p className="text-sm text-gray-500 mb-6">Build a NeedCart by describing your urgent situation.</p>
        <button
          onClick={() => navigate("/build")}
          className="px-5 py-2.5 bg-[#ff9900] hover:bg-[#e88a00] text-white text-sm font-semibold rounded-xl transition-all"
        >
          Build a NeedCart
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cart Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review your generated cart before confirming.</p>
        </div>
        <button
          onClick={() => navigate("/build")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Edit Need
        </button>
      </div>

      {/* Cart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <IntentCard result={result} />
          <WhyThisCart result={result} />

          {cartItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Cart Items ({cartItems.length})</h3>
              {cartItems.map((item, idx) => (
                <CartItemCard
                  key={item.id + item.name + idx}
                  item={item}
                  onSwap={onSwap}
                  onRemove={onRemove}
                  isPersonalized={
                    item.is_personalized === true ||
                    !!item.personalization_reason ||
                    (item.reason && (
                      item.reason.includes("Personalized pick") ||
                      item.reason.includes("Preferred by") ||
                      item.reason.includes("Matches")
                    ))
                  }
                />
              ))}
            </div>
          )}

          {/* Removed Items */}
          {removedItems.length > 0 && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">Removed Items ({removedItems.length})</h4>
              <div className="space-y-1">
                {removedItems.map((item, idx) => (
                  <div key={item.id + item.name + idx} className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500 line-through">{item.name} - ₹{item.price}</span>
                    <button
                      onClick={() => onUndoRemove(item)}
                      className="text-[10px] font-medium text-blue-600 hover:text-blue-700 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100"
                    >
                      Undo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ReplacementPanel replacements={result.replacements} />
          <SkippedItemsPanel skippedItems={result.skipped_items} />
        </div>

        {/* Right: Sticky Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <CartSummary result={result} cartTotal={cartTotal} />
            <CheckoutMock
              checkoutReady={result.checkout_ready}
              totalPrice={cartTotal}
              eta={result.eta_minutes}
              itemCount={cartItems.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function IntentCard({ result }) {
  const intentInfo = INTENT_DISPLAY[result.detected_intent] || INTENT_DISPLAY.general_urgent_need;
  const Icon = intentInfo.icon;
  const excluded = result.constraints?.excluded_items || [];
  const requested = result.constraints?.requested_extra_items || [];
  const hasPreferences = excluded.length > 0 || requested.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-gray-50">
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
      {hasPreferences && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">User Preferences</p>
          <div className="flex flex-wrap gap-1.5">
            {excluded.map((item) => (
              <span key={item} className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 rounded-full border border-red-100">
                Avoiding: {item}
              </span>
            ))}
            {requested.map((item) => (
              <span key={item} className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-600 rounded-full border border-green-100">
                Requested: {item}
              </span>
            ))}
          </div>
        </div>
      )}
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

function CartSummary({ result, cartTotal }) {
  const styles = {
    "Complete Cart": "bg-green-100 text-green-700 border-green-200",
    "Budget-Optimized Cart": "bg-blue-100 text-blue-700 border-blue-200",
    "Substituted Cart": "bg-amber-100 text-amber-700 border-amber-200",
    "Rescue Cart": "bg-orange-100 text-orange-700 border-orange-200",
    "Partial Cart": "bg-red-100 text-red-700 border-red-200",
  };
  const statusCls = styles[result.cart_status] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Order Summary</h3>
      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${statusCls}`}>
        {result.cart_status}
      </span>

      <div className="mt-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-xl font-bold text-gray-900">₹{cartTotal}</span>
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

      <p className="mt-4 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
        {result.summary}
      </p>

      <div className="mt-4 border-t border-gray-100 pt-3">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Order Readiness</p>
        <CartHealthScore scores={result.scores} />
      </div>
    </div>
  );
}
