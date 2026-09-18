import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";

export default function Dashboard() {
 const { logout } = useAuth();
const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      const response = await api.get<Task[]>("/tasks/");
      setTasks(response.data);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async () => {
    if (!title.trim()) {
      return;
    }

    try {
      const response = await api.post<Task>("/tasks/", {
        title,
        description,
      });

      setTasks((currentTasks) => [
        response.data,
        ...currentTasks,
      ]);

      setTitle("");
      setDescription("");
    } catch {
      setError("Failed to create task");
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const response = await api.put<Task>(
        `/tasks/${task.id}`,
        {
          completed: !task.completed,
        }
      );

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id
            ? response.data
            : item
        )
      );
    } catch {
      setError("Failed to update task");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== id
        )
      );
    } catch {
      setError("Failed to delete task");
    }
  };

  return (
    <div>
      <header>
        <h1>Task Manager</h1>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </header>

      <main>
        <h2>Create Task</h2>

        <input
          placeholder="Task title"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
        />

        <button onClick={createTask}>
          Add Task
        </button>

        {error && <p>{error}</p>}

        <h2>Tasks</h2>

        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id}>
              <h3>{task.title}</h3>

              <p>
                {task.description}
              </p>

              <p>
                Status:{" "}
                {task.completed
                  ? "Completed"
                  : "Pending"}
              </p>

              <button
                onClick={() =>
                  toggleTask(task)
                }
              >
                {task.completed
                  ? "Mark Pending"
                  : "Complete"}
              </button>

              <button
                onClick={() =>
                  deleteTask(task.id)
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}