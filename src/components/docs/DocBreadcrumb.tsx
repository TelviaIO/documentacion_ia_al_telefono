import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DocBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function DocBreadcrumb({ items }: DocBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-8">
      <BreadcrumbList className="gap-1.5 sm:gap-2.5">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="text-muted-foreground/60 hover:text-primary transition-colors">
              <span className="text-[13px] font-medium tracking-tight">Docs</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            <BreadcrumbSeparator className="opacity-40">
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            {item.href ? (
              <BreadcrumbLink asChild>
                <Link to={item.href} className="text-muted-foreground/60 hover:text-primary transition-colors text-[13px] font-medium tracking-tight">
                  {item.label}
                </Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="text-muted-foreground/40 text-[13px] font-medium tracking-tight">
                {item.label}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
