import { Expense, Member } from '../utils/api'

interface ExpenseTimelineProps {
  expenses: Expense[]
  _members: Member[]
  onDeleteExpense?: (expenseId: string) => void
}

// @ts-ignore: _members parameter reserved for future use
const ExpenseTimeline = ({ expenses, _members, onDeleteExpense }: ExpenseTimelineProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryIcon = (description: string): { icon: string; bgColor: string; textColor: string } => {
    const desc = description.toLowerCase()

    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('lunch') || desc.includes('dinner')) {
      return {
        icon: 'restaurant',
        bgColor: 'bg-tertiary/20',
        textColor: 'text-tertiary'
      }
    }

    if (desc.includes('hotel') || desc.includes('airbnb') || desc.includes('accommodation')) {
      return {
        icon: 'hotel',
        bgColor: 'bg-secondary/20',
        textColor: 'text-secondary'
      }
    }

    if (desc.includes('transport') || desc.includes('uber') || desc.includes('taxi') || desc.includes('flight')) {
      return {
        icon: 'directions_car',
        bgColor: 'bg-error/20',
        textColor: 'text-error'
      }
    }

    if (desc.includes('activity') || desc.includes('tour') || desc.includes('boat') || desc.includes('museum')) {
      return {
        icon: 'directions_boat',
        bgColor: 'bg-primary/20',
        textColor: 'text-primary'
      }
    }

    // Default category
    return {
      icon: 'payments',
      bgColor: 'bg-surface-container-high',
      textColor: 'text-on-surface'
    }
  }

  const getSharedByCount = (fractions: Record<string, number>) => {
    return Object.keys(fractions).length
  }

  if (expenses.length === 0) {
    return (
      <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="font-headline text-lg font-bold text-light-on-surface">Recent Expenses</h3>
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-light-on-surface-variant">receipt_long</span>
          </div>
          <p className="text-light-on-surface-variant mb-4">No expenses yet</p>
          <p className="text-sm text-light-on-surface-variant">Start logging your group expenses to see them here</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="font-headline text-lg font-bold text-light-on-surface">Recent Expenses</h3>

      <div className="space-y-4">
        {expenses.map((expense, index) => {
          const category = getCategoryIcon(expense.description)
          const isLast = index === expenses.length - 1

          return (
            <div key={expense.expenseId} className="flex gap-6 group">
              {/* Timeline Icon and Line */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full ${category.bgColor} flex items-center justify-center ${category.textColor}`}>
                  <span className="material-symbols-outlined">{category.icon}</span>
                </div>
                {!isLast && (
                  <div className="w-0.5 grow bg-gray-200 rounded-full group-last:hidden min-h-[2rem]"></div>
                )}
              </div>

              {/* Expense Card */}
              <div className="pb-8 grow">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:bg-gray-50 transition-colors group/card">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-headline font-bold text-light-on-surface">{expense.description}</h4>
                      <p className="text-xs font-medium text-light-on-surface-variant flex items-center gap-1">
                        Paid by <span className="text-primary font-bold">{expense.paidBy}</span> • {formatDate(expense.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <p className="font-headline font-extrabold text-lg text-light-on-surface">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-[10px] font-bold text-light-on-surface-variant uppercase tracking-widest">
                          Shared by {getSharedByCount(expense.fractions)}
                        </p>
                      </div>
                      {onDeleteExpense && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteExpense(expense.expenseId)
                          }}
                          className="opacity-0 group-hover/card:opacity-100 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete expense"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ExpenseTimeline