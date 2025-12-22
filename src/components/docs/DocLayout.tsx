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
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background radial highlights to match the image gradient style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[100px] rounded-full" />
      </div>

      <DocHeader 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex relative z-10 w-full max-w-[1600px] mx-auto">
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar - Fixed on desktop */}
        <aside
          className={cn(
            "fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-[280px] overflow-y-auto shrink-0",
            "bg-transparent transition-transform duration-300 lg:translate-x-0 pt-6",
            "lg:border-r border-border/40",
            isMobileMenuOpen ? "translate-x-0 bg-background/95 lg:bg-transparent" : "-translate-x-full"
          )}
        >
          <DocSidebar onClose={() => setIsMobileMenuOpen(false)} />
        </aside>
        
        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 lg:px-12 py-8">
          <div className="max-w-[850px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
