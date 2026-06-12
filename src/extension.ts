import * as vscode from 'vscode';
import { registerCollapseDocs } from './collapse_docs/register_collapse_docs';

export function activate(context: vscode.ExtensionContext) {
    registerCollapseDocs(context);
}

export function deactivate() {}