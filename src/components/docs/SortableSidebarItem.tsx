import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableSidebarItemProps {
    id: string;
    children: React.ReactNode;
    isOverlay?: boolean;
}

export function SortableSidebarItem({ id, children, isOverlay }: SortableSidebarItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    if (isOverlay) {
        return <div className="opacity-80 bg-background border rounded-md shadow-lg">{children}</div>;
    }

    return (
        <div ref={setNodeRef} style={style} className="relative group/sortable">
            {/* Drag handle */}
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    "absolute right-1 top-1/2 -translate-y-1/2 p-1 cursor-grab rounded-sm z-20",
                    "text-muted-foreground/30 hover:text-foreground hover:bg-muted",
                    "opacity-0 group-hover/sortable:opacity-100 transition-opacity"
                )}
                onClick={(e) => e.stopPropagation()} // Prevent triggering accordion/link
            >
                <GripVertical className="h-3 w-3" />
            </div>
            {children}
        </div>
    );
}
