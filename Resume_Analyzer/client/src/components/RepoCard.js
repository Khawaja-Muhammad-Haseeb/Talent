function RepoCard({ project }) {
  const language = project.language || "Unknown";
  const stars = project.stars ?? 0;

  return (
    <article className="link-card">
      <a href={project.url} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
        {project.name}
      </a>
      <p style={{ margin: "8px 0" }}>{project.description || "No description available."}</p>
      <div className="link-meta">
        <span className="type-badge">{language}</span>
        <span className="verified">⭐ {stars}</span>
      </div>
    </article>
  );
}

export default RepoCard;
