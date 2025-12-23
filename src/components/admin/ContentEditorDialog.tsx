import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdatePageOrder, useUpdateSectionOrder } from '@/hooks/useDocumentation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    } | null;
}

export function ContentEditorDialog({ open, onOpenChange, item }: ContentEditorDialogProps) {
    const updatePageOrder = useUpdatePageOrder();
    const updateSectionOrder = useUpdateSectionOrder();
    const [order, setOrder] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Initialize state when item changes
    if (item && order === '') {
        // Only set if not already set (this simple check handles mounting roughly, but useEffect is better for controlled inputs)
    }

    // Actually let's use a key or effect
    useState(() => {
        if (item) setOrder(String(item.order));
    });

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
                // We only have a hook for bulk update, let's just use it for single item array
                // Or we can create specific single update hooks, but reuse is fine
                await updatePageOrder.mutateAsync([{ id: item.id, order: newOrder }]);
                toast.success('Orden de página actualizado');
            } else {
                await updateSectionOrder.mutateAsync([{ id: item.id, order: newOrder }]);
                toast.success('Orden de sección actualizado');
            }
            onOpenChange(false);
        } catch (error) {
            toast.error('Error al actualizar el orden');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
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
