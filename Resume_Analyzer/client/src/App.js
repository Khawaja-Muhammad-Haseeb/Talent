import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ResumePage from "./pages/ResumePage";
import GitHubPage from "./pages/GitHubPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResumePage />} />
        <Route path="/github" element={<GitHubPage />} />
        <Route
          path="/challenge"
          element={
            <main className="app">
              <section className="container">
                <div className="card">
                  <h2>Stage 3 Challenge Coming Next</h2>
                  <p>Your enriched profile has been saved in pipeline memory.</p>
                </div>
              </section>
            </main>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
