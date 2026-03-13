import { FileQuestion, Search, Inbox, FolderOpen } from 'lucide-react';

const EmptyState = ({ 
  type = 'default', 
  title = 'No data found', 
  description = 'There are no items to display.',
  action,
  className = ''
}) => {
  const icons = {
    default: FileQuestion,
    search: Search,
    inbox: Inbox,
    folder: FolderOpen,
  };

  const Icon = icons[type] || icons.default;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
      <p className="text-neutral-500 text-center max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

