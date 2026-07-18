# v0.2.19
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

import json
import typing


class GradiaAssessment(gl.Contract):
    """
    GradiaAssessment

    Adaptive grading consensus for public, evidence-backed learner submissions.
    Educators register an assessment and rubric summary; students register a
    public evidence URL and hash; GenLayer validator consensus reviews the
    submission against the rubric and returns an authoritative on-chain grade.

    What belongs on-chain: assessment and submission registries, rubric
    summaries, and the finalized consensus grade record.

    What stays off-chain: full submission content, attachments, and analytics.
    Only public reference URLs and content hashes are stored here.
    """

    assessments: TreeMap[str, str]
    submissions: TreeMap[str, str]
    assessment_submission_index: TreeMap[str, str]
    consensus_records: TreeMap[str, str]

    def __init__(self) -> None:
        self.assessments = TreeMap()
        self.submissions = TreeMap()
        self.assessment_submission_index = TreeMap()
        self.consensus_records = TreeMap()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _sender(self) -> str:
        return gl.message.sender_address.as_hex.lower()

    def _json(self, value: typing.Any) -> str:
        return json.dumps(value, sort_keys=True)

    def _load(self, raw: str) -> typing.Any:
        if raw is None or raw == "":
            return {}
        return json.loads(raw)

    def _require_non_empty(self, value: str, field_name: str) -> None:
        if value is None or len(value.strip()) == 0:
            raise gl.vm.UserError(field_name + " is required")

    def _limit(self, value: typing.Any, max_len: int) -> str:
        text = str(value)
        if len(text) > max_len:
            return text[:max_len]
        return text

    def _bounded_score(self, value: typing.Any, fallback: int) -> int:
        try:
            score = int(value)
        except Exception:
            score = fallback
        if score < 0:
            return 0
        if score > 100:
            return 100
        return score

    def _list_of_strings(self, value: typing.Any, max_items: int, max_len: int) -> typing.List[str]:
        result: typing.List[str] = []
        if isinstance(value, list):
            for item in value:
                if len(result) >= max_items:
                    break
                result.append(self._limit(item, max_len))
        return result

    def _key2(self, a: str, b: str) -> str:
        return a + "::" + b

    def _consensus_key(self, assessment_id: str, submission_id: str) -> str:
        return self._key2(assessment_id, submission_id)

    def _append_unique(self, existing: str, item: str) -> str:
        if existing is None or existing == "":
            return item
        parts = existing.split("|")
        for part in parts:
            if part == item:
                return existing
        return existing + "|" + item

    def _require_assessment_exists(self, assessment_id: str) -> typing.Any:
        raw = self.assessments.get(assessment_id, "")
        if raw == "":
            raise gl.vm.UserError("Assessment not found")
        return self._load(raw)

    def _require_submission_exists(self, submission_id: str) -> typing.Any:
        raw = self.submissions.get(submission_id, "")
        if raw == "":
            raise gl.vm.UserError("Submission not found")
        return self._load(raw)

    def _assert_no_predecided_verdict(self, text: str) -> None:
        lower = text.lower()
        forbidden = [
            '"finalgrade"',
            "'finalgrade'",
            "finalgrade:",
            '"confidence"',
            "'confidence'",
            "confidence:",
            '"rubricalignment"',
            "'rubricalignment'",
        ]
        for item in forbidden:
            if item in lower:
                raise gl.vm.UserError("Input contains pre-decided grading language: " + item)

    def _normalise_consensus_result(self, raw: typing.Any) -> typing.Any:
        if isinstance(raw, str):
            parsed = json.loads(raw)
        else:
            parsed = raw

        return {
            "finalGrade": self._limit(parsed.get("finalGrade", "UNGRADED"), 12),
            "confidence": self._bounded_score(parsed.get("confidence", 0), 0),
            "evidenceVerified": bool(parsed.get("evidenceVerified", False)),
            "evidenceUrl": self._limit(parsed.get("evidenceUrl", ""), 500),
            "evidenceHashMatched": bool(parsed.get("evidenceHashMatched", False)),
            "verificationNotes": self._limit(parsed.get("verificationNotes", ""), 800),
            "rubricAlignment": self._limit(parsed.get("rubricAlignment", ""), 40),
            "learningOutcomeAchievement": self._limit(parsed.get("learningOutcomeAchievement", ""), 40),
            "evidenceQuality": self._limit(parsed.get("evidenceQuality", ""), 40),
            "strengths": self._list_of_strings(parsed.get("strengths", []), 8, 320),
            "improvements": self._list_of_strings(parsed.get("improvements", []), 8, 320),
            "feedback": self._limit(parsed.get("feedback", ""), 1600),
            "nextSteps": self._limit(parsed.get("nextSteps", ""), 800),
            "history": self._list_of_strings(parsed.get("history", []), 10, 320),
        }

    def _run_consensus_grading(self, assessment: typing.Any, submission: typing.Any) -> typing.Any:
        assessment_json = self._json(assessment)
        submission_json = self._json(submission)
        evidence_url = str(submission.get("url", ""))

        def grading_input() -> str:
            response = gl.nondet.web.get(evidence_url)
            evidence_text = response.body.decode("utf-8")
            return (
                f"ASSESSMENT: {assessment_json}\n"
                f"SUBMISSION: {submission_json}\n"
                f"FETCHED_PUBLIC_EVIDENCE_FROM_URL: {evidence_url}\n"
                f"EVIDENCE_CONTENT:\n{evidence_text[:12000]}"
            )

        # non_comparative: leader grades the submission, validators judge whether
        # the grade is a reasonable, rubric-grounded reading of independently
        # fetched public evidence, not merely of user-supplied claims.
        consensus_json = gl.eq_principle.prompt_non_comparative(
            grading_input,
            task=(
                "You are an impartial educational assessor. Evaluate the student submission "
                "against the assessment rubric and learning objectives in the input. "
                "The input includes public evidence fetched by the contract from the registered URL. "
                "Do not grade from the submitted title, URL, or hash alone. "
                "If the fetched evidence is unrelated, private/login-gated, empty, or insufficient, "
                "return finalGrade UNVERIFIED, confidence 0, evidenceVerified false, and explain why. "
                "Return ONLY valid JSON, no markdown, no explanation outside the JSON.\n\n"
                "Return exactly this structure:\n"
                '{"finalGrade":"B+","confidence":80,"evidenceVerified":true,'
                '"evidenceUrl":"https://example.com/work","evidenceHashMatched":false,'
                '"verificationNotes":"Fetched public evidence and checked it against the rubric.",'
                '"rubricAlignment":"High",'
                '"learningOutcomeAchievement":"High","evidenceQuality":"Medium-High",'
                '"strengths":["..."],"improvements":["..."],'
                '"feedback":"One paragraph.","nextSteps":"One sentence.",'
                '"history":["One sentence describing how this grade was reached."]}\n\n'
                "confidence is an integer 0-100. evidenceHashMatched may be false if the exact hash "
                "algorithm cannot be recomputed by the validator, but evidenceVerified must only be true "
                "when the URL content itself was actually reachable and relevant."
            ),
            criteria=(
                "finalGrade must be a defensible letter grade given the rubric summary and maximum score.\n"
                "Validators must inspect the fetched public evidence included in the input before accepting a grade.\n"
                "Validators must reject grades that rely only on user-submitted claims, a URL string, or JSON shape.\n"
                "If fetched evidence does not support the claimed submission, finalGrade must be UNVERIFIED and confidence must be 0.\n"
                "rubricAlignment, learningOutcomeAchievement, and evidenceQuality must each be one of: "
                "Low, Medium, Medium-High, High.\n"
                "The grade must be justified by fetched public evidence and the registered hash/reference, not assumed.\n"
                "The response must be valid JSON matching the required structure."
            ),
        )

        result = self._normalise_consensus_result(consensus_json)
        result["evidenceUrl"] = evidence_url
        return result

    # ------------------------------------------------------------------
    # Assessment registry
    # ------------------------------------------------------------------

    @gl.public.write
    def create_assessment(
        self,
        assessment_id: str,
        title: str,
        subject: str,
        instructions: str,
        objectives: str,
        requirements: str,
        max_score: int,
        due_date: str,
        rubric_summary: str,
    ) -> None:
        self._require_non_empty(assessment_id, "assessment_id")
        self._require_non_empty(title, "title")
        self._require_non_empty(rubric_summary, "rubric_summary")
        if self.assessments.get(assessment_id, "") != "":
            raise gl.vm.UserError("Assessment already exists")

        record = {
            "id": assessment_id,
            "title": self._limit(title, 200),
            "subject": self._limit(subject, 140),
            "instructions": self._limit(instructions, 2000),
            "objectives": self._limit(objectives, 1200),
            "requirements": self._limit(requirements, 1200),
            "maxScore": self._bounded_score(max_score, 100),
            "dueDate": due_date,
            "rubricSummary": self._limit(rubric_summary, 800),
            "owner": self._sender(),
            "status": "open",
        }
        self.assessments[assessment_id] = self._json(record)

    @gl.public.view
    def get_assessment(self, assessment_id: str) -> str:
        return self.assessments.get(assessment_id, "")

    # ------------------------------------------------------------------
    # Submission registry
    # ------------------------------------------------------------------

    @gl.public.write
    def register_submission(
        self,
        submission_id: str,
        assessment_id: str,
        title: str,
        url: str,
        evidence_hash: str,
        submitted_at: str,
    ) -> None:
        self._require_non_empty(submission_id, "submission_id")
        self._require_non_empty(title, "title")
        self._require_non_empty(url, "url")
        if not (url.startswith("https://") or url.startswith("http://")):
            raise gl.vm.UserError("Submission must reference a public URL")
        self._require_assessment_exists(assessment_id)
        if self.submissions.get(submission_id, "") != "":
            raise gl.vm.UserError("Submission already exists")

        record = {
            "id": submission_id,
            "assessmentId": assessment_id,
            "title": self._limit(title, 200),
            "url": url,
            "hash": evidence_hash,
            "student": self._sender(),
            "submittedAt": submitted_at,
        }
        self.submissions[submission_id] = self._json(record)
        self.assessment_submission_index[assessment_id] = self._append_unique(
            self.assessment_submission_index.get(assessment_id, ""),
            submission_id,
        )

    @gl.public.view
    def get_submission(self, submission_id: str) -> str:
        return self.submissions.get(submission_id, "")

    # ------------------------------------------------------------------
    # Consensus grading
    # ------------------------------------------------------------------

    @gl.public.write
    def request_assessment_consensus(self, assessment_id: str, submission_id: str) -> str:
        assessment = self._require_assessment_exists(assessment_id)
        submission = self._require_submission_exists(submission_id)
        if submission.get("assessmentId", "") != assessment_id:
            raise gl.vm.UserError("Submission does not belong to assessment")

        self._assert_no_predecided_verdict(
            assessment.get("instructions", "")
            + " "
            + assessment.get("objectives", "")
            + " "
            + assessment.get("requirements", "")
            + " "
            + submission.get("title", "")
        )

        result = self._run_consensus_grading(assessment, submission)
        result["assessmentId"] = assessment_id
        result["submissionId"] = submission_id

        self.consensus_records[self._consensus_key(assessment_id, submission_id)] = self._json(result)

        assessment["status"] = "finalized"
        self.assessments[assessment_id] = self._json(assessment)

        return self._json(result)

    @gl.public.view
    def get_consensus_record(self, assessment_id: str, submission_id: str) -> str:
        self._require_assessment_exists(assessment_id)
        submission = self._require_submission_exists(submission_id)
        if submission.get("assessmentId", "") != assessment_id:
            raise gl.vm.UserError("Submission does not belong to assessment")
        return self.consensus_records.get(self._consensus_key(assessment_id, submission_id), "")
