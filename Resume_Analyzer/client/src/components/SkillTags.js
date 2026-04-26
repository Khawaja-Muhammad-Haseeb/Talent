function SkillTags({ skills = [] }) {
  return (
    <div className="skill-tags">
      {skills.map((skill) => (
        <span key={skill} className="skill-pill">
          {skill}
        </span>
      ))}
    </div>
  );
}

export default SkillTags;
