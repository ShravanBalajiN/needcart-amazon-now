import { MessageSquare } from "lucide-react";

export default function NeedInput({ value, onChange, onSubmit, loading }) {
  return (
    <div className="relative">
      <div className="flex items-start gap-3 bg-slate-800/60 border border-slate-700 rounded-xl p-4 focus-within:border-amber-500/50 transition-colors">
        <MessageSquare className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Tell Amazon what happened. What do you need right now?"
          className="flex-1 bg-transparent border-none outline-none resize-none text-slate-100 placeholder-slate-500 text-base min-h-[80px]"
          rows={3}
          disabled={loading}
          aria-label="Describe your need"
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className="mt-3 w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? "Building Cart..." : "Build My Cart"}
      </button>
    </div>
  );
}
