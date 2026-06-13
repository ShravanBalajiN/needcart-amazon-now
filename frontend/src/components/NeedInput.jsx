import { ShoppingCart } from "lucide-react";
import VoiceInputButton from "./VoiceInputButton";

export default function NeedInput({ value, onChange, onSubmit, onVoice, loading }) {
  return (
    <div className="space-y-3">
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Guests are coming in half an hour... / Power is gone at home... / My child has fever at night..."
          className="w-full bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-400 text-base p-4 pb-14 min-h-[100px] rounded-xl"
          rows={3}
          disabled={loading}
          aria-label="Describe your urgent need"
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <VoiceInputButton onTranscript={onVoice} disabled={loading} />
          <button
            onClick={onSubmit}
            disabled={loading || !value.trim()}
            className="flex items-center gap-2 bg-[#ff9900] hover:bg-[#e88b00] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 px-5 rounded-lg transition-all text-sm shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            {loading ? "Building..." : "Build My Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
