import { useEffect, useState } from "react";
import { graphqlRequest } from "./graphqlClient";
import { TasksView } from "./TasksView";

type Project = {
  id: string;
  name: string;
  description?: string | null;
};

type ProjectsResponse = {
  projects: Project[];
};

type CreateProjectResponse = {
  createProject: Project;
};

type Props = {
  token: string;
  currentUserId: string;
  viewMode: "all" | "mine";
};

export function ProjectsView({ token, currentUserId, viewMode }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = `
        query GetProjects($limit: Int, $offset: Int) {
          projects(limit: $limit, offset: $offset) {
            id
            name
            description
          }
        }
      `;

      const data = await graphqlRequest<ProjectsResponse>({
        query,
        variables: { limit: 20, offset: 0 },
        token,
      });

      setProjects(data.projects);
      if (!selectedProjectId && data.projects.length > 0) {
        setSelectedProjectId(data.projects[0].id);
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const mutation = `
        mutation CreateProject($name: String!, $description: String!) {
          createProject(name: $name, description: $description) {
            id
            name
            description
          }
        }
      `;

      const data = await graphqlRequest<CreateProjectResponse>({
        query: mutation,
        variables: { name, description },
        token,
      });

      setProjects((prev) => [...prev, data.createProject]);
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err.message ?? "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="projects-layout">
      <section className="projects-panel">
        <h2>Projects</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="projects-list">
          <ul className="list">
            {projects.map((project) => (
              <li
                key={project.id}
                className={
                  project.id === selectedProjectId
                    ? "list-item active"
                    : "list-item"
                }
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div className="list-item-text">
                  <strong>{project.name}</strong>
                  {project.description && (
                    <span className="muted-text">{project.description}</span>
                  )}
                </div>
              </li>
            ))}
            {projects.length === 0 && !loading && (
              <li className="muted-text">No projects yet. Create one below.</li>
            )}
          </ul>
        </div>

        <form onSubmit={handleCreateProject} className="simple-form">
          <h3>Create Project</h3>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Description
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading}>
            Create
          </button>
        </form>
      </section>

      <section className="tasks-panel">
        {selectedProjectId ? (
          <TasksView
            token={token}
            projectId={selectedProjectId}
            currentUserId={currentUserId}
            viewMode={viewMode}
          />
        ) : (
          <p className="muted-text">
            Select a project to see its tasks.
          </p>
        )}
      </section>
    </div>
  );
}

