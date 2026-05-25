import * as vscode from 'vscode';
import { updateExportsBlock } from './export';
import { insertGeneratedJSDoc } from './generate';
import { CollapseDocsManager } from './collapseDocs';

let collapseDocsManager: CollapseDocsManager;

export function activate(context: vscode.ExtensionContext) {
	console.log('CollapseDocs activated');

	collapseDocsManager = new CollapseDocsManager();

	// Folding providers
	context.subscriptions.push(
		vscode.languages.registerFoldingRangeProvider(
			{ language: 'python', scheme: 'file' },
			collapseDocsManager.getPythonFoldingProvider()
		),
		vscode.languages.registerFoldingRangeProvider(
			[
				{ language: 'javascript', scheme: 'file' },
				{ language: 'typescript', scheme: 'file' },
				{ language: 'javascriptreact', scheme: 'file' },
				{ language: 'typescriptreact', scheme: 'file' }
			],
			collapseDocsManager.getJsdocFoldingProvider()
		)
	);

	// Collapse command
	const foldCommand = vscode.commands.registerCommand('collapseDocs.run', async () => {
		await collapseDocsManager.collapseDocsRun();
	});

	// Unfold command
	const unfoldCommand = vscode.commands.registerCommand('collapseDocs.unfold', async () => {
		await collapseDocsManager.unfoldDocs();
	});

	const toggleCommand = vscode.commands.registerCommand('collapseDocs.toggle', async () => {
		await collapseDocsManager.toggleDocs();
	});

	// Export function command
	const exportCommand = vscode.commands.registerCommand('collapseDocs.exportFunction', updateExportsBlock);

	// Export function command
	const generateCommand = vscode.commands.registerCommand('collapseDocs.generateDocs', insertGeneratedJSDoc);

	context.subscriptions.push(foldCommand, unfoldCommand, toggleCommand, exportCommand, generateCommand);
}

export function deactivate() {
	if (collapseDocsManager) {
		collapseDocsManager.dispose();
	}
}
