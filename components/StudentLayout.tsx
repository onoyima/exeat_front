export default function Sidebar({ onExeatClick }: { onExeatClick: () => void }) {
  return (
    <nav>
      {/* Other menu items */}
      <button
        onClick={onExeatClick}
        className="w-full text-left px-4 py-2 hover:bg-indigo-50"
      >
        Apply for Exeat
      </button>
    </nav>
  );
}
