import { useEffect, useState } from "react";

const STEPS = [
  "Reading your resume...",
  "Extracting links and certificates...",
  "Fetching linked content...",
  "Running AI analysis...",
  "Generating your report..."
];

function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % STEPS.length);
    }, 3000);

    return () => clearInterval(id);
  }, []);

  return (
    <section className="card loading-card">
      <h3>Analyzing Resume</h3>
      <ul className="loading-steps">
        {STEPS.map((step, i) => (
          <li key={step} className={i === index ? "active-step" : ""}>
            <span className="dot" /> {step}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default LoadingState;
