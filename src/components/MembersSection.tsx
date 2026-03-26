import { Member } from '../utils/api'

interface MembersSectionProps {
  members: Member[]
  currentUser?: string
  onAddMember?: () => void
}

const MembersSection = ({ members, currentUser = 'Me', onAddMember }: MembersSectionProps) => {
  // Generate a random avatar for each member
  const getAvatarUrl = (memberName: string) => {
    const seed = memberName.toLowerCase().replace(/\s+/g, '')
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=ffbf00,8dedec,83fff6`
  }

  return (
    <section className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-lg font-bold text-light-on-surface">Fellow Explorers</h3>
        <button
          onClick={onAddMember}
          className="text-primary font-bold text-sm hover:text-primary/80 transition-colors"
        >
          Add New
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {/* Current User Pill */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-sm border border-transparent shrink-0">
          <img
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
            src={getAvatarUrl(currentUser)}
          />
          <span className="text-sm font-semibold text-light-on-surface">{currentUser}</span>
        </div>

        {/* Other Members */}
        {members.map((member) => (
          <div
            key={member.memberName}
            className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-full shadow-sm shrink-0 border border-transparent hover:bg-gray-50 transition-colors"
          >
            <img
              alt={member.memberName}
              className="w-8 h-8 rounded-full object-cover"
              src={getAvatarUrl(member.memberName)}
            />
            <span className="text-sm font-medium text-light-on-surface-variant">
              {member.memberName}
            </span>
          </div>
        ))}

        {/* Add Member Button */}
        {members.length === 0 && (
          <button
            onClick={onAddMember}
            className="flex items-center gap-3 bg-surface-container px-4 py-2.5 rounded-full shadow-sm border border-dashed border-primary/30 hover:border-primary/50 transition-colors shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">add</span>
            </div>
            <span className="text-sm font-medium text-primary">Add members</span>
          </button>
        )}
      </div>
    </section>
  )
}

export default MembersSection