import { useRef, useState } from "react";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function UploadZone({ selectedFile, onFileSelect, onAnalyze, disabled }) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const validateAndSelect = (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only PDF and DOCX files are supported.");
      return;
    }

    setFileError("");
    onFileSelect(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    validateAndSelect(file);
  };

  const onBrowseClick = () => fileInputRef.current?.click();

  return (
    <section className="card">
      <div
        className={`upload-zone ${dragging ? "dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={onBrowseClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onBrowseClick();
        }}
      >
        <p>Drag and drop your resume here</p>
        <span>or click to browse (PDF, DOCX)</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(event) => validateAndSelect(event.target.files?.[0])}
        className="hidden-input"
      />

      {selectedFile ? (
        <div className="file-info">
          <strong>{selectedFile.name}</strong>
          <span>{formatSize(selectedFile.size)}</span>
        </div>
      ) : null}

      {fileError ? <div className="inline-error">{fileError}</div> : null}

      <button className="analyze-btn" onClick={onAnalyze} disabled={!selectedFile || disabled}>
        Analyze Resume
      </button>
    </section>
  );
}

export default UploadZone;
