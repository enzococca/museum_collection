import { ReactNode, useState } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface HelpSectionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  roleLabel?: 'viewer' | 'editor' | 'admin';
  defaultExpanded?: boolean;
  children: ReactNode;
}

const roleBadgeStyles = {
  viewer: 'bg-green-100 text-green-700',
  editor: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
};

const roleBadgeLabels = {
  viewer: 'All Users',
  editor: 'Editor+',
  admin: 'Admin Only',
};

export function HelpSection({
  id,
  title,
  icon: Icon,
  roleLabel,
  defaultExpanded = false,
  children
}: HelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      id={id}
      className="bg-white rounded-xl shadow-museum border border-museum-100 overflow-hidden scroll-mt-24"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-museum-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Icon className="w-5 h-5 text-primary-600" />
          </div>
          <span className="font-semibold text-bronze-900 text-lg">{title}</span>
          {roleLabel && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeStyles[roleLabel]}`}>
              {roleBadgeLabels[roleLabel]}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-bronze-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`transition-all duration-200 ease-in-out ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-6 pb-6 border-t border-museum-100 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
