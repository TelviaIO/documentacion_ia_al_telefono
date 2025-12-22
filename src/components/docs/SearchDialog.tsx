import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "cmdk"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { usePages, useSections } from "@/hooks/useDocumentation"
import { Search, FileText, Hash } from "lucide-react"

interface SearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const navigate = useNavigate()
    const { data: pages } = usePages()
    const { data: sections } = useSections()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                onOpenChange((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [onOpenChange])

    const runCommand = (command: () => void) => {
        onOpenChange(false)
        command()
    }

    // Pre-process items for search
    const items = pages?.map(page => {
        const section = sections?.find(s => s.id === page.section_id)
        return {
            id: page.id,
            title: page.title,
            slug: page.slug,
            sectionSlug: section?.slug || '',
            sectionTitle: section?.title || 'Sin sección',
            type: 'page' as const
        }
    }) || []

    const sectionItems = sections?.map(section => ({
        id: section.id,
        title: section.title,
        slug: section.slug,
        type: 'section' as const
    })) || []

    return (
        <div className="search-dialog-wrapper">
            <CommandDialog open={open} onOpenChange={onOpenChange}>
                <CommandInput placeholder="Buscar documentación..." />
                <CommandList className="max-h-[350px]">
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>

                    {items.length > 0 && (
                        <CommandGroup heading="Páginas">
                            {items.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={`${item.title} ${item.sectionTitle}`}
                                    onSelect={() => {
                                        runCommand(() => navigate(`/docs/${item.sectionSlug}/${item.slug}`))
                                    }}
                                    className="flex items-center gap-2 px-4 py-2"
                                >
                                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col">
                                        <span>{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{item.sectionTitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {sectionItems.length > 0 && (
                        <CommandGroup heading="Secciones">
                            {sectionItems.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.title}
                                    onSelect={() => {
                                        // Navigate to the first page of the section if possible, or just open the section in sidebar (this might need better logic if we had a dedicated section page)
                                        // For now, let's find the first page of this section
                                        const firstPage = pages?.find(p => p.section_id === item.id)
                                        if (firstPage) {
                                            runCommand(() => navigate(`/docs/${item.slug}/${firstPage.slug}`))
                                        } else {
                                            // Fallback or handle empty section
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2"
                                >
                                    <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{item.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </div>
    )
}
