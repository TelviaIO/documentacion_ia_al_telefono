import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSections, usePages, useDeleteSection, useDeletePage } from '@/hooks/useDocumentation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Pencil, Trash2, FileText, Folder } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: pages, isLoading: pagesLoading } = usePages();
  const deleteSection = useDeleteSection();
  const deletePage = useDeletePage();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleDeleteSection = async (id: string) => {
    try {
      await deleteSection.mutateAsync(id);
      toast.success('Sección eliminada');
    } catch (error) {
      toast.error('Error al eliminar la sección');
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      await deletePage.mutateAsync(id);
      toast.success('Página eliminada');
    } catch (error) {
      toast.error('Error al eliminar la página');
    }
  };

  if (loading) {
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
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Panel de Administración</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Sections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Secciones
              </CardTitle>
              <CardDescription>
                Gestiona las secciones de la documentación
              </CardDescription>
            </div>
            <Link to="/admin/sections/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva sección
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {sectionsLoading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : sections && sections.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">{section.title}</TableCell>
                      <TableCell className="text-muted-foreground">{section.slug}</TableCell>
                      <TableCell>{section.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/sections/${section.id}`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar sección?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminarán también todas las páginas de esta sección. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSection(section.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No hay secciones. Crea una para empezar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Páginas
              </CardTitle>
              <CardDescription>
                Gestiona las páginas de documentación
              </CardDescription>
            </div>
            <Link to="/admin/pages/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva página
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pagesLoading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : pages && pages.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Sección</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => {
                    const section = sections?.find(s => s.id === page.section_id);
                    return (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {section?.title || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{page.slug}</TableCell>
                        <TableCell>{page.order}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {section && (
                              <Link to={`/docs/${section.slug}/${page.slug}`}>
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar página?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePage(page.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No hay páginas. Crea una sección primero.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
