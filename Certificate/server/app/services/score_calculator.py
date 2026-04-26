def calculate_final_score(stage1, stage2, stage3):
    resume_score = stage1.get("score", 0)
    github_score = stage2.get("combinedScore", 0)
    challenge_score = stage3.get("evaluation", {}).get("score", 0)

    final_score = round(
        (resume_score * 0.20) + (github_score * 0.30) + (challenge_score * 0.50), 1
    )

    if final_score >= 8.0:
        level = "Professional"
        color = "purple"
    elif final_score >= 6.5:
        level = "Intermediate"
        color = "blue"
    elif final_score >= 5.0:
        level = "Beginner"
        color = "green"
    else:
        level = None
        color = "red"

    cert_recommendation = stage3.get("evaluation", {}).get(
        "certificationRecommendation", "Borderline"
    )

    eligible = level is not None and cert_recommendation != "Not Recommended"
    if (
        cert_recommendation == "Not Recommended"
        and final_score < 6.0
    ):
        eligible = False

    return {
        "resumeScore": resume_score,
        "githubScore": github_score,
        "challengeScore": challenge_score,
        "finalScore": final_score,
        "level": level,
        "color": color,
        "eligible": eligible,
    }
