import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSections, usePages, useCreatePage } from '@/hooks/useDocumentation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPageForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: sections } = useSections();
  const { data: pages } = usePages();
  const createPage = useCreatePage();

  const [sectionId, setSectionId] = useState(searchParams.get('section') || '');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('<p>Escribe aquí el contenido...</p>');
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (sectionId && pages) {
      const sectionPages = pages.filter(p => p.section_id === sectionId);
      setOrder(sectionPages.length);
    }
  }, [sectionId, pages]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sectionId) {
      toast.error('Selecciona una sección');
      return;
    }

    try {
      await createPage.mutateAsync({
        section_id: sectionId,
        title,
        slug,
        content,
        order,
      });
      
      const section = sections?.find(s => s.id === sectionId);
      toast.success('Página creada');
      
      if (section) {
        navigate(`/docs/${section.slug}/${slug}`);
      } else {
        navigate('/admin');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la página');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Nueva página</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Crear página</CardTitle>
            <CardDescription>
              Crea una nueva página de documentación. Podrás editarla después.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="section">Sección</Label>
                  <Select value={sectionId} onValueChange={setSectionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections?.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Introducción"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="introduccion"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Se usará en la URL: /docs/seccion/{slug || 'slug'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Contenido</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createPage.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {createPage.isPending ? 'Creando...' : 'Crear página'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
