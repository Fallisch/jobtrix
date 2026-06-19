"use client";

type Template = "classic" | "modern" | "traditional" | "accent" | "creative";

function ClassicPreview() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff" stroke="#ddd" strokeWidth="1" />
      <rect x="0" y="0" width="120" height="3" fill="#2F80ED" />
      <rect x="16" y="14" width="50" height="5" rx="1" fill="#1E3A5F" />
      <rect x="16" y="22" width="35" height="3" rx="1" fill="#999" />
      <rect x="16" y="30" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="35" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="40" width="70" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="50" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="55" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="60" width="55" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="70" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="75" width="88" height="2" rx="1" fill="#ccc" />
    </svg>
  );
}

function ModernPreview() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff" stroke="#ddd" strokeWidth="1" />
      <rect x="0" y="0" width="40" height="160" fill="#1E3A5F" />
      <circle cx="20" cy="20" r="10" fill="#2F80ED" opacity="0.3" />
      <rect x="8" y="35" width="24" height="3" rx="1" fill="#fff" />
      <rect x="8" y="41" width="20" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="8" y="52" width="16" height="2" rx="1" fill="#2F80ED" />
      <rect x="8" y="57" width="24" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="8" y="62" width="20" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="50" y="14" width="60" height="5" rx="1" fill="#1E3A5F" />
      <rect x="50" y="25" width="60" height="2" rx="1" fill="#ccc" />
      <rect x="50" y="30" width="60" height="2" rx="1" fill="#ccc" />
      <rect x="50" y="35" width="45" height="2" rx="1" fill="#ccc" />
      <rect x="50" y="45" width="60" height="2" rx="1" fill="#ccc" />
      <rect x="50" y="50" width="60" height="2" rx="1" fill="#ccc" />
    </svg>
  );
}

function TraditionalPreview() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff" stroke="#ddd" strokeWidth="1" />
      <rect x="16" y="12" width="88" height="1" fill="#1E3A5F" />
      <rect x="30" y="18" width="60" height="5" rx="1" fill="#1E3A5F" />
      <rect x="38" y="26" width="44" height="3" rx="1" fill="#999" />
      <rect x="16" y="34" width="88" height="1" fill="#1E3A5F" />
      <rect x="16" y="42" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="47" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="52" width="70" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="62" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="67" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="72" width="55" height="2" rx="1" fill="#ccc" />
    </svg>
  );
}

function AccentPreview() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff" stroke="#ddd" strokeWidth="1" />
      <rect x="0" y="0" width="5" height="160" fill="#2F80ED" />
      <rect x="16" y="14" width="50" height="5" rx="1" fill="#2F80ED" />
      <rect x="16" y="22" width="35" height="3" rx="1" fill="#999" />
      <rect x="16" y="32" width="30" height="3" rx="1" fill="#2F80ED" opacity="0.7" />
      <rect x="16" y="38" width="94" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="43" width="94" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="48" width="70" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="58" width="30" height="3" rx="1" fill="#2F80ED" opacity="0.7" />
      <rect x="16" y="64" width="94" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="69" width="94" height="2" rx="1" fill="#ccc" />
    </svg>
  );
}

function CreativePreview() {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <rect width="120" height="160" fill="#fff" stroke="#ddd" strokeWidth="1" />
      <rect x="0" y="0" width="120" height="40" fill="#1E3A5F" />
      <circle cx="20" cy="20" r="12" fill="#2F80ED" opacity="0.3" />
      <rect x="40" y="13" width="60" height="5" rx="1" fill="#fff" />
      <rect x="40" y="22" width="45" height="3" rx="1" fill="rgba(255,255,255,0.6)" />
      <rect x="16" y="50" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="55" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="60" width="70" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="70" width="40" height="3" rx="1" fill="#2F80ED" />
      <rect x="16" y="76" width="88" height="2" rx="1" fill="#ccc" />
      <rect x="16" y="81" width="88" height="2" rx="1" fill="#ccc" />
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
