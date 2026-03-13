import { Loader2 } from 'lucide-react';

const Loading = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const container = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500`} />
      {text && <p className="text-sm text-neutral-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        {container}
      </div>
    );
  }

  return container;
};

// Skeleton components for loading states
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-neutral-200 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="border-b border-neutral-100">
    {[...Array(columns)].map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const FormSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-24 mt-6" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-24 mt-6" />
    <Skeleton className="h-24 w-full" />
  </div>
);

export default Loading;

