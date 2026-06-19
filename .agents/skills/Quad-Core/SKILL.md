```markdown
# Quad-Core Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill provides guidance on the development patterns and conventions used in the Quad-Core JavaScript codebase. It covers file naming, import/export styles, commit message practices, and testing patterns. Use this guide to ensure consistency and efficiency when contributing to Quad-Core.

## Coding Conventions

### File Naming
- **Pattern:** PascalCase  
  *Each file name starts with a capital letter and each word is capitalized, with no separators.*
  ```js
  // Example file names:
  MyComponent.js
  DataProcessor.js
  ```

### Import Style
- **Relative Imports:**  
  *Modules are imported using relative paths.*
  ```js
  import Helper from './Helper';
  import DataProcessor from '../utils/DataProcessor';
  ```

### Export Style
- **Default Exports:**  
  *Each module exports a single default export.*
  ```js
  // In DataProcessor.js
  export default function processData(data) {
    // ...
  }
  ```

### Commit Messages
- **Freeform, Short:**  
  *No strict prefixing; average length is ~21 characters.*
  ```text
  Fix data parsing bug
  Add new helper method
  Update UI styles
  ```

## Workflows

### Adding a New Module
**Trigger:** When you need to add a new feature or utility to the codebase  
**Command:** `/add-module`

1. Create a new file using PascalCase (e.g., `NewFeature.js`).
2. Implement your module logic.
3. Use relative imports to include dependencies.
4. Export your module using `export default`.
5. Write a corresponding test file if applicable (see Testing Patterns).
6. Commit changes with a concise message.

### Refactoring Existing Code
**Trigger:** When improving or reorganizing code without changing its external behavior  
**Command:** `/refactor`

1. Identify the target file(s).
2. Apply changes while maintaining PascalCase naming and relative imports.
3. Ensure the default export style is preserved.
4. Update or add tests if necessary.
5. Commit with a brief, descriptive message.

### Writing Tests
**Trigger:** When adding or updating functionality  
**Command:** `/write-test`

1. Create a test file named after the module, using the pattern `*.test.*` (e.g., `DataProcessor.test.js`).
2. Implement tests using the project's preferred testing framework (unknown; check existing tests for reference).
3. Place the test file alongside or in the designated test directory.
4. Run tests to verify correctness.
5. Commit test files with a clear message.

## Testing Patterns

- **File Naming:** Test files follow the `*.test.*` pattern (e.g., `MyComponent.test.js`).
- **Framework:** Not explicitly specified; review existing test files for framework details.
- **Placement:** Test files are typically placed alongside the modules they test or in a dedicated test directory.
- **Example:**
  ```js
  // MyComponent.test.js
  import MyComponent from './MyComponent';

  test('should render correctly', () => {
    // test implementation
  });
  ```

## Commands
| Command        | Purpose                                    |
|----------------|--------------------------------------------|
| /add-module    | Scaffold and add a new module              |
| /refactor      | Refactor existing code                     |
| /write-test    | Create and run tests for a module          |
```
