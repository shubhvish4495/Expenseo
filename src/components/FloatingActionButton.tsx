interface FloatingActionButtonProps {
  onClick: () => void
  label?: string
}

const FloatingActionButton = ({ onClick, label = "Log New Expense" }: FloatingActionButtonProps) => {
  return (
    <div className="fixed bottom-32 left-0 w-full px-6 flex justify-center z-40">
      <button
        onClick={onClick}
        className="bg-gradient-primary text-white px-8 py-4 rounded-full font-headline font-bold text-lg shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200 animate-fade-in"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          add
        </span>
        {label}
      </button>
    </div>
  )
}

export default FloatingActionButton