import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Code2, Play, BookOpen, Bug, CheckCircle2, ArrowRight, Layers, Sparkles, Terminal } from "lucide-react"

interface TutorialChapter {
  id: string
  title: string
  category: "Fundamentals" | "Django REST Framework" | "ORM & Models" | "Debugging"
  description: string
  codeSnippet: string
  explanation: string
}

const CHAPTERS: TutorialChapter[] = [
  {
    id: "drf-serializers",
    title: "DRF ModelSerializers & Validation",
    category: "Django REST Framework",
    description: "Learn how to build secure, robust ModelSerializers with custom validation logic in Django REST Framework.",
    codeSnippet: `from rest_framework import serializers
from .models import Course, Enrollment

class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'price', 'is_paid', 'enrolled_count']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Course price cannot be negative.")
        return value`,
    explanation: "ModelSerializers automatically generate fields from the underlying Django model and handle field-level and object-level validation gracefully.",
  },
  {
    id: "orm-n-plus-one",
    title: "Optimizing Queries: select_related & prefetch_related",
    category: "ORM & Models",
    description: "Eliminate N+1 database bottlenecks by pre-fetching foreign keys and many-to-many relationships in a single database round-trip.",
    codeSnippet: `# BAD: Causes N+1 database queries
courses = Course.objects.all()
for c in courses:
    print(c.instructor.name)

# GOOD: Single JOIN query via select_related
optimized_courses = Course.objects.select_related('instructor').prefetch_related('modules__lessons').all()
for c in optimized_courses:
    print(c.instructor.name)`,
    explanation: "select_related performs an SQL JOIN on ForeignKey/OneToOne, while prefetch_related does separate batch lookups for M2M and reverse relationships.",
  },
  {
    id: "backend-debugging-500",
    title: "Debugging 500 Errors: Missing Attributes & NoneType",
    category: "Debugging",
    description: "Trace and resolve common Django production bugs including AttributeError, DoesNotExist exceptions, and serializer context errors.",
    codeSnippet: `class ProductDetailView(APIView):
    def get(self, request, pk):
        # FIX: Use get_object_or_404 or catch DoesNotExist explicitly
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductSerializer(product, context={'request': request})
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )`,
    explanation: "Uncaught exceptions crash with HTTP 500. Wrapping queries with get_object_or_404 or explicit exception handlers ensures clean HTTP responses.",
  },
]

export default function DjangoTutorials() {
  const [selectedChapter, setSelectedChapter] = useState<TutorialChapter>(CHAPTERS[0])

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Code2 className="w-3.5 h-3.5" />
              Backend Mastery
            </span>
            <span className="text-xs text-slate-400">Django 5 · DRF · Production Architecture</span>
          </div>
          <h1
            className="text-3xl font-extrabold text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Django & Backend Tutorials
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Master real-world Django, API design, database query optimization, and production backend debugging.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/codelab"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-white" />
            Launch CodeLab
          </Link>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
          >
            Backend Debugging Problems
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Essential Chapters
          </div>
          {CHAPTERS.map((chap) => {
            const isSelected = chap.id === selectedChapter.id
            return (
              <div
                key={chap.id}
                onClick={() => setSelectedChapter(chap)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-indigo-50/50 border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {chap.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">{chap.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{chap.description}</p>
              </div>
            )
          })}
        </div>

        <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
              {selectedChapter.category}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedChapter.title}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedChapter.description}</p>
          </div>

          <div className="p-4 bg-slate-950 font-mono text-xs text-emerald-300 overflow-x-auto">
            <div className="text-slate-500 mb-2 font-sans text-[11px] uppercase tracking-wider font-bold">
              Code Pattern & Architecture:
            </div>
            <pre className="leading-relaxed whitespace-pre">{selectedChapter.codeSnippet}</pre>
          </div>

          <div className="p-5 border-t border-slate-100 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700 mb-1">Architecture Note</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{selectedChapter.explanation}</p>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Bug className="w-4 h-4 text-rose-500" />
              <span>Practice realistic backend debugging assessments in CodeLab</span>
            </div>
            <Link
              to="/codelab"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Open in CodeLab
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
