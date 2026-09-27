export interface SyntaxTopic {
  id: string
  title: string
  description: string
  category: "basics" | "control-flow" | "functions" | "data-structures" | "memory"
  snippets: {
    python: {
      code: string
      notes: string
    }
    java: {
      code: string
      notes: string
    }
    c: {
      code: string
      notes: string
    }
    cpp: {
      code: string
      notes: string
    }
  }
}

export const SYNTAX_COMPARISONS: SyntaxTopic[] = [
  {
    id: "hello-world",
    title: "Program Entry & Console Output",
    description:
      "Compare how each language sets up the entry point and prints text to standard output.",
    category: "basics",
    snippets: {
      python: {
        code: `# Python has no boilerplate class or main function requirement
print("Hello, World!")

# Formatted string (f-string)
user = "SkillTrix Learner"
print(f"Welcome back, {user}!")`,
        notes:
          "No main function or classes needed. Script runs top-to-bottom. Built-in print() handles newline automatically.",
      },
      java: {
        code: `// Java requires everything inside a class
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        // String concatenation or formatted print
        String user = "SkillTrix Learner";
        System.out.printf("Welcome back, %s!%n", user);
    }
}`,
        notes:
          "Class name must match file. Entry point must be public static void main(String[] args). Uses System.out.",
      },
      c: {
        code: `// C requires including stdio.h header
#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");

    // Format specifier %s for strings
    const char* user = "SkillTrix Learner";
    printf("Welcome back, %s!\\n", user);

    return 0; // Exit status code
}`,
        notes:
          "Procedural. Requires #include <stdio.h>. Must explicitly write \\n for newline. Returns integer status code 0.",
      },
      cpp: {
        code: `// C++ uses iostream header and standard namespace
#include <iostream>
#include <string>

using namespace std;

int main() {
    cout << "Hello, World!" << endl;

    string user = "SkillTrix Learner";
    cout << "Welcome back, " << user << "!" << endl;

    return 0;
}`,
        notes:
          "Uses stream insertion operator (<<) with std::cout and std::endl. More type-safe than C's printf.",
      },
    },
  },
  {
    id: "variables-types",
    title: "Variables & Type System",
    description:
      "Dynamic vs static typing, type inference, constants, and basic primitive types.",
    category: "basics",
    snippets: {
      python: {
        code: `# Dynamically typed - types inferred at runtime
age = 25              # int
pi = 3.14159          # float
is_active = True      # bool (Capitalized)
name = "SkillTrix"    # str

# Optional type hints (Python 3.6+)
score: float = 98.5

# Variables can be reassigned to different types
data = 100
data = "now a string"`,
        notes:
          "Dynamic typing. No keywords like 'var' or 'let'. Booleans are True/False with capital initial letters.",
      },
      java: {
        code: `// Statically typed - explicit types or 'var' (Java 10+)
int age = 25;
double pi = 3.14159;
boolean isActive = true;
String name = "SkillTrix";

// Constants use the 'final' keyword
final double MAX_SCORE = 100.0;

// Type inference with 'var'
var counter = 0; // inferred as int`,
        notes:
          "Strict static typing. Semicolons required. String is an object reference, primitives are lowercase.",
      },
      c: {
        code: `// Statically typed with fixed primitive types
int age = 25;
double pi = 3.14159;
char initial = 'S';
const char* name = "SkillTrix"; // Pointer to char array

// Constants use 'const' keyword
const int MAX_USERS = 500;

// No native boolean before C99 (#include <stdbool.h>)
int is_active = 1; // 1 = true, 0 = false`,
        notes:
          "Lowest-level primitive types. Strings are null-terminated char arrays. Booleans are 0 or 1 unless stdbool.h is included.",
      },
      cpp: {
        code: `#include <string>

// Statically typed with modern 'auto' deduction
int age = 25;
double pi = 3.14159;
bool is_active = true;
std::string name = "SkillTrix";

// Compile-time constants
constexpr int MAX_ITEMS = 1000;

// Auto type deduction (C++11+)
auto score = 98.5; // inferred as double`,
        notes:
          "Offers std::string, native bool, constexpr for compile-time calculation, and auto keyword for type deduction.",
      },
    },
  },
  {
    id: "functions",
    title: "Function & Method Declarations",
    description:
      "Defining functions, passing parameters, return types, and default values.",
    category: "functions",
    snippets: {
      python: {
        code: `# Function defined with 'def' keyword and indented block
def calculate_grade(score: int, bonus: int = 5) -> str:
    total = score + bonus
    if total >= 90:
        return "Grade: A"
    return "Grade: B"

# Multiple return values (tuple unpacking)
def get_user_stats():
    return "Marcus", 95, True

name, score, active = get_user_stats()
print(calculate_grade(87))`,
        notes:
          "Uses def keyword. Indentation defines the body. Supports default arguments and returning multiple values natively.",
      },
      java: {
        code: `public class Solution {
    // Must specify visibility, static modifier, and return type
    public static String calculateGrade(int score, int bonus) {
        int total = score + bonus;
        if (total >= 90) {
            return "Grade: A";
        }
        return "Grade: B";
    }

    // Method overloading (Java doesn't support default parameter values)
    public static String calculateGrade(int score) {
        return calculateGrade(score, 5);
    }
}`,
        notes:
          "Strict return types. No default arguments; uses method overloading instead. Must be part of a class.",
      },
      c: {
        code: `#include <stdio.h>

// Forward declaration / prototype
const char* calculate_grade(int score, int bonus);

// Function definition
const char* calculate_grade(int score, int bonus) {
    int total = score + bonus;
    if (total >= 90) {
        return "Grade: A";
    }
    return "Grade: B";
}

int main(void) {
    printf("%s\\n", calculate_grade(87, 5));
    return 0;
}`,
        notes:
          "Stand-alone procedural functions. Must specify return type. Prototypes recommended before main(). No overloading.",
      },
      cpp: {
        code: `#include <iostream>
#include <string>

// Supports default parameter values
std::string calculateGrade(int score, int bonus = 5) {
    int total = score + bonus;
    if (total >= 90) {
        return "Grade: A";
    }
    return "Grade: B";
}

// Function overloading supported
std::string calculateGrade(double gpa) {
    return gpa >= 3.8 ? "Grade: A" : "Grade: B";
}`,
        notes:
          "Supports default arguments, function overloading, pass-by-reference (&), and template functions for generic programming.",
      },
    },
  },
  {
    id: "loops",
    title: "Loops & Iteration",
    description:
      "For-loops, while-loops, range generators, and iterating over collections.",
    category: "control-flow",
    snippets: {
      python: {
        code: `# For-in loop with range(start, stop, step)
for i in range(1, 4):
    print(f"Count: {i}")

# Iterating with index using enumerate()
languages = ["Python", "Java", "C++", "C"]
for idx, lang in enumerate(languages, 1):
    print(f"{idx}: {lang}")

# While loop with break/continue
num = 3
while num > 0:
    print(f"Blastoff in {num}...")
    num -= 1`,
        notes:
          "Loops iterate over iterables directly. range() replaces the traditional 3-part C-style for loop.",
      },
      java: {
        code: `public class LoopDemo {
    public static void main(String[] args) {
        // Classic 3-part for loop
        for (int i = 1; i <= 3; i++) {
            System.out.println("Count: " + i);
        }

        // Enhanced for-each loop
        String[] languages = {"Python", "Java", "C++", "C"};
        for (String lang : languages) {
            System.out.println("Lang: " + lang);
        }

        // While loop
        int num = 3;
        while (num > 0) {
            System.out.println("Countdown: " + num);
            num--;
        }
    }
}`,
        notes:
          "Supports traditional 3-part loop and enhanced for-each loop (for (T item : collection)).",
      },
      c: {
        code: `#include <stdio.h>

int main(void) {
    // Traditional for loop
    for (int i = 1; i <= 3; i++) {
        printf("Count: %d\\n", i);
    }

    // Array iteration using size calculation
    const char* languages[] = {"Python", "Java", "C++", "C"};
    int length = sizeof(languages) / sizeof(languages[0]);

    for (int i = 0; i < length; i++) {
        printf("%d: %s\\n", i + 1, languages[i]);
    }

    // While loop
    int num = 3;
    while (num > 0) {
        printf("Blastoff: %d\\n", num--);
    }
    return 0;
}`,
        notes:
          "Pure 3-part for loop. No for-each loop. Array size must be calculated with sizeof(arr)/sizeof(arr[0]).",
      },
      cpp: {
        code: `#include <iostream>
#include <vector>
#include <string>

int main() {
    // Range-based for loop (C++11+)
    std::vector<std::string> languages = {"Python", "Java", "C++", "C"};

    // Loop by const reference for efficiency
    for (const auto& lang : languages) {
        std::cout << "Lang: " << lang << std::endl;
    }

    // Traditional index-based loop
    for (size_t i = 0; i < languages.size(); ++i) {
        std::cout << i + 1 << ": " << languages[i] << std::endl;
    }

    return 0;
}`,
        notes:
          "Range-based for loop (for (const auto& x : vec)) prevents copying. size() method avoids manual sizeof calculations.",
      },
    },
  },
  {
    id: "collections",
    title: "Dynamic Arrays & Lists",
    description:
      "Creating, adding, accessing, and sizing dynamic list collections.",
    category: "data-structures",
    snippets: {
      python: {
        code: `# Dynamic list with heterogeneous items
nums = [10, 20, 30]
nums.append(40)        # Add element
nums.insert(0, 5)      # Insert at start
length = len(nums)     # 5

# Slicing and list comprehension
evens = [x for x in nums if x % 2 == 0]
first_three = nums[:3]
print(f"Nums: {nums}")
print(f"Length: {length}")`,
        notes:
          "Built-in list is dynamic, versatile, supports slicing [start:stop] and list comprehensions.",
      },
      java: {
        code: `import java.util.ArrayList;
import java.util.List;

public class ListDemo {
    public static void main(String[] args) {
        // Generics required for type safety
        List<Integer> nums = new ArrayList<>();
        nums.add(10);
        nums.add(20);
        nums.add(30);
        nums.add(40);

        int length = nums.size();
        int first = nums.get(0); // get by index

        System.out.println("Size: " + length + ", First: " + first);
    }
}`,
        notes:
          "Uses java.util.ArrayList<T> with boxed object types (Integer instead of int). Methods: add(), get(), size().",
      },
      c: {
        code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    // Fixed stack array:
    int static_arr[4] = {10, 20, 30, 40};

    // Dynamic heap allocation:
    int capacity = 4;
    int* nums = (int*)malloc(capacity * sizeof(int));
    if (!nums) return 1;

    nums[0] = 10;
    nums[1] = 20;
    nums[2] = 30;
    nums[3] = 40;

    printf("nums[2] = %d\\n", nums[2]);

    // MUST free heap memory manually!
    free(nums);
    return 0;
}`,
        notes:
          "No built-in dynamic list. Requires manual malloc(), realloc(), and free(). Memory leaks occur if free() is omitted.",
      },
      cpp: {
        code: `#include <iostream>
#include <vector>

int main() {
    // std::vector handles dynamic resizing automatically
    std::vector<int> nums = {10, 20, 30};
    nums.push_back(40); // append

    std::cout << "Size: " << nums.size() << std::endl;
    std::cout << "Front: " << nums.front() << ", Back: " << nums.back() << std::endl;

    // Fast indexed access
    for (size_t i = 0; i < nums.size(); ++i) {
        std::cout << nums[i] << " ";
    }
    std::cout << std::endl;

    // Memory freed automatically via RAII!
    return 0;
}`,
        notes:
          "std::vector provides contiguous memory, bounds checking with at(), and automatic cleanup via RAII destructor.",
      },
    },
  },
  {
    id: "memory-pointers",
    title: "Memory, Pointers & References",
    description:
      "How memory management, pointers, and reference passing work across the 4 languages.",
    category: "memory",
    snippets: {
      python: {
        code: `# Everything in Python is an object reference
a = [1, 2, 3]
b = a          # Both point to same underlying list!
b.append(4)
print(a)       # Prints [1, 2, 3, 4]

# To make a real copy:
import copy
c = a.copy()
c.append(5)
print(a)       # Still [1, 2, 3, 4]

# Memory managed by automatic Garbage Collection (ref count + cycle detector)`,
        notes:
          "No explicit pointer syntax. Assignment passes references. Garbage collector cleans up unreferenced objects automatically.",
      },
      java: {
        code: `public class MemoryDemo {
    public static void main(String[] args) {
        // Primitives pass by value
        int x = 10;
        int y = x; // independent copy

        // Objects pass references by value
        int[] arr1 = {1, 2, 3};
        int[] arr2 = arr1; // both refer to same array!
        arr2[0] = 99;
        System.out.println("arr1[0] is " + arr1[0]); // Prints 99

        // Managed by JVM Garbage Collector (GC)
    }
}`,
        notes:
          "No pointer manipulation. References cannot be computed or offset like in C. Automatic Garbage Collector.",
      },
      c: {
        code: `#include <stdio.h>

void swap(int* a, int* b) {
    int temp = *a; // Dereference pointer
    *a = *b;
    *b = temp;
}

int main(void) {
    int x = 10;
    int* ptr = &x; // Store memory address of x

    printf("Value: %d\\n", *ptr);
    printf("Address: %p\\n", (void*)ptr);

    int y = 20;
    swap(&x, &y); // Pass address for pass-by-reference
    printf("After swap: x=%d, y=%d\\n", x, y);

    return 0;
}`,
        notes:
          "Direct memory access with * (dereference) and & (address-of). Pointers allow low-level hardware and buffer control.",
      },
      cpp: {
        code: `#include <iostream>
#include <memory> // For smart pointers

// Pass-by-reference using & syntax (cleaner than C pointers)
void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 10, y = 20;
    swap(x, y); // No & needed at call site!
    std::cout << "x=" << x << ", y=" << y << std::endl;

    // Modern C++: Unique pointer with automatic free
    auto smartPtr = std::make_unique<int>(100);
    std::cout << "Smart pointer value: " << *smartPtr << std::endl;
    // Memory freed automatically when smartPtr goes out of scope!

    return 0;
}`,
        notes:
          "Features references (&), raw pointers (*), and Smart Pointers (std::unique_ptr, std::shared_ptr) to prevent memory leaks.",
      },
    },
  },
]
