import { Phone, Search, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 lg:px-8">
        <div className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Phone className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">IA al Teléfono</span>
          </Link>
        </div>

        <nav className="ml-8 hidden lg:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-foreground border-b-2 border-primary pb-[22px] -mb-[1px]"
          >
            Documentación
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {searchOpen ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-9 w-48 md:w-64"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
