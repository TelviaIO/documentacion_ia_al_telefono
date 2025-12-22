import { useState, ReactNode } from 'react';
import { DocHeader } from './DocHeader';
import { DocSidebar } from './DocSidebar';
import { cn } from '@/lib/utils';

interface DocLayoutProps {
  children: ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <DocHeader 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 overflow-y-auto",
            "bg-card/80 backdrop-blur-xl border-r border-border/50",
            "transition-transform duration-300 lg:translate-x-0",
            "shadow-lg lg:shadow-none",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <DocSidebar onClose={() => setIsMobileMenuOpen(false)} />
        </aside>
        
        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="bg-card/60 backdrop-blur-sm min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
