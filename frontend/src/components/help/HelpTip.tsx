import { ReactNode } from 'react';
import { Lightbulb, AlertTriangle, Info, Wrench } from 'lucide-react';

interface HelpTipProps {
  type: 'tip' | 'warning' | 'note' | 'troubleshooting';
  title?: string;
  children: ReactNode;
}

const tipStyles = {
  tip: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: Lightbulb,
    iconColor: 'text-green-600',
    defaultTitle: 'Tip',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    defaultTitle: 'Warning',
  },
  note: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
    defaultTitle: 'Note',
  },
  troubleshooting: {
    container: 'bg-orange-50 border-orange-200 text-orange-800',
    icon: Wrench,
    iconColor: 'text-orange-600',
    defaultTitle: 'Troubleshooting',
  },
};

export function HelpTip({ type, title, children }: HelpTipProps) {
  const style = tipStyles[type];
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border p-4 ${style.container}`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
        <div>
          <h5 className="font-medium mb-1">{title || style.defaultTitle}</h5>
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}
