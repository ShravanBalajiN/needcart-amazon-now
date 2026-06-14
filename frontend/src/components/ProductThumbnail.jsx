/**
 * ProductThumbnail - Premium illustrated product thumbnails
 * Uses inline SVG with category/product-aware visuals.
 * No external images needed. Renders a polished quick-commerce style tile.
 */

// Product-specific keyword matching (priority order)
const PRODUCT_MATCHERS = [
  { keywords: ["pepsi"], style: "beverage_can", accent: "#1E40AF", bg: "#DBEAFE", label: "P" },
  { keywords: ["sprite"], style: "beverage_can", accent: "#059669", bg: "#D1FAE5", label: "S" },
  { keywords: ["cola", "thumbs up", "coke"], style: "beverage_can", accent: "#7C2D12", bg: "#FEE2E2", label: "C" },
  { keywords: ["juice", "frooti", "mango juice", "orange juice", "aam panna", "nimbu pani", "fruit juice"], style: "juice_box", accent: "#D97706", bg: "#FEF3C7", label: "J" },
  { keywords: ["water", "mineral water"], style: "water_bottle", accent: "#0284C7", bg: "#E0F2FE", label: "W" },
  { keywords: ["coconut water"], style: "water_bottle", accent: "#065F46", bg: "#D1FAE5", label: "CW" },
  { keywords: ["lays", "chips", "nachos", "small chips"], style: "snack_pack", accent: "#CA8A04", bg: "#FEF9C3", label: "L" },
  { keywords: ["kurkure"], style: "snack_pack", accent: "#EA580C", bg: "#FFF7ED", label: "K" },
  { keywords: ["good day", "cookies", "biscuits", "cream biscuits", "budget biscuits", "low sugar biscuits"], style: "biscuit_pack", accent: "#92400E", bg: "#FEF3C7", label: "B" },
  { keywords: ["noodles", "cup noodles", "instant noodles"], style: "noodle_cup", accent: "#DC2626", bg: "#FEE2E2", label: "N" },
  { keywords: ["milk"], style: "milk_pack", accent: "#1D4ED8", bg: "#EFF6FF", label: "M" },
  { keywords: ["curd", "yogurt", "lassi"], style: "dairy_cup", accent: "#7C3AED", bg: "#EDE9FE", label: "C" },
  { keywords: ["paneer"], style: "dairy_pack", accent: "#059669", bg: "#ECFDF5", label: "P" },
  { keywords: ["cheese"], style: "dairy_pack", accent: "#D97706", bg: "#FFFBEB", label: "C" },
  { keywords: ["bread", "pav bun"], style: "bread_loaf", accent: "#92400E", bg: "#FEF3C7", label: "B" },
  { keywords: ["egg"], style: "egg_tray", accent: "#B45309", bg: "#FFFBEB", label: "E" },
  { keywords: ["oats", "oats pack"], style: "cereal_box", accent: "#65A30D", bg: "#ECFCCB", label: "O" },
  { keywords: ["poha", "upma", "rava", "cornflakes", "cerelac"], style: "cereal_box", accent: "#CA8A04", bg: "#FEF9C3", label: "P" },
  { keywords: ["idli", "dosa batter"], style: "cereal_box", accent: "#9333EA", bg: "#F3E8FF", label: "I" },
  { keywords: ["butter", "jam", "honey"], style: "jar", accent: "#D97706", bg: "#FFFBEB", label: "B" },
  { keywords: ["chocolate", "chikki"], style: "chocolate_bar", accent: "#78350F", bg: "#FEF3C7", label: "C" },
  { keywords: ["cake rusk", "muffin", "croissant", "khari"], style: "bakery_item", accent: "#B45309", bg: "#FEF3C7", label: "B" },
  { keywords: ["candle"], style: "candle", accent: "#D97706", bg: "#FFFBEB", label: "C" },
  { keywords: ["torch", "lantern"], style: "torch", accent: "#1D4ED8", bg: "#DBEAFE", label: "T" },
  { keywords: ["battery", "batteries"], style: "battery", accent: "#16A34A", bg: "#DCFCE7", label: "B" },
  { keywords: ["matchbox"], style: "matchbox", accent: "#DC2626", bg: "#FEE2E2", label: "M" },
  { keywords: ["power bank"], style: "battery", accent: "#4F46E5", bg: "#EEF2FF", label: "PB" },
  { keywords: ["agarbatti", "incense"], style: "incense", accent: "#9333EA", bg: "#F3E8FF", label: "A" },
  { keywords: ["camphor"], style: "pooja_item", accent: "#DC2626", bg: "#FEF2F2", label: "C" },
  { keywords: ["diya", "diya clay"], style: "diya", accent: "#EA580C", bg: "#FFF7ED", label: "D" },
  { keywords: ["kumkum", "sindoor", "turmeric"], style: "pooja_item", accent: "#DC2626", bg: "#FEF2F2", label: "K" },
  { keywords: ["ghee"], style: "jar", accent: "#CA8A04", bg: "#FFFBEB", label: "G" },
  { keywords: ["coconut", "dry coconut"], style: "pooja_item", accent: "#854D0E", bg: "#FEF9C3", label: "C" },
  { keywords: ["cotton wicks", "garland", "flower"], style: "pooja_item", accent: "#E11D48", bg: "#FCE7F3", label: "W" },
  { keywords: ["thermometer"], style: "thermometer", accent: "#DC2626", bg: "#FEE2E2", label: "T" },
  { keywords: ["ors", "electral", "glucose"], style: "sachet", accent: "#0D9488", bg: "#CCFBF1", label: "O" },
  { keywords: ["paracetamol", "ibuprofen", "cough"], style: "medicine", accent: "#059669", bg: "#ECFDF5", label: "M" },
  { keywords: ["vicks", "balm"], style: "medicine", accent: "#0284C7", bg: "#E0F2FE", label: "V" },
  { keywords: ["bandage", "dettol", "antiseptic"], style: "medicine", accent: "#DC2626", bg: "#FEF2F2", label: "+" },
  { keywords: ["diaper", "wipes", "baby"], style: "baby_item", accent: "#EC4899", bg: "#FCE7F3", label: "B" },
  { keywords: ["paper cup", "paper plate", "plastic spoon"], style: "disposable", accent: "#6B7280", bg: "#F3F4F6", label: "D" },
  { keywords: ["napkin", "tissue"], style: "disposable", accent: "#4B5563", bg: "#F9FAFB", label: "N" },
  { keywords: ["mosquito", "repellent"], style: "household_item", accent: "#059669", bg: "#ECFDF5", label: "M" },
  { keywords: ["soap", "dish wash", "floor cleaner", "phenyl"], style: "household_item", accent: "#2563EB", bg: "#EFF6FF", label: "S" },
  { keywords: ["samosa", "mixture", "namkeen", "bhujia", "murukku", "khakhra", "popcorn", "pappad", "mathri", "economy snack", "sev"], style: "snack_pack", accent: "#D97706", bg: "#FFFBEB", label: "S" },
  { keywords: ["tea", "chai", "coffee"], style: "hot_drink", accent: "#78350F", bg: "#FEF3C7", label: "T" },
  { keywords: ["soda", "lemon soda", "tonic", "rooh afza"], style: "beverage_can", accent: "#059669", bg: "#D1FAE5", label: "S" },
  { keywords: ["protein", "nuts", "peanut", "dry fruit"], style: "protein_pack", accent: "#7C2D12", bg: "#FEF3C7", label: "P" },
  { keywords: ["banana", "apple", "fruit"], style: "fruit", accent: "#65A30D", bg: "#ECFCCB", label: "F" },
  { keywords: ["chicken sandwich"], style: "sandwich", accent: "#B45309", bg: "#FEF3C7", label: "CS" },
  { keywords: ["sugar"], style: "jar", accent: "#9CA3AF", bg: "#F9FAFB", label: "S" },
  { keywords: ["rasgulla", "gulab jamun", "soan papdi", "kaju katli"], style: "sweet_box", accent: "#B45309", bg: "#FFFBEB", label: "S" },
];

// Category fallback styles
const CATEGORY_STYLES = {
  beverages: { accent: "#1D4ED8", bg: "#DBEAFE", style: "beverage_can", label: "B" },
  snacks: { accent: "#D97706", bg: "#FEF9C3", style: "snack_pack", label: "S" },
  sweet_snacks: { accent: "#B45309", bg: "#FFFBEB", style: "sweet_box", label: "S" },
  breakfast: { accent: "#CA8A04", bg: "#FEF9C3", style: "cereal_box", label: "B" },
  dairy: { accent: "#7C3AED", bg: "#EDE9FE", style: "dairy_cup", label: "D" },
  bakery: { accent: "#92400E", bg: "#FEF3C7", style: "bakery_item", label: "B" },
  emergency: { accent: "#DC2626", bg: "#FEE2E2", style: "torch", label: "E" },
  pooja: { accent: "#EA580C", bg: "#FFF7ED", style: "diya", label: "P" },
  health_essentials: { accent: "#059669", bg: "#ECFDF5", style: "thermometer", label: "H" },
  household: { accent: "#4B5563", bg: "#F3F4F6", style: "household_item", label: "H" },
  disposables: { accent: "#6B7280", bg: "#F3F4F6", style: "disposable", label: "D" },
  baby: { accent: "#EC4899", bg: "#FCE7F3", style: "baby_item", label: "B" },
  personal_care: { accent: "#6366F1", bg: "#EEF2FF", style: "household_item", label: "P" },
};

function getProductStyle(item) {
  const nameLower = item.name.toLowerCase();
  for (const matcher of PRODUCT_MATCHERS) {
    for (const kw of matcher.keywords) {
      if (nameLower.includes(kw)) {
        return matcher;
      }
    }
  }
  return CATEGORY_STYLES[item.category] || { accent: "#6B7280", bg: "#F3F4F6", style: "default", label: "?" };
}

// SVG shape renderers
function renderShape(style, accent) {
  switch (style) {
    case "beverage_can":
      return (
        <>
          <rect x="18" y="10" width="14" height="30" rx="4" fill={accent} opacity="0.85" />
          <rect x="19" y="12" width="12" height="6" rx="2" fill="white" opacity="0.3" />
          <ellipse cx="25" cy="10" rx="7" ry="2" fill={accent} opacity="0.9" />
          <rect x="22" y="6" width="6" height="4" rx="1" fill={accent} opacity="0.7" />
        </>
      );
    case "juice_box":
      return (
        <>
          <rect x="16" y="12" width="18" height="26" rx="3" fill={accent} opacity="0.85" />
          <rect x="18" y="14" width="14" height="8" rx="2" fill="white" opacity="0.25" />
          <circle cx="25" cy="28" r="4" fill="white" opacity="0.2" />
          <rect x="23" y="8" width="4" height="5" rx="1" fill={accent} opacity="0.6" />
        </>
      );
    case "water_bottle":
      return (
        <>
          <path d="M22 14h6v4l2 2v16c0 2-2 4-5 4s-5-2-5-4V20l2-2V14z" fill={accent} opacity="0.75" />
          <rect x="22" y="10" width="6" height="4" rx="2" fill={accent} opacity="0.9" />
          <path d="M20 22h10" stroke="white" strokeWidth="1" opacity="0.3" />
          <path d="M20 26h10" stroke="white" strokeWidth="1" opacity="0.2" />
        </>
      );
    case "snack_pack":
      return (
        <>
          <path d="M15 16h20l-2 22H17L15 16z" fill={accent} opacity="0.8" />
          <path d="M15 16c0-3 4-5 10-5s10 2 10 5" fill={accent} opacity="0.9" />
          <circle cx="25" cy="26" r="5" fill="white" opacity="0.2" />
          <path d="M20 22h10" stroke="white" strokeWidth="1.5" opacity="0.3" />
        </>
      );
    case "biscuit_pack":
      return (
        <>
          <rect x="14" y="14" width="22" height="20" rx="4" fill={accent} opacity="0.8" />
          <rect x="16" y="16" width="18" height="6" rx="2" fill="white" opacity="0.2" />
          <circle cx="20" cy="28" r="2.5" fill="white" opacity="0.25" />
          <circle cx="25" cy="28" r="2.5" fill="white" opacity="0.25" />
          <circle cx="30" cy="28" r="2.5" fill="white" opacity="0.25" />
        </>
      );
    case "noodle_cup":
      return (
        <>
          <path d="M16 18h18l-2 18H18L16 18z" fill={accent} opacity="0.8" />
          <ellipse cx="25" cy="18" rx="9" ry="3" fill={accent} opacity="0.95" />
          <path d="M20 24c2 2 4 0 5 2s3 0 5-2" stroke="white" strokeWidth="1.5" opacity="0.4" fill="none" />
          <path d="M24 12v6M26 10v8" stroke={accent} strokeWidth="1" opacity="0.5" />
        </>
      );
    case "milk_pack":
      return (
        <>
          <rect x="17" y="14" width="16" height="22" rx="3" fill={accent} opacity="0.8" />
          <path d="M17 18h16" stroke="white" strokeWidth="1" opacity="0.3" />
          <rect x="19" y="20" width="12" height="8" rx="2" fill="white" opacity="0.2" />
          <path d="M22 11l3-2 3 2v3h-6v-3z" fill={accent} opacity="0.9" />
        </>
      );
    case "dairy_cup":
      return (
        <>
          <path d="M17 18h16l-1 16H18L17 18z" fill={accent} opacity="0.75" />
          <ellipse cx="25" cy="18" rx="8" ry="3" fill={accent} opacity="0.9" />
          <ellipse cx="25" cy="16" rx="6" ry="2" fill="white" opacity="0.3" />
          <circle cx="25" cy="26" r="3" fill="white" opacity="0.15" />
        </>
      );
    case "dairy_pack":
      return (
        <>
          <rect x="16" y="15" width="18" height="20" rx="3" fill={accent} opacity="0.8" />
          <rect x="18" y="17" width="14" height="6" rx="2" fill="white" opacity="0.25" />
          <rect x="18" y="27" width="14" height="4" rx="1" fill="white" opacity="0.15" />
        </>
      );
    case "bread_loaf":
      return (
        <>
          <ellipse cx="25" cy="30" rx="10" ry="6" fill={accent} opacity="0.7" />
          <path d="M15 28c0-8 4-14 10-14s10 6 10 14" fill={accent} opacity="0.85" />
          <path d="M18 28h14" stroke="white" strokeWidth="1" opacity="0.3" />
          <path d="M20 22h10" stroke="white" strokeWidth="0.8" opacity="0.2" />
        </>
      );
    case "egg_tray":
      return (
        <>
          <rect x="14" y="22" width="22" height="14" rx="3" fill={accent} opacity="0.5" />
          <ellipse cx="20" cy="22" rx="3.5" ry="5" fill={accent} opacity="0.8" />
          <ellipse cx="25" cy="22" rx="3.5" ry="5" fill={accent} opacity="0.85" />
          <ellipse cx="30" cy="22" rx="3.5" ry="5" fill={accent} opacity="0.8" />
          <ellipse cx="20" cy="20" rx="2" ry="1" fill="white" opacity="0.3" />
          <ellipse cx="25" cy="20" rx="2" ry="1" fill="white" opacity="0.3" />
        </>
      );
    case "cereal_box":
      return (
        <>
          <rect x="16" y="12" width="18" height="24" rx="3" fill={accent} opacity="0.8" />
          <rect x="18" y="14" width="14" height="8" rx="2" fill="white" opacity="0.2" />
          <circle cx="25" cy="28" r="4" fill="white" opacity="0.15" />
          <path d="M22 28h6" stroke="white" strokeWidth="1" opacity="0.3" />
        </>
      );
    case "jar":
      return (
        <>
          <rect x="18" y="16" width="14" height="20" rx="4" fill={accent} opacity="0.75" />
          <rect x="20" y="12" width="10" height="5" rx="2" fill={accent} opacity="0.9" />
          <rect x="20" y="20" width="10" height="6" rx="2" fill="white" opacity="0.2" />
        </>
      );
    case "chocolate_bar":
      return (
        <>
          <rect x="14" y="16" width="22" height="16" rx="3" fill={accent} opacity="0.85" />
          <path d="M14 20h22M14 24h22M14 28h22" stroke="white" strokeWidth="0.5" opacity="0.2" />
          <path d="M20 16v16M26 16v16M32 16v16" stroke="white" strokeWidth="0.5" opacity="0.2" />
          <rect x="16" y="18" width="8" height="4" rx="1" fill="white" opacity="0.15" />
        </>
      );
    case "candle":
      return (
        <>
          <rect x="22" y="18" width="6" height="18" rx="2" fill={accent} opacity="0.7" />
          <path d="M25 10c-2 3-3 5-3 7 0 2 1.5 3 3 3s3-1 3-3c0-2-1-4-3-7z" fill="#F59E0B" opacity="0.9" />
          <rect x="23" y="16" width="4" height="3" rx="1" fill={accent} opacity="0.9" />
        </>
      );
    case "torch":
      return (
        <>
          <rect x="16" y="20" width="18" height="10" rx="3" fill={accent} opacity="0.8" />
          <rect x="14" y="22" width="4" height="6" rx="2" fill={accent} opacity="0.9" />
          <circle cx="34" cy="25" r="4" fill="#FDE047" opacity="0.7" />
          <circle cx="34" cy="25" r="2" fill="white" opacity="0.5" />
        </>
      );
    case "battery":
      return (
        <>
          <rect x="16" y="16" width="16" height="18" rx="3" fill={accent} opacity="0.8" />
          <rect x="20" y="12" width="8" height="4" rx="2" fill={accent} opacity="0.9" />
          <path d="M22 22v6M20 25h4" stroke="white" strokeWidth="1.5" opacity="0.5" />
          <path d="M28 24h2" stroke="white" strokeWidth="1.5" opacity="0.4" />
        </>
      );
    case "matchbox":
      return (
        <>
          <rect x="15" y="17" width="20" height="14" rx="2" fill={accent} opacity="0.8" />
          <rect x="17" y="19" width="16" height="10" rx="1" fill="white" opacity="0.15" />
          <circle cx="23" cy="13" r="2" fill="#F59E0B" opacity="0.8" />
          <path d="M23 15v2" stroke={accent} strokeWidth="1.5" opacity="0.7" />
        </>
      );
    case "incense":
      return (
        <>
          <rect x="24" y="16" width="2" height="20" rx="1" fill={accent} opacity="0.7" />
          <path d="M25 10c-1 2-1 4 0 6" stroke={accent} strokeWidth="1" opacity="0.5" fill="none" />
          <path d="M24 10c1 3 2 4 1 6" stroke={accent} strokeWidth="0.8" opacity="0.4" fill="none" />
          <rect x="20" y="34" width="10" height="4" rx="2" fill={accent} opacity="0.8" />
        </>
      );
    case "diya":
      return (
        <>
          <ellipse cx="25" cy="32" rx="9" ry="4" fill={accent} opacity="0.7" />
          <path d="M18 30c0-4 3-8 7-8s7 4 7 8" fill={accent} opacity="0.8" />
          <path d="M25 16c-1 2-2 4-2 5 0 1.5 1 2 2 2s2-.5 2-2c0-1-1-3-2-5z" fill="#F59E0B" opacity="0.9" />
        </>
      );
    case "pooja_item":
      return (
        <>
          <circle cx="25" cy="25" r="10" fill={accent} opacity="0.2" />
          <circle cx="25" cy="25" r="6" fill={accent} opacity="0.6" />
          <circle cx="25" cy="25" r="3" fill="white" opacity="0.3" />
          <path d="M25 12v4M25 34v4M12 25h4M34 25h4" stroke={accent} strokeWidth="1" opacity="0.4" />
        </>
      );
    case "thermometer":
      return (
        <>
          <rect x="23" y="12" width="4" height="20" rx="2" fill={accent} opacity="0.7" />
          <circle cx="25" cy="34" r="5" fill={accent} opacity="0.8" />
          <circle cx="25" cy="34" r="3" fill="white" opacity="0.3" />
          <rect x="24" y="18" width="2" height="10" rx="1" fill="white" opacity="0.3" />
        </>
      );
    case "sachet":
      return (
        <>
          <rect x="16" y="16" width="18" height="16" rx="3" fill={accent} opacity="0.75" />
          <path d="M16 20h18" stroke="white" strokeWidth="0.8" opacity="0.3" />
          <path d="M20 16l-2-4h14l-2 4" fill={accent} opacity="0.5" />
          <circle cx="25" cy="26" r="3" fill="white" opacity="0.2" />
        </>
      );
    case "medicine":
      return (
        <>
          <rect x="17" y="16" width="16" height="18" rx="3" fill={accent} opacity="0.7" />
          <rect x="19" y="12" width="12" height="5" rx="2" fill={accent} opacity="0.9" />
          <path d="M22 22v6M19 25h6" stroke="white" strokeWidth="1.5" opacity="0.4" />
        </>
      );
    case "baby_item":
      return (
        <>
          <rect x="16" y="14" width="18" height="22" rx="5" fill={accent} opacity="0.7" />
          <circle cx="25" cy="22" r="4" fill="white" opacity="0.25" />
          <rect x="20" y="30" width="10" height="3" rx="1" fill="white" opacity="0.2" />
        </>
      );
    case "disposable":
      return (
        <>
          <ellipse cx="25" cy="30" rx="9" ry="5" fill={accent} opacity="0.4" />
          <path d="M18 16h14l2 14H16L18 16z" fill={accent} opacity="0.7" />
          <ellipse cx="25" cy="16" rx="7" ry="3" fill={accent} opacity="0.85" />
        </>
      );
    case "household_item":
      return (
        <>
          <rect x="17" y="14" width="16" height="22" rx="4" fill={accent} opacity="0.7" />
          <rect x="21" y="10" width="8" height="5" rx="2" fill={accent} opacity="0.85" />
          <rect x="19" y="20" width="12" height="6" rx="2" fill="white" opacity="0.2" />
          <path d="M22 30h6" stroke="white" strokeWidth="1" opacity="0.3" />
        </>
      );
    case "hot_drink":
      return (
        <>
          <path d="M17 20h14v14c0 2-3 4-7 4s-7-2-7-4V20z" fill={accent} opacity="0.8" />
          <path d="M31 23c2 0 4 1 4 3s-2 3-4 3" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M22 16c0-2 1-3 3-3s3 1 3 3" stroke={accent} strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M20 15c0-3 2-4 3-4" stroke={accent} strokeWidth="0.8" fill="none" opacity="0.3" />
        </>
      );
    case "protein_pack":
      return (
        <>
          <rect x="16" y="14" width="18" height="20" rx="4" fill={accent} opacity="0.8" />
          <circle cx="25" cy="22" r="4" fill="white" opacity="0.2" />
          <path d="M23 20l2 2 4-4" stroke="white" strokeWidth="1.5" opacity="0.4" fill="none" />
          <rect x="18" y="28" width="14" height="3" rx="1" fill="white" opacity="0.15" />
        </>
      );
    case "fruit":
      return (
        <>
          <circle cx="25" cy="26" r="9" fill={accent} opacity="0.7" />
          <circle cx="25" cy="26" r="6" fill={accent} opacity="0.9" />
          <path d="M25 16c-1 2 0 4 0 4" stroke="#166534" strokeWidth="1.5" fill="none" opacity="0.6" />
          <ellipse cx="26" cy="16" rx="3" ry="2" fill="#166534" opacity="0.5" />
        </>
      );
    case "sandwich":
      return (
        <>
          <path d="M14 22h22l-2 4H16L14 22z" fill={accent} opacity="0.9" />
          <path d="M15 26h20l-1 4H16L15 26z" fill="#65A30D" opacity="0.6" />
          <path d="M16 30h18l-1 4H17L16 30z" fill={accent} opacity="0.8" />
          <path d="M14 22c0-3 5-6 11-6s11 3 11 6" fill={accent} opacity="0.7" />
        </>
      );
    case "sweet_box":
      return (
        <>
          <rect x="14" y="16" width="22" height="16" rx="3" fill={accent} opacity="0.8" />
          <rect x="14" y="14" width="22" height="4" rx="2" fill={accent} opacity="0.95" />
          <path d="M20 22c0 2 2 4 5 4s5-2 5-4" stroke="white" strokeWidth="1" opacity="0.3" fill="none" />
          <circle cx="20" cy="26" r="1.5" fill="white" opacity="0.2" />
          <circle cx="30" cy="26" r="1.5" fill="white" opacity="0.2" />
        </>
      );
    case "bakery_item":
      return (
        <>
          <ellipse cx="25" cy="28" rx="10" ry="7" fill={accent} opacity="0.7" />
          <path d="M18 24c2-6 5-8 7-8s5 2 7 8" fill={accent} opacity="0.85" />
          <path d="M20 26h10" stroke="white" strokeWidth="0.8" opacity="0.2" />
        </>
      );
    default:
      return (
        <>
          <rect x="16" y="14" width="18" height="20" rx="4" fill={accent} opacity="0.6" />
          <rect x="18" y="16" width="14" height="6" rx="2" fill="white" opacity="0.2" />
          <circle cx="25" cy="28" r="3" fill="white" opacity="0.15" />
        </>
      );
  }
}

export default function ProductThumbnail({ item, size = "md" }) {
  const { accent, bg, style, label } = getProductStyle(item);

  const sizeClasses = {
    sm: "w-14 h-14 rounded-xl",
    md: "w-[72px] h-[72px] rounded-2xl",
    lg: "w-20 h-20 rounded-2xl",
  };

  const containerClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`${containerClass} shrink-0 relative overflow-hidden shadow-sm border border-black/5`}
      style={{ background: `linear-gradient(135deg, ${bg} 0%, white 100%)` }}
    >
      {/* SVG illustration */}
      <svg
        viewBox="0 0 50 50"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderShape(style, accent)}
      </svg>

      {/* Subtle product initial overlay */}
      <div
        className="absolute bottom-0.5 right-1 text-[8px] font-bold opacity-30 select-none"
        style={{ color: accent }}
      >
        {label}
      </div>
    </div>
  );
}
