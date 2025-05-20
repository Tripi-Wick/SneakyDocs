# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-05-20
### Added
- New context menu command: **Generate JSDoc for Function**
  - Automatically analyzes the function under the cursor
  - Inserts a well-formatted JSDoc block with `@param`, `@returns`, and `@example`
  - Supports destructured parameters with default values (e.g. `options = {}`)

- New context menu command: **Export Selected Function**
  - Automatically scans for functions in the file
  - Updates or appends missing entries to the `module.exports` block
  - Preserves comment formatting and export order

## [1.2.0] - 2025-05-12
### Added
- Initial support for **JavaScript** and **TypeScript** JSDoc folding
- Folding range providers for:
  - Python docstrings (`"""` / `'''`)
  - JSDoc comments (`/** */`)
- Context menu options to collapse or uncollapse all doc comments

## [1.1.0] - 2025-05-11
### Initial release
- Basic structure with Python docstring collapsing
- Command palette support
