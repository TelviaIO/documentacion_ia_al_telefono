import { Search, Menu, X, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { SearchDialog } from './SearchDialog';
import { useAuth } from '@/hooks/useAuth';
import { useNavItems } from '@/hooks/useDocumentation';
import { NavEditorDialog } from '@/components/admin/NavEditorDialog';

interface DocHeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function DocHeader({ onMenuToggle, isMenuOpen }: DocHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [navEditorOpen, setNavEditorOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { data: navItems } = useNavItems();

  const renderNavItem = (item: any) => {
    if (item.type === 'button') {
      return (
        <Button
          key={item.id}
          asChild
          className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm hover:shadow-primary/20 transition-all"
        >
          <a href={item.url} target={item.url.startsWith('http') ? '_blank' : undefined} rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}>
            {item.label}
            <span className="ml-1 opacity-70">›</span>
          </a>
        </Button>
      );
    }

    const Component = item.url.startsWith('http') ? 'a' : Link;
    const props = item.url.startsWith('http')
      ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' }
      : { to: item.url };

    return (
      <Component
        key={item.id}
        {...props}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {item.label}
      </Component>
    );
  };

  // Filter items
  const links = navItems?.filter(i => i.type === 'link') || [];
  const buttons = navItems?.filter(i => i.type === 'button') || [];

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center px-4 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-accent/60"
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/" className="flex items-center group select-none">
            <span className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#00D2FF] drop-shadow-sm group-hover:opacity-80 transition-opacity">
              IA al Teléfono
            </span>
          </Link>
        </div>

        {/* Centered Search Bar */}
        <div className="flex-1 max-w-xl mx-auto px-4 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar en la documentación..."
              className="pl-9 w-full bg-muted/40 border-border/50 focus:bg-background h-10 rounded-full transition-all focus:ring-primary/20"
              onClick={() => setSearchOpen(true)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 pointer-events-none">
              <kbd className="h-5 select-none items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘
              </kbd>
              <kbd className="h-5 select-none items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                K
              </kbd>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4 lg:gap-6">
          <nav className="hidden lg:flex items-center gap-6">
            {/* Fallback items if loading or empty, though hook handles default */}
            {!navItems && (
              <>
                <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Homepage</Link>
                <Link to="/support" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Support</Link>
                <Link to="/compliance" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Compliance</Link>
              </>
            )}

            {links.map(renderNavItem)}
          </nav>

          {buttons.map(renderNavItem)}

          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="hidden lg:flex gap-2 border-dashed text-muted-foreground"
              onClick={() => setNavEditorOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar Menú
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <NavEditorDialog open={navEditorOpen} onOpenChange={setNavEditorOpen} />
    </header>
  );
}
