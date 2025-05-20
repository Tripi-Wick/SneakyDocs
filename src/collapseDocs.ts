import * as vscode from 'vscode';

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
                if (document.languageId !== 'python') return [];
                const text = document.getText();
                const ranges: vscode.FoldingRange[] = [];
                const docstringRegex = /("""|''')([\s\S]*?)(\1)/g;

                let match: RegExpExecArray | null;
                while ((match = docstringRegex.exec(text))) {
                    const start = document.positionAt(match.index).line;
                    const end = document.positionAt(match.index + match[0].length).line;
                    if (end > start) {
                        ranges.push(new vscode.FoldingRange(start, end));
                    }
                }
                this.docstringCache.set(document.uri.toString(), ranges);
                return ranges;
            }
        };
    }

    getJsdocFoldingProvider(): vscode.FoldingRangeProvider {
        return {
            provideFoldingRanges: (document: vscode.TextDocument): vscode.FoldingRange[] => {
                if (!['javascript', 'typescript'].includes(document.languageId)) return [];
                const text = document.getText();
                const ranges: vscode.FoldingRange[] = [];
                const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;

                let match: RegExpExecArray | null;
                while ((match = jsdocRegex.exec(text))) {
                    const start = document.positionAt(match.index).line;
                    const end = document.positionAt(match.index + match[0].length).line;
                    if (end > start) {
                        ranges.push(new vscode.FoldingRange(start, end));
                    }
                }
                this.docstringCache.set(document.uri.toString(), ranges);
                return ranges;
            }
        };
    }

    async collapseDocsRun() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const lang = editor.document.languageId;
        if (!['python', 'javascript', 'typescript'].includes(lang)) return;

        const docUri = editor.document.uri.toString();
        const ranges = this.docstringCache.get(docUri) ?? [];

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
        if (!['python', 'javascript', 'typescript'].includes(lang)) return;

        await vscode.commands.executeCommand('editor.unfoldAll');
        editor.setDecorations(this.hideDecoration, []);
        this.foldedLines.clear();
    }

    dispose() {
        if (this.hideDecoration) {
            this.hideDecoration.dispose();
        }
    }
}
