import * as vscode from 'vscode';

type PositionEntry = {
    functionName: string;
    insertAfterLine: number;
};

type ExtendedEntry = PositionEntry & {
    description: string | null;
};

export async function updateExportsBlock() {
    const functionsList = getFunctionNames();
    const moduleExportList = getModuleExportLines();

    const missingFunctions = getMissingExports(functionsList, moduleExportList);
    const exportStartLine = getModuleExportsStartLine();
    let positions = getInsertPositionsForMissingExports(missingFunctions, functionsList, moduleExportList, exportStartLine);
    // positions = adjustInsertLinesWithIndex(positions);

    const extendedPositions = attachDescriptionsToPositions(positions);
    console.log(extendedPositions);

    insertMissingExportsIntoModule(extendedPositions)
}


function getFunctionNames(): string[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return [];
    }

    const doc = editor.document;
    const totalLines = doc.lineCount;

    const functionNames: string[] = [];
    const functionRegex = /^\s*function\s+(\w+)\s*\(/;

    for (let i = 0; i < totalLines; i++) {
        const lineText = doc.lineAt(i).text;
        const match = lineText.match(functionRegex);
        if (match) {
            functionNames.push(match[1]);
        }
    }

    return functionNames;
}


function getModuleExportLines(): { line: number; text: string }[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return [];
    }

    const doc = editor.document;
    const totalLines = doc.lineCount;

    let insideExport = false;
    const exportLines: { line: number; text: string }[] = [];

    for (let i = 0; i < totalLines; i++) {
        const lineText = doc.lineAt(i).text;

        if (!insideExport && lineText.includes('module.exports') && lineText.includes('{')) {
            insideExport = true;
            continue; // skip the opening line
        }

        if (insideExport) {
            if (lineText.includes('};')) {
                break; // end of block
            }

            exportLines.push({ line: i, text: lineText });
        }
    }

    return exportLines;
}

function getMissingExports(
    functionsList: string[],
    moduleExportList: { line: number; text: string }[]
): string[] {
    return functionsList.filter(fn =>
        !moduleExportList.some(entry => entry.text.includes(fn))
    );
}

function getModuleExportsStartLine(): number {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return 0;
    }

    const doc = editor.document;
    const totalLines = doc.lineCount;

    for (let i = 0; i < totalLines; i++) {
        const line = doc.lineAt(i).text;
        if (line.includes('module.exports') && line.includes('{')) {
            return i;
        }
    }

    return 0;
}

function getInsertPositionsForMissingExports(
    missing: string[],
    functionsList: string[],
    moduleExportList: { line: number; text: string }[],
    exportStartLine: number
): { functionName: string; insertAfterLine: number }[] {
    const exportMap = new Map<string, number>();
    for (const entry of moduleExportList) {
        const match = entry.text.match(/\b(\w+)\b/);
        if (match) {
            exportMap.set(match[1], entry.line);
        }
    }

    const result: { functionName: string; insertAfterLine: number }[] = [];

    for (const fn of missing) {
        const indexInFile = functionsList.indexOf(fn);
        if (indexInFile === -1) continue;

        let insertAfterLine: number = exportStartLine + 1; // domyślnie: wstaw zaraz po module.exports = {

        for (let i = indexInFile - 1; i >= 0; i--) {
            const prevFn = functionsList[i];
            if (exportMap.has(prevFn)) {
                insertAfterLine = exportMap.get(prevFn)! + 1;
                break;
            }
        }

        result.push({ functionName: fn, insertAfterLine });
    }

    return result;
}

function adjustInsertLinesWithIndex(
    positions: { functionName: string; insertAfterLine: number }[]
): { functionName: string; insertAfterLine: number }[] {
    return positions.map((entry, index) => ({
        functionName: entry.functionName,
        insertAfterLine: entry.insertAfterLine + index
    }));
}

function attachDescriptionsToPositions(positions: PositionEntry[]): ExtendedEntry[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return [];
    }

    const doc = editor.document;
    const totalLines = doc.lineCount;

    const jsdocStartRegex = /^\s*\/\*\*/;
    const jsdocEndRegex = /^\s*\*\//;
    const jsdocLineRegex = /^\s*\*\s?(.*)/;
    const functionRegex = /^\s*function\s+(\w+)\s*\(/;

    const extended: ExtendedEntry[] = [];

    for (let i = 0; i < totalLines; i++) {
        const lineText = doc.lineAt(i).text;
        const match = lineText.match(functionRegex);
        if (!match) continue;

        const functionName = match[1];
        const positionEntry = positions.find(p => p.functionName === functionName);
        if (!positionEntry) continue;

        // Cofnij się do JSDoc
        const jsdocLines: string[] = [];
        for (let j = i - 1; j >= 0; j--) {
            const line = doc.lineAt(j).text;

            if (jsdocEndRegex.test(line)) continue; // skip */
            if (jsdocStartRegex.test(line)) break;

            const commentMatch = line.match(jsdocLineRegex);
            if (commentMatch) {
                jsdocLines.unshift(commentMatch[1]);
            } else {
                break;
            }
        }

        const description = jsdocLines.length > 0 ? jsdocLines[0] : null;

        extended.push({
            ...positionEntry,
            description,
        });
    }

    return extended;
}


async function insertMissingExportsIntoModule(
    extendedPositions: ExtendedEntry[]
) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    const doc = editor.document;
    const uri = doc.uri;

    const edit = new vscode.WorkspaceEdit();



    for (const entry of extendedPositions) {
        const insertLine = entry.insertAfterLine;

        const insertText =
            `   ${entry.functionName},  ` +
            (entry.description ? ` // ${entry.description.trim()}` : ` // TODO: Add description`);

        const insertPos = new vscode.Position(insertLine, 0);
        edit.insert(uri, insertPos, insertText + '\n');
    }

    await vscode.workspace.applyEdit(edit);
    vscode.window.showInformationMessage('Missing exports inserted into module.exports.');
}