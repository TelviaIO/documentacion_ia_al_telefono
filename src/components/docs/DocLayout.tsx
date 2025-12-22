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
    <div className="min-h-screen bg-background">
      <DocHeader 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 border-r border-border bg-sidebar overflow-y-auto",
            "transition-transform duration-300 lg:translate-x-0",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <DocSidebar onClose={() => setIsMobileMenuOpen(false)} />
        </aside>
        
        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
