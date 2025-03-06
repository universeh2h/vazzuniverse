import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavItems } from '@/types/schema/navbar';

interface NavItemProps {
  item: NavItems;
  openItems: Record<string, boolean>;
  toggleItem: (name: string) => void;
  isActive: (path?: string) => boolean;
  isChildActive: (children?: NavItems[]) => boolean;
}

export const NavItem = ({
  item,
  openItems,
  toggleItem,
  isActive: isActiveProp,
  isChildActive: isChildActiveProp,
}: NavItemProps) => {
  const active = isActiveProp(item.path);
  const hasChildren = item.children && item.children?.length > 0;
  const isOpen = openItems[item.nama] || isChildActiveProp(item.children);

  if (hasChildren) {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => toggleItem(item.nama)}
          className={cn(
            'flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isChildActiveProp(item.children)
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted'
          )}
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.nama}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isOpen && (
          <div className="pl-8 mt-1 space-y-1">
            {item.children?.map((child) => (
              <Link
                key={child.nama}
                href={child.path || '#'}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm transition-colors',
                  isActiveProp(child.path)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {child.nama}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.path || '#'}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
      )}
      aria-current={active ? 'page' : undefined}
    >
      {item.icon}
      <span>{item.nama}</span>
    </Link>
  );
};
