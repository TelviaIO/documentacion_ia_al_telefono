import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSections, usePages } from '@/hooks/useDocumentation';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: pages, isLoading: pagesLoading } = usePages();

  useEffect(() => {
    if (!sectionsLoading && !pagesLoading && sections && pages) {
      // Find the first section and its first page
      const sortedSections = [...sections].sort((a, b) => a.order - b.order);
      if (sortedSections.length > 0) {
        const firstSection = sortedSections[0];
        const sectionPages = pages
          .filter(p => p.section_id === firstSection.id)
          .sort((a, b) => a.order - b.order);
        
        if (sectionPages.length > 0) {
          navigate(`/docs/${firstSection.slug}/${sectionPages[0].slug}`, { replace: true });
        } else {
          navigate(`/docs/${firstSection.slug}`, { replace: true });
        }
      }
    }
  }, [sections, pages, sectionsLoading, pagesLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando documentación...</p>
      </div>
    </div>
  );
};

export default Index;
