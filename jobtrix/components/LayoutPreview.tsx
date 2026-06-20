"use client";

type Template = "classic" | "modern" | "traditional" | "accent" | "creative";

function ClassicPreview() {
  return (
    <svg viewBox="0 0 120 170" className="w-full h-full">
      <rect width="120" height="170" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5" />
      {/* Blue accent bar top */}
      <rect x="0" y="0" width="120" height="3" fill="#2F80ED" />
      {/* Label */}
      <rect x="14" y="10" width="22" height="2" rx="0.5" fill="#2F80ED" opacity="0.6" />
      {/* Name */}
      <rect x="14" y="16" width="48" height="5" rx="1" fill="#1E3A5F" />
      {/* Meta line */}
      <rect x="14" y="24" width="32" height="2" rx="0.5" fill="#9ca3af" />
      {/* Divider */}
      <rect x="14" y="30" width="92" height="0.5" fill="#e5e7eb" />
      {/* Text paragraphs */}
      <rect x="14" y="35" width="92" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="14" y="39" width="92" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="14" y="43" width="72" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="14" y="50" width="92" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="14" y="54" width="92" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="14" y="58" width="60" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="14" y="65" width="92" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="14" y="69" width="92" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="14" y="73" width="48" height="2" rx="0.5" fill="#d1d5db" />
    </svg>
  );
}

function ModernPreview() {
  return (
    <svg viewBox="0 0 120 170" className="w-full h-full">
      <rect width="120" height="170" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5" />
      {/* Dark sidebar 32% */}
      <rect x="0" y="0" width="38" height="170" fill="#1E3A5F" />
      {/* Photo circle */}
      <circle cx="19" cy="24" r="11" fill="#2F80ED" opacity="0.25" />
      <circle cx="19" cy="24" r="10" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
      {/* Name in sidebar */}
      <rect x="6" y="40" width="26" height="3" rx="0.5" fill="#fff" />
      {/* Meta lines */}
      <rect x="6" y="46" width="22" height="1.5" rx="0.5" fill="#cbd5e1" />
      <rect x="6" y="50" width="18" height="1.5" rx="0.5" fill="#cbd5e1" />
      <rect x="6" y="54" width="20" height="1.5" rx="0.5" fill="#cbd5e1" />
      {/* Content area */}
      <rect x="44" y="10" width="18" height="2" rx="0.5" fill="#2F80ED" opacity="0.6" />
      <rect x="44" y="16" width="66" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="44" y="20" width="66" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="44" y="24" width="50" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="44" y="31" width="66" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="44" y="35" width="66" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="44" y="39" width="44" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="44" y="46" width="66" height="2" rx="0.5" fill="#d1d5db" />
      <rect x="44" y="50" width="66" height="2" rx="0.5" fill="#d1d5db" />
    </svg>
  );
}

function TraditionalPreview() {
  return (
    <svg viewBox="0 0 120 170" className="w-full h-full">
      <rect width="120" height="170" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5" />
      {/* Header area: name left, photo right */}
      <rect x="14" y="8" width="18" height="2" rx="0.5" fill="#1a1a1a" opacity="0.5" />
      <rect x="14" y="13" width="40" height="4" rx="0.5" fill="#1a1a1a" />
      <rect x="14" y="19" width="30" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="14" y="22" width="26" height="1.5" rx="0.5" fill="#6b7280" />
      {/* Photo placeholder right */}
      <rect x="90" y="8" width="16" height="20" fill="#e5e7eb" stroke="#1a1a1a" strokeWidth="0.5" />
      {/* Black divider */}
      <rect x="14" y="32" width="92" height="0.75" fill="#1a1a1a" />
      {/* Section heading */}
      <rect x="14" y="38" width="36" height="2.5" rx="0.5" fill="#1a1a1a" />
      <rect x="14" y="42" width="92" height="0.5" fill="#1a1a1a" />
      {/* Table rows */}
      <rect x="14" y="46" width="92" height="14" fill="none" stroke="#9ca3af" strokeWidth="0.5" />
      <rect x="16" y="48" width="18" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="38" y="48" width="30" height="2" rx="0.5" fill="#1a1a1a" />
      <rect x="38" y="52" width="24" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="14" y="60" width="92" height="0.5" fill="#e5e7eb" />
      <rect x="16" y="63" width="18" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="38" y="63" width="28" height="2" rx="0.5" fill="#1a1a1a" />
      <rect x="38" y="67" width="22" height="1.5" rx="0.5" fill="#6b7280" />
      {/* Second section */}
      <rect x="14" y="78" width="28" height="2.5" rx="0.5" fill="#1a1a1a" />
      <rect x="14" y="82" width="92" height="0.5" fill="#1a1a1a" />
      <rect x="14" y="86" width="92" height="12" fill="none" stroke="#9ca3af" strokeWidth="0.5" />
      <rect x="16" y="88" width="14" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="38" y="88" width="32" height="2" rx="0.5" fill="#1a1a1a" />
      <rect x="38" y="92" width="26" height="1.5" rx="0.5" fill="#6b7280" />
    </svg>
  );
}

function AccentPreview() {
  return (
    <svg viewBox="0 0 120 170" className="w-full h-full">
      <rect width="120" height="170" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5" />
      {/* Gradient banner */}
      <defs>
        <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8bb8f0" />
          <stop offset="1" stopColor="#2F80ED" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="120" height="28" fill="url(#accentGrad)" />
      {/* Photo in banner */}
      <rect x="8" y="5" width="18" height="18" rx="2" fill="#ffffff" opacity="0.3" />
      {/* Name band */}
      <rect x="0" y="28" width="120" height="14" fill="#2F80ED" />
      <rect x="24" y="32" width="72" height="4" rx="1" fill="#fff" />
      {/* Bewerbung band */}
      <rect x="0" y="42" width="120" height="8" fill="#f3f4f6" />
      <rect x="20" y="45" width="10" height="1.5" fill="#2F80ED" />
      <rect x="35" y="44.5" width="50" height="3" rx="0.5" fill="#374151" />
      <rect x="90" y="45" width="10" height="1.5" fill="#2F80ED" />
      {/* Info bar */}
      <rect x="0" y="50" width="120" height="7" fill="#f8f9fa" />
      <rect x="10" y="52.5" width="24" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="48" y="52.5" width="24" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="86" y="52.5" width="24" height="1.5" rx="0.5" fill="#6b7280" />
      {/* Two columns */}
      {/* Left: timeline */}
      <rect x="10" y="62" width="32" height="2.5" rx="0.5" fill="#2F80ED" />
      <rect x="10" y="66" width="55" height="0.5" fill="#e5e7eb" />
      <rect x="10" y="70" width="3" height="3" fill="#2F80ED" opacity="0.5" />
      <rect x="16" y="70" width="14" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="16" y="73" width="24" height="2" rx="0.5" fill="#2F80ED" />
      <rect x="16" y="77" width="18" height="1.5" rx="0.5" fill="#6b7280" />
      {/* Right: skill bars */}
      <rect x="72" y="62" width="32" height="2.5" rx="0.5" fill="#2F80ED" />
      <rect x="72" y="66" width="38" height="0.5" fill="#e5e7eb" />
      <rect x="72" y="70" width="20" height="1.5" rx="0.5" fill="#374151" />
      <rect x="72" y="73" width="38" height="2.5" rx="1" fill="#e5e7eb" />
      <rect x="72" y="73" width="28" height="2.5" rx="1" fill="#2F80ED" />
      <rect x="72" y="79" width="18" height="1.5" rx="0.5" fill="#374151" />
      <rect x="72" y="82" width="38" height="2.5" rx="1" fill="#e5e7eb" />
      <rect x="72" y="82" width="22" height="2.5" rx="1" fill="#2F80ED" />
      {/* Divider */}
      <rect x="67" y="60" width="0.5" height="40" fill="#e5e7eb" />
    </svg>
  );
}

function CreativePreview() {
  return (
    <svg viewBox="0 0 120 170" className="w-full h-full">
      <rect width="120" height="170" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5" />
      {/* Colored sidebar 34% */}
      <rect x="0" y="0" width="41" height="170" fill="#1E3A5F" />
      {/* Round photo */}
      <circle cx="20" cy="24" r="12" fill="#2F80ED" opacity="0.25" />
      <circle cx="20" cy="24" r="11" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
      {/* Name */}
      <rect x="5" y="40" width="31" height="3" rx="0.5" fill="#fff" />
      {/* Kontakt section */}
      <rect x="5" y="50" width="20" height="1.5" rx="0.5" fill="#fff" opacity="0.7" />
      {/* Contact rows with icons */}
      <circle cx="8" cy="56" r="1.5" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
      <rect x="12" y="55" width="22" height="1.5" rx="0.5" fill="#f1f5f9" />
      <circle cx="8" cy="61" r="1.5" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
      <rect x="12" y="60" width="18" height="1.5" rx="0.5" fill="#f1f5f9" />
      <circle cx="8" cy="66" r="1.5" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
      <rect x="12" y="65" width="20" height="1.5" rx="0.5" fill="#f1f5f9" />
      {/* Skill bars in sidebar */}
      <rect x="5" y="74" width="24" height="1.5" rx="0.5" fill="#fff" opacity="0.7" />
      <rect x="5" y="79" width="14" height="1.5" rx="0.5" fill="#fff" opacity="0.5" />
      <rect x="5" y="82" width="31" height="2" rx="1" fill="#475569" />
      <rect x="5" y="82" width="24" height="2" rx="1" fill="#fff" />
      <rect x="5" y="87" width="12" height="1.5" rx="0.5" fill="#fff" opacity="0.5" />
      <rect x="5" y="90" width="31" height="2" rx="1" fill="#475569" />
      <rect x="5" y="90" width="18" height="2" rx="1" fill="#fff" />
      {/* Main content right */}
      <rect x="48" y="12" width="58" height="5" rx="1" fill="#1a1a1a" />
      {/* Section with icon */}
      <rect x="48" y="24" width="3" height="3" rx="0.5" fill="#1E3A5F" opacity="0.5" />
      <rect x="54" y="24" width="30" height="3" rx="0.5" fill="#1E3A5F" />
      {/* Timeline entries with icons */}
      <rect x="48" y="32" width="3" height="3" rx="0.5" fill="#6b7280" opacity="0.4" />
      <rect x="54" y="32" width="14" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="54" y="35" width="26" height="2" rx="0.5" fill="#1a1a1a" />
      <rect x="54" y="39" width="20" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="48" y="46" width="3" height="3" rx="0.5" fill="#6b7280" opacity="0.4" />
      <rect x="54" y="46" width="12" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="54" y="49" width="28" height="2" rx="0.5" fill="#1a1a1a" />
      <rect x="54" y="53" width="22" height="1.5" rx="0.5" fill="#6b7280" />
      {/* Second section */}
      <rect x="48" y="62" width="3" height="3" rx="0.5" fill="#1E3A5F" opacity="0.5" />
      <rect x="54" y="62" width="24" height="3" rx="0.5" fill="#1E3A5F" />
      <rect x="48" y="70" width="3" height="3" rx="0.5" fill="#6b7280" opacity="0.4" />
      <rect x="54" y="70" width="10" height="1.5" rx="0.5" fill="#6b7280" />
      <rect x="54" y="73" width="24" height="2" rx="0.5" fill="#1a1a1a" />
      <rect x="54" y="77" width="18" height="1.5" rx="0.5" fill="#6b7280" />
    </svg>
  );
}

const previews: Record<Template, () => React.JSX.Element> = {
  classic: ClassicPreview,
  modern: ModernPreview,
  traditional: TraditionalPreview,
  accent: AccentPreview,
  creative: CreativePreview,
};

export default function LayoutPreview({ template }: { template: Template }) {
  const Preview = previews[template];
  return (
    <div className="w-24 h-32 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600 bg-white">
      <Preview />
    </div>
  );
}
