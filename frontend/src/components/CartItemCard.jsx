import { Clock, Star } from "lucide-react";

export default function CartItemCard({ item }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
            {item.is_forgotten_essential && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-full">
                <Star className="w-3 h-3" />
                Forgotten Essential
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-md">
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <Clock className="w-3 h-3" />
              {item.eta_minutes} min
            </span>
            <span className="text-[11px] text-gray-500">Qty: {item.quantity}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">{item.reason}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-base font-bold text-gray-900">₹{item.price * item.quantity}</div>
          {item.quantity > 1 && (
            <div className="text-[10px] text-gray-400">₹{item.price} each</div>
          )}
        </div>
      </div>
    </div>
  );
}
