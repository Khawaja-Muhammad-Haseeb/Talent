import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ResumePage from "./pages/ResumePage";
import GitHubPage from "./pages/GitHubPage";
import ChallengePage from "./pages/ChallengePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResumePage />} />
        <Route path="/github" element={<GitHubPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route
          path="/interview"
          element={
            <main className="app">
              <section className="container">
                <div className="card">
                  <h2>Stage 4 Interview Coming Next</h2>
                  <p>Stage 3 result has been saved in your developer pipeline context.</p>
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
