import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocTableOfContentsProps {
  content: string;
}

export function DocTableOfContents({ content }: DocTableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse headings from HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3');

    const items: TocItem[] = [];
    headingElements.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      items.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      });
    });

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="hidden xl:block w-56 shrink-0 pl-8 border-l border-border/40" aria-label="Tabla de contenidos">
      <div className="sticky top-24 space-y-4">
        <p className="text-[12px] font-bold text-foreground/80 flex items-center gap-2">
          <span className="w-1 h-3 bg-primary rounded-full" />
          ON THIS PAGE
        </p>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li
              key={heading.id}
            >
              <a
                href={`#${heading.id}`}
                className={cn(
                  "text-[13px] block py-1.5 transition-all relative",
                  activeId === heading.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground/80 hover:text-foreground"
                )}
                style={{ paddingLeft: `${(heading.level - 1) * 8}px` }}
              >
                {activeId === heading.id && (
                  <span className="absolute left-[-32px] top-1/2 -translate-y-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
