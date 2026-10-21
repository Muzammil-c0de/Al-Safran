import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { sampleProjects } from '@/data/sampleProjects';
import type { Project } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      const hasReal = data.length > 0;
      setProjects(hasReal ? data : sampleProjects);
      setIsSample(!hasReal);
    } catch {
      setProjects(sampleProjects);
      setIsSample(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { projects, loading, isSample, reload: load };
}
