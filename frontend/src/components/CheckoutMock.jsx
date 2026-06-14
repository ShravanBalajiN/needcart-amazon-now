import { ShoppingCart, CheckCircle2, Pencil } from "lucide-react";

export default function CheckoutMock({ checkoutReady, totalPrice, eta, itemCount, confirmed, onConfirm, onCancelConfirm }) {
  if (!checkoutReady) return null;

  if (confirmed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fadeIn">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-green-800">Cart Confirmed</h3>
        <p className="text-sm text-green-600 mt-1">Your NeedCart is checkout-ready.</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-green-700">
          <span className="font-semibold">₹{totalPrice}</span>
          <span>{eta} min delivery</span>
          <span>{itemCount} items</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-3">Need to make changes? Edit the cart and confirm again.</p>
        <button
          onClick={onCancelConfirm}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Cart
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConfirm}
      className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#ff9900] hover:bg-[#e88b00] text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-lg"
    >
      <ShoppingCart className="w-5 h-5" />
      Confirm Cart - ₹{totalPrice}
    </button>
  );
}
