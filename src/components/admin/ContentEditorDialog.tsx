import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdatePageDetails, useUpdateSectionOrder } from '@/hooks/useDocumentation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ContentEditorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Item can be a section or a page
    item: {
        id: string;
        title: string;
        slug: string;
        order: number;
        type: 'section' | 'page';
        meta_title?: string;
        meta_description?: string;
    } | null;
}

export function ContentEditorDialog({ open, onOpenChange, item }: ContentEditorDialogProps) {
    const updatePageDetails = useUpdatePageDetails();
    const updateSectionOrder = useUpdateSectionOrder();
    const [order, setOrder] = useState<string>('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setOrder(String(item.order));
            setMetaTitle(item.meta_title || '');
            setMetaDescription(item.meta_description || '');
        }
    }, [item]);

    const handleSave = async () => {
        if (!item) return;

        const newOrder = parseInt(order);
        if (isNaN(newOrder)) {
            toast.error('El orden debe ser un número válido');
            return;
        }

        setLoading(true);
        try {
            if (item.type === 'page') {
                await updatePageDetails.mutateAsync({
                    id: item.id,
                    order: newOrder,
                    meta_title: metaTitle,
                    meta_description: metaDescription
                });
                toast.success('Detalles de página actualizados');
            } else {
                await updateSectionOrder.mutateAsync([{ id: item.id, order: newOrder }]);
                toast.success('Orden de sección actualizado');
            }
            onOpenChange(false);
        } catch (error) {
            toast.error('Error al actualizar');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar {item.type === 'section' ? 'Sección' : 'Página'}</DialogTitle>
                    <DialogDescription>
                        Ajusta el orden y los detalles de "{item.title}"
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <div className="col-span-3 text-sm text-muted-foreground p-2 bg-muted rounded-md">{item.title}</div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="order" className="text-right">Orden</Label>
                        <Input
                            id="order"
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            className="col-span-3"
                            type="number"
                        />
                    </div>

                    {item.type === 'page' && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="meta_title" className="text-right">Meta Title</Label>
                                <Input
                                    id="meta_title"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Título para SEO (opcional)"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="meta_description" className="text-right mt-2">Meta Desc.</Label>
                                <Textarea
                                    id="meta_description"
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Descripción para SEO (opcional)"
                                    rows={3}
                                />
                            </div>
                        </>
                    )}

                    <p className="text-xs text-muted-foreground ml-[25%] col-span-3">
                        Número más bajo aparece primero.
                    </p>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
