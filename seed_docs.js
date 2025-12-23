import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tqiodegojsfginhiflfk.supabase.co";
// Use the key from .env (VITE_SUPABASE_PUBLISHABLE_KEY)
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaW9kZWdvanNmZ2luaGlmbGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MjUzODEsImV4cCI6MjA4MjAwMTM4MX0.A8bKs3Gge7FW4EjpO30I7eu-iit4VVBv0Z7j8avewDY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const structure = [
    {
        title: "1. Modelo de Uso",
        slug: "modelo-de-uso",
        order: 1,
        pages: [
            { title: "Qué ofrece la plataforma", slug: "que-ofrece-la-plataforma", order: 1 },
            { title: "Cómo una agencia trabaja con clientes", slug: "agencia-y-clientes", order: 2 }
        ]
    },
    {
        title: "2. Alta de Clientes y Agentes",
        slug: "alta-de-clientes",
        order: 2,
        pages: [
            { title: "Crear cliente", slug: "crear-cliente", order: 1 },
            { title: "Crear y vincular agente de voz", slug: "agente-de-voz", order: 2 },
            { title: "Definir precio por minuto", slug: "precio-por-minuto", order: 3 }
        ]
    },
    {
        title: "3. Operación y Seguimiento",
        slug: "operacion-y-seguimiento",
        order: 3,
        pages: [
            { title: "Ver llamadas", slug: "ver-llamadas", order: 1 },
            { title: "Estados", slug: "estados", order: 2 },
            { title: "Consumo y métricas", slug: "consumo-y-metricas", order: 3 }
        ]
    },
    {
        title: "4. Plan y Soporte",
        slug: "plan-y-soporte",
        order: 4,
        pages: [
            { title: "Suscripción", slug: "suscripcion", order: 1 },
            { title: "Límites", slug: "limites", order: 2 },
            { title: "Facturación", slug: "facturacion", order: 3 },
            { title: "Contacto", slug: "contacto", order: 4 }
        ]
    }
];

async function seed() {
    console.log("Iniciando carga de secciones...");

    for (const sectionData of structure) {
        // Insert section
        const { data: section, error: sectionError } = await supabase
            .from('doc_sections')
            .insert({
                title: sectionData.title,
                slug: sectionData.slug,
                order: sectionData.order
            })
            .select()
            .single();

        if (sectionError) {
            console.error(`Error creando sección ${sectionData.title}:`, sectionError.message);
            continue;
        }

        console.log(`Sección creada: ${section.title}`);

        // Insert pages
        for (const pageData of sectionData.pages) {
            const { error: pageError } = await supabase
                .from('doc_pages')
                .insert({
                    section_id: section.id,
                    title: pageData.title,
                    slug: pageData.slug,
                    order: pageData.order,
                    content: `<h2>${pageData.title}</h2><p>Contenido pendiente de completar para la sección de ${sectionData.title.split('. ')[1]}.</p>`
                });

            if (pageError) {
                console.error(`Error creando página ${pageData.title}:`, pageError.message);
            } else {
                console.log(`  Página creada: ${pageData.title}`);
            }
        }
    }

    console.log("Carga finalizada.");
}

seed();
