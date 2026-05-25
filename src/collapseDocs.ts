import * as vscode from 'vscode';

const PYTHON_DOC_LANGUAGE_ID = 'python';
const JSDOC_LANGUAGE_IDS = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
const SUPPORTED_LANGUAGE_IDS = [PYTHON_DOC_LANGUAGE_ID, ...JSDOC_LANGUAGE_IDS];

export class CollapseDocsManager {
    foldedLines = new Set<string>();
    docstringCache = new Map<string, vscode.FoldingRange[]>();
    hideDecoration: vscode.TextEditorDecorationType;

    constructor() {
        this.hideDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.background'),
            isWholeLine: true
        });
    }

    getPythonFoldingProvider(): vscode.FoldingRangeProvider {
        return {
            provideFoldingRanges: (document: vscode.TextDocument): vscode.FoldingRange[] => {
                if (document.languageId !== PYTHON_DOC_LANGUAGE_ID) return [];
                return this.collectFoldingRanges(document);
            }
        };
    }

    getJsdocFoldingProvider(): vscode.FoldingRangeProvider {
        return {
            provideFoldingRanges: (document: vscode.TextDocument): vscode.FoldingRange[] => {
                if (!JSDOC_LANGUAGE_IDS.includes(document.languageId)) return [];
                return this.collectFoldingRanges(document);
            }
        };
    }

    collectFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
        const text = document.getText();
        const ranges: vscode.FoldingRange[] = [];
        const docRegex = document.languageId === PYTHON_DOC_LANGUAGE_ID
            ? /("""|''')([\s\S]*?)(\1)/g
            : /\/\*\*([\s\S]*?)\*\//g;

        let match: RegExpExecArray | null;
        while ((match = docRegex.exec(text))) {
            const start = document.positionAt(match.index).line;
            const end = document.positionAt(match.index + match[0].length).line;
            if (end > start) {
                ranges.push(new vscode.FoldingRange(start, end));
            }
        }
        this.docstringCache.set(document.uri.toString(), ranges);
        return ranges;
    }

    getCachedOrCurrentRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
        return this.docstringCache.get(document.uri.toString()) ?? this.collectFoldingRanges(document);
    }

    areDocsFolded(document: vscode.TextDocument): boolean {
        const docUri = document.uri.toString();
        const ranges = this.getCachedOrCurrentRanges(document);
        return ranges.length > 0 && ranges.every((range) => this.foldedLines.has(`${docUri}:${range.start}`));
    }

    async collapseDocsRun() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lang = editor.document.languageId;
        if (!SUPPORTED_LANGUAGE_IDS.includes(lang)) return;

        const docUri = editor.document.uri.toString();
        const ranges = this.getCachedOrCurrentRanges(editor.document);

        const decorations: vscode.DecorationOptions[] = [];

        for (const range of ranges) {
            const key = `${docUri}:${range.start}`;
            if (this.foldedLines.has(key)) continue;

            const pos = new vscode.Position(range.start, 0);
            editor.selection = new vscode.Selection(pos, pos);
            await vscode.commands.executeCommand('editor.fold');

            const lineText = editor.document.lineAt(range.start).text;
            decorations.push({
                range: new vscode.Range(range.start, 0, range.start, lineText.length)
            });

            this.foldedLines.add(key);
        }

        editor.setDecorations(this.hideDecoration, decorations);
    }

    async unfoldDocs() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lang = editor.document.languageId;
        if (!SUPPORTED_LANGUAGE_IDS.includes(lang)) return;

        await vscode.commands.executeCommand('editor.unfoldAll');
        editor.setDecorations(this.hideDecoration, []);
        this.foldedLines.clear();
    }

    async toggleDocs() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lang = editor.document.languageId;
        if (!SUPPORTED_LANGUAGE_IDS.includes(lang)) return;

        if (this.areDocsFolded(editor.document)) {
            await this.unfoldDocs();
        } else {
            await this.collapseDocsRun();
        }
    }

    dispose() {
        if (this.hideDecoration) {
            this.hideDecoration.dispose();
        }
    }
}
