import { useState } from "react";
import "./App.css";
import { graphqlRequest } from "./graphqlClient";
import { ProjectsView } from "./ProjectsView";

type AuthMode = "login" | "register";

type ViewMode = "all" | "mine";

type AuthPayload = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

async function loginRequest(email: string, password: string) {
  const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          id
          name
          email
        }
      }
    }
  `;

  return graphqlRequest<{ login: AuthPayload }>({
    query,
    variables: { email, password },
  });
}

async function registerRequest(
  name: string,
  email: string,
  password: string,
) {
  const query = `
    mutation Register($name: String!, $email: String!, $password: String!) {
      register(name: $name, email: $email, password: $password) {
        token
        user {
          id
          name
          email
        }
      }
    }
  `;

  return graphqlRequest<{ register: AuthPayload }>({
    query,
    variables: { name, email, password },
  });
}

function App() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token"),
  );
  const [currentUser, setCurrentUser] = useState<AuthPayload["user"] | null>(
    () => {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    },
  );

  const [viewMode, setViewMode] = useState<ViewMode>("all");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await loginRequest(email, password);
        const payload = data.login;
        setToken(payload.token);
        setCurrentUser(payload.user);
        localStorage.setItem("token", payload.token);
        localStorage.setItem("user", JSON.stringify(payload.user));
      } else {
        const data = await registerRequest(name, email, password);
        const payload = data.register;
        setToken(payload.token);
        setCurrentUser(payload.user);
        localStorage.setItem("token", payload.token);
        localStorage.setItem("user", JSON.stringify(payload.user));
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <div className="app-root">
      {token && currentUser ? (
        <div className="app-container">
          <header className="app-header">
            <div>
              <h1>GraphQL Task Manager</h1>
              <p>
                Logged in as <strong>{currentUser.name}</strong> (
                {currentUser.email}) • ID:{" "}
                <span className="user-id-text">{currentUser.id}</span>
              </p>
            </div>
            <button onClick={handleLogout}>Logout</button>
          </header>
          <div className="view-toggle">
            <button
              className={viewMode === "all" ? "active" : ""}
              onClick={() => setViewMode("all")}
              type="button"
            >
              All Projects
            </button>
            <button
              className={viewMode === "mine" ? "active" : ""}
              onClick={() => setViewMode("mine")}
              type="button"
            >
              My Tasks
            </button>
          </div>
          <main className="app-main">
            <ProjectsView
              token={token}
              currentUserId={currentUser.id}
              viewMode={viewMode}
            />
          </main>
        </div>
      ) : (
        <div className="auth-container">
          <div className="auth-card">
            <h1>GraphQL Task Manager</h1>
            <div className="auth-tabs">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === "register" && (
                <label>
                  Name
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              {error && <p className="error-text">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading
                  ? mode === "login"
                    ? "Logging in..."
                    : "Registering..."
                  : mode === "login"
                    ? "Login"
                    : "Register"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
