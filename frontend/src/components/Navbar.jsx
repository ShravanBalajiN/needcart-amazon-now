import { NavLink } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `text-xs font-medium transition-colors ${isActive ? "text-[#ff9900]" : "text-gray-300 hover:text-white"}`;

  return (
    <header className="bg-[#131921] border-b border-[#232f3e] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-[#ff9900]" />
            <span className="text-lg font-bold text-white tracking-tight">NeedCart</span>
          </NavLink>
          <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] font-medium bg-[#232f3e] text-[#febd69] rounded-full border border-[#febd69]/30">
            Amazon Now Concept
          </span>
        </div>

        <nav className="hidden sm:flex items-center gap-6">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/build" className={linkClass}>Build Cart</NavLink>
          <NavLink to="/cart" className={linkClass}>My Cart</NavLink>
          <NavLink to="/roadmap" className={linkClass}>Roadmap</NavLink>
        </nav>

        <span className="text-[10px] text-gray-500 hidden lg:block">Urgency-to-Cart Engine</span>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden border-t border-[#232f3e] px-4 py-2 flex items-center gap-4 overflow-x-auto">
        <NavLink to="/" className={linkClass}>Home</NavLink>
        <NavLink to="/build" className={linkClass}>Build</NavLink>
        <NavLink to="/cart" className={linkClass}>Cart</NavLink>
        <NavLink to="/roadmap" className={linkClass}>Roadmap</NavLink>
      </div>
    </header>
  );
}
