import { AssessmentForm } from "@/components/assessment-form";

export default function NewAssessmentPage() {
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#6E3482]">Step 1</p>
        <h1 className="text-3xl font-black text-[#49225B]">Create Assessment</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#49225B]/75">
          Define the assignment, learning objectives, scoring ceiling, and rubric summary before committing the record to the Intelligent Contract.
        </p>
      </div>
      <AssessmentForm />
    </div>
  );
}
