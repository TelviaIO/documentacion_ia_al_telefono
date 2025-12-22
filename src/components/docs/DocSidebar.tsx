import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus, Settings, FileText, Folder, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSections, usePages, DocSection, DocPage } from '@/hooks/useDocumentation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocSidebarProps {
  onClose?: () => void;
}

export function DocSidebar({ onClose }: DocSidebarProps) {
  const { sectionSlug, pageSlug } = useParams();
  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: pages, isLoading: pagesLoading } = usePages();
  const { isAdmin } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Auto-expand section containing current page
  useEffect(() => {
    if (sections && sectionSlug) {
      const currentSection = sections.find(s => s.slug === sectionSlug);
      if (currentSection) {
        setExpandedSections(prev => new Set([...prev, currentSection.id]));
      }
    }
  }, [sections, sectionSlug]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionPages = (sectionId: string) => {
    return pages?.filter(p => p.section_id === sectionId).sort((a, b) => a.order - b.order) || [];
  };

  const isCurrentPage = (section: DocSection, page: DocPage) => {
    return sectionSlug === section.slug && pageSlug === page.slug;
  };

  if (sectionsLoading || pagesLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 ml-4" />
            <Skeleton className="h-4 w-40 ml-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="p-6 text-center">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-sm mb-4">
          No hay secciones de documentación
        </p>
        {isAdmin && (
          <Link to="/admin/sections/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Crear sección
            </Button>
          </Link>
        )}
      </div>
    );
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {/* Logo/Title */}
        <div className="mb-6 px-3">
          <Link to="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">IA al Teléfono</span>
          </Link>
        </div>

        <nav className="space-y-1" role="navigation" aria-label="Documentación">
          {sortedSections.map((section) => {
            const sectionPages = getSectionPages(section.id);
            const isExpanded = expandedSections.has(section.id);
            const hasCurrentPage = sectionPages.some(p => isCurrentPage(section, p));
            
            return (
              <div key={section.id} className="space-y-0.5">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                    "hover:bg-accent/60 transition-all duration-200",
                    "text-left group",
                    hasCurrentPage && "text-primary"
                  )}
                  aria-expanded={isExpanded}
                >
                  <span className={cn(
                    "transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </span>
                  <Folder className={cn(
                    "h-4 w-4 flex-shrink-0",
                    hasCurrentPage ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="truncate">{section.title}</span>
                </button>
                
                {isExpanded && (
                  <div className="ml-3 space-y-0.5 border-l-2 border-border/50 pl-3 py-1">
                    {sectionPages.length === 0 ? (
                      <p className="py-2 px-3 text-sm text-muted-foreground/70 italic">Sin páginas</p>
                    ) : (
                      sectionPages.map((page) => (
                        <Link
                          key={page.id}
                          to={`/docs/${section.slug}/${page.slug}`}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                            isCurrentPage(section, page)
                              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[2px] pl-[10px]"
                              : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                          )}
                        >
                          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{page.title}</span>
                        </Link>
                      ))
                    )}
                    
                    {isAdmin && (
                      <Link
                        to={`/admin/pages/new?section=${section.id}`}
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-primary/70 hover:text-primary transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Añadir página</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        
        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-border/50 space-y-1">
            <Link
              to="/admin/sections/new"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva sección</span>
            </Link>
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Panel de admin</span>
            </Link>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
