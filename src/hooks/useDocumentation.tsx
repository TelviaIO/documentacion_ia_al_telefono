import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DocSection {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  order: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocPage {
  id: string;
  section_id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export function useSections() {
  return useQuery({
    queryKey: ['doc-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doc_sections')
        .select('*')
        .order('order');

      if (error) throw error;
      return data as DocSection[];
    },
  });
}

export function usePages(sectionId?: string) {
  return useQuery({
    queryKey: ['doc-pages', sectionId],
    queryFn: async () => {
      let query = supabase
        .from('doc_pages')
        .select('*')
        .order('order');

      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DocPage[];
    },
  });
}

export function usePage(sectionSlug: string, pageSlug: string) {
  return useQuery({
    queryKey: ['doc-page', sectionSlug, pageSlug],
    queryFn: async () => {
      // First get the section
      const { data: section, error: sectionError } = await supabase
        .from('doc_sections')
        .select('id')
        .eq('slug', sectionSlug)
        .maybeSingle();

      if (sectionError) throw sectionError;
      if (!section) return null;

      // Then get the page
      const { data: page, error: pageError } = await supabase
        .from('doc_pages')
        .select('*')
        .eq('section_id', section.id)
        .eq('slug', pageSlug)
        .maybeSingle();

      if (pageError) throw pageError;
      return page as DocPage | null;
    },
    enabled: !!sectionSlug && !!pageSlug,
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { data, error } = await supabase
        .from('doc_pages')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-pages'] });
      queryClient.invalidateQueries({ queryKey: ['doc-page'] });
    },
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ section_id, title, slug, content, order }: {
      section_id: string;
      title: string;
      slug: string;
      content: string;
      order: number;
    }) => {
      const { data, error } = await supabase
        .from('doc_pages')
        .insert({ section_id, title, slug, content, order })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-pages'] });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('doc_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-pages'] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, slug, icon, parent_id }: { id: string; title: string; slug: string; icon?: string; parent_id?: string | null }) => {
      const { data, error } = await supabase
        .from('doc_sections')
        .update({ title, slug, icon, parent_id })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-sections'] });
    },
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, slug, icon, order, parent_id }: {
      title: string;
      slug: string;
      icon?: string;
      order: number;
      parent_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('doc_sections')
        .insert({ title, slug, icon, order, parent_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-sections'] });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('doc_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-sections'] });
    },
  });
}
