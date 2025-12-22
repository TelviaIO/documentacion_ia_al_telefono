import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSections, useCreateSection, useUpdateSection } from '@/hooks/useDocumentation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSectionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: sections } = useSections();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [order, setOrder] = useState(0);
  const [parentId, setParentId] = useState<string | null>(null);

  const isEditing = !!id;
  const currentSection = sections?.find(s => s.id === id);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (currentSection) {
      setTitle(currentSection.title);
      setSlug(currentSection.slug);
      setIcon(currentSection.icon || '');
      setOrder(currentSection.order);
      setParentId(currentSection.parent_id);
    } else if (sections) {
      setOrder(sections.length);
      setParentId(null);
    }
  }, [currentSection, sections]);

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
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalParentId = parentId === 'none' ? null : parentId;

    try {
      if (isEditing && id) {
        await updateSection.mutateAsync({
          id,
          title,
          slug,
          icon: icon || undefined,
          parent_id: finalParentId
        });
        toast.success('Sección actualizada');
      } else {
        await createSection.mutateAsync({
          title,
          slug,
          icon: icon || undefined,
          order,
          parent_id: finalParentId
        });
        toast.success('Sección creada');
      }
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la sección');
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

  // Filter sections to avoid self-reference or circular dependnecy (basic 1-level check)
  const parentOptions = sections?.filter(s => s.id !== id) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">
            {isEditing ? 'Editar sección' : 'Nueva sección'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar sección' : 'Crear sección'}</CardTitle>
            <CardDescription>
              Las secciones agrupan páginas relacionadas en el menú de navegación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Modelo de Uso"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="modelo-de-uso"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Se usará en la URL: /docs/{slug || 'slug'}/...
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Sección Padre (Opcional)</Label>
                <Select
                  value={parentId || "none"}
                  onValueChange={(value) => setParentId(value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sección padre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna (Sección principal)</SelectItem>
                    {parentOptions.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Si seleccionas una padre, esta sección se convertirá en una subsección.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icono (opcional)</Label>
                <Input
                  id="icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="book"
                />
                <p className="text-xs text-muted-foreground">
                  Nombre del icono de Lucide (book, users, settings, etc.)
                </p>
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

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createSection.isPending || updateSection.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {createSection.isPending || updateSection.isPending ? 'Guardando...' : 'Guardar'}
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
