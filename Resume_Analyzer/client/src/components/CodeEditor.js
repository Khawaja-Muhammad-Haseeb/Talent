import { useMemo, useState } from "react";

function CodeEditor({ onSubmit, disabled }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const characterCount = text.length;
  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text]
  );

  const submit = () => {
    if (!text.trim()) {
      setError("Please write your solution before submitting");
      return;
    }
    setError("");
    onSubmit(text);
  };

  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>Your Solution</h3>
      <p style={{ color: "#475467", marginTop: 0 }}>
        Write your solution in any language, pseudocode, or plain English. Focus on your reasoning and approach.
      </p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={16}
        style={{
          width: "100%",
          borderRadius: 10,
          border: "1px solid #d0d5dd",
          padding: 12,
          fontFamily: "Consolas, Monaco, monospace",
          resize: "vertical"
        }}
        placeholder="Write your answer here..."
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "#667085" }}>
        <span>{characterCount} characters</span>
        <span>{wordCount} words</span>
      </div>
      {error ? <div className="inline-error">{error}</div> : null}
      <button
        className="analyze-btn"
        style={{ width: "100%" }}
        disabled={disabled || !text.trim()}
        onClick={submit}
      >
        Submit Solution
      </button>
      <p style={{ color: "#667085", marginBottom: 0 }}>
        Your solution will be evaluated by AI with full context of your profile and skills
      </p>
    </section>
  );
}

export default CodeEditor;
