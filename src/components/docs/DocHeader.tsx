import { Search, Menu, X, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface DocHeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function DocHeader({ onMenuToggle, isMenuOpen }: DocHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/80 backdrop-blur-xl">
      <div className="flex h-16 items-center px-4 lg:px-8">
        <div className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-accent/60"
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-lg text-foreground">IA al Teléfono</span>
              <span className="text-xs text-muted-foreground block -mt-0.5">Documentación</span>
            </div>
          </Link>
        </div>

        <nav className="ml-8 hidden lg:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-primary relative after:absolute after:bottom-[-21px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
          >
            Docs
          </Link>
          <a 
            href="https://iaaltelefono.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Ir al Panel
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {searchOpen ? (
            <div className="relative animate-in slide-in-from-right-2 duration-200">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar en la documentación..."
                className="pl-9 w-48 md:w-72 bg-background/50 border-border/50 focus:bg-background"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/60"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline text-sm">Buscar</span>
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
