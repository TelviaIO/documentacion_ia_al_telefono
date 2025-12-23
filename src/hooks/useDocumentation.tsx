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
  meta_title?: string;
  meta_description?: string;
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



export function useUpdatePageDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, order, meta_title, meta_description }: {
      id: string;
      order?: number;
      meta_title?: string;
      meta_description?: string;
    }) => {
      const updates: any = {};
      if (order !== undefined) updates.order = order;
      if (meta_title !== undefined) updates.meta_title = meta_title;
      if (meta_description !== undefined) updates.meta_description = meta_description;

      const { data, error } = await supabase
        .from('doc_pages')
        .update(updates)
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

export function useUpdateSectionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; order: number }[]) => {
      // Process updates in parallel or sequence
      const promises = updates.map(({ id, order }) =>
        supabase.from('doc_sections').update({ order }).eq('id', id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);

      if (errors.length > 0) throw errors[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-sections'] });
    },
  });
}

export function useUpdatePageOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; order: number }[]) => {
      const promises = updates.map(({ id, order }) =>
        supabase.from('doc_pages').update({ order }).eq('id', id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);

      if (errors.length > 0) throw errors[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-pages'] });
    },
  });
}

export interface DocNavItem {
  id: string;
  label: string;
  url: string;
  type: 'link' | 'button';
  order: number;
}

export function useNavItems() {
  return useQuery({
    queryKey: ['doc-nav-items'],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await supabase
        .from('doc_nav_items' as any)
        .select('*')
        .order('order');

      if (error) {
        // If table doesn't exist yet, return defaults
        if (error.code === '42P01') {
          return [
            { id: '1', label: 'Homepage', url: '/', type: 'link', order: 1 },
            { id: '2', label: 'Support', url: '/support', type: 'link', order: 2 },
            { id: '3', label: 'Compliance', url: '/compliance', type: 'link', order: 3 },
            { id: '4', label: 'Dashboard', url: '#', type: 'button', order: 4 },
          ] as DocNavItem[];
        }
        throw error;
      }
      return data as unknown as DocNavItem[];
    },
  });
}

export function useUpdateNavItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, label, url }: { id: string; label: string; url: string }) => {
      // @ts-ignore
      const { data, error } = await supabase
        .from('doc_nav_items' as any)
        .update({ label, url })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-nav-items'] });
    },
  });
}
