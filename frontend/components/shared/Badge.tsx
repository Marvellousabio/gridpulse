interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: string;
}

export function Badge({ variant, children }: BadgeProps) {
  const styles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
