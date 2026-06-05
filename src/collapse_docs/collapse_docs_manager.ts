import * as vscode from 'vscode';
import { DocFoldingProvider } from './providers/doc_folding_provider';

export class CollapseDocsManager {
    foldedLines = new Set<string>();
    hideDecoration: vscode.TextEditorDecorationType;
    providers: DocFoldingProvider[];

    constructor(providersList: DocFoldingProvider[]) {
        this.providers = providersList;
        this.hideDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.background'),
            isWholeLine: true
        });
    }

    public async toggleDocs() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const provider = this.getActiveProvider(editor);
        if (!provider) return;

        if (this.areDocsFolded(editor.document, provider)) {
            await this.unfoldDocs(editor, provider);
        } else {
            await this.collapseDocsRun(editor, provider);
        }
    }

    private async collapseDocsRun(editor: vscode.TextEditor, provider: DocFoldingProvider) {
        const docUri = editor.document.uri.toString();
        const ranges = provider.provideFoldingRanges(editor.document);
        const decorations: vscode.DecorationOptions[] = [];
        const linesToFold: number[] = [];

        for (const range of ranges) {
            const key = `${docUri}:${range.start}`;
            if (this.foldedLines.has(key)) continue;

            linesToFold.push(range.start);
            this.foldedLines.add(key);

            const lineText = editor.document.lineAt(range.start).text;
            decorations.push({
                range: new vscode.Range(range.start, 0, range.start, lineText.length)
            });
        }

        if (linesToFold.length > 0) {
            await vscode.commands.executeCommand('editor.fold', { selectionLines: linesToFold });
        }

        editor.setDecorations(this.hideDecoration, decorations);
    }

    private async unfoldDocs(editor: vscode.TextEditor, provider: DocFoldingProvider) {
        const docUri = editor.document.uri.toString();
        const ranges = provider.provideFoldingRanges(editor.document);
        const linesToUnfold: number[] = [];

        for (const range of ranges) {
            linesToUnfold.push(range.start);
            this.foldedLines.delete(`${docUri}:${range.start}`);
        }

        if (linesToUnfold.length > 0) {
            await vscode.commands.executeCommand('editor.unfold', { selectionLines: linesToUnfold });
        }

        editor.setDecorations(this.hideDecoration, []);
    }

    private areDocsFolded(document: vscode.TextDocument, provider: DocFoldingProvider): boolean {
        const docUri = document.uri.toString();
        const ranges = provider.provideFoldingRanges(document);
        return ranges.length > 0 && ranges.every((range) => this.foldedLines.has(`${docUri}:${range.start}`));
    }

    private getActiveProvider(editor: vscode.TextEditor): DocFoldingProvider | undefined {
        return this.providers.find(p => p.languageIds.includes(editor.document.languageId));
    }
}