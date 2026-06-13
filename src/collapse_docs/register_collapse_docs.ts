import * as vscode from 'vscode';
import { CollapseDocsManager } from './collapse_docs_manager';
import { PythonFoldingProvider } from './providers/python_provider';
import { JSDocFoldingProvider } from './providers/jsdoc_provider';
import { CStyleFoldingProvider } from './providers/c_style_provider';

export function registerCollapseDocs(context: vscode.ExtensionContext): void {
    const pythonProvider = new PythonFoldingProvider();
    const jsdocProvider = new JSDocFoldingProvider();
    const cStyleProvider = new CStyleFoldingProvider();

    const manager = new CollapseDocsManager([pythonProvider, jsdocProvider, cStyleProvider]);

    context.subscriptions.push(
        manager,
        vscode.languages.registerFoldingRangeProvider(
            pythonProvider.getDocumentSelectorsMap(),
            pythonProvider
        ),
        vscode.languages.registerFoldingRangeProvider(
            jsdocProvider.getDocumentSelectorsMap(),
            jsdocProvider
        ),
        vscode.languages.registerFoldingRangeProvider(
            cStyleProvider.getDocumentSelectorsMap(),
            cStyleProvider
        ),
        vscode.commands.registerCommand('collapseDocs.toggle', async () => {
            await manager.toggleDocs();
        }),
        // Fold state is remembered per document; it follows edits and is
        // dropped when the document closes so a later reopen starts fresh.
        vscode.workspace.onDidChangeTextDocument(event => manager.handleDocumentChange(event)),
        vscode.workspace.onDidCloseTextDocument(document => manager.forgetDocument(document)),
        ...registerAutoCollapseOnOpen(manager)
    );
}

// Opt-in (collapseDocs.autoCollapseOnOpen, default off): collapse a file's docs
// the first time it becomes active. A set of already-collapsed documents keeps
// tab switches from re-collapsing docs the user has manually expanded; closing a
// file forgets it, so reopening it collapses again.
function registerAutoCollapseOnOpen(manager: CollapseDocsManager): vscode.Disposable[] {
    const autoCollapsed = new Set<string>();

    const run = (editor: vscode.TextEditor | undefined) => {
        if (!editor || !autoCollapseEnabled()) return;

        const uri = editor.document.uri.toString();
        if (autoCollapsed.has(uri)) return;

        autoCollapsed.add(uri);
        manager.collapseDocs(editor).catch(error =>
            console.error('Collapse Docs: auto-collapse on open failed', error));
    };

    run(vscode.window.activeTextEditor);
    return [
        vscode.window.onDidChangeActiveTextEditor(run),
        vscode.workspace.onDidCloseTextDocument(document => autoCollapsed.delete(document.uri.toString()))
    ];
}

function autoCollapseEnabled(): boolean {
    return vscode.workspace.getConfiguration('collapseDocs').get<boolean>('autoCollapseOnOpen', false);
}
