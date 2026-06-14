import { Clock, Star, Sparkles, Trash2 } from "lucide-react";
import SmartSwapButton from "./SmartSwap";
import ProductThumbnail from "./ProductThumbnail";

export default function CartItemCard({ item, onSwap, onRemove, isPersonalized }) {
  const showPersonalizedBadge =
    isPersonalized ||
    item.is_personalized === true ||
    !!item.personalization_reason ||
    (item.reason && (
      item.reason.includes("Personalized pick") ||
      item.reason.includes("Preferred by") ||
      item.reason.includes("Matches")
    ));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3.5">
        {/* Product Thumbnail */}
        <ProductThumbnail item={item} size="md" />

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</h4>
            {item.is_forgotten_essential && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-full">
                <Star className="w-3 h-3" />
                Forgotten Essential
              </span>
            )}
            {showPersonalizedBadge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                <Sparkles className="w-3 h-3" />
                Personalized Pick
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-1.5">
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-md capitalize">
              {item.category.replace(/_/g, " ")}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <Clock className="w-3 h-3" />
              {item.eta_minutes} min
            </span>
            <span className="text-[11px] text-gray-500">Qty: {item.quantity}</span>
          </div>
          <p className="mt-1.5 text-xs text-gray-500 leading-relaxed line-clamp-2">{item.reason}</p>
          {item.personalization_reason && (
            <p className="mt-1 text-[10px] text-orange-600 font-medium italic">
              {item.personalization_reason}
            </p>
          )}
        </div>

        {/* Price + Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-base font-bold text-gray-900">₹{item.price * item.quantity}</div>
          {item.quantity > 1 && (
            <div className="text-[10px] text-gray-400">₹{item.price} each</div>
          )}
          <div className="flex items-center gap-1.5 mt-auto">
            {onSwap && <SmartSwapButton item={item} onSwap={onSwap} />}
            {onRemove && (
              <button
                onClick={() => onRemove(item)}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-100 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
