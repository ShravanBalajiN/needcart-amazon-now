import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { healthCheck, generateCart } from "./api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import BuildPage from "./pages/BuildPage";
import CartPage from "./pages/CartPage";
import ImpactPage from "./pages/ImpactPage";
import RoadmapPage from "./pages/RoadmapPage";

const DEFAULT_STRESS = {
  override_budget: null,
  override_urgency_minutes: null,
  simulate_stockout_product_ids: [],
  simulate_stockout_groups: [],
};

export default function App() {
  const [need, setNeed] = useState(() => localStorage.getItem("nc_need") || "");
  const [mode, setMode] = useState(() => localStorage.getItem("nc_mode") || "balanced");
  const [profile, setProfile] = useState(() => localStorage.getItem("nc_profile") || "default");
  const [stress, setStress] = useState(DEFAULT_STRESS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendUp, setBackendUp] = useState(true);
  const [result, setResult] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [removedItems, setRemovedItems] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    healthCheck()
      .then(() => setBackendUp(true))
      .catch(() => setBackendUp(false));
  }, []);

  // Persist preferences
  useEffect(() => { localStorage.setItem("nc_need", need); }, [need]);
  useEffect(() => { localStorage.setItem("nc_mode", mode); }, [mode]);
  useEffect(() => { localStorage.setItem("nc_profile", profile); }, [profile]);

  const resetLocalCartState = () => {
    setRemovedItems([]);
  };

  const handleSubmit = async () => {
    if (!need.trim()) return false;
    setLoading(true);
    setError(null);
    setResult(null);
    setCartItems([]);
    resetLocalCartState();

    const payload = {
      need: need.trim(),
      mode,
      stress,
      household_profile_id: profile,
    };

    try {
      const data = await generateCart(payload);
      setResult(data);
      setCartItems(data.items || []);
      setLoading(false);
      return true;
    } catch {
      setError("Could not build cart right now. Please try again.");
      setLoading(false);
      return false;
    }
  };

  const handleRebuild = () => {
    if (need.trim()) {
      handleSubmit().then((ok) => { if (ok) navigate("/cart"); });
    }
  };

  const handleSwap = (originalItem, alternative) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === originalItem.id && item.name === originalItem.name
          ? { ...item, name: alternative.name, price: alternative.price, reason: "Smart Swap: user selected alternative." }
          : item
      )
    );
  };

  const handleRemove = (itemToRemove) => {
    setCartItems((prev) => prev.filter((item) => !(item.id === itemToRemove.id && item.name === itemToRemove.name)));
    setRemovedItems((prev) => [...prev, itemToRemove]);
  };

  const handleUndoRemove = (itemToRestore) => {
    setRemovedItems((prev) => prev.filter((item) => !(item.id === itemToRestore.id && item.name === itemToRestore.name)));
    setCartItems((prev) => [...prev, itemToRestore]);
  };

  const handleNeedChange = (val) => {
    setNeed(val);
  };

  const handleModeChange = (val) => {
    setMode(val);
    resetLocalCartState();
  };

  const handleProfileChange = (val) => {
    setProfile(val);
    resetLocalCartState();
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 w-full">
        <Routes>
          <Route
            path="/"
            element={<HomePage onSelectPrompt={(p) => { setNeed(p); }} />}
          />
          <Route
            path="/build"
            element={
              <BuildPage
                need={need} onNeedChange={handleNeedChange}
                mode={mode} onModeChange={handleModeChange}
                profile={profile} onProfileChange={handleProfileChange}
                stress={stress} onStressChange={setStress}
                loading={loading} error={error} backendUp={backendUp}
                onSubmit={handleSubmit} onRebuild={handleRebuild}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                result={result} cartItems={cartItems} removedItems={removedItems}
                onSwap={handleSwap} onRemove={handleRemove} onUndoRemove={handleUndoRemove}
                cartTotal={cartTotal}
              />
            }
          />
          <Route
            path="/impact"
            element={<ImpactPage result={result} cartItems={cartItems} />}
          />
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
