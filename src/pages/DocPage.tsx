import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DocLayout } from '@/components/docs/DocLayout';
import { DocBreadcrumb } from '@/components/docs/DocBreadcrumb';
import { DocNavigation } from '@/components/docs/DocNavigation';
import { DocTableOfContents } from '@/components/docs/DocTableOfContents';
import { AdminButton } from '@/components/admin/AdminButton';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { usePage, useSections, usePages, useUpdatePage } from '@/hooks/useDocumentation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export default function DocPage() {
  const { sectionSlug, pageSlug } = useParams();
  const navigate = useNavigate();
  const { data: page, isLoading: pageLoading } = usePage(sectionSlug || '', pageSlug || '');
  const { data: sections } = useSections();
  const { data: allPages } = usePages();
  const { isAdmin } = useAuth();
  const updatePage = useUpdatePage();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const currentSection = sections?.find(s => s.slug === sectionSlug);

  useEffect(() => {
    if (page) {
      setEditTitle(page.title);
      setEditContent(page.content);
    }
  }, [page]);

  // Calculate prev/next navigation
  const getNavigation = () => {
    if (!sections || !allPages || !currentSection || !page) {
      return { prev: undefined, next: undefined };
    }

    // Flatten all pages with their section info
    const allPagesWithSections = sections.flatMap(section => {
      const sectionPages = allPages.filter(p => p.section_id === section.id);
      return sectionPages.map(p => ({
        ...p,
        sectionSlug: section.slug,
      }));
    });

    const currentIndex = allPagesWithSections.findIndex(
      p => p.section_id === page.section_id && p.slug === page.slug
    );

    const prevPage = currentIndex > 0 ? allPagesWithSections[currentIndex - 1] : undefined;
    const nextPage = currentIndex < allPagesWithSections.length - 1 
      ? allPagesWithSections[currentIndex + 1] 
      : undefined;

    return {
      prev: prevPage ? { title: prevPage.title, href: `/docs/${prevPage.sectionSlug}/${prevPage.slug}` } : undefined,
      next: nextPage ? { title: nextPage.title, href: `/docs/${nextPage.sectionSlug}/${nextPage.slug}` } : undefined,
    };
  };

  const { prev, next } = getNavigation();

  const handleSave = async () => {
    if (!page) return;
    
    try {
      await updatePage.mutateAsync({
        id: page.id,
        title: editTitle,
        content: editContent,
      });
      toast.success('Página guardada correctamente');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error al guardar la página');
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (page) {
      setEditTitle(page.title);
      setEditContent(page.content);
    }
    setIsEditing(false);
  };

  if (pageLoading) {
    return (
      <DocLayout>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-10 w-96 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </DocLayout>
    );
  }

  if (!page) {
    return (
      <DocLayout>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
          <p className="text-muted-foreground mb-4">
            La página que buscas no existe o ha sido eliminada.
          </p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
        <AdminButton />
      </DocLayout>
    );
  }

  const breadcrumbItems = [
    { label: currentSection?.title || 'Sección', href: '/' },
    { label: page.title },
  ];

  // Extract plain text for meta description
  const plainTextContent = page.content.replace(/<[^>]+>/g, '').slice(0, 155);

  return (
    <>
      <Helmet>
        <title>{page.title} - IA al Teléfono</title>
        <meta name="description" content={plainTextContent || `Documentación sobre ${page.title} en IA al Teléfono.`} />
        <link rel="canonical" href={`/docs/${sectionSlug}/${pageSlug}`} />
      </Helmet>

      <DocLayout>
        <div className="flex">
          <article className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-8">
            <DocBreadcrumb items={breadcrumbItems} />
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-2xl font-bold"
                    placeholder="Título de la página"
                  />
                </div>
                
                <RichTextEditor
                  content={editContent}
                  onChange={setEditContent}
                />
                
                <div className="flex items-center gap-2">
                  <Button onClick={handleSave} disabled={updatePage.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updatePage.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {page.title}
                  </h1>
                  
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="shrink-0"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
                
                <div 
                  className="prose-doc"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
                
                <DocNavigation prev={prev} next={next} />
              </>
            )}
          </article>
          
          {!isEditing && page.content && (
            <DocTableOfContents content={page.content} />
          )}
        </div>
        
        <AdminButton />
      </DocLayout>
    </>
  );
}
