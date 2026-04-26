import { useState } from "react";
import { useNavigate } from "react-router-dom";

function VerifyLookup() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const id = value.trim().toUpperCase();
    if (!id) return;
    navigate(`/verify/${id}`);
  };

  return (
    <form onSubmit={submit} className="card">
      <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
        Enter Credential ID e.g. TMP-A3F2-9C1B-7E44
      </label>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={{ width: "100%", border: "1px solid #d0d5dd", borderRadius: 8, padding: 10 }}
      />
      <button className="analyze-btn" type="submit">
        Verify
      </button>
    </form>
  );
}

export default VerifyLookup;
