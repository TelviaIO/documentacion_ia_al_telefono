import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, Plus, Settings, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSections, usePages, DocSection, DocPage, useUpdateSectionOrder, useUpdatePageOrder } from '@/hooks/useDocumentation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableSidebarItem } from './SortableSidebarItem';
import { toast } from 'sonner';

interface DocSidebarProps {
  onClose?: () => void;
}

export function DocSidebar({ onClose }: DocSidebarProps) {
  const { sectionSlug, pageSlug } = useParams();
  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: pages, isLoading: pagesLoading } = usePages();
  const { isAdmin } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const updateSectionOrder = useUpdateSectionOrder();
  const updatePageOrder = useUpdatePageOrder();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-expand section containing current page
  useEffect(() => {
    if (sections && sectionSlug) {
      const currentSection = sections.find(s => s.slug === sectionSlug);
      if (currentSection) {
        setExpandedSections(prev => new Set([...prev, currentSection.id]));
        if (currentSection.parent_id) {
          setExpandedSections(prev => new Set([...prev, currentSection.parent_id!]));
        }
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // Handle Section Reordering
    if (activeId.startsWith('section-') && overId.startsWith('section-')) {
      const isRoot = !sections?.find(s => `section-${s.id}` === activeId)?.parent_id;

      // Get all relevant siblings (either all roots, or all children of same parent)
      const currentSection = sections?.find(s => `section-${s.id}` === activeId);
      const parentId = currentSection?.parent_id;

      const relevantSections = sections
        ?.filter(s => s.parent_id === parentId)
        .sort((a, b) => a.order - b.order) || [];

      const oldIndex = relevantSections.findIndex(s => `section-${s.id}` === activeId);
      const newIndex = relevantSections.findIndex(s => `section-${s.id}` === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Create new array with moved item
        const newOrder = [...relevantSections];
        const [movedItem] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, movedItem);

        // Prepare updates
        const updates = newOrder.map((section, index) => ({
          id: section.id,
          order: index + 1
        }));

        try {
          await updateSectionOrder.mutateAsync(updates);
          toast.success('Orden de secciones actualizado');
        } catch (error) {
          toast.error('Error al reordenar secciones');
        }
      }
    }
    // Handle Page Reordering
    else if (activeId.startsWith('page-') && overId.startsWith('page-')) {
      const currentPage = pages?.find(p => `page-${p.id}` === activeId);
      const sectionId = currentPage?.section_id;

      const relevantPages = pages
        ?.filter(p => p.section_id === sectionId)
        .sort((a, b) => a.order - b.order) || [];

      const oldIndex = relevantPages.findIndex(p => `page-${p.id}` === activeId);
      const newIndex = relevantPages.findIndex(p => `page-${p.id}` === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...relevantPages];
        const [movedItem] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, movedItem);

        const updates = newOrder.map((page, index) => ({
          id: page.id,
          order: index + 1
        }));

        try {
          await updatePageOrder.mutateAsync(updates);
          toast.success('Orden de páginas actualizado');
        } catch (error) {
          toast.error('Error al reordenar páginas');
        }
      }
    }
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

  const renderSection = (section: DocSection, depth: number = 0) => {
    const sectionPages = getSectionPages(section.id);
    const childSections = sortedSections.filter(s => s.parent_id === section.id);
    const isExpanded = expandedSections.has(section.id);
    const hasCurrentPage = sectionPages.some(p => isCurrentPage(section, p));
    const hasActiveChild = childSections.some(child => expandedSections.has(child.id));
    const isActive = isExpanded || hasCurrentPage || hasActiveChild;

    const SectionHeader = (
      <button
        onClick={() => toggleSection(section.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold tracking-tight uppercase transition-colors relative",
          "text-muted-foreground/70 hover:text-foreground",
          "text-left group",
          (isExpanded || hasCurrentPage) && "text-foreground"
        )}
        aria-expanded={isExpanded}
      >
        <span className="truncate">{section.title}</span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 ml-auto transition-transform duration-200 opacity-50 group-hover:opacity-100",
          !isActive && "-rotate-90"
        )} />
      </button>
    );

    return (
      <div key={section.id} className="space-y-1" style={{ marginLeft: depth > 0 ? '8px' : '0' }}>
        {isAdmin ? (
          <SortableSidebarItem id={`section-${section.id}`}>
            {SectionHeader}
          </SortableSidebarItem>
        ) : SectionHeader}

        {isActive && (
          <div className="space-y-0.5 mt-1 border-l border-border/40 ml-3 pl-3">
            {/* Pages - Orderable List */}
            {sectionPages.length > 0 && (
              <SortableContext
                id={`ctx-pages-${section.id}`}
                items={sectionPages.map(p => `page-${p.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0.5 mb-1">
                  {sectionPages.map((page) => {
                    const PageLink = (
                      <Link
                        to={`/docs/${section.slug}/${page.slug}`}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all duration-200 outline-none relative",
                          isCurrentPage(section, page)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground/80 hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        <span className="truncate">{page.title}</span>
                      </Link>
                    );

                    return (
                      <div key={page.id}>
                        {isAdmin ? (
                          <SortableSidebarItem id={`page-${page.id}`}>
                            {PageLink}
                          </SortableSidebarItem>
                        ) : PageLink}
                      </div>
                    );
                  })}
                </div>
              </SortableContext>
            )}

            {/* Child Sections - Orderable List */}
            {childSections.length > 0 && (
              <SortableContext
                id={`ctx-subsections-${section.id}`}
                items={childSections.map(s => `section-${s.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {childSections.map(child => renderSection(child, depth + 1))}
                </div>
              </SortableContext>
            )}

            {/* No content fallback */}
            {sectionPages.length === 0 && childSections.length === 0 && (
              <p className="py-1 px-3 text-xs text-muted-foreground/50 italic">Sin contenido</p>
            )}

            {isAdmin && (
              <div className="pt-1">
                <Link
                  to={`/admin/pages/new?section=${section.id}`}
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-1 text-[12px] text-primary/60 hover:text-primary transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>Página</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const rootSections = sortedSections.filter(s => !s.parent_id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="h-full">
        <div className="py-2 px-2 lg:px-4">
          <nav className="space-y-1" role="navigation" aria-label="Documentación">
            <SortableContext
              id="ctx-root"
              items={rootSections.map(s => `section-${s.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {rootSections.map(s => renderSection(s))}
            </SortableContext>
          </nav>

          {isAdmin && (
            <div className="pt-8 mt-8 border-t border-border/40 space-y-1">
              <Link
                to="/admin/sections/new"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Nueva sección</span>
              </Link>
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground/70 hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Panel de admin</span>
              </Link>
            </div>
          )}
        </div>
      </ScrollArea>
    </DndContext>
  );
}
