import { useEffect, useState } from "react";
import { graphqlRequest } from "./graphqlClient";
import { motion } from "framer-motion";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assignedTo?: {
    id: string;
  };
};

type TasksResponse = {
  tasks: Task[];
};

type CreateTaskResponse = {
  createTask: Task;
};

type UpdateTaskStatusResponse = {
  updateTaskStatus: Task;
};

type Props = {
  token: string;
  projectId: string;
  currentUserId: string;
  viewMode: "all" | "mine";
};

export function TasksView({
  token,
  projectId,
  currentUserId,
  viewMode,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const query = `
        query GetTasks($projectId: ID, $status: TaskStatus, $limit: Int, $offset: Int) {
          tasks(projectId: $projectId, status: $status, limit: $limit, offset: $offset) {
            id
            title
            description
            status
            assignedTo {
              id
            }
          }
        }
      `;

      const variables: Record<string, unknown> = {
        projectId,
        limit: 20,
        offset: 0,
      };

      if (statusFilter) {
        variables.status = statusFilter;
      }

      const data = await graphqlRequest<TasksResponse>({
        query,
        variables,
        token,
      });

      let fetchedTasks = data.tasks;

      if (viewMode === "mine") {
        fetchedTasks = fetchedTasks.filter((task) =>
          task.assignedTo?.id === currentUserId,
        );
      }

      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, statusFilter]);

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const mutation = `
        mutation CreateTask(
          $title: String!,
          $description: String!,
          $status: TaskStatus!,
          $projectId: ID!,
          $assignedTo: ID!
        ) {
          createTask(
            title: $title,
            description: $description,
            status: $status,
            projectId: $projectId,
            assignedTo: $assignedTo
          ) {
            id
            title
            description
            status
          }
        }
      `;

      const data = await graphqlRequest<CreateTaskResponse>({
        query: mutation,
        variables: {
          title,
          description,
          status: "TODO",
          projectId,
          assignedTo,
        },
        token,
      });

      setTasks((prev) => [
        ...prev,
        { ...data.createTask, assignedTo: { id: assignedTo } },
      ]);

      setTitle("");
      setDescription("");
      setAssignedTo("");
    } catch (err: any) {
      setError(err.message ?? "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setError(null);

    try {
      const mutation = `
        mutation UpdateTaskStatus($id: ID!, $status: TaskStatus!) {
          updateTaskStatus(id: $id, status: $status) {
            id
            status
          }
        }
      `;

      const data = await graphqlRequest<UpdateTaskStatusResponse>({
        query: mutation,
        variables: { id: taskId, status },
        token,
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.updateTaskStatus.id
            ? { ...task, status: data.updateTaskStatus.status }
            : task,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to update task status");
    }
  };

  return (
    <div>
      <h2>Tasks</h2>

      <div className="tasks-toolbar">
        <label>
          Status filter
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TaskStatus | "")
            }
          >
            <option value="">All</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </label>

        <button type="button" onClick={fetchTasks} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="tasks-list">
        <motion.ul
          className="list"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.07,
              },
            },
          }}
        >
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              className="list-item"
              layout
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.25 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="list-item-text">
                <strong>{task.title}</strong>
                {task.description && (
                  <span className="muted-text">{task.description}</span>
                )}
              </div>

              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(task.id, e.target.value as TaskStatus)
                }
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </motion.li>
          ))}

          {tasks.length === 0 && !loading && (
            <motion.li
              className="muted-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No tasks for this project yet.
            </motion.li>
          )}
        </motion.ul>
      </div>

      <form onSubmit={handleCreateTask} className="simple-form">
        <h3>Create Task</h3>

        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

        <label>
          Assigned To (User ID)
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          Create Task
        </button>
      </form>
    </div>
  );
}