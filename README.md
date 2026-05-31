# Collapse Docs

**Collapse Docs** is a lightweight extension that adds a right-click context menu option to toggle the visibility of all Python docstrings and JavaScript/TypeScript JSDoc blocks in the editor.

## Features

- Adds a context menu entry in the editor:
  - `Toggle Collapse Docs`
- Automatically detects and folds:
  - Python docstrings using triple quotes (`'''` or `"""`)
  - JSDoc comments using `/** ... */` in JavaScript, TypeScript, JSX, and TSX files
- Helps improve code readability by hiding large documentation blocks
- Toggles supported doc blocks between collapsed and expanded states with one command
- Automatically handles folded region highlight color for seamless integration with your theme

## Supported Languages

- Python (`.py`)
- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)

## How to Use

1. Open any `.py`, `.js`, `.jsx`, `.ts`, or `.tsx` file in the editor.
2. Right-click anywhere in the editor.
3. Choose **Toggle Collapse Docs** - collapses docs when open and unfolds them when already collapsed.

The default keyboard shortcut for `Toggle Collapse Docs` is `Ctrl+Shift+Alt+D`.

Alternatively, use the command palette (`Ctrl+Shift+P`) and run:
- `Toggle Collapse Docs`

### Acknowledgments 🎉
A huge thank you to [Trishan Preet Singh](https://www.linkedin.com/in/007-tripi-wick/) for collaborating! This is the first open-source collaboration for this project, and I am extremely grateful. Trishan shed new light on the it with his excellent fixes and additions. Thank you! 🤜🤛