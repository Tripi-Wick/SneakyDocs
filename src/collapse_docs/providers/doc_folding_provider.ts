import * as vscode from 'vscode';

export abstract class DocFoldingProvider implements vscode.FoldingRangeProvider {
    abstract languageIds: string[];
    protected abstract docRegex: RegExp;

    private readyDocuments = new Set<string>();
    private readyWaiters = new Map<string, Array<() => void>>();

    public provideFoldingRanges(document: vscode.TextDocument, _context?: vscode.FoldingContext,
        token?: vscode.CancellationToken): vscode.FoldingRange[] {
        // A non-undefined token means VS Code (not our own code) is requesting ranges,
        // i.e. it is building its folding model — so editor.fold will now work.
        // Signal anyone waiting to fold this document.
        if (token !== undefined) {
            this.markModelReady(document);
        }

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

    // Resolves once VS Code has requested folding ranges for the document, which
    // means its folding model exists and a fold will be complete rather than partial.
    // Resolves immediately if that has already happened.
    public whenModelReady(document: vscode.TextDocument): Promise<void> {
        const uri = document.uri.toString();
        if (this.readyDocuments.has(uri)) return Promise.resolve();

        return new Promise<void>(resolve => {
            const waiters = this.readyWaiters.get(uri) ?? [];
            waiters.push(resolve);
            this.readyWaiters.set(uri, waiters);
        });
    }

    private markModelReady(document: vscode.TextDocument): void {
        const uri = document.uri.toString();
        this.readyDocuments.add(uri);

        const waiters = this.readyWaiters.get(uri);
        if (waiters) {
            this.readyWaiters.delete(uri);
            waiters.forEach(resolve => resolve());
        }
    }

    // Forget a document's readiness (e.g. when it is closed) so that reopening it
    // waits for VS Code to rebuild the folding model instead of folding against a
    // stale "ready" flag.
    public forgetDocument(document: vscode.TextDocument): void {
        const uri = document.uri.toString();
        this.readyDocuments.delete(uri);
        this.readyWaiters.delete(uri);
    }

    public getDocumentSelectorsMap(): vscode.DocumentFilter[] {
        return this.languageIds.map(lang => ({ language: lang, scheme: 'file' }));
    }

    private getFoldingRange(document: vscode.TextDocument, match: RegExpExecArray): vscode.FoldingRange | null {
        const start = document.positionAt(match.index).line;
        const end = document.positionAt(match.index + match[0].length).line;
        return end > start ? new vscode.FoldingRange(start, end) : null;
    }
}