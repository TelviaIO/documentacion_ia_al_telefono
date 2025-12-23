import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSections, usePages } from '@/hooks/useDocumentation';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { data: sections, isLoading: sectionsLoading, error: sectionsError } = useSections();
  const { data: pages, isLoading: pagesLoading, error: pagesError } = usePages();

  useEffect(() => {
    if (!sectionsLoading && !pagesLoading && sections && pages && sections.length > 0) {
      // Find the first section and its first page
      const sortedSections = [...sections].sort((a, b) => a.order - b.order);
      const firstSection = sortedSections[0];
      const sectionPages = pages
        .filter(p => p.section_id === firstSection.id)
        .sort((a, b) => a.order - b.order);

      if (sectionPages.length > 0) {
        navigate(`/docs/${firstSection.slug}/${sectionPages[0].slug}`, { replace: true });
      } else {
        // If first section has no pages, we might still want to go there or try next section
        navigate(`/docs/${firstSection.slug}/none`, { replace: true });
      }
    }
  }, [sections, pages, sectionsLoading, pagesLoading, navigate]);

  if (sectionsError || pagesError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2 text-destructive">Error de conexión</h1>
          <p className="text-muted-foreground mb-4">No se pudo conectar con la base de datos de Supabase.</p>
          <p className="text-xs font-mono bg-muted p-2 rounded max-w-md mx-auto">
            Asegúrate de haber configurado las variables VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en Vercel.
          </p>
        </div>
      </div>
    );
  }

  if (!sectionsLoading && !pagesLoading && (!sections || sections.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md border border-border/50 rounded-2xl p-8 bg-card shadow-sm">
          <h1 className="text-2xl font-bold mb-4">¡Bienvenido a tu Documentación!</h1>
          <p className="text-muted-foreground mb-8">
            Parece que aún no has creado ninguna sección. Accede al panel de administración para empezar a configurar tu contenido.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-all"
            >
              Ir al Panel de Administración
            </button>
            <p className="text-xs text-muted-foreground">
              Deberás iniciar sesión para poder crear contenido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Cargando documentación...</p>
      </div>
    </div>
  );
};

export default Index;
