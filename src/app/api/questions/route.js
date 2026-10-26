import questionsData from "@/data/questions.json";

export async function GET() {
  try {
    // Sanitize questions to prevent answer key leaking to client inspector
    const safeQuestions = questionsData.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

    return Response.json({
      success: true,
      total: safeQuestions.length,
      questions: safeQuestions
    });
  } catch (error) {
    console.error("Error reading questions:", error);
    return Response.json(
      { success: false, error: "Failed to load questions" },
      { status: 500 }
    );
  }
}
