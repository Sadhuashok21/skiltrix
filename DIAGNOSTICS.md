# CodeLab diagnostics

The Monaco CodeLab and ABAP Studio use debounced source checks. CodeLab waits 450 ms after an edit, cancels the previous request, and rejects responses with a stale request, project, file, or version identifier. Checks are limited to files owned by the authenticated project. The project-wide action reads tracked files only, checks at most 100 files, and has a 10 second budget. Results are not cached.

The shared result format includes project-relative file, severity, code, message, source, category, and provider positions when the provider supplies them. Coordinates are 1-based for Monaco. Providers that do not report a column leave it unset; the editor marks the reported line. The Problems views support severity filtering, counts, hover details, click navigation, and F8 / Shift+F8 navigation in CodeLab.

## Providers and limits

| Files | Provider | Checks | Requirements and limits |
| --- | --- | --- | --- |
| Python | Python `compile()` | Syntax and indentation errors with parser line/column | Does not execute code; no Pyright/Ruff or general undefined-name analysis is configured. |
| PHP | `php -l` | Parse errors with PHP-reported line | PHP CLI required. Does not run PHPStan/Psalm, framework bootstraps, or extension checks. |
| JavaScript / TypeScript / JSX / TSX | Project TypeScript compiler (`tsc`) | Parser and single-file compiler diagnostics, including type errors | Node and `skiltrix/node_modules/typescript` required. Runs with `--noResolve` in a temp directory; project tsconfig, dependency types, and cross-file import resolution are not loaded. |
| Java | `javac -proc:none` | Parser, symbol, and type diagnostics | JDK required. No annotation processors, project classpath, Maven/Gradle, or framework checks. |
| C / C++ | GCC or Clang `-fsyntax-only` | Parser and compiler diagnostics | GCC/Clang required. No project headers, build-system flags, or project include paths are loaded. |
| SQL | SQLite `EXPLAIN` against the selected workspace database | SQLite syntax, schema references, and supported SkilTrix dialect command syntax | Uses the project's actual SQLite database read-only. It does not execute the query. SQL features implemented only in the dispatcher receive basic command-shape validation. |
| ABAP | Existing SkilTrix lexer/parser | Supported-subset grammar and parser diagnostics | Not a SAP compiler. Unsupported statements are labeled simulator limitations; ABAP columns, full type checking, DDIC semantics, and SAP release compatibility are not verified. |
| Django templates | Django template parser | Template tag/expression syntax | Does not render templates or verify all runtime context variables and installed tag libraries. |
| HTML | Python `HTMLParser` with element-stack checks | Mismatched and unclosed tags | Not a full HTML5 conformance validator; asset resolution and all optional-tag rules are not checked. |
| CSS | PostCSS parser | CSS parse errors | PostCSS required; no stylelint/property-value validation. SCSS/Less report the provider as unavailable. |
| JSON | Python JSON parser | JSON syntax with line/column | No schema validation. |
| Django project-wide static checks | Python AST inspection | Python syntax, local URL/import targets, duplicate literal `INSTALLED_APPS`/`MIDDLEWARE` entries, migration package marker | Does not import project code or connect to its database. Full `manage.py check` and migration checks must be run explicitly inside the selected project's isolated environment. |

Known code extensions without an installed provider return `TOOL_UNAVAILABLE` or `DIAGNOSTIC_PROVIDER_UNAVAILABLE`; they are not marked as valid. Plain text and unknown non-code files are left alone.

## Safety

Live checks do not execute Python, PHP, JavaScript, Java, C/C++, SQL, or Django application code. PHP lint, javac, GCC/Clang, and TypeScript run in unique temporary directories with time limits. SQL is prepared with SQLite `EXPLAIN` using a read-only connection. Expensive full Django checks are not run automatically because they import project code and may initialize project databases.

## Verification

Run the frontend state tests with `npm run test:diagnostics`. Backend provider and workspace ownership tests run with `python manage.py test skiltrix.tests_diagnostics skiltrix.test_workspace_ownership` from `apis/`. The test suite covers parser locations, stale result rejection, marker cleanup, workspace isolation, SQL non-execution, and explicit missing-tool responses.
