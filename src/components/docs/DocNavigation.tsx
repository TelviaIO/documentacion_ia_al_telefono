import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
}

interface DocNavigationProps {
  prev?: NavItem;
  next?: NavItem;
}

export function DocNavigation({ prev, next }: DocNavigationProps) {
  return (
    <nav className="flex items-center justify-between mt-12 pt-8 border-t border-border" aria-label="Paginación">
      <div>
        {prev && (
          <Link to={prev.href}>
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              <div className="text-left">
                <span className="text-xs text-muted-foreground block">Anterior</span>
                <span className="font-medium">{prev.title}</span>
              </div>
            </Button>
          </Link>
        )}
      </div>
      
      <div>
        {next && (
          <Link to={next.href}>
            <Button variant="ghost" className="gap-2">
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Siguiente</span>
                <span className="font-medium">{next.title}</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
