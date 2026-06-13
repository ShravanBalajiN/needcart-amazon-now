import { Package, Clock, Star } from "lucide-react";

export default function CartItemCard({ item }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-medium text-slate-100 truncate">{item.name}</h4>
            {item.is_forgotten_essential && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full">
                <Star className="w-3 h-3" />
                Forgotten Essential
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Package className="w-3 h-3" />
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.eta_minutes} min
            </span>
            <span>Qty: {item.quantity}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.reason}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-base font-semibold text-slate-100">
            ₹{item.price * item.quantity}
          </div>
          {item.quantity > 1 && (
            <div className="text-[10px] text-slate-500">₹{item.price} each</div>
          )}
        </div>
      </div>
    </div>
  );
}
