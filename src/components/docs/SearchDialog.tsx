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
import { Search, FileText, Hash, ArrowRight } from "lucide-react"

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
                onOpenChange(!open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [onOpenChange, open])

    const runCommand = (command: () => void) => {
        onOpenChange(false)
        command()
    }

    // Pre-process items for search
    const items = pages?.map(page => {
        const section = sections?.find(s => s.id === page.section_id)
        // Clean content for search index - remove simple markdown chars
        const cleanContent = page.content
            ?.replace(/[#*`\[\]()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 500) || ''; // Index first 500 chars for performance if needed, or more

        return {
            id: page.id,
            title: page.title,
            slug: page.slug,
            content: cleanContent,
            rawContent: page.content || '',
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
                <CommandInput placeholder="Buscar en documentación..." />
                <CommandList className="max-h-[80vh] overflow-y-auto">
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>

                    {items.length > 0 && (
                        <CommandGroup heading="Páginas">
                            {items.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={`${item.title} ${item.sectionTitle} ${item.content}`}
                                    onSelect={() => {
                                        runCommand(() => navigate(`/docs/${item.sectionSlug}/${item.slug}`))
                                    }}
                                    className="flex flex-col gap-1 px-4 py-3 border-b border-border/40 last:border-0"
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <FileText className="h-4 w-4 text-primary/70 shrink-0" />
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">{item.title}</span>
                                                <span className="text-xs text-muted-foreground/50 shrink-0 capitalize ml-auto bg-muted px-2 py-0.5 rounded-full">
                                                    {item.sectionTitle}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Snippet preview - purely visual, cmdk handles filtering based on 'value' */}
                                    {item.content && (
                                        <div className="text-xs text-muted-foreground w-full line-clamp-2 pl-6">
                                            {item.content}
                                        </div>
                                    )}
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
                                        const firstPage = pages?.find(p => p.section_id === item.id)
                                        if (firstPage) {
                                            runCommand(() => navigate(`/docs/${item.slug}/${firstPage.slug}`))
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
