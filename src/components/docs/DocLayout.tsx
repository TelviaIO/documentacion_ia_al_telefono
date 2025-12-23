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

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 bg-background/50 backdrop-blur-sm mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
              <a
                href="https://ia-al-telefono.com/aviso-legal/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Aviso Legal
              </a>
              <a
                href="https://ia-al-telefono.com/politica-de-privacidad/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Política de Privacidad
              </a>
              <a
                href="https://ia-al-telefono.com/politica-de-cookies/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Aviso de Cookies
              </a>
            </div>
            <div className="text-center md:text-right">
              © {new Date().getFullYear()} IA al Teléfono
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
