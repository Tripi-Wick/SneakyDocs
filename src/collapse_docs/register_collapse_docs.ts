import * as vscode from 'vscode';
import { CollapseDocsManager } from './collapse_docs_manager';
import { PythonFoldingProvider } from './providers/python_provider';
import { JSDocFoldingProvider } from './providers/jsdoc_provider';

export async function registerCollapseDocs(context: vscode.ExtensionContext): Promise<void> {
    await disableFoldingHighlight();

    const pythonProvider = new PythonFoldingProvider();
    const jsdocProvider = new JSDocFoldingProvider();

    const manager = new CollapseDocsManager([pythonProvider, jsdocProvider]);

    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(
            pythonProvider.getDocumentSelectorsMap(),
            pythonProvider
        ),
        vscode.languages.registerFoldingRangeProvider(
            jsdocProvider.getDocumentSelectorsMap(),
            jsdocProvider
        ),
        vscode.commands.registerCommand('collapseDocs.toggle', async () => {
            await manager.toggleDocs();
        })
    );
}

async function disableFoldingHighlight(): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    if (config.get('editor.foldingHighlight') !== false) {
        await config.update('editor.foldingHighlight', false, vscode.ConfigurationTarget.Global);
    }
}