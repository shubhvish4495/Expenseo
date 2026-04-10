interface SummaryData {
  totalSpend: number
  userBalance: number
  groupName: string
  isOwed: boolean
}

interface SummaryCardsProps {
  data: SummaryData
}

const SummaryCards = ({ data }: SummaryCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
      {/* Total Group Spend Card */}
      <div className="bg-gradient-primary p-8 rounded-2xl editorial-shadow text-white relative overflow-hidden flex flex-col justify-between h-48">
        <div className="z-10">
          <p className="font-label text-sm opacity-90 font-medium">Total Group Spend</p>
          <h2 className="text-4xl font-headline font-extrabold tracking-tighter mt-1">
            {formatCurrency(data.totalSpend)}
          </h2>
        </div>
        <div className="z-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">group</span>
          <span className="font-label text-xs font-semibold tracking-wide uppercase">
            {data.groupName}
          </span>
        </div>
        {/* Abstract Sun Decor */}
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* User Balance Card */}
      <div className="bg-white p-8 rounded-2xl flex flex-col justify-between h-48 border border-transparent shadow-sm">
        <div>
          <p className="font-label text-sm text-light-on-surface-variant font-medium">Your Balance</p>
          <h2 className={`text-4xl font-headline font-extrabold tracking-tighter mt-1 ${
            data.userBalance >= 0 ? 'text-teal-600' : 'text-red-600'
          }`}>
            {data.userBalance >= 0 ? `+${formatCurrency(data.userBalance)}` : `-${formatCurrency(Math.abs(data.userBalance))}`}
          </h2>
        </div>
        <div className={`flex items-center gap-2 ${
          data.userBalance >= 0 ? 'text-teal-600' : 'text-red-600'
        }`}>
          <span className="material-symbols-outlined text-[18px]">
            {data.userBalance >= 0 ? 'trending_up' : 'trending_down'}
          </span>
          <span className="font-label text-xs font-bold">
            {data.userBalance >= 0 ? "You're owed money" : "You owe money"}
          </span>
        </div>
      </div>
    </section>
  )
}

export default SummaryCards