import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Project } from '@/types';

/** Projects added from the admin panel (Admin → Projects). */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await api.getProjects());
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { projects, loading, reload: load };
}
