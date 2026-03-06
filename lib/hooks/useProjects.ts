import { useEffect, useState } from "react";
import { Project } from "@/types/project";

export function useProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => setProjects(data))
      .finally(() => setIsLoading(false));
  }, []);

  return { data: projects, isLoading };
}