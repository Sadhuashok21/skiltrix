export interface InterviewQuestion {
  id: string
  topic: string
  difficulty: string
  question: string
  shortAnswer: string
  explanation?: string
  code?: string
  tags?: string[]
  frequentCompanies?: string[]
}

export const DEFAULT_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // --- PYTHON ---
  {
    id: "py-1",
    topic: "Python",
    difficulty: "Easy",
    question: "What is the difference between a List and a Tuple in Python?",
    shortAnswer: "Lists are mutable (can be changed after creation), while tuples are immutable (read-only).",
    explanation: "Lists use square brackets `[]` and support methods like `.append()` and `.pop()`. Tuples use parentheses `()` and are hashable (can be used as dictionary keys) and more memory-efficient.",
    code: `# List (Mutable)\nmy_list = [1, 2, 3]\nmy_list.append(4)\n\n# Tuple (Immutable)\nmy_tuple = (1, 2, 3)\n# my_tuple[0] = 99 -> Raises TypeError`,
    tags: ["python", "data-structures", "core"],
    frequentCompanies: ["Google", "Amazon", "TCS", "Infosys"],
  },
  {
    id: "py-2",
    topic: "Python",
    difficulty: "Medium",
    question: "What is the Global Interpreter Lock (GIL) in CPython?",
    shortAnswer: "A mutex that allows only one thread to hold the control of the Python interpreter at any time.",
    explanation: "The GIL prevents multi-threaded CPython programs from executing pure Python bytecode across multiple CPU cores simultaneously. For CPU-bound tasks, multiprocessing or C extensions are preferred.",
    code: `import threading\n\n# For I/O bound tasks, threading is still great!\n# For CPU-bound tasks, use multiprocessing:\nfrom multiprocessing import Pool\n\nwith Pool() as p:\n    results = p.map(abs, [-1, -2, -3])`,
    tags: ["python", "concurrency", "gil"],
    frequentCompanies: ["Meta", "Microsoft", "Uber"],
  },
  {
    id: "py-3",
    topic: "Python",
    difficulty: "Medium",
    question: "How do Generators and the `yield` keyword work in Python?",
    shortAnswer: "Generators produce items lazily on-demand without storing the entire sequence in memory.",
    explanation: "`yield` pauses the function execution, returning the current value to the caller and saving state so execution resumes immediately after `yield` on the next call to `next()`.",
    code: `def count_up(n):\n    val = 1\n    while val <= n:\n        yield val\n        val += 1\n\nfor num in count_up(3):\n    print(num)  # 1, 2, 3`,
    tags: ["python", "memory", "iterators"],
    frequentCompanies: ["Amazon", "Flipkart", "Accenture"],
  },

  // --- JAVASCRIPT ---
  {
    id: "js-1",
    topic: "JavaScript",
    difficulty: "Easy",
    question: "What is the difference between `var`, `let`, and `const`?",
    shortAnswer: "`var` is function-scoped and hoisted; `let` and `const` are block-scoped and exist in the Temporal Dead Zone until declared.",
    explanation: "`const` prevents reassignment of the variable identifier. `let` permits reassignment. Neither is attached to the global object (`window`) in modules.",
    code: `let x = 10;\nx = 20; // Allowed\n\nconst y = 30;\n// y = 40; // TypeError: Assignment to constant variable`,
    tags: ["javascript", "es6", "scoping"],
    frequentCompanies: ["Amazon", "Cognizant", "Wipro"],
  },
  {
    id: "js-2",
    topic: "JavaScript",
    difficulty: "Medium",
    question: "What is a Closure in JavaScript and what is it used for?",
    shortAnswer: "A function bundled together with references to its surrounding lexical environment.",
    explanation: "A closure gives an inner function access to an outer function's scope even after the outer function has finished executing. It is used for data privacy, currying, and callbacks.",
    code: `function createCounter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2`,
    tags: ["javascript", "closures", "functions"],
    frequentCompanies: ["Google", "Swiggy", "Microsoft"],
  },
  {
    id: "js-3",
    topic: "JavaScript",
    difficulty: "Hard",
    question: "Explain the JavaScript Event Loop (Microtasks vs Macrotasks).",
    shortAnswer: "The event loop coordinates call stack execution, clearing the microtask queue before picking the next macrotask.",
    explanation: "Promises and `queueMicrotask` schedule microtasks which run immediately after current synchronous code. `setTimeout`, `setInterval`, and I/O schedule macrotasks.",
    code: `console.log("1");\nsetTimeout(() => console.log("4 (Macro)"), 0);\nPromise.resolve().then(() => console.log("3 (Micro)"));\nconsole.log("2");\n// Output order: 1, 2, 3, 4`,
    tags: ["javascript", "event-loop", "async"],
    frequentCompanies: ["Uber", "Netflix", "Atlassian"],
  },

  // --- JAVA ---
  {
    id: "java-1",
    topic: "Java",
    difficulty: "Easy",
    question: "What are the four fundamental pillars of Object-Oriented Programming in Java?",
    shortAnswer: "Encapsulation, Inheritance, Polymorphism, and Abstraction.",
    explanation: "Encapsulation hides internal state via private fields and public accessors. Inheritance allows classes to acquire attributes of a parent. Polymorphism provides method overriding/overloading. Abstraction simplifies complex systems via interfaces and abstract classes.",
    code: `public abstract class Animal {\n    private String name;\n    public abstract void speak(); // Abstraction\n}\npublic class Dog extends Animal { // Inheritance\n    @Override\n    public void speak() { System.out.println("Woof"); } // Polymorphism\n}`,
    tags: ["java", "oop", "architecture"],
    frequentCompanies: ["Oracle", "TCS", "Infosys", "Capgemini"],
  },
  {
    id: "java-2",
    topic: "Java",
    difficulty: "Medium",
    question: "What is the difference between String, StringBuilder, and StringBuffer?",
    shortAnswer: "String is immutable; StringBuilder is mutable and non-thread-safe; StringBuffer is mutable and thread-safe (synchronized).",
    explanation: "Modifying a `String` creates a new object in the String Constant Pool. `StringBuilder` is fastest for single-threaded string concatenation. `StringBuffer` provides thread-safety with synchronization overhead.",
    code: `StringBuilder sb = new StringBuilder();\nfor (int i = 0; i < 5; i++) {\n    sb.append(i).append(" ");\n}\nSystem.out.println(sb.toString()); // 0 1 2 3 4`,
    tags: ["java", "strings", "memory"],
    frequentCompanies: ["Goldman Sachs", "Morgan Stanley", "HCL"],
  },

  // --- DSA ---
  {
    id: "dsa-1",
    topic: "DSA",
    difficulty: "Easy",
    question: "What is the time and space complexity of Binary Search?",
    shortAnswer: "Time complexity is O(log N); space complexity is O(1) iterative, O(log N) recursive.",
    explanation: "Binary Search requires a sorted collection. At each step, it compares the target with the middle element and cuts the search space in half.",
    code: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
    tags: ["dsa", "algorithms", "searching"],
    frequentCompanies: ["Amazon", "Google", "Microsoft", "Meta"],
  },
  {
    id: "dsa-2",
    topic: "DSA",
    difficulty: "Medium",
    question: "What is the difference between an Array and a Linked List?",
    shortAnswer: "Arrays offer O(1) random access in contiguous memory; Linked Lists allow dynamic size and O(1) insertions/deletions at known nodes.",
    explanation: "Arrays suffer from fixed sizing or expensive re-allocation costs. Linked lists store nodes with pointers anywhere in memory, adding 4 to 8 bytes pointer overhead per node.",
    code: `// Array: elements next to each other in memory\n[10, 20, 30]\n\n// Linked List: node -> next_node\nNode(10) -> Node(20) -> Node(30) -> null`,
    tags: ["dsa", "data-structures", "complexity"],
    frequentCompanies: ["Adobe", "Salesforce", "Flipkart"],
  },

  // --- REACT ---
  {
    id: "react-1",
    topic: "React",
    difficulty: "Easy",
    question: "What is the Virtual DOM and how does React reconciliation work?",
    shortAnswer: "An in-memory lightweight representation of the real DOM used by React to compute minimal UI updates.",
    explanation: "When state changes, React renders a new virtual tree, computes the diff (reconciliation using the Fiber algorithm), and batches actual DOM updates efficiently.",
    code: `// React compares prev & next VDOM trees:\nfunction Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}`,
    tags: ["react", "vdom", "frontend"],
    frequentCompanies: ["Meta", "Uber", "Walmart"],
  },
  {
    id: "react-2",
    topic: "React",
    difficulty: "Medium",
    question: "What are the core rules of React Hooks?",
    shortAnswer: "1. Only call Hooks at the top level of your React function. 2. Only call Hooks from React components or custom hooks.",
    explanation: "Never call Hooks inside loops, conditions, or nested functions. This ensures Hooks are called in the exact same order on every render, allowing React to preserve internal state across renders.",
    code: `function MyComponent() {\n  // ✅ Valid: Top level\n  const [val, setVal] = useState(0);\n\n  // ❌ Invalid: Conditional hook\n  // if (val > 0) useEffect(...)\n}`,
    tags: ["react", "hooks", "lifecycle"],
    frequentCompanies: ["Amazon", "Razorpay", "CRED"],
  },

  // --- HTML ---
  {
    id: "html-1",
    topic: "HTML",
    difficulty: "Easy",
    question: "Why is semantic HTML important and what are common semantic tags?",
    shortAnswer: "Semantic tags describe meaning to both browsers and developers, boosting accessibility (a11y) and SEO.",
    explanation: "Instead of generic `<div>` tags, use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>` so screen readers and search engine crawlers understand content hierarchy.",
    code: `<article>\n  <header>\n    <h2>Semantic Article Title</h2>\n    <time datetime="2026-01-01">Jan 1, 2026</time>\n  </header>\n  <p>Article body content...</p>\n  <footer>Published by SkilTrix</footer>\n</article>`,
    tags: ["html", "semantic", "seo", "accessibility"],
    frequentCompanies: ["Google", "Infosys", "Wipro"],
  },
  {
    id: "html-2",
    topic: "HTML",
    difficulty: "Medium",
    question: "What is the difference between `localStorage`, `sessionStorage`, and Cookies?",
    shortAnswer: "`localStorage` persists indefinitely; `sessionStorage` expires on tab close; Cookies are sent with every HTTP request.",
    explanation: "`localStorage` stores ~5-10MB without expiration. `sessionStorage` lasts for the browser session. Cookies store ~4KB, support `HttpOnly` and `Secure` flags, and travel to the server on every request header.",
    code: `// Local Storage\nlocalStorage.setItem("user_token", "jwt_abc123");\n\n// Session Storage\nsessionStorage.setItem("active_tab", "overview");`,
    tags: ["html", "storage", "web-apis"],
    frequentCompanies: ["Amazon", "PayPal", "Shopify"],
  },

  // --- CSS ---
  {
    id: "css-1",
    topic: "CSS",
    difficulty: "Easy",
    question: "Explain the CSS Box Model and `box-sizing: border-box`.",
    shortAnswer: "The Box Model consists of Content, Padding, Border, and Margin.",
    explanation: "By default (`content-box`), `width` only applies to the content. With `border-box`, `width` includes content, padding, and border, making responsive layout sizing predictable.",
    code: `* {\n  box-sizing: border-box; /* Highly recommended modern reset */\n  margin: 0;\n  padding: 0;\n}`,
    tags: ["css", "box-model", "layout"],
    frequentCompanies: ["Google", "Adobe", "Cognizant"],
  },
  {
    id: "css-2",
    topic: "CSS",
    difficulty: "Medium",
    question: "What is the difference between CSS Flexbox and CSS Grid?",
    shortAnswer: "Flexbox is one-dimensional (row or column); Grid is two-dimensional (simultaneous rows and columns).",
    explanation: "Flexbox is ideal for linear components like navigation bars, button groups, and vertical stacks. Grid is ideal for full page layouts, complex card boards, and responsive tile matrices.",
    code: `/* Flexbox: 1D alignment */\n.nav {\n  display: flex;\n  justify-content: space-between;\n}\n\n/* Grid: 2D alignment */\n.dashboard-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n}`,
    tags: ["css", "flexbox", "grid", "responsive"],
    frequentCompanies: ["Meta", "Apple", "Spotify"],
  },

  // --- DJANGO ---
  {
    id: "django-1",
    topic: "Django",
    difficulty: "Easy",
    question: "Explain Django's MTV (Model-Template-View) Architecture.",
    shortAnswer: "Model handles database schema & ORM, Template handles presentation UI, and View executes business logic.",
    explanation: "Django's MTV maps to classic MVC: Model is Model, Template is View (UI), and View acts as Controller (mediates between models and templates/serializers).",
    code: `# Model: defines database table\nclass Course(models.Model):\n    name = models.CharField(max_length=200)\n\n# View: executes business logic\ndef list_courses(request):\n    courses = Course.objects.all()\n    return render(request, "courses.html", {"courses": courses})`,
    tags: ["django", "python", "backend"],
    frequentCompanies: ["Instagram", "Pinterest", "Accenture"],
  },
  {
    id: "django-2",
    topic: "Django",
    difficulty: "Medium",
    question: "What is the difference between `select_related` and `prefetch_related` in Django ORM?",
    shortAnswer: "`select_related` uses SQL JOINs for single-valued relationships (ForeignKey, OneToOne); `prefetch_related` executes separate SQL queries for multi-valued relationships (ManyToMany, reverse ForeignKey).",
    explanation: "Both solve the N+1 database queries problem. Use `select_related` for direct parent lookups and `prefetch_related` for related lists of children.",
    code: `# 1 SQL query with JOIN:\nCourse.objects.select_related("user").all()\n\n# 2 SQL queries combined in Python memory:\nCourse.objects.prefetch_related("modules__lessons").all()`,
    tags: ["django", "orm", "database-optimization"],
    frequentCompanies: ["Meta", "DoorDash", "Bitbucket"],
  },

  // --- SQL ---
  {
    id: "sql-1",
    topic: "SQL",
    difficulty: "Easy",
    question: "What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN?",
    shortAnswer: "INNER JOIN returns matching rows from both tables; LEFT JOIN returns all rows from the left table plus matches from the right; RIGHT JOIN returns all rows from the right table.",
    explanation: "Non-matching rows from outer joins produce `NULL` in the columns of the table without a match.",
    code: `SELECT u.email, e.course_id\nFROM sfs_allusers u\nLEFT JOIN st_course_enrollments e ON u.id = e.user_id;`,
    tags: ["sql", "joins", "relational-db"],
    frequentCompanies: ["Oracle", "Amazon", "Goldman Sachs"],
  },
  {
    id: "sql-2",
    topic: "SQL",
    difficulty: "Medium",
    question: "What is Database Normalization (1NF, 2NF, 3NF)?",
    shortAnswer: "Organizing table schemas to minimize data redundancy and avoid insertion, update, and deletion anomalies.",
    explanation: "1NF requires atomic column values and unique rows. 2NF removes partial functional dependencies (all non-key columns depend on the entire primary key). 3NF removes transitive dependencies.",
    code: `-- 3NF Normalized tables:\n-- Users (id, name, email)\n-- Courses (id, title, price)\n-- Enrollments (user_id, course_id, enrolled_at)`,
    tags: ["sql", "normalization", "schema-design"],
    frequentCompanies: ["Microsoft", "IBM", "TCS"],
  },

  // --- SAP ABAP ---
  {
    id: "abap-1",
    topic: "SAP ABAP",
    difficulty: "Medium",
    question: "What is `SY-SUBRC` in SAP ABAP and what are its standard return codes?",
    shortAnswer: "`SY-SUBRC` is a system field holding the return code of the most recently executed ABAP statement (0 = success).",
    explanation: "Values: 0 means successful execution; 4 means key or record not found; 8 or higher signifies errors or end of file/dataset.",
    code: `SELECT SINGLE * FROM vbak INTO @DATA(ls_order)\n  WHERE vbeln = @p_vbeln.\n\nIF sy-subrc = 0.\n  WRITE: / 'Order found:', ls_order-vbeln.\nELSE.\n  MESSAGE 'Sales order not found' TYPE 'E'.\nENDIF.`,
    tags: ["sap", "abap", "enterprise"],
    frequentCompanies: ["SAP", "Deloitte", "PwC", "Accenture", "TCS"],
  },
]
