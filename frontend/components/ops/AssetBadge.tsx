import type { AssetClass } from '@/lib/types/gridpulse';

interface AssetBadgeProps {
  assetClass: AssetClass;
  className?: string;
}

export function AssetBadge({ assetClass, className = '' }: AssetBadgeProps) {
  const isLi = assetClass === 'LITHIUM_SWAP';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
        isLi ? 'bg-lithium/15 text-lithium border border-lithium/40' : 'bg-hydrogen/15 text-hydrogen border border-hydrogen/40'
      } ${className}`}
    >
      {isLi ? 'Li-Ion Swap' : 'H₂ Hub'}
    </span>
  );
}
