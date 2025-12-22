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
    <nav className="hidden xl:block w-64 shrink-0" aria-label="Tabla de contenidos">
      <div className="sticky top-24 space-y-2">
        <p className="text-sm font-medium text-foreground mb-4">En esta página</p>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                className={cn(
                  "text-sm block py-1 transition-colors",
                  activeId === heading.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
