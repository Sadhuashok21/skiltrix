import { useState } from "react"
import { Link } from "react-router-dom"
import { useSkiltrixData } from "../context/SkiltrixDataContext"
import { mapQuiz, type QuizCardData } from "../data/apiAdapters"
import { getQuiz, submitQuiz, type ApiQuiz } from "../api/quizzes"
import { TechIcon } from "../components/TechIcons"
import {
  Trophy,
  Award,
  BookOpen,
  Check,
  X,
  Lightbulb,
  Flag,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"

const questions = [
  {
    q: "What is the output of: print(type([]))?",
    options: [
      "<class 'list'>",
      "<class 'array'>",
      "<class 'tuple'>",
      "<type 'list'>",
    ],
    answer: 0,
    explanation:
      "In Python 3, type([]) returns <class 'list'>. The type() function returns the type object of any value.",
  },
  {
    q: "Which of the following is immutable in Python?",
    options: ["List", "Dictionary", "Set", "Tuple"],
    answer: 3,
    explanation:
      "Tuples are immutable — once created, their contents cannot be changed. Lists, dictionaries, and sets are all mutable.",
  },
  {
    q: "What does len('Hello, World!') return?",
    options: ["12", "13", "14", "11"],
    answer: 1,
    explanation:
      "The string 'Hello, World!' has 13 characters including the comma, space, and exclamation mark.",
  },
  {
    q: "Which keyword is used to define a function in Python?",
    options: ["function", "fun", "define", "def"],
    answer: 3,
    explanation:
      "Python uses the 'def' keyword to define functions. Example: def my_function(): pass",
  },
  {
    q: "What is the correct way to create a dictionary in Python?",
    options: ["d = []", "d = ()", "d = {}", "d = <>"],
    answer: 2,
    explanation:
      "Dictionaries in Python are created using curly braces {}. Lists use [], tuples use ().",
  },
  {
    q: "What does the 'in' operator check?",
    options: [
      "If a value is greater than another",
      "If a value is a member of a sequence",
      "If two values are equal",
      "If a variable is defined",
    ],
    answer: 1,
    explanation:
      "The 'in' operator checks membership — whether a value exists in a sequence like a list, string, tuple, or dictionary.",
  },
  {
    q: "How do you start a comment in Python?",
    options: ["//", "/*", "#", "<!--"],
    answer: 2,
    explanation:
      "Python uses the # symbol for single-line comments. Multi-line strings (triple quotes) are often used for docstrings but are not true comments.",
  },
  {
    q: "What will range(2, 10, 2) produce?",
    options: [
      "[2, 4, 6, 8]",
      "[2, 4, 6, 8, 10]",
      "[2, 3, 4, 5, 6, 7, 8, 9]",
      "[0, 2, 4, 6, 8]",
    ],
    answer: 0,
    explanation:
      "range(start, stop, step) generates numbers from start up to (but not including) stop, with the given step. So range(2, 10, 2) gives 2, 4, 6, 8.",
  },
  {
    q: "Which method adds an item to the end of a list?",
    options: ["add()", "push()", "append()", "insert()"],
    answer: 2,
    explanation:
      "The append() method adds an item to the end of a list. insert() can add at any position, but append() is for the end specifically.",
  },
  {
    q: "What is f-string formatting? (e.g. f'Hello, {name}')",
    options: [
      "A file string type",
      "A formatted string literal",
      "A function call",
      "A filter string",
    ],
    answer: 1,
    explanation:
      "F-strings (formatted string literals) allow you to embed Python expressions inside string literals. Introduced in Python 3.6.",
  },
]

type QuizState = "browse" | "quiz" | "results"

export default function Quizzes() {
  const { quizzes: apiQuizzes, refresh } = useSkiltrixData()
  const quizTopics = apiQuizzes.map(mapQuiz)
  const [state, setState] = useState<QuizState>("browse")
  const [selectedQuiz, setSelectedQuiz] = useState<QuizCardData | null>(null)
  const [quizData, setQuizData] = useState<ApiQuiz | null>(null)
  const [result, setResult] = useState<{ score: number; percentage: number; correct: number; total: number } | null>(null)
  const questions = (quizData?.questions ?? []).map((q) => ({ q: q.question_text, options: q.options.map((option) => option.option_text), questionId: q.question_id, optionIds: q.options.map((option) => option.option_id), explanation: "" }))
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [marked, setMarked] = useState<number[]>([])
  const [showExplain, setShowExplain] = useState(false)
  const [apiError, setApiError] = useState("")

  const startQuiz = async (q: QuizCardData) => {
    setSelectedQuiz(q)
    setQuizData(null)
    setResult(null)
    setCurrentQ(0)
    setSelected(null)
    setAnswers(new Array(q.questions).fill(null))
    setMarked([])
    try {
      setApiError("")
      const fullQuiz = await getQuiz(q.id)
      setQuizData(fullQuiz)
      setAnswers(new Array(fullQuiz.questions?.length ?? 0).fill(null))
      if (fullQuiz.questions?.length) setState("quiz")
    } catch {
      setApiError("Quiz questions could not be loaded from the API.")
      setState("browse")
    }
  }

  const selectAnswer = (i: number) => {
    if (answers[currentQ] !== null) return
    setSelected(i)
    setShowExplain(false)
  }

  const goNext = () => {
    if (selected === null) return
    const newAnswers = [...answers]
    newAnswers[currentQ] = selected
    setAnswers(newAnswers)
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelected(newAnswers[currentQ + 1])
      setShowExplain(false)
    } else {
      void finishQuiz(newAnswers)
    }
  }

  const finishQuiz = async (submittedAnswers: (number | null)[]) => {
    if (!quizData || !selectedQuiz) return
    const userId = localStorage.getItem("user_id")
    if (!userId) { setApiError("Sign in before submitting a quiz."); setState("browse"); return }
    try {
      const submitted = questions.flatMap((question, index) => {
        const optionId = question.optionIds[submittedAnswers[index] ?? -1]
        return optionId ? [{ question_id: question.questionId, selected_option_id: optionId }] : []
      })
      const response = await submitQuiz(userId, quizData.quiz_id, submitted)
      setResult(response.result)
      setState("results")
      refresh()
    } catch {
      setApiError("Quiz results could not be submitted. Check your connection and try again.")
      setState("browse")
    }
  }

  const score = result?.correct ?? 0
  const pct = result?.percentage ?? 0

  if (state === "results") {
    const grade =
      pct >= 90
        ? {
            label: "Excellent!",
            icon: Trophy,
            color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          }
        : pct >= 70
          ? {
              label: "Good job!",
              icon: Award,
              color: "text-indigo-700 bg-indigo-50 border-indigo-200",
            }
          : {
              label: "Keep practicing!",
              icon: BookOpen,
              color: "text-amber-700 bg-amber-50 border-amber-200",
            }

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div
          className={`rounded-2xl ${grade.color} border-2 p-8 text-center mb-8 shadow-sm`}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center mx-auto mb-3">
            <grade.icon className="w-8 h-8" />
          </div>
          <h2
            className="text-3xl font-extrabold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {grade.label}
          </h2>
          <div
            className="text-6xl font-extrabold my-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {pct}%
          </div>
          <p className="text-base">
            You got <strong>{score}</strong> out of{" "}
            <strong>{questions.length}</strong> correct
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Score", value: `${score}/${questions.length}` },
            { label: "Accuracy", value: `${pct}%` },
            { label: "Time taken", value: "—" },
            { label: "XP Earned", value: `+${result?.score ?? 0} XP` },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
              <div
                className="text-xl font-bold text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {s.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Review answers */}
        <div className="space-y-4 mb-8">
          {questions.map((q, i) => {
            const chosen = answers[i]
            return (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      {q.q}
                    </p>
                    <p className="text-xs text-slate-600">Your answer: <strong>{chosen === null ? "Not answered" : q.options[chosen]}</strong></p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => selectedQuiz && void startQuiz(selectedQuiz)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Retry Quiz
          </button>
          <button
            onClick={() => setState("browse")}
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Browse Quizzes
          </button>
        </div>
      </div>
    )
  }

  if (state === "quiz") {
    const q = questions[currentQ]
    const answered = answers[currentQ]

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Quiz header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">
              {selectedQuiz?.title}
            </p>
            <h2
              className="font-bold text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Question {currentQ + 1}{" "}
              <span className="text-slate-400 font-normal">
                of {questions.length}
              </span>
            </h2>
          </div>
          <button
            onClick={() => setState("browse")}
            className="text-xs text-slate-400 hover:text-red-500"
          >
            Exit quiz
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                answers[i] !== null
                  ? "bg-indigo-500"
                  : i === currentQ
                    ? "bg-indigo-600"
                    : marked.includes(i)
                      ? "bg-amber-400"
                      : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
          <p
            className="text-lg font-semibold text-slate-900 leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {q.q}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map((opt, i) => {
            const isSelected = selected === i || answered === i
            const showResult = answered !== null || selected !== null

            let cls =
              "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
            if (isSelected)
              cls = "border-indigo-500 bg-indigo-50 text-indigo-800"

            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left font-medium text-sm transition-all ${cls}`}
              >
                <span
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                    isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-current"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {selected !== null && showExplain && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5">
            <h4 className="text-sm font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Explanation</span>
            </h4>
            <p className="text-sm text-indigo-800">{q.explanation}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (currentQ > 0) {
                  setCurrentQ(currentQ - 1)
                  setSelected(answers[currentQ - 1])
                }
              }}
              disabled={currentQ === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            {selected !== null && (
              <button
                onClick={() => setShowExplain(!showExplain)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg"
              >
                {showExplain ? "Hide" : "Explain"}
              </button>
            )}
            <button
              onClick={() =>
                setMarked((m) =>
                  m.includes(currentQ)
                    ? m.filter((x) => x !== currentQ)
                    : [...m, currentQ],
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
                marked.includes(currentQ)
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "border-slate-200 text-slate-500 hover:border-amber-300"
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${marked.includes(currentQ) ? "fill-amber-600 text-amber-600" : ""}`} />
              <span>{marked.includes(currentQ) ? "Marked" : "Mark"}</span>
            </button>
          </div>
          <button
            onClick={goNext}
            disabled={selected === null}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>{currentQ === questions.length - 1 ? "Submit Quiz" : "Next"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700">Quizzes</span>
        </nav>
        <h1
          className="text-3xl font-extrabold text-slate-900 mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Quizzes
        </h1>
        <p className="text-slate-500">
          Test your knowledge and track improvement across topics
        </p>
        {apiError && <p className="mt-3 text-sm text-red-600">{apiError}</p>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {quizTopics.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <TechIcon name={quiz.icon || quiz.title} className="w-5 h-5 text-indigo-600" />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  quiz.difficulty === "Beginner"
                    ? "bg-green-100 text-green-700"
                    : quiz.difficulty === "Intermediate"
                      ? "bg-amber-100 text-amber-700"
                      : quiz.difficulty === "Advanced"
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                }`}
              >
                {quiz.difficulty}
              </span>
            </div>
            <h3
              className="font-bold text-slate-900 mb-1 leading-snug text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {quiz.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {quiz.questions} questions · ~{quiz.time}
            </p>

            <div className="space-y-2 text-xs text-slate-500 mb-4">
              <div className="flex items-center justify-between">
                <span>Best score</span>
                <span
                  className={`font-semibold ${
                    quiz.bestScore >= 80
                      ? "text-green-600"
                      : quiz.bestScore > 0
                        ? "text-amber-600"
                        : "text-slate-400"
                  }`}
                >
                  {quiz.bestScore > 0 ? `${quiz.bestScore}%` : "Not taken"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Attempts</span>
                <span className="font-semibold text-slate-700">
                  {quiz.attempts}x
                </span>
              </div>
            </div>

            {quiz.bestScore > 0 && (
              <div className="h-1.5 bg-slate-100 rounded-full mb-4">
                <div
                  className={`h-full rounded-full ${
                    quiz.bestScore >= 80 ? "bg-green-500" : "bg-amber-400"
                  }`}
                  style={{ width: `${quiz.bestScore}%` }}
                />
              </div>
            )}

            <button
              onClick={() => startQuiz(quiz)}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              <span>{quiz.attempts > 0 ? "Retake Quiz" : "Start Quiz"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
