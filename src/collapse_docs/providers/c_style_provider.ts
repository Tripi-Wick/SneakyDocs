import { DocFoldingProvider } from './doc_folding_provider';

export class CStyleFoldingProvider extends DocFoldingProvider {
    // C and the languages that share its comment syntax.
    languageIds = ['c', 'cpp', 'java', 'csharp', 'rust'];
    // Block comments (`/* ... */`, which covers doc variants `/** */` and
    // `/*! */`) and runs of two or more consecutive line comments (`//`,
    // including doc variants `///` and `//!`). A single-line block comment, a
    // lone line comment, or a comment trailing code stays on one line and so is
    // left unfolded.
    protected docRegex = /\/\*[\s\S]*?\*\/|^[ \t]*\/\/.*(?:\r?\n[ \t]*\/\/.*)+/gm;
}
