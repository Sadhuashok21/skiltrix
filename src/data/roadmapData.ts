import type { RoadmapTrack } from "../types/roadmap"

export const OFFICIAL_ROADMAPS_DATA: RoadmapTrack[] = [
  {
    key: "frontend_roadmap",
    title: "Frontend Web Roadmap",
    category: "Web Development",
    badge: "INFOGRAPHICS TIMELINE",
    description: "Winding 3D visual journey to master HTML, CSS, JavaScript, React, Next.js, and Web Performance.",
    icon: "code",
    accent_color: "#F59E0B",
    estimated_weeks: "12-16 Weeks",
    total_stages: 6,
    completed_stages: 0,
    progress_percent: 0,
    stages: [
      {
        stage_number: 1,
        badge_text: "STEP 01",
        title: "HTML5 & Modern CSS3",
        description: "Semantic HTML, Flexbox, Grid, Responsive Design & Tailwind",
        color: "#F59E0B",
        difficulty: "Beginner",
        estimated_hours: "15 Hours",
        tutorial_link: "/tutorials/html",
        practice_link: "/compilers/html-compiler",
        completed: false,
        topics: [
          "Semantic Elements & Accessibility",
          "Flexbox & CSS Grid Systems",
          "Responsive Media Queries",
          "Tailwind CSS & Utility Frameworks",
        ],
      },
      {
        stage_number: 2,
        badge_text: "STEP 02",
        title: "JavaScript ES6+",
        description: "DOM Manipulation, Async/Await, Promises & Fetch API",
        color: "#10B981",
        difficulty: "Beginner",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/javascript",
        practice_link: "/compilers/javascript-compiler",
        completed: false,
        topics: [
          "ES6+ Arrow Functions & Destructuring",
          "DOM Events & Event Bubbling",
          "Promises, Async / Await Syntax",
          "Fetch API & LocalStorage Persistence",
        ],
      },
      {
        stage_number: 3,
        badge_text: "STEP 03",
        title: "React & Component State",
        description: "JSX, Hooks (useState, useEffect), Props & Context",
        color: "#06B6D4",
        difficulty: "Intermediate",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/react",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "JSX & Component Driven Architecture",
          "useState, useEffect & Custom Hooks",
          "Context API & State Management",
          "React Router Navigation",
        ],
      },
      {
        stage_number: 4,
        badge_text: "STEP 04",
        title: "TypeScript & State Management",
        description: "Type Safety, Redux Toolkit & Zustand",
        color: "#3B82F6",
        difficulty: "Intermediate",
        estimated_hours: "20 Hours",
        tutorial_link: "/tutorials/typescript",
        practice_link: "/compilers/typescript-compiler",
        completed: false,
        topics: [
          "TypeScript Interfaces, Types & Generics",
          "Redux Toolkit / RTK Query",
          "Zustand & Lightweight State",
          "Formik / React Hook Form",
        ],
      },
      {
        stage_number: 5,
        badge_text: "STEP 05",
        title: "Next.js & SSR/SSG",
        description: "App Router, Server Components, SEO & API Routes",
        color: "#8B5CF6",
        difficulty: "Advanced",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/nextjs",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Next.js App Router Architecture",
          "Server Side Rendering (SSR) & SSG",
          "API Routes & Server Actions",
          "SEO Optimization & Performance",
        ],
      },
      {
        stage_number: 6,
        badge_text: "STEP 06",
        title: "Web Testing & Deployment",
        description: "Jest, Playwright, Vercel CI/CD & Lighthouse",
        color: "#EC4899",
        difficulty: "Advanced",
        estimated_hours: "15 Hours",
        tutorial_link: "/tutorials/git",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Jest & React Testing Library",
          "Playwright / Cypress E2E Testing",
          "Lighthouse Performance & Core Web Vitals",
          "Vercel & Netlify Deployment",
        ],
      },
    ],
  },
  {
    key: "backend_roadmap",
    title: "Backend Engineering Roadmap",
    category: "Backend Development",
    badge: "INFOGRAPHICS TIMELINE",
    description: "Winding 3D learning path for building scalable APIs, databases, microservices, and cloud systems.",
    icon: "server",
    accent_color: "#10B981",
    estimated_weeks: "14-18 Weeks",
    total_stages: 6,
    completed_stages: 0,
    progress_percent: 0,
    stages: [
      {
        stage_number: 1,
        badge_text: "STEP 01",
        title: "Core Language & Data Structures",
        description: "Select Language (Node/Java/Go/Python) & Data Structures",
        color: "#F59E0B",
        difficulty: "Beginner",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/python",
        practice_link: "/practice",
        completed: false,
        topics: [
          "Language Fundamentals & Syntax",
          "OOP & Design Patterns",
          "Arrays, HashMaps, Trees & Algorithms",
          "Memory & Thread Concurrency",
        ],
      },
      {
        stage_number: 2,
        badge_text: "STEP 02",
        title: "Databases & ORMs",
        description: "Relational SQL, NoSQL & Query Optimization",
        color: "#10B981",
        difficulty: "Beginner",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/sql",
        practice_link: "/sql-practice",
        completed: false,
        topics: [
          "PostgreSQL & Complex SQL Queries",
          "MongoDB & Redis Key-Value Caching",
          "Database Indexing & Transactions",
          "ORMs: Hibernate / Prisma / SQLAlchemy",
        ],
      },
      {
        stage_number: 3,
        badge_text: "STEP 03",
        title: "API Design & Security",
        description: "REST, GraphQL, OAuth2 & JWT Authentication",
        color: "#06B6D4",
        difficulty: "Intermediate",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/node",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "RESTful Principles & OpenAPI Standards",
          "GraphQL Schemas & Queries",
          "JWT Tokens & Session Management",
          "Rate Limiting & CORS Gateways",
        ],
      },
      {
        stage_number: 4,
        badge_text: "STEP 04",
        title: "Caching & Message Queues",
        description: "Redis Caching, RabbitMQ & Kafka Event Streaming",
        color: "#3B82F6",
        difficulty: "Intermediate",
        estimated_hours: "20 Hours",
        tutorial_link: "/tutorials/redis",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Redis In-Memory Caching Strategies",
          "RabbitMQ Message Queuing",
          "Apache Kafka Event Streams",
          "Monolith to Microservices Pattern",
        ],
      },
      {
        stage_number: 5,
        badge_text: "STEP 05",
        title: "Docker, Kubernetes & Cloud",
        description: "Containerization, AWS Services & Orchestration",
        color: "#8B5CF6",
        difficulty: "Advanced",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/docker",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Docker Containers & Compose",
          "Kubernetes Cluster Management",
          "AWS EC2, S3, RDS & Lambda",
          "GitHub Actions CI/CD Pipelines",
        ],
      },
      {
        stage_number: 6,
        badge_text: "STEP 06",
        title: "System Design & Observability",
        description: "Scalability, Sharding & Prometheus Monitoring",
        color: "#EC4899",
        difficulty: "Advanced",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/system-design",
        practice_link: "/practice",
        completed: false,
        topics: [
          "High-Availability System Architecture",
          "Database Sharding & Load Balancing",
          "Prometheus & Grafana Monitoring",
          "OWASP Security Hardening",
        ],
      },
    ],
  },
  {
    key: "fullstack_roadmap",
    title: "Full Stack Engineering Roadmap",
    category: "Full Stack Development",
    badge: "INFOGRAPHICS TIMELINE",
    description: "Complete end-to-end 3D roadmap covering Frontend, Backend, Databases, DevOps, and Full-Stack App Deployment.",
    icon: "layers",
    accent_color: "#06B6D4",
    estimated_weeks: "18-24 Weeks",
    total_stages: 6,
    completed_stages: 0,
    progress_percent: 0,
    stages: [
      {
        stage_number: 1,
        badge_text: "STEP 01",
        title: "Frontend Fundamentals",
        description: "HTML5, CSS3, JavaScript ES6+ & Tailwind",
        color: "#F59E0B",
        difficulty: "Beginner",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/html",
        practice_link: "/compilers/html-compiler",
        completed: false,
        topics: [
          "HTML5 Semantics & Responsive Layouts",
          "CSS Grid, Flexbox & Tailwind CSS",
          "JavaScript DOM & ES6+ Syntax",
          "Async/Await & Fetch API",
        ],
      },
      {
        stage_number: 2,
        badge_text: "STEP 02",
        title: "React & Single Page Apps",
        description: "Components, State, Hooks & React Router",
        color: "#10B981",
        difficulty: "Beginner",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/react",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "React Components & Props",
          "useState, useEffect & Custom Hooks",
          "Context API & State Management",
          "SPA Client Routing",
        ],
      },
      {
        stage_number: 3,
        badge_text: "STEP 03",
        title: "Node.js & Express Backend",
        description: "RESTful APIs, Express Middleware & Routing",
        color: "#06B6D4",
        difficulty: "Intermediate",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/node",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Node.js Runtime & NPM Modules",
          "Express Server Setup & Middleware",
          "RESTful Endpoints & Controller Pattern",
          "Error Handling & Logging",
        ],
      },
      {
        stage_number: 4,
        badge_text: "STEP 04",
        title: "Databases & Authentication",
        description: "PostgreSQL, MongoDB, JWT & OAuth2",
        color: "#3B82F6",
        difficulty: "Intermediate",
        estimated_hours: "20 Hours",
        tutorial_link: "/tutorials/sql",
        practice_link: "/sql-practice",
        completed: false,
        topics: [
          "Relational SQL (PostgreSQL) & ORMs",
          "NoSQL Document Stores (MongoDB)",
          "JWT Token Authentication",
          "Bcrypt Password Hashing",
        ],
      },
      {
        stage_number: 5,
        badge_text: "STEP 05",
        title: "DevOps, Docker & Cloud",
        description: "Containerization, CI/CD Pipelines & AWS",
        color: "#8B5CF6",
        difficulty: "Advanced",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/docker",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Dockerization of App Services",
          "Docker Compose Multi-Container Setup",
          "GitHub Actions Deployment CI/CD",
          "AWS EC2, S3 & Nginx Reverse Proxy",
        ],
      },
      {
        stage_number: 6,
        badge_text: "STEP 06",
        title: "Full-Stack Production App",
        description: "Monorepo, Next.js, Microservices & Capstone Project",
        color: "#EC4899",
        difficulty: "Advanced",
        estimated_hours: "35 Hours",
        tutorial_link: "/tutorials/nextjs",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Next.js Full Stack App Architecture",
          "Real-Time WebSockets / Socket.io",
          "Stripe Payment Gateway Integration",
          "Production Monitoring & Release",
        ],
      },
    ],
  },
  {
    key: "python_fullstack_roadmap",
    title: "Python Full Stack Roadmap",
    category: "Full Stack Development",
    badge: "INFOGRAPHICS TIMELINE",
    description: "Serpentine 3D roadmap covering Python core, Django, FastAPI, PostgreSQL, React frontend, and Cloud deployment.",
    icon: "terminal",
    accent_color: "#3B82F6",
    estimated_weeks: "16-20 Weeks",
    total_stages: 6,
    completed_stages: 0,
    progress_percent: 0,
    stages: [
      {
        stage_number: 1,
        badge_text: "STEP 01",
        title: "Python Language & OOP",
        description: "Data Types, Functions, OOP, Decorators & Virtual Environments",
        color: "#F59E0B",
        difficulty: "Beginner",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/python",
        practice_link: "/compilers/python-compiler",
        completed: false,
        topics: [
          "Python Syntax, Data Structures & Comprehensions",
          "OOP: Classes, Inheritance & Dunder Methods",
          "Decorators, Generators & Context Managers",
          "Virtual Environments & Pip Package Manager",
        ],
      },
      {
        stage_number: 2,
        badge_text: "STEP 02",
        title: "Django Web Framework",
        description: "MVT Pattern, ORM Models, Views, Templates & Admin",
        color: "#10B981",
        difficulty: "Beginner",
        estimated_hours: "30 Hours",
        tutorial_link: "/django-tutorials",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Django MVT Architecture & Project Setup",
          "Django ORM Models & Migrations",
          "Views, URLs & Template Engine",
          "Django Admin Panel & User Authentication",
        ],
      },
      {
        stage_number: 3,
        badge_text: "STEP 03",
        title: "Django REST Framework & FastAPI",
        description: "REST Endpoints, Serializers, Pydantic & Async",
        color: "#06B6D4",
        difficulty: "Intermediate",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/fastapi",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Django REST Framework (DRF) Serializers",
          "JWT Authentication & Permissions",
          "FastAPI Async Endpoints & Pydantic",
          "Swagger / OpenAPI Documentation",
        ],
      },
      {
        stage_number: 4,
        badge_text: "STEP 04",
        title: "Databases & Celery Queues",
        description: "PostgreSQL, Redis, Celery & Asynchronous Tasks",
        color: "#3B82F6",
        difficulty: "Intermediate",
        estimated_hours: "20 Hours",
        tutorial_link: "/tutorials/postgresql",
        practice_link: "/sql-practice",
        completed: false,
        topics: [
          "PostgreSQL Relational DB Configuration",
          "Redis Caching & Session Storage",
          "Celery Asynchronous Task Queues",
          "Celery Beat Scheduled Background Jobs",
        ],
      },
      {
        stage_number: 5,
        badge_text: "STEP 05",
        title: "Frontend Integration with React",
        description: "React SPA, Axios Integration & JWT Auth Handling",
        color: "#8B5CF6",
        difficulty: "Advanced",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/react",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "React Components & State Management",
          "Axios HTTP Request Interceptors",
          "JWT Token Storage & Refresh Flows",
          "Tailwind CSS UI Styling",
        ],
      },
      {
        stage_number: 6,
        badge_text: "STEP 06",
        title: "Docker & Cloud Deployment",
        description: "Gunicorn, Nginx, Docker Compose, AWS & CI/CD",
        color: "#EC4899",
        difficulty: "Advanced",
        estimated_hours: "20 Hours",
        tutorial_link: "/tutorials/docker",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Dockerization of Django & React",
          "Nginx Reverse Proxy & Gunicorn WSGI",
          "AWS EC2 & S3 Media File Uploads",
          "GitHub Actions Production Deployment",
        ],
      },
    ],
  },
  {
    key: "java_roadmap",
    title: "Java Developer Roadmap",
    category: "Enterprise Development",
    badge: "INFOGRAPHICS TIMELINE",
    description: "3D winding infographic path from Java SE Core, Collections, Multithreading to Spring Boot Enterprise Microservices.",
    icon: "coffee",
    accent_color: "#F59E0B",
    estimated_weeks: "16-20 Weeks",
    total_stages: 6,
    completed_stages: 0,
    progress_percent: 0,
    stages: [
      {
        stage_number: 1,
        badge_text: "STEP 01",
        title: "Java SE Core & OOP",
        description: "Syntax, Data Types, Control Flow, OOP & Exception Handling",
        color: "#F59E0B",
        difficulty: "Beginner",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/java",
        practice_link: "/compilers/java-compiler",
        completed: false,
        topics: [
          "Java Virtual Machine (JVM) & JDK Setup",
          "OOP: Classes, Interfaces & Polymorphism",
          "Exception Handling & Custom Exceptions",
          "Generics, Enums & Memory Management",
        ],
      },
      {
        stage_number: 2,
        badge_text: "STEP 02",
        title: "Collections & Streams API",
        description: "List, Set, Map, Lambda Expressions & Functional Streams",
        color: "#10B981",
        difficulty: "Beginner",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/java",
        practice_link: "/compilers/java-compiler",
        completed: false,
        topics: [
          "ArrayList, LinkedList, HashSet & HashMap",
          "Java 8 Lambda Expressions & Functional Interfaces",
          "Stream API Filtering, Mapping & Reduction",
          "Optional Class & Null Handling",
        ],
      },
      {
        stage_number: 3,
        badge_text: "STEP 03",
        title: "Concurrency & Multithreading",
        description: "Threads, ExecutorService, Concurrent Collections & Locks",
        color: "#06B6D4",
        difficulty: "Intermediate",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/java",
        practice_link: "/compilers/java-compiler",
        completed: false,
        topics: [
          "Thread Creation, Runnable & Lifecycle",
          "Synchronization & Reentrant Locks",
          "ExecutorService Thread Pools & Futures",
          "CompletableFuture Concurrent Programming",
        ],
      },
      {
        stage_number: 4,
        badge_text: "STEP 04",
        title: "Spring Framework & Spring Boot",
        description: "Dependency Injection, Spring MVC & REST APIs",
        color: "#3B82F6",
        difficulty: "Intermediate",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/spring-boot",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Spring Inversion of Control (IoC) & Beans",
          "Spring Boot Auto-Configuration",
          "Spring MVC Controller REST Endpoints",
          "Jackson JSON Serialization",
        ],
      },
      {
        stage_number: 5,
        badge_text: "STEP 05",
        title: "Spring Data JPA & Security",
        description: "Hibernate ORM, PostgreSQL & Spring Security JWT",
        color: "#8B5CF6",
        difficulty: "Advanced",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/spring-boot",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Spring Data JPA & Hibernate Entities",
          "PostgreSQL Database Relationships",
          "Spring Security Authentication & Filters",
          "JWT Token Role-Based Security",
        ],
      },
      {
        stage_number: 6,
        badge_text: "STEP 06",
        title: "Spring Cloud & Microservices",
        description: "Eureka, API Gateway, Docker & JUnit Testing",
        color: "#EC4899",
        difficulty: "Advanced",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/system-design",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Spring Cloud Eureka Service Discovery",
          "Spring Cloud API Gateway & Resilience4j",
          "Dockerizing Spring Boot Services",
          "Unit Testing with JUnit 5 & Mockito",
        ],
      },
    ],
  },
  {
    key: "android_roadmap",
    title: "Android Development Roadmap",
    category: "Mobile Development",
    badge: "INFOGRAPHICS TIMELINE",
    description: "Continuous 3D serpentine roadmap from beginner to production-ready Android developer. Tap any milestone to view details and track progress.",
    icon: "smartphone",
    accent_color: "#10B981",
    estimated_weeks: "14-18 Weeks",
    total_stages: 6,
    completed_stages: 0,
    progress_percent: 0,
    stages: [
      {
        stage_number: 1,
        badge_text: "STEP 01",
        title: "Android Foundations",
        description: "Install Android Studio, SDK, Gradle, Emulator & First App",
        color: "#F59E0B",
        difficulty: "Beginner",
        estimated_hours: "15 Hours",
        tutorial_link: "/tutorials/kotlin",
        practice_link: "/compilers/kotlin-compiler",
        completed: false,
        topics: [
          "Android Studio Setup & SDK Manager",
          "Gradle Build System & Dependencies",
          "Project Directory Structure",
          "Emulator Setup & Running First App",
        ],
      },
      {
        stage_number: 2,
        badge_text: "STEP 02",
        title: "Kotlin Fundamentals",
        description: "Variables, OOP, Null Safety, Lambdas & Extensions",
        color: "#10B981",
        difficulty: "Beginner",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/kotlin",
        practice_link: "/compilers/kotlin-compiler",
        completed: false,
        topics: [
          "Control Flow, Functions & Type System",
          "OOP: Classes, Inheritance & Interfaces",
          "Null Safety & Smart Casting",
          "Lambdas, High-Order Functions & Collections",
        ],
      },
      {
        stage_number: 3,
        badge_text: "STEP 03",
        title: "Android UI & Views",
        description: "XML Layouts, ConstraintLayout, RecyclerView & Navigation",
        color: "#06B6D4",
        difficulty: "Intermediate",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/kotlin",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "XML Layouts & ConstraintLayout Basics",
          "Activities, Fragments & Lifecycle",
          "RecyclerView, ViewHolders & Adapters",
          "Navigation Component & SafeArgs",
        ],
      },
      {
        stage_number: 4,
        badge_text: "STEP 04",
        title: "Jetpack Compose UI",
        description: "Composables, State, Material 3 & Animations",
        color: "#3B82F6",
        difficulty: "Intermediate",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/kotlin",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Composables & Declarative UI Syntax",
          "Remember, MutableState & State Hoisting",
          "LazyColumn, LazyRow & Grid Layouts",
          "Material Design 3 Theming & Animations",
        ],
      },
      {
        stage_number: 5,
        badge_text: "STEP 05",
        title: "Coroutines & Flow",
        description: "Asynchronous Programming, StateFlow & REST APIs",
        color: "#8B5CF6",
        difficulty: "Advanced",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/kotlin",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "Kotlin Coroutines & Dispatchers",
          "StateFlow & SharedFlow Reactive Streams",
          "Retrofit REST APIs & OkHttp Interceptors",
          "JSON Deserialization with Moshi / Gson",
        ],
      },
      {
        stage_number: 6,
        badge_text: "STEP 06",
        title: "Architecture & Room",
        description: "MVVM / Clean Architecture, Room Database & Hilt DI",
        color: "#EC4899",
        difficulty: "Advanced",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/system-design",
        practice_link: "/codelab",
        completed: false,
        topics: [
          "ViewModel & Repository Pattern",
          "Room Database & DataStore Local Persistence",
          "Dependency Injection with Hilt",
          "Unit Testing with JUnit & Mockito",
        ],
      },
    ],
  },
  {
    key: "cyber_security_roadmap",
    title: "Cyber Security Specialist Roadmap",
    category: "Cyber Security",
    badge: "INFOGRAPHICS TIMELINE",
    description: "3D visual learning journey covering Networking, Ethical Hacking, Web App Security, Cryptography, and Incident Response.",
    icon: "shield",
    accent_color: "#8B5CF6",
    estimated_weeks: "16-22 Weeks",
    total_stages: 6,
    completed_stages: 0,
    progress_percent: 0,
    stages: [
      {
        stage_number: 1,
        badge_text: "STEP 01",
        title: "Computer Networking & OS",
        description: "TCP/IP, OSI Model, Subnetting, Linux CLI & Bash",
        color: "#F59E0B",
        difficulty: "Beginner",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/linux",
        practice_link: "/practice",
        completed: false,
        topics: [
          "TCP/IP, UDP & OSI 7-Layer Protocol Stack",
          "IP Addressing, Subnetting & DNS Protocols",
          "Linux Terminal Commands & File Permissions",
          "Bash Shell Scripting Automation",
        ],
      },
      {
        stage_number: 2,
        badge_text: "STEP 02",
        title: "Cyber Security Fundamentals",
        description: "CIA Triad, Risk Management, Security Policies & Threat Models",
        color: "#10B981",
        difficulty: "Beginner",
        estimated_hours: "20 Hours",
        tutorial_link: "/tutorials/cybersecurity",
        practice_link: "/practice",
        completed: false,
        topics: [
          "Confidentiality, Integrity & Availability (CIA)",
          "Threat Modeling & Attack Surfaces",
          "Security Frameworks (NIST & ISO 27001)",
          "Access Controls & Multi-Factor Auth (MFA)",
        ],
      },
      {
        stage_number: 3,
        badge_text: "STEP 03",
        title: "Ethical Hacking & Recon",
        description: "Information Gathering, Nmap, Wireshark & Scanning",
        color: "#06B6D4",
        difficulty: "Intermediate",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/cybersecurity",
        practice_link: "/practice",
        completed: false,
        topics: [
          "OSINT Reconnaissance & Social Engineering",
          "Nmap Network Port Scanning",
          "Wireshark Packet Analysis & Sniffing",
          "Vulnerability Assessment Tools (OpenVAS / Nessus)",
        ],
      },
      {
        stage_number: 4,
        badge_text: "STEP 04",
        title: "Web Application Security",
        description: "OWASP Top 10, Burp Suite, SQLi & XSS Attacks",
        color: "#3B82F6",
        difficulty: "Intermediate",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/cybersecurity",
        practice_link: "/practice",
        completed: false,
        topics: [
          "OWASP Top 10 Vulnerabilities",
          "SQL Injection (SQLi) & Remediation",
          "Cross-Site Scripting (XSS) & CSRF",
          "Burp Suite Interception Proxy",
        ],
      },
      {
        stage_number: 5,
        badge_text: "STEP 05",
        title: "Cryptography & PKI",
        description: "Symmetric/Asymmetric Encryption, Hashing & SSL/TLS",
        color: "#8B5CF6",
        difficulty: "Advanced",
        estimated_hours: "25 Hours",
        tutorial_link: "/tutorials/cybersecurity",
        practice_link: "/practice",
        completed: false,
        topics: [
          "AES, RSA & Elliptic Curve Cryptography",
          "SHA-256 Hashing & Password Salting",
          "Public Key Infrastructure (PKI) & Certificates",
          "TLS/SSL Handshake & Secure Communications",
        ],
      },
      {
        stage_number: 6,
        badge_text: "STEP 06",
        title: "Incident Response & Forensics",
        description: "SIEM Monitoring, Malware Analysis & SOC Analyst Capstone",
        color: "#EC4899",
        difficulty: "Advanced",
        estimated_hours: "30 Hours",
        tutorial_link: "/tutorials/cybersecurity",
        practice_link: "/practice",
        completed: false,
        topics: [
          "SIEM Log Analysis (Splunk / Elastic SOC)",
          "Memory Forensics & Incident Response",
          "Basic Reverse Engineering & Malware Analysis",
          "Penetration Testing Report Writing",
        ],
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL PROGRESS PERSISTENCE (MATCHING ANDROID ProgressManager / Room DB)
// ─────────────────────────────────────────────────────────────────────────────

const PREF_PREFIX = "skiltrix_roadmap_progress"

export function getLocalStageCompleted(roadmapKey: string, stageNumber: number): boolean {
  try {
    const raw = localStorage.getItem(`${PREF_PREFIX}_${roadmapKey}_stage_${stageNumber}`)
    return raw === "true"
  } catch {
    return false
  }
}

export function getLocalCompletedSubtopics(roadmapKey: string, stageNumber: number): string[] {
  try {
    const raw = localStorage.getItem(`${PREF_PREFIX}_${roadmapKey}_stage_${stageNumber}_subtopics`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setLocalStageCompleted(
  roadmapKey: string,
  stageNumber: number,
  completed: boolean,
  subtopics?: string[]
): void {
  try {
    localStorage.setItem(`${PREF_PREFIX}_${roadmapKey}_stage_${stageNumber}`, String(completed))
    if (subtopics) {
      localStorage.setItem(`${PREF_PREFIX}_${roadmapKey}_stage_${stageNumber}_subtopics`, JSON.stringify(subtopics))
    }
  } catch {}
}

export function resetLocalRoadmapProgress(roadmapKey: string): void {
  try {
    const prefix = `${PREF_PREFIX}_${roadmapKey}_stage_`
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(prefix)) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  } catch {}
}

export function getLocalRoadmapWithProgress(roadmapKey: string): RoadmapTrack | null {
  const rm = OFFICIAL_ROADMAPS_DATA.find((r) => r.key === roadmapKey)
  if (!rm) return null

  let completedCount = 0
  const stages = rm.stages.map((st) => {
    const isCompleted = getLocalStageCompleted(rm.key, st.stage_number)
    const subtopicsDone = getLocalCompletedSubtopics(rm.key, st.stage_number)
    if (isCompleted) completedCount++
    return {
      ...st,
      completed: isCompleted,
      completed_subtopics: subtopicsDone,
    }
  })

  const total = stages.length
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0

  return {
    ...rm,
    stages,
    total_stages: total,
    completed_stages: completedCount,
    progress_percent: percent,
  }
}

export function getAllRoadmapsWithLocalProgress(): RoadmapTrack[] {
  return OFFICIAL_ROADMAPS_DATA.map((rm) => {
    let completedCount = 0
    const stages = rm.stages.map((st) => {
      const isCompleted = getLocalStageCompleted(rm.key, st.stage_number)
      if (isCompleted) completedCount++
      return {
        ...st,
        completed: isCompleted,
        completed_subtopics: getLocalCompletedSubtopics(rm.key, st.stage_number),
      }
    })
    const total = stages.length
    const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0

    let currentStage = 1
    for (const st of stages) {
      if (!st.completed) {
        currentStage = st.stage_number
        break
      }
    }

    return {
      ...rm,
      stages,
      total_stages: total,
      completed_stages: completedCount,
      progress_percent: percent,
      current_stage: currentStage,
    }
  })
}

