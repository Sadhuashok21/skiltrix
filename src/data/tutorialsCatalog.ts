export interface CodeExample {
  title: string
  language: string
  code: string
  explanation: string
  output?: string
}

export interface TryItYourselfTask {
  task: string
  initialCode: string
  solutionCode: string
  expectedOutput?: string
  hints: string[]
  validationType?: "output_match" | "contains_text" | "regex"
}

export interface LessonQuiz {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  xpAward?: number
}

export interface CodingChallengeRef {
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  description: string
  initialCode: string
  testCases?: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>
}

export interface TutorialLessonItem {
  id: string
  slug: string
  title: string
  readingTimeMinutes: number
  order: number
  learningObjectives: string[]
  explanation: string
  syntaxCode?: string
  codeExamples: CodeExample[]
  tryItYourself: TryItYourselfTask
  quiz: LessonQuiz
  challenge?: CodingChallengeRef
}

export interface TutorialModuleItem {
  id: string
  title: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
  description: string
  order: number
  lessons: TutorialLessonItem[]
}

export interface TutorialTrackItem {
  id: string
  title: string
  category: "languages" | "web" | "backend" | "databases" | "computer_science" | "cloud_devops" | "other_tech"
  icon: string
  tagline: string
  description: string
  isFeatured?: boolean
  popularBadge?: string
  order: number
  modules: TutorialModuleItem[]
  projects?: Array<{
    title: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
    description: string
    technologies: string[]
  }>
}

export interface LearningPathItem {
  id: string
  title: string
  badge: string
  description: string
  duration: string
  steps: Array<{
    stepNumber: number
    title: string
    trackId: string
    topics: string[]
  }>
}

// ==============================================================================
// 60+ PROGRAMMING & TECH TRACKS CATALOG
// ==============================================================================

export const TUTORIAL_CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "languages", label: "Programming Languages" },
  { id: "web", label: "Web Development" },
  { id: "backend", label: "Backend Systems" },
  { id: "databases", label: "Databases & SQL" },
  { id: "computer_science", label: "Computer Science" },
  { id: "cloud_devops", label: "Cloud & DevOps" },
  { id: "other_tech", label: "AI & Modern Tech" },
]

export const TUTORIAL_TRACKS: TutorialTrackItem[] = [
  // ─── 1. PROGRAMMING LANGUAGES ──────────────────────────────────────────────
  {
    id: "java",
    title: "Java",
    category: "languages",
    icon: "java",
    tagline: "Enterprise, OOP & Cloud Backend",
    description: "Master Java from fundamentals to OOP, multithreading, collections, streams, and Spring microservices.",
    isFeatured: true,
    popularBadge: "Top Pick",
    order: 1,
    modules: [
      {
        id: "java-intro",
        title: "Java Fundamentals",
        level: "beginner",
        order: 1,
        description: "JVM execution model, syntax structure, variables, operators, and primitive data types.",
        lessons: [
          {
            id: "java-intro-jvm",
            slug: "intro",
            title: "Java Intro & JVM Architecture",
            readingTimeMinutes: 5,
            order: 1,
            learningObjectives: [
              "Understand Java's Write Once, Run Anywhere (WORA) philosophy",
              "Differentiate between JDK, JRE, and JVM",
              "Learn how bytecode executes via the JIT compiler",
              "Write and run your first Java class"
            ],
            explanation: `Java is a class-based, object-oriented language created for platform independence. Unlike native binaries compiled for a single CPU architecture, Java programs compile to standard bytecode (.class) which runs on any system with a Java Virtual Machine (JVM).

### The Three Pillars of Java Execution
1. **JDK (Java Development Kit)**: Complete SDK with compiler (javac), archiver (jar), and tools.
2. **JRE (Java Runtime Environment)**: Libraries and virtual machine needed to run Java apps.
3. **JVM (Java Virtual Machine)**: Translates bytecode into native CPU instructions with JIT compilation and automated garbage collection.

### Structure of a Java Class
Every executable Java program defines a class with a main entry point:
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, SkilTrix!");
    }
}
\`\`\`
- \`public class Main\`: Defines an accessible class. Filename must be \`Main.java\`.
- \`public static void main(String[] args)\`: Execution entry point called by the JVM.
- \`System.out.println(...)\`: Writes standard console output with a trailing newline.`,
            syntaxCode: "public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
            codeExamples: [
              {
                title: "Basic Console Output",
                language: "java",
                code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to SkilTrix Java!");
        System.out.println("Platform Independence in Action.");
    }
}`,
                explanation: "Prints two lines to standard console output.",
                output: "Welcome to SkilTrix Java!\nPlatform Independence in Action."
              }
            ],
            tryItYourself: {
              task: "Modify the program to print 'Hello SkilTrix' on the first line.",
              initialCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
              solutionCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello SkilTrix");
    }
}`,
              expectedOutput: "Hello SkilTrix",
              hints: ["Change the text inside System.out.println(\"...\") to \"Hello SkilTrix\""],
              validationType: "output_match"
            },
            quiz: {
              question: "Which component of the Java platform compiles Java source code (.java) into bytecode (.class)?",
              options: [
                "JVM (Java Virtual Machine)",
                "javac (Java Compiler)",
                "JIT (Just-in-Time Compiler)",
                "Garbage Collector"
              ],
              correctIndex: 1,
              explanation: "javac is the Java compiler that transforms source code into bytecode. The JVM then executes that bytecode."
            },
            challenge: {
              title: "Banner Output",
              difficulty: "Easy",
              description: "Print a 3-line box banner with asterisks.",
              initialCode: `public class Main {
    public static void main(String[] args) {
        // Print banner
    }
}`
            }
          },
          {
            id: "java-variables",
            slug: "variables",
            title: "Java Variables & Primitive Types",
            readingTimeMinutes: 6,
            order: 2,
            learningObjectives: [
              "Declare and initialize strongly typed variables",
              "Understand all 8 primitive types: byte, short, int, long, float, double, char, boolean",
              "Distinguish primitive types from reference types (Strings and Objects)",
              "Perform explicit and implicit type casting"
            ],
            explanation: `Java is strongly typed: every variable must have a declared type before use. Variables allocate storage locations in memory.

### The 8 Java Primitive Types
- **Integers**: \`byte\` (8-bit), \`short\` (16-bit), \`int\` (32-bit), \`long\` (64-bit, suffix \`L\`).
- **Floating Points**: \`float\` (32-bit, suffix \`f\`), \`double\` (64-bit).
- **Characters**: \`char\` (16-bit Unicode, e.g. \`'A'\`).
- **Booleans**: \`boolean\` (\`true\` or \`false\`).

### Strings (Reference Types)
Strings are objects of \`java.lang.String\` and are immutable:
\`\`\`java
String learner = "Ashok";
int xp = 450;
System.out.println(learner + " has " + xp + " XP");
\`\`\``,
            syntaxCode: "dataType variableName = value;",
            codeExamples: [
              {
                title: "Primitives and Strings in Action",
                language: "java",
                code: `public class Main {
    public static void main(String[] args) {
        int studentId = 101;
        double gpa = 3.92;
        char grade = 'A';
        boolean enrolled = true;
        String name = "Priya";

        System.out.println("ID: " + studentId + " | Name: " + name);
        System.out.println("GPA: " + gpa + " (" + grade + ") | Enrolled: " + enrolled);
    }
}`,
                explanation: "Demonstrates multiple variable declarations and string concatenation.",
                output: "ID: 101 | Name: Priya\nGPA: 3.92 (A) | Enrolled: true"
              }
            ],
            tryItYourself: {
              task: "Declare an integer variable `points = 500` and print 'Points: 500'.",
              initialCode: `public class Main {
    public static void main(String[] args) {
        // Declare points and print
    }
}`,
              solutionCode: `public class Main {
    public static void main(String[] args) {
        int points = 500;
        System.out.println("Points: " + points);
    }
}`,
              expectedOutput: "Points: 500",
              hints: ["Write: int points = 500;", "Then: System.out.println(\"Points: \" + points);"],
              validationType: "output_match"
            },
            quiz: {
              question: "What is the default size of an 'int' variable in Java?",
              options: ["8 bits", "16 bits", "32 bits", "64 bits"],
              correctIndex: 2,
              explanation: "In Java, an int is always 32 bits (4 bytes), ranging from -2,147,483,648 to 2,147,483,647."
            }
          },
          {
            id: "java-control-flow",
            slug: "control-flow",
            title: "Control Flow: If...Else & Switch",
            readingTimeMinutes: 7,
            order: 3,
            learningObjectives: [
              "Branch code execution using if, else if, and else",
              "Use logical operators (&&, ||, !)",
              "Implement traditional and modern arrow switch statements"
            ],
            explanation: `Conditional statements allow your programs to evaluate boolean expressions and decide which code paths to execute.

### 1. If-Else Chains
\`\`\`java
int score = 88;
if (score >= 90) {
    System.out.println("Grade A");
} else if (score >= 80) {
    System.out.println("Grade B");
} else {
    System.out.println("Grade C");
}
\`\`\`

### 2. Modern Switch Expressions (Java 14+)
\`\`\`java
int day = 2;
String name = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    default -> "Weekend";
};
\`\`\``,
            syntaxCode: "if (condition) {\n    // code\n} else {\n    // code\n}",
            codeExamples: [
              {
                title: "Conditional Evaluation",
                language: "java",
                code: `public class Main {
    public static void main(String[] args) {
        int age = 20;
        if (age >= 18) {
            System.out.println("Adult - Eligible for driving license");
        } else {
            System.out.println("Minor");
        }
    }
}`,
                explanation: "Checks eligibility condition.",
                output: "Adult - Eligible for driving license"
              }
            ],
            tryItYourself: {
              task: "Check if temperature > 30. If yes, print 'Hot'; otherwise print 'Moderate'. Set temperature to 35.",
              initialCode: `public class Main {
    public static void main(String[] args) {
        int temp = 35;
        // Add if-else
    }
}`,
              solutionCode: `public class Main {
    public static void main(String[] args) {
        int temp = 35;
        if (temp > 30) {
            System.out.println("Hot");
        } else {
            System.out.println("Moderate");
        }
    }
}`,
              expectedOutput: "Hot",
              hints: ["if (temp > 30) { System.out.println(\"Hot\"); } else { System.out.println(\"Moderate\"); }"],
              validationType: "output_match"
            },
            quiz: {
              question: "Which operator represents logical AND in Java?",
              options: ["&", "&&", "AND", "||"],
              correctIndex: 1,
              explanation: "&& is the short-circuit logical AND operator in Java."
            }
          }
        ]
      },
      {
        id: "java-oop",
        title: "Object-Oriented Programming (OOP)",
        level: "intermediate",
        order: 2,
        description: "Classes, objects, constructors, encapsulation, inheritance, polymorphism, and interfaces.",
        lessons: [
          {
            id: "java-classes",
            slug: "classes-and-objects",
            title: "Classes & Objects",
            readingTimeMinutes: 8,
            order: 1,
            learningObjectives: [
              "Define classes as blueprints for state and behavior",
              "Instantiate objects on the heap using new",
              "Implement custom constructors and methods"
            ],
            explanation: `Object-Oriented Programming models real-world entities into software objects. A **Class** is the blueprint; an **Object** is the concrete instance allocated in memory.

### Anatomy of a Class
\`\`\`java
public class Developer {
    // Fields
    String name;
    int experienceYears;

    // Constructor
    public Developer(String name, int experienceYears) {
        this.name = name;
        this.experienceYears = experienceYears;
    }

    // Method
    public void code() {
        System.out.println(name + " has " + experienceYears + " years of coding experience.");
    }
}
\`\`\``,
            syntaxCode: "ClassName obj = new ClassName();",
            codeExamples: [
              {
                title: "Student Object Example",
                language: "java",
                code: `class Student {
    String name;
    int score;

    Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    void show() {
        System.out.println("Student " + name + " scored " + score + "%");
    }
}

public class Main {
    public static void main(String[] args) {
        Student s = new Student("Rohit", 94);
        s.show();
    }
}`,
                explanation: "Demonstrates class definition and method invocation.",
                output: "Student Rohit scored 94%"
              }
            ],
            tryItYourself: {
              task: "Create a Book object with title 'Java Concurrency' and price 45.0, then print 'Java Concurrency - $45.0'.",
              initialCode: `class Book {
    String title;
    double price;
    Book(String t, double p) { title = t; price = p; }
}

public class Main {
    public static void main(String[] args) {
        // Instantiate and print
    }
}`,
              solutionCode: `class Book {
    String title;
    double price;
    Book(String t, double p) { title = t; price = p; }
}

public class Main {
    public static void main(String[] args) {
        Book b = new Book("Java Concurrency", 45.0);
        System.out.println(b.title + " - $" + b.price);
    }
}`,
              expectedOutput: "Java Concurrency - $45.0",
              hints: ["Book b = new Book(\"Java Concurrency\", 45.0);", "System.out.println(b.title + \" - $\" + b.price);"],
              validationType: "output_match"
            },
            quiz: {
              question: "What keyword is used to allocate memory on the heap for a new object in Java?",
              options: ["create", "alloc", "new", "make"],
              correctIndex: 2,
              explanation: "The 'new' keyword dynamically instantiates an object and invokes its constructor."
            }
          }
        ]
      }
    ],
    projects: [
      {
        title: "Bank Account Transaction Engine",
        difficulty: "Intermediate",
        description: "Build an object-oriented banking simulator supporting deposits, withdrawals, interest rates, and audit logs.",
        technologies: ["Java", "OOP", "Encapsulation", "Collections"]
      },
      {
        title: "RESTful Student Management API",
        difficulty: "Advanced",
        description: "Develop a microservice backend managing courses and students with CRUD operations.",
        technologies: ["Java", "Spring Boot", "JPA", "H2 Database"]
      }
    ]
  },

  // ─── 2. PYTHON ─────────────────────────────────────────────────────────────
  {
    id: "python",
    title: "Python",
    category: "languages",
    icon: "python",
    tagline: "Readable, Expressive & Powerful",
    description: "Learn Python from clean syntax to OOP, list comprehensions, data processing, and FastAPI/Django backends.",
    isFeatured: true,
    popularBadge: "Popular",
    order: 2,
    modules: [
      {
        id: "python-basics",
        title: "Python Basics",
        level: "beginner",
        order: 1,
        description: "Indentation, variables, data types, control flow, and functions.",
        lessons: [
          {
            id: "py-intro",
            slug: "intro",
            title: "Python Introduction & Zen of Python",
            readingTimeMinutes: 4,
            order: 1,
            learningObjectives: [
              "Understand Python's interpreted execution model",
              "Learn the core philosophy of PEP 20 (Zen of Python)",
              "Understand indentation-based code blocks"
            ],
            explanation: `Python is an interpreted, high-level, dynamically typed language created by Guido van Rossum. It emphasizes readability and developer productivity.

### Why Python?
- Clean, english-like syntax
- Massive standard library ("Batteries Included")
- Dominant in Backend Development, Data Science, Artificial Intelligence, and Automation.

### Indentation Rules
Python uses 4 spaces for indentation instead of curly braces to delimit blocks of code.`,
            syntaxCode: "print(\"Hello, Python!\")",
            codeExamples: [
              {
                title: "First Python Program",
                language: "python",
                code: `platform = "SkilTrix"
year = 2026
print(f"Welcome to {platform} Python {year}!")`,
                explanation: "Uses Python 3.6+ f-string formatting.",
                output: "Welcome to SkilTrix Python 2026!"
              }
            ],
            tryItYourself: {
              task: "Print 'Python is awesome with SkilTrix!' using print().",
              initialCode: `# Print the greeting here\n`,
              solutionCode: `print("Python is awesome with SkilTrix!")\n`,
              expectedOutput: "Python is awesome with SkilTrix!",
              hints: ["Write print('Python is awesome with SkilTrix!')"],
              validationType: "output_match"
            },
            quiz: {
              question: "What symbol denotes single-line comments in Python?",
              options: ["//", "--", "#", "/*"],
              correctIndex: 2,
              explanation: "# is used for single-line comments in Python."
            }
          },
          {
            id: "py-lists",
            slug: "lists-and-dicts",
            title: "Lists, Tuples & Dictionaries",
            readingTimeMinutes: 6,
            order: 2,
            learningObjectives: [
              "Manipulate ordered, mutable lists",
              "Understand immutable tuples",
              "Store key-value data with dictionaries",
              "Write concise list comprehensions"
            ],
            explanation: `Python provides four built-in collection types:
1. **List (\`[]\`)**: Ordered, mutable, allows duplicates.
2. **Tuple (\`()\`)**: Ordered, **immutable**, allows duplicates.
3. **Dictionary (\`{}\`)**: Key-value pairs with O(1) hash table lookup.
4. **Set (\`set()\`)**: Unordered collection of unique items.

### List Comprehension
\`\`\`python
squares = [x**2 for x in range(6)]  # [0, 1, 4, 9, 16, 25]
\`\`\``,
            syntaxCode: "my_list = [1, 2, 3]\nmy_dict = {'key': 'value'}",
            codeExamples: [
              {
                title: "Dictionary and Comprehension",
                language: "python",
                code: `skills = ["Python", "Django", "SQL", "Docker"]
upper_skills = [s.upper() for s in skills]
print("Skills:", ", ".join(upper_skills))`,
                explanation: "Transforms list elements using list comprehension.",
                output: "Skills: PYTHON, DJANGO, SQL, DOCKER"
              }
            ],
            tryItYourself: {
              task: "Create a list of numbers [10, 20, 30] and print the second item.",
              initialCode: `# Create numbers list and print item at index 1\n`,
              solutionCode: `nums = [10, 20, 30]\nprint(nums[1])\n`,
              expectedOutput: "20",
              hints: ["Python indices start at 0: nums[1] is the second item."],
              validationType: "output_match"
            },
            quiz: {
              question: "Which collection type cannot be modified after creation?",
              options: ["List", "Dictionary", "Tuple", "Set"],
              correctIndex: 2,
              explanation: "Tuples are immutable in Python; their elements cannot be added, removed, or changed."
            }
          }
        ]
      }
    ],
    projects: [
      {
        title: "Automated Web Scraper & Data Pipeline",
        difficulty: "Intermediate",
        description: "Fetch real-time data, parse structured records, and save to SQLite.",
        technologies: ["Python", "BeautifulSoup", "SQLite", "Requests"]
      }
    ]
  },

  // ─── 3. JAVASCRIPT & TYPESCRIPT ────────────────────────────────────────────
  {
    id: "javascript",
    title: "JavaScript",
    category: "languages",
    icon: "javascript",
    tagline: "The Core Language of the Web",
    description: "Understand ES6+, async/await, closures, promises, DOM manipulation, and modern web development.",
    isFeatured: true,
    popularBadge: "Essential",
    order: 3,
    modules: [
      {
        id: "js-fundamentals",
        title: "JavaScript ES6+ Essentials",
        level: "beginner",
        order: 1,
        description: "Variables, arrow functions, destructuring, and async programming.",
        lessons: [
          {
            id: "js-scope",
            slug: "variables-and-scope",
            title: "Variables, Scope & Arrow Functions",
            readingTimeMinutes: 5,
            order: 1,
            learningObjectives: [
              "Understand differences between const, let, and var",
              "Master block scoping",
              "Write concise arrow functions with lexical this"
            ],
            explanation: `Modern JavaScript uses \`const\` and \`let\` for predictable block-scoped declarations.

### Arrow Functions
\`\`\`javascript
// Traditional
function multiply(a, b) {
    return a * b;
}

// Arrow function
const multiply = (a, b) => a * b;
\`\`\``,
            syntaxCode: "const value = 42;\nlet counter = 0;",
            codeExamples: [
              {
                title: "Array Methods with Arrow Functions",
                language: "javascript",
                code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled.join(", "));`,
                explanation: "Uses Array.prototype.map with arrow function.",
                output: "Doubled: 2, 4, 6, 8, 10"
              }
            ],
            tryItYourself: {
              task: "Create an arrow function `square` that returns n * n. Call and print `square(6)`.",
              initialCode: `// Write square function and log square(6)\n`,
              solutionCode: `const square = n => n * n;\nconsole.log(square(6));\n`,
              expectedOutput: "36",
              hints: ["const square = n => n * n;", "console.log(square(6));"],
              validationType: "output_match"
            },
            quiz: {
              question: "What is the key difference between const and let in JavaScript?",
              options: [
                "const is function-scoped while let is block-scoped",
                "const variables cannot be reassigned; let variables can",
                "let cannot hold numbers",
                "const is hoisted to window, let is not"
              ],
              correctIndex: 1,
              explanation: "const creates a read-only reference that cannot be reassigned; let allows reassignment."
            }
          }
        ]
      }
    ]
  },

  {
    id: "typescript",
    title: "TypeScript",
    category: "languages",
    icon: "typescript",
    tagline: "Typed JavaScript at Scale",
    description: "Add static types, interfaces, generics, union types, and compile-time guarantees to JavaScript.",
    isFeatured: true,
    order: 4,
    modules: [
      {
        id: "ts-basics",
        title: "TypeScript Foundations",
        level: "intermediate",
        order: 1,
        description: "Static typing, interfaces, type aliases, and generics.",
        lessons: [
          {
            id: "ts-types-interfaces",
            slug: "types-and-interfaces",
            title: "Types, Interfaces & Generics",
            readingTimeMinutes: 6,
            order: 1,
            learningObjectives: [
              "Define interfaces for object contracts",
              "Understand union and intersection types",
              "Build reusable code with generics"
            ],
            explanation: `TypeScript adds a static type system over JavaScript that compiles away at runtime.

\`\`\`typescript
interface UserProfile {
    id: number;
    username: string;
    isActive: boolean;
    role?: "admin" | "learner";
}
\`\`\``,
            syntaxCode: "interface User {\n  id: string;\n  name: string;\n}",
            codeExamples: [
              {
                title: "Generic Function Example",
                language: "typescript",
                code: `function wrapInBox<T>(item: T): { value: T; timestamp: number } {
    return { value: item, timestamp: 2026 };
}
const boxed = wrapInBox("SkilTrix");
console.log(boxed.value, boxed.timestamp);`,
                explanation: "Demonstrates TypeScript generic parameter <T>.",
                output: "SkilTrix 2026"
              }
            ],
            tryItYourself: {
              task: "Create a typed constant `course: string = 'TypeScript'` and print it.",
              initialCode: `// Write typed variable\n`,
              solutionCode: `const course: string = "TypeScript";\nconsole.log(course);\n`,
              expectedOutput: "TypeScript",
              hints: ["const course: string = 'TypeScript';", "console.log(course);"],
              validationType: "output_match"
            },
            quiz: {
              question: "What happens to TypeScript type annotations after compilation to JavaScript?",
              options: [
                "They are turned into runtime validations",
                "They are completely erased",
                "They are stored in JSON schemas",
                "They become comments in the HTML"
              ],
              correctIndex: 1,
              explanation: "TypeScript types are purely compile-time constructs and are completely erased during compilation."
            }
          }
        ]
      }
    ]
  },

  // ─── 4. WEB DEVELOPMENT ───────────────────────────────────────────────────
  {
    id: "html",
    title: "HTML5",
    category: "web",
    icon: "html",
    tagline: "The Skeleton of the Web",
    description: "Semantic elements, forms, multimedia, accessible markup, and modern SEO structures.",
    isFeatured: false,
    order: 5,
    modules: [
      {
        id: "html-basics",
        title: "HTML5 Fundamentals",
        level: "beginner",
        order: 1,
        description: "Doctype, head, body, headings, semantic tags, and forms.",
        lessons: [
          {
            id: "html-semantic",
            slug: "semantic-elements",
            title: "Semantic HTML & Accessibility",
            readingTimeMinutes: 5,
            order: 1,
            learningObjectives: [
              "Structure web pages with header, nav, main, article, section, footer",
              "Improve accessibility (a11y) and SEO",
              "Organize content hierarchy properly"
            ],
            explanation: `Semantic HTML tags convey meaning to both browsers and assistive screen readers.

### Common Semantic Elements
- \`<header>\`: Introductory content or navigation.
- \`<nav>\`: Set of navigation links.
- \`<main>\`: Dominant content of the document body.
- \`<section>\`: Standalone thematic section.
- \`<article>\`: Self-contained independent composition.
- \`<footer>\`: Author, copyright, or contact footer.`,
            syntaxCode: "<article>\n  <h2>Title</h2>\n  <p>Content</p>\n</article>",
            codeExamples: [
              {
                title: "Semantic Document Structure",
                language: "html",
                code: `<header>
  <h1>SkilTrix Learning</h1>
</header>
<main>
  <article>
    <h2>Learn Semantic HTML</h2>
    <p>Semantic tags improve accessibility and search engine ranking.</p>
  </article>
</main>`,
                explanation: "Clean semantic markup without generic div soup.",
                output: "HTML document rendered successfully."
              }
            ],
            tryItYourself: {
              task: "Create an h1 tag with 'Welcome to SkilTrix'.",
              initialCode: `<!-- Add h1 here -->\n`,
              solutionCode: `<h1>Welcome to SkilTrix</h1>\n`,
              expectedOutput: "Welcome to SkilTrix",
              hints: ["Write <h1>Welcome to SkilTrix</h1>"],
              validationType: "contains_text"
            },
            quiz: {
              question: "Which tag should be used for the primary unique content of a web page?",
              options: ["<content>", "<main>", "<section>", "<div>"],
              correctIndex: 1,
              explanation: "<main> represents the dominant content of the <body> of a document."
            }
          }
        ]
      }
    ]
  },

  {
    id: "css",
    title: "CSS3 & Modern Layouts",
    category: "web",
    icon: "css",
    tagline: "Styling, Flexbox, Grid & Animations",
    description: "Master modern CSS, Flexbox, CSS Grid, media queries, animations, and custom properties.",
    isFeatured: false,
    order: 6,
    modules: [
      {
        id: "css-layout",
        title: "Modern Layouts: Flexbox & Grid",
        level: "beginner",
        order: 1,
        description: "1D layout with Flexbox and 2D layout with CSS Grid.",
        lessons: [
          {
            id: "css-flexbox",
            slug: "flexbox",
            title: "CSS Flexbox in Depth",
            readingTimeMinutes: 6,
            order: 1,
            learningObjectives: [
              "Master flex-direction, justify-content, and align-items",
              "Align items along main axis and cross axis",
              "Build responsive navbar and card layouts"
            ],
            explanation: `Flexbox is designed for 1-dimensional layouts (either a row or a column).

\`\`\`css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}
\`\`\``,
            syntaxCode: ".box {\n  display: flex;\n  justify-content: center;\n}",
            codeExamples: [
              {
                title: "Centered Card with Flexbox",
                language: "css",
                code: `.center-card {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: #1e293b;
  color: #f8fafc;
  border-radius: 12px;
}`,
                explanation: "Centers children horizontally and vertically.",
                output: "Flexbox rules compiled."
              }
            ],
            tryItYourself: {
              task: "Set display to flex and justify-content to center.",
              initialCode: `.container {\n  /* Add rules */\n}`,
              solutionCode: `.container {\n  display: flex;\n  justify-content: center;\n}`,
              expectedOutput: "display: flex",
              hints: ["display: flex;", "justify-content: center;"],
              validationType: "contains_text"
            },
            quiz: {
              question: "Which CSS property aligns flex items along the cross axis?",
              options: ["justify-content", "align-items", "flex-direction", "order"],
              correctIndex: 1,
              explanation: "align-items controls positioning on the cross axis (perpendicular to main axis)."
            }
          }
        ]
      }
    ]
  },

  {
    id: "react",
    title: "React",
    category: "web",
    icon: "react",
    tagline: "Declarative, Component-Based UI",
    description: "Component hierarchy, hooks, state machines, context, routing, and modern React 19 features.",
    isFeatured: true,
    popularBadge: "Essential",
    order: 7,
    modules: [
      {
        id: "react-core",
        title: "React Components & State",
        level: "intermediate",
        order: 1,
        description: "JSX, props, useState, useEffect, and component composition.",
        lessons: [
          {
            id: "react-state",
            slug: "state-and-hooks",
            title: "React State & Lifecycle with Hooks",
            readingTimeMinutes: 7,
            order: 1,
            learningObjectives: [
              "Understand virtual DOM reconciliation",
              "Manage state with useState",
              "Trigger side-effects with useEffect"
            ],
            explanation: `In React, user interfaces are declarative functions of state: \`UI = f(State)\`.

\`\`\`jsx
import { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0);
    return (
        <button onClick={() => setCount(c => c + 1)}>
            Count: {count}
        </button>
    );
}
\`\`\``,
            syntaxCode: "const [state, setState] = useState(initial);",
            codeExamples: [
              {
                title: "Functional Component with State",
                language: "javascript",
                code: `function Badge({ text }) {
  return <span className="badge">{text}</span>;
}
console.log("Badge component defined successfully.");`,
                explanation: "Standard React JSX pattern.",
                output: "Badge component defined successfully."
              }
            ],
            tryItYourself: {
              task: "Create a function returning a greeting object with platform 'SkilTrix' and print it.",
              initialCode: `// Return greeting object\n`,
              solutionCode: `const getInfo = () => ({ platform: "SkilTrix" });\nconsole.log(getInfo().platform);\n`,
              expectedOutput: "SkilTrix",
              hints: ["console.log('SkilTrix');"],
              validationType: "output_match"
            },
            quiz: {
              question: "Why should you never mutate state directly in React (e.g. state.count++)?",
              options: [
                "It causes a syntax error",
                "React will not trigger a re-render because it checks reference equality",
                "Browsers don't support objects in React",
                "State gets converted to null"
              ],
              correctIndex: 1,
              explanation: "React relies on setter functions and immutable updates to trigger its reconciliation cycle."
            }
          }
        ]
      }
    ]
  },

  // ─── 5. DATABASES & SQL ────────────────────────────────────────────────────
  {
    id: "sql",
    title: "SQL & Databases",
    category: "databases",
    icon: "sql",
    tagline: "Relational Queries & Schema Design",
    description: "Write complex joins, aggregations, window functions, indexes, and transactions.",
    isFeatured: true,
    popularBadge: "High Demand",
    order: 8,
    modules: [
      {
        id: "sql-queries",
        title: "SQL Querying & Joins",
        level: "beginner",
        order: 1,
        description: "SELECT, WHERE, GROUP BY, HAVING, and relational JOIN operations.",
        lessons: [
          {
            id: "sql-joins",
            slug: "joins-and-aggregations",
            title: "Relational Joins & Aggregations",
            readingTimeMinutes: 6,
            order: 1,
            learningObjectives: [
              "Perform INNER, LEFT, and RIGHT joins",
              "Filter records with WHERE and HAVING",
              "Compute summary metrics using COUNT, SUM, AVG"
            ],
            explanation: `Relational databases link information across normalized tables via foreign keys.

\`\`\`sql
SELECT 
    c.name, 
    COUNT(o.id) AS total_orders, 
    SUM(o.amount) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
HAVING COUNT(o.id) > 1
ORDER BY total_spent DESC;
\`\`\``,
            syntaxCode: "SELECT columns FROM table1 JOIN table2 ON table1.id = table2.t1_id;",
            codeExamples: [
              {
                title: "Basic SELECT with Aliases",
                language: "sql",
                code: `SELECT 'SkilTrix' AS platform, 2026 AS year, 'Online' AS status;`,
                explanation: "Row projection with column aliases.",
                output: "platform: SkilTrix | year: 2026 | status: Online"
              }
            ],
            tryItYourself: {
              task: "Write an SQL query that selects 'SkilTrix SQL' as title.",
              initialCode: `-- Write SQL query here\n`,
              solutionCode: `SELECT 'SkilTrix SQL' AS title;\n`,
              expectedOutput: "SkilTrix SQL",
              hints: ["SELECT 'SkilTrix SQL' AS title;"],
              validationType: "output_match"
            },
            quiz: {
              question: "What is the difference between WHERE and HAVING in SQL?",
              options: [
                "WHERE is for numbers; HAVING is for strings",
                "WHERE filters rows before grouping; HAVING filters aggregated groups",
                "HAVING is only used with SQLite",
                "WHERE requires an index; HAVING does not"
              ],
              correctIndex: 1,
              explanation: "WHERE filters rows prior to GROUP BY aggregation; HAVING filters the groups produced by GROUP BY."
            }
          }
        ]
      }
    ]
  },

  // ─── 6. OTHER MAJOR TRACKS ────────────────────────────────────────────────
  {
    id: "cpp",
    title: "C++",
    category: "languages",
    icon: "cpp",
    tagline: "High Performance & Systems Engineering",
    description: "Pointers, memory management, templates, STL, modern C++20, and low-latency systems.",
    isFeatured: false,
    order: 9,
    modules: [
      {
        id: "cpp-basics",
        title: "C++ Fundamentals",
        level: "beginner",
        order: 1,
        description: "Streams, pointers, references, and memory allocation.",
        lessons: [
          {
            id: "cpp-intro",
            slug: "intro",
            title: "C++ Introduction & Pointers",
            readingTimeMinutes: 6,
            order: 1,
            learningObjectives: [
              "Understand compilation and linking in C++",
              "Differentiate between stack and heap memory",
              "Work with pointers and references"
            ],
            explanation: `C++ is a compiled, statically typed language that offers fine-grained control over hardware memory while supporting modern object-oriented and generic paradigms.`,
            syntaxCode: "#include <iostream>\nint main() {\n    std::cout << \"Hello!\" << std::endl;\n    return 0;\n}",
            codeExamples: [
              {
                title: "Hello C++",
                language: "cpp",
                code: `#include <iostream>
int main() {
    std::cout << "Hello from SkilTrix C++!" << std::endl;
    return 0;
}`,
                explanation: "Standard C++ stream output.",
                output: "Hello from SkilTrix C++!"
              }
            ],
            tryItYourself: {
              task: "Print 'SkilTrix C++' using std::cout.",
              initialCode: `#include <iostream>\nint main() {\n    // Print here\n    return 0;\n}`,
              solutionCode: `#include <iostream>\nint main() {\n    std::cout << "SkilTrix C++" << std::endl;\n    return 0;\n}`,
              expectedOutput: "SkilTrix C++",
              hints: ["std::cout << \"SkilTrix C++\" << std::endl;"],
              validationType: "output_match"
            },
            quiz: {
              question: "What operator is used to get the memory address of a variable in C++?",
              options: ["*", "&", "->", "@"],
              correctIndex: 1,
              explanation: "The ampersand '&' is the address-of operator."
            }
          }
        ]
      }
    ]
  },

  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    category: "computer_science",
    icon: "code",
    tagline: "Coding Interviews & Problem Solving",
    description: "Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, Big-O notation, and interview patterns.",
    isFeatured: true,
    popularBadge: "Career Essential",
    order: 10,
    modules: [
      {
        id: "dsa-big-o",
        title: "Complexity & Array Patterns",
        level: "beginner",
        order: 1,
        description: "Time & Space complexity, two pointers, and sliding window.",
        lessons: [
          {
            id: "dsa-complexity",
            slug: "big-o-notation",
            title: "Big-O Notation & Asymptotic Analysis",
            readingTimeMinutes: 7,
            order: 1,
            learningObjectives: [
              "Classify algorithms by Big-O time and space complexity",
              "Understand O(1), O(log n), O(n), O(n log n), and O(n²)",
              "Evaluate best, average, and worst-case performance"
            ],
            explanation: `Big-O notation describes the limiting behavior of a function as input size (N) grows towards infinity.

### Common Complexity Classes
- **O(1)**: Constant time (e.g. Hash map lookup, array indexing).
- **O(log N)**: Logarithmic time (e.g. Binary search on sorted array).
- **O(N)**: Linear time (e.g. Single pass through an array).
- **O(N log N)**: Linearithmic time (e.g. Merge sort, Quick sort average).
- **O(N²)**: Quadratic time (e.g. Nested loops, Bubble sort).`,
            syntaxCode: "// Time: O(N) | Space: O(1)",
            codeExamples: [
              {
                title: "Two Pointers Technique",
                language: "javascript",
                code: `// Reverse array in-place O(N) time, O(1) extra space
function reverseArray(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  return arr;
}
console.log(reverseArray([1, 2, 3, 4, 5]).join(", "));`,
                explanation: "In-place array reversal using two pointers.",
                output: "5, 4, 3, 2, 1"
              }
            ],
            tryItYourself: {
              task: "Write a function returning the length of an array and print length of [1, 2, 3, 4, 5].",
              initialCode: `const arr = [1, 2, 3, 4, 5];\nconsole.log(arr.length);\n`,
              solutionCode: `const arr = [1, 2, 3, 4, 5];\nconsole.log(arr.length);\n`,
              expectedOutput: "5",
              hints: ["console.log(arr.length);"],
              validationType: "output_match"
            },
            quiz: {
              question: "What is the average time complexity of searching in a balanced Binary Search Tree (BST)?",
              options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
              correctIndex: 1,
              explanation: "Each comparison cuts the search space in half, resulting in O(log N) time."
            }
          }
        ]
      }
    ]
  },

  {
    id: "linux",
    title: "Linux & Shell Scripting",
    category: "cloud_devops",
    icon: "terminal",
    tagline: "Server Administration & CLI Mastery",
    description: "Commands, file permissions, Bash scripting, process management, SSH, and server configuration.",
    isFeatured: false,
    order: 11,
    modules: [
      {
        id: "linux-cli",
        title: "Linux Command Line",
        level: "beginner",
        order: 1,
        description: "Navigation, file operations, permissions, and grep.",
        lessons: [
          {
            id: "linux-permissions",
            slug: "file-permissions",
            title: "Linux File Permissions & Chmod",
            readingTimeMinutes: 5,
            order: 1,
            learningObjectives: [
              "Understand User, Group, and Other permission categories",
              "Decode permission bits (r=4, w=2, x=1)",
              "Use chmod and chown commands safely"
            ],
            explanation: `In Linux, every file and directory has 3 sets of permissions:
1. **User (Owner)**
2. **Group**
3. **Others**

Permissions are represented by:
- **r (read)**: 4
- **w (write)**: 2
- **x (execute)**: 1

For example, \`chmod 755 script.sh\` gives:
- Owner: 7 (4+2+1 = rwx)
- Group: 5 (4+1 = r-x)
- Others: 5 (4+1 = r-x)`,
            syntaxCode: "chmod 755 filename.sh",
            codeExamples: [
              {
                title: "Permission Breakdown",
                language: "bash",
                code: `echo "Script execution permission granted: chmod +x deploy.sh"`,
                explanation: "Grants execute permissions to all users.",
                output: "Script execution permission granted: chmod +x deploy.sh"
              }
            ],
            tryItYourself: {
              task: "Echo 'Linux rocks with SkilTrix'.",
              initialCode: `echo "Linux rocks with SkilTrix"\n`,
              solutionCode: `echo "Linux rocks with SkilTrix"\n`,
              expectedOutput: "Linux rocks with SkilTrix",
              hints: ["echo \"Linux rocks with SkilTrix\""],
              validationType: "output_match"
            },
            quiz: {
              question: "What numeric chmod value represents read, write, and execute for the owner, and read-only for everyone else?",
              options: ["777", "744", "644", "755"],
              correctIndex: 1,
              explanation: "Owner: 4+2+1=7; Group: 4; Others: 4 => 744."
            }
          }
        ]
      }
    ]
  },

  {
    id: "git",
    title: "Git & GitHub",
    category: "cloud_devops",
    icon: "git",
    tagline: "Version Control & Team Collaboration",
    description: "Branching strategies, merging, rebasing, pull requests, resolving merge conflicts, and CI/CD.",
    isFeatured: false,
    order: 12,
    modules: [
      {
        id: "git-basics",
        title: "Git Version Control",
        level: "beginner",
        order: 1,
        description: "git init, commit, branch, merge, and remote repositories.",
        lessons: [
          {
            id: "git-branching",
            slug: "branching-and-merging",
            title: "Git Branching & Pull Requests",
            readingTimeMinutes: 5,
            order: 1,
            learningObjectives: [
              "Create and switch feature branches",
              "Understand fast-forward vs 3-way merge",
              "Open and review GitHub Pull Requests"
            ],
            explanation: `Branches allow developers to diverge from the main production line of development to work on features or bug fixes without affecting the stable codebase.`,
            syntaxCode: "git checkout -b feature/new-module",
            codeExamples: [
              {
                title: "Creating a Branch",
                language: "bash",
                code: `git checkout -b feature/auth-flow
git add .
git commit -m "feat: implement JWT token exchange"
git push origin feature/auth-flow`,
                explanation: "Standard Git feature development lifecycle.",
                output: "Branch pushed to origin."
              }
            ],
            tryItYourself: {
              task: "Print 'git status clean'.",
              initialCode: `console.log("git status clean");\n`,
              solutionCode: `console.log("git status clean");\n`,
              expectedOutput: "git status clean",
              hints: ["console.log('git status clean');"],
              validationType: "output_match"
            },
            quiz: {
              question: "Which Git command switches to an existing branch named 'dev'?",
              options: [
                "git switch dev (or git checkout dev)",
                "git branch dev",
                "git pull dev",
                "git move dev"
              ],
              correctIndex: 0,
              explanation: "git switch dev (or git checkout dev) switches the active working tree to that branch."
            }
          }
        ]
      }
    ]
  }
]

// ==============================================================================
// STRUCTURED LEARNING PATHS
// ==============================================================================

export const LEARNING_PATHS: LearningPathItem[] = [
  {
    id: "java-developer",
    title: "Java Developer Career Path",
    badge: "Enterprise Ready",
    description: "From syntax fundamentals to Spring Boot microservices, multithreading, and system architecture.",
    duration: "12 Weeks (120 Hours)",
    steps: [
      { stepNumber: 1, title: "Java Core & Syntax", trackId: "java", topics: ["Variables", "Data Types", "Loops", "Methods"] },
      { stepNumber: 2, title: "OOP Architecture", trackId: "java", topics: ["Classes", "Inheritance", "Polymorphism", "Interfaces"] },
      { stepNumber: 3, title: "Collections & Streams", trackId: "java", topics: ["List/Map/Set", "Lambda", "Stream API"] },
      { stepNumber: 4, title: "Concurrency & Multithreading", trackId: "java", topics: ["Threads", "Executors", "Synchronization"] },
      { stepNumber: 5, title: "Relational Databases", trackId: "sql", topics: ["SQL Queries", "Joins", "Transactions", "JDBC"] },
      { stepNumber: 6, title: "Spring Boot Microservices", trackId: "backend", topics: ["REST APIs", "JPA", "Spring Security"] }
    ]
  },
  {
    id: "python-developer",
    title: "Python Developer Career Path",
    badge: "High Demand",
    description: "Complete roadmap covering Python fundamentals, OOP, data processing, and FastAPI/Django APIs.",
    duration: "10 Weeks (100 Hours)",
    steps: [
      { stepNumber: 1, title: "Python Basics", trackId: "python", topics: ["Variables", "Conditionals", "Functions", "Modules"] },
      { stepNumber: 2, title: "Data Structures", trackId: "python", topics: ["Lists", "Tuples", "Dictionaries", "Comprehensions"] },
      { stepNumber: 3, title: "Object-Oriented Python", trackId: "python", topics: ["Classes", "Dunder Methods", "Inheritance"] },
      { stepNumber: 4, title: "Backend Web Frameworks", trackId: "backend", topics: ["Django", "FastAPI", "REST Architecture"] },
      { stepNumber: 5, title: "Databases & ORM", trackId: "databases", topics: ["PostgreSQL", "SQLAlchemy", "Django ORM"] }
    ]
  },
  {
    id: "full-stack-developer",
    title: "Full Stack Engineer Career Path",
    badge: "Most Comprehensive",
    description: "HTML, CSS, modern JavaScript, TypeScript, React, Node.js, SQL, and cloud deployment.",
    duration: "16 Weeks (160 Hours)",
    steps: [
      { stepNumber: 1, title: "Web Foundations", trackId: "html", topics: ["HTML5", "CSS3", "Flexbox", "Responsive Design"] },
      { stepNumber: 2, title: "JavaScript Programming", trackId: "javascript", topics: ["ES6+", "Async/Await", "DOM", "Promises"] },
      { stepNumber: 3, title: "Frontend with React", trackId: "react", topics: ["Components", "Hooks", "Context", "Routing"] },
      { stepNumber: 4, title: "TypeScript Integration", trackId: "typescript", topics: ["Interfaces", "Generics", "Type Safety"] },
      { stepNumber: 5, title: "Backend & Databases", trackId: "sql", topics: ["Node.js", "Express", "PostgreSQL", "REST APIs"] },
      { stepNumber: 6, title: "DevOps & Cloud", trackId: "cloud_devops", topics: ["Git", "Docker", "Linux", "Deployment"] }
    ]
  }
]

