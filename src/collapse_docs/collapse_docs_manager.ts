import * as vscode from 'vscode';
import { DocFoldingProvider } from './providers/doc_folding_provider';

export class CollapseDocsManager implements vscode.Disposable {
    private readonly foldedLines = new Set<string>();
    private readonly hideDecoration: vscode.TextEditorDecorationType;
    private readonly providers: DocFoldingProvider[];

    constructor(providers: DocFoldingProvider[]) {
        this.providers = providers;
        this.hideDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.background'),
            isWholeLine: true
        });
    }

    public dispose() {
        this.hideDecoration.dispose();
    }

    public async toggleDocs() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const provider = this.getActiveProvider(editor);
        if (!provider) return;

        const ranges = provider.provideFoldingRanges(editor.document);
        if (this.areDocsFolded(editor.document, ranges)) {
            await this.unfoldDocs(editor, ranges);
        } else {
            await this.collapseDocsRun(editor, provider, ranges);
        }
    }

    // Collapse-only entry point for auto-collapse on open: folds the editor's doc
    // blocks if its language is supported and they are not already folded.
    public async collapseDocs(editor: vscode.TextEditor) {
        const provider = this.getActiveProvider(editor);
        if (!provider) return;

        const ranges = provider.provideFoldingRanges(editor.document);
        if (this.areDocsFolded(editor.document, ranges)) return;

        await this.collapseDocsRun(editor, provider, ranges);
    }

    // Drop remembered fold state for a document (e.g. when it is closed) so a
    // later reopen starts fresh instead of being treated as already folded.
    public forgetDocument(document: vscode.TextDocument) {
        const prefix = `${document.uri.toString()}:`;
        for (const key of this.foldedLines) {
            if (key.startsWith(prefix)) {
                this.foldedLines.delete(key);
            }
        }

        for (const provider of this.providers) {
            provider.forgetDocument(document);
        }
    }

    // Tracked keys are block start lines, which shift as the user edits above
    // them while VS Code moves the folds and decorations along with the text.
    // Follow the same shifts (and drop lines edited away) so toggling still
    // reads and writes the right state after edits.
    public handleDocumentChange(event: vscode.TextDocumentChangeEvent) {
        const prefix = `${event.document.uri.toString()}:`;
        let lines: number[] = [];
        for (const key of this.foldedLines) {
            if (key.startsWith(prefix)) {
                lines.push(Number(key.slice(prefix.length)));
            }
        }
        if (lines.length === 0) return;

        for (const change of event.contentChanges) {
            const start = change.range.start.line;
            const end = change.range.end.line;
            const delta = change.text.split('\n').length - 1 - (end - start);
            lines = lines
                .filter(line => line <= start || line > end)
                .map(line => (line > end ? line + delta : line));
        }

        for (const key of this.foldedLines) {
            if (key.startsWith(prefix)) {
                this.foldedLines.delete(key);
            }
        }
        for (const line of lines) {
            this.foldedLines.add(`${prefix}${line}`);
        }
    }

    private async collapseDocsRun(
        editor: vscode.TextEditor,
        provider: DocFoldingProvider,
        ranges: vscode.FoldingRange[]
    ) {
        const docUri = editor.document.uri.toString();
        const linesToFold = ranges
            .map(range => range.start)
            .filter(line => !this.foldedLines.has(`${docUri}:${line}`));

        if (linesToFold.length === 0) return;

        const anchorLine = editor.selection.active.line;
        if (!(await this.foldLines(editor, provider, linesToFold))) return;

        for (const line of linesToFold) {
            this.foldedLines.add(`${docUri}:${line}`);
        }
        this.applyHideDecorations(editor, ranges);
        this.keepLineCentered(editor, anchorLine);
    }

    // VS Code builds its folding model asynchronously and knows the big regions
    // (functions) before the comment regions. Folding a doc line too early
    // collapses the enclosing function instead, so wait until VS Code has queried
    // the provider (model is building, comment regions included) and let it
    // finish assembling. Returns false without folding if the model never became
    // ready within the timeout or the editor is no longer active — folding then
    // would collapse the wrong region, or act on a different file since
    // editor.fold targets the active editor.
    private async foldLines(
        editor: vscode.TextEditor,
        provider: DocFoldingProvider,
        linesToFold: number[]
    ): Promise<boolean> {
        const ready = await Promise.race([
            provider.whenModelReady(editor.document).then(() => true),
            this.delay(2000).then(() => false)
        ]);
        await this.delay(50);

        if (!ready || vscode.window.activeTextEditor !== editor) return false;

        // Expand first: if a doc block is already folded (e.g. VS Code restored
        // the fold state on reopen), folding it again escalates to the enclosing
        // function. Unfolding an already-expanded line is a no-op.
        await vscode.commands.executeCommand('editor.unfold', { selectionLines: linesToFold });
        await vscode.commands.executeCommand('editor.fold', { selectionLines: linesToFold });
        return true;
    }

    // Paint the whole-line background overlay over every currently folded doc line
    // so the leftover header line (e.g. `/**`) blends into the editor. Rebuilt in
    // full because setDecorations replaces the previous set.
    private applyHideDecorations(editor: vscode.TextEditor, ranges: vscode.FoldingRange[]) {
        const docUri = editor.document.uri.toString();
        const decorations: vscode.DecorationOptions[] = [];

        for (const range of ranges) {
            if (!this.foldedLines.has(`${docUri}:${range.start}`)) continue;

            const lineLength = editor.document.lineAt(range.start).text.length;
            decorations.push({ range: new vscode.Range(range.start, 0, range.start, lineLength) });
        }

        editor.setDecorations(this.hideDecoration, decorations);
    }

    // Collapsing shifts the remaining content upward, so re-reveal the line the
    // user was on, centered, to keep their focus in place instead of jumping.
    private keepLineCentered(editor: vscode.TextEditor, line: number) {
        editor.revealRange(new vscode.Range(line, 0, line, 0), vscode.TextEditorRevealType.InCenter);
    }

    private async unfoldDocs(editor: vscode.TextEditor, ranges: vscode.FoldingRange[]) {
        const docUri = editor.document.uri.toString();
        const linesToUnfold = ranges.map(range => range.start);

        for (const line of linesToUnfold) {
            this.foldedLines.delete(`${docUri}:${line}`);
        }

        if (linesToUnfold.length > 0) {
            await vscode.commands.executeCommand('editor.unfold', { selectionLines: linesToUnfold });
        }

        editor.setDecorations(this.hideDecoration, []);
    }

    private areDocsFolded(document: vscode.TextDocument, ranges: vscode.FoldingRange[]): boolean {
        const docUri = document.uri.toString();
        return ranges.length > 0 && ranges.every(range => this.foldedLines.has(`${docUri}:${range.start}`));
    }

    private getActiveProvider(editor: vscode.TextEditor): DocFoldingProvider | undefined {
        // Providers are registered for the 'file' scheme only, so other schemes
        // (diff views, untitled buffers) have no doc ranges in VS Code's folding
        // model and folding there would collapse the wrong region.
        if (editor.document.uri.scheme !== 'file') return undefined;

        return this.providers.find(p => p.languageIds.includes(editor.document.languageId));
    }

    private delay(ms: number): Promise<void> {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }
}
