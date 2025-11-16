import { ProjectCard } from "@/components/cards/project-card";
import { Button } from "@/components/ui/button";

interface Project {
  name: string;
  subtitle: string;
  description: string;
  cycle: string;
  accent: string;
  tags: string[];
}

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/55">
            Selected Work
          </p>
          <h2 className="text-4xl font-black">Commissions & Systems</h2>
        </div>
        <Button
          asChild
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full"
        >
          <a href="#contact">
            Collaborate
            <span aria-hidden>↗</span>
          </a>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 auto-rows-fr">
        {projects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
    </section>
  );
}
