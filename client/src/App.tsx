import { useState, useEffect } from "react";
import "./App.css";
import { ProjectsView } from "./ProjectsView";
import { useAuth0 } from "@auth0/auth0-react";

type ViewMode = "all" | "mine";

function App() {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const [token, setToken] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated) {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
      }
    };

    fetchToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-root">
      {isAuthenticated && token ? (
        <div className="app-container">
          <header className="app-header">
            <div>
              <h1>GraphQL Task Manager</h1>
              <p>
                Logged in as <strong>{user?.name}</strong> (
                {user?.email})
              </p>
            </div>

            <button
              onClick={() =>
                logout({
                  logoutParams: { returnTo: window.location.origin },
                })
              }
            >
              Logout
            </button>
          </header>

          <div className="view-toggle">
            <button
              className={viewMode === "all" ? "active" : ""}
              onClick={() => setViewMode("all")}
            >
              All Projects
            </button>

            <button
              className={viewMode === "mine" ? "active" : ""}
              onClick={() => setViewMode("mine")}
            >
              My Tasks
            </button>
          </div>

          <main className="app-main">
            <ProjectsView
              token={token}
              currentUserId={user?.sub || ""}
              viewMode={viewMode}
            />
          </main>
        </div>
      ) : (
        <div className="auth-container">
          <div className="auth-card">
            <h1>GraphQL Task Manager</h1>

            <button onClick={() => loginWithRedirect()}>
              Login / Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;