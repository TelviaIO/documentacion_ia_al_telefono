import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus, Settings, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSections, usePages, DocSection, DocPage } from '@/hooks/useDocumentation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DocSidebarProps {
  onClose?: () => void;
}

export function DocSidebar({ onClose }: DocSidebarProps) {
  const { sectionSlug, pageSlug } = useParams();
  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: pages, isLoading: pagesLoading } = usePages();
  const { isAdmin } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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
    return pages?.filter(p => p.section_id === sectionId) || [];
  };

  const isCurrentPage = (section: DocSection, page: DocPage) => {
    return sectionSlug === section.slug && pageSlug === page.slug;
  };

  if (sectionsLoading || pagesLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
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
      <div className="p-4 text-center">
        <p className="text-muted-foreground text-sm mb-4">
          No hay secciones de documentación
        </p>
        {isAdmin && (
          <Link to="/admin/sections/new">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Crear sección
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <nav className="space-y-1 p-4" role="navigation" aria-label="Documentación">
      {sections.map((section) => {
        const sectionPages = getSectionPages(section.id);
        const isExpanded = expandedSections.has(section.id) || 
          sectionPages.some(p => sectionSlug === section.slug && pageSlug === p.slug);
        
        return (
          <div key={section.id} className="space-y-1">
            <button
              onClick={() => toggleSection(section.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                "hover:bg-accent hover:text-accent-foreground transition-colors",
                "text-left"
              )}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
              <Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{section.title}</span>
            </button>
            
            {isExpanded && (
              <div className="ml-4 space-y-1 border-l border-border pl-4">
                {sectionPages.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">Sin páginas</p>
                ) : (
                  sectionPages.map((page) => (
                    <Link
                      key={page.id}
                      to={`/docs/${section.slug}/${page.slug}`}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        isCurrentPage(section, page)
                          ? "bg-doc-nav-active text-accent-foreground border-l-2 border-doc-nav-active-border -ml-[17px] pl-[15px]"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{page.title}</span>
                    </Link>
                  ))
                )}
                
                {isAdmin && (
                  <Link
                    to={`/admin/pages/new?section=${section.id}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir página
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {isAdmin && (
        <div className="pt-4 border-t border-border mt-4">
          <Link
            to="/admin/sections/new"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            Añadir sección
          </Link>
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Administrar
          </Link>
        </div>
      )}
    </nav>
  );
}
