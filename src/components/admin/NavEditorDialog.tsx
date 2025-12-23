import { useState, useEffect } from 'react';
import { useNavItems, useUpdateNavItem, DocNavItem } from '@/hooks/useDocumentation';
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

interface NavEditorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NavEditorDialog({ open, onOpenChange }: NavEditorDialogProps) {
    const { data: navItems, isLoading } = useNavItems();
    const updateNavItem = useUpdateNavItem();
    const [items, setItems] = useState<DocNavItem[]>([]);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        if (navItems) {
            setItems(navItems);
        }
    }, [navItems]);

    const handleUpdate = async (id: string, field: keyof DocNavItem, value: string) => {
        const updatedItems = items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setItems(updatedItems);
    };

    const handleSave = async (item: DocNavItem) => {
        setSavingId(item.id);
        try {
            await updateNavItem.mutateAsync({
                id: item.id,
                label: item.label,
                url: item.url,
            });
            toast.success(`Enlace "${item.label}" actualizado`);
        } catch (error) {
            toast.error('Error al guardar cambio');
            console.error(error);
        } finally {
            setSavingId(null);
        }
    };

    if (isLoading) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Menú de Navegación</DialogTitle>
                    <DialogDescription>
                        Personaliza el texto y destino de los enlaces del encabezado.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {items.map((item) => (
                        <div key={item.id} className="grid gap-4 p-4 border rounded-lg bg-muted/20">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                                    {item.type === 'button' ? 'Botón (CTA)' : 'Enlace'} #{item.order}
                                </h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`label-${item.id}`}>Texto (Anchor)</Label>
                                    <Input
                                        id={`label-${item.id}`}
                                        value={item.label}
                                        onChange={(e) => handleUpdate(item.id, 'label', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`url-${item.id}`}>Destino (URL)</Label>
                                    <Input
                                        id={`url-${item.id}`}
                                        value={item.url}
                                        onChange={(e) => handleUpdate(item.id, 'url', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={() => handleSave(item)}
                                    disabled={savingId === item.id}
                                >
                                    {savingId === item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
