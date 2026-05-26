# Sneaky Docs

**Sneaky Docs** is a lightweight extension that adds right-click context menu options to collapse or uncollapse all Python docstrings and JavaScript/TypeScript JSDoc blocks in the editor.

## Features

- Adds multiple context menu entries in the editor:
  - `Collapse All Docstrings / JSDoc`
  - `Uncollapse All Docstrings / JSDoc`
  - `Toggle Collapse Docs`
  - `Export Selected Function`
  - `Generate JSDoc for Function`
- Automatically detects and folds:
  - Python docstrings using triple quotes (`'''` or `"""`)
  - JSDoc comments using `/** ... */` in JavaScript, TypeScript, JSX, and TSX files
- Helps improve code readability by hiding large documentation blocks
- Toggles supported doc blocks between collapsed and expanded states with one command
- Automatically adds missing `module.exports` entries for functions in `.js` / `.ts` files, based on file content
- Generates structured JSDoc comments (`/** ... */`) above a selected or surrounding function, including:
  - Parameter names and types
  - Default values
  - Destructured options objects
  - `@returns` and example usage
- Uses smart formatting and preserves indentation/style of surrounding code

## Supported Languages

- Python (`.py`)
- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)

## How to Use

1. Open any `.py`, `.js`, `.jsx`, `.ts`, or `.tsx` file in the editor.
2. Right-click anywhere in the editor.
3. Choose one of the following options:
   - **Collapse All Docstrings / JSDoc**
   - **Uncollapse All Docstrings / JSDoc**
    - **Toggle Collapse Docs** - collapses docs when open and unfolds them when already collapsed
   - **Export Selected Function** – scans the file and inserts missing entries into `module.exports`, keeping correct order and formatting
   - **Generate JSDoc for Function** – analyzes the current function (based on cursor position) and inserts a JSDoc block above it

Alternatively, use the command palette (`Ctrl+Shift+P`) and run:
- `Collapse All Docstrings / JSDoc`
- `Uncollapse All Docstrings / JSDoc`
- `Toggle Collapse Docs`
- `CollapseDocs: Export Selected Function`
- `CollapseDocs: Generate JSDoc for Function`

The default keyboard shortcut for `Toggle Collapse Docs` is `Ctrl+Shift+Alt+D`.

## Recommended Settings

To improve the visual appearance of folded regions (e.g., make them better match dark themes), consider adding this to your `settings.json`:

```json
{
  "workbench.colorCustomizations": {
    "editor.foldBackground": "#00000000"
  }
}
