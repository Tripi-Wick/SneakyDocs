import * as vscode from 'vscode';

export abstract class DocFoldingProvider implements vscode.FoldingRangeProvider {
    abstract languageIds: string[];
    protected abstract docRegex: RegExp;

    public provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
        const text = document.getText();
        const ranges: vscode.FoldingRange[] = [];
        let match: RegExpExecArray | null;

        this.docRegex.lastIndex = 0;

        while ((match = this.docRegex.exec(text))) {
            const range = this.getFoldingRange(document, match);
            if (range) {
                ranges.push(range);
            }
        }

        return ranges;
    }

    public getDocumentSelectorsMap(): vscode.DocumentFilter[] {
        return this.languageIds.map(lang => ({ language: lang, scheme: 'file' }));
    }

    public getDocumentSelectors(): string[] {
        return this.languageIds;
    }

    private getFoldingRange(document: vscode.TextDocument, match: RegExpExecArray): vscode.FoldingRange | null {
        const start = document.positionAt(match.index).line;
        const end = document.positionAt(match.index + match[0].length).line;
        return end > start ? new vscode.FoldingRange(start, end) : null;
    }
}