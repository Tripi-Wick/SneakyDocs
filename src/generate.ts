import * as vscode from 'vscode';

export function generateJSDoc(functionName: string, parameters: string[], returnType: string = 'void'): string {
    const lines: string[] = [];

    lines.push('/**');
    lines.push(` * Executes ${functionName} logic.`);
    lines.push(' *');

    for (const param of parameters) {
        const destructuredMatch = param.match(/^\{(.+)\}\s*=\s*\{\}/);
        if (destructuredMatch) {
            const fields = destructuredMatch[1].split(',').map(f => f.trim()).filter(Boolean);
            lines.push(` * @param {Object} [options={}] - Configuration options.`);

            for (const field of fields) {
                const [nameRaw, defaultValRaw] = field.split('=').map(s => s.trim());
                const name = nameRaw.replace(/^\.\.\./, ''); // usuwamy "...rest" jeśli są
                const defaultVal = defaultValRaw ?? '';
                const jsType = inferTypeFromPrefixOrDefault(name, defaultVal);
                lines.push(` * @param {${jsType}} [options.${name}=${defaultVal}] - TODO: Describe ${name}.`);
            }
        } else {
            const [paramName, defaultValRaw] = param.split('=').map(s => s.trim());
            const jsType = inferTypeFromPrefixOrDefault(paramName, defaultValRaw);
            const displayName = defaultValRaw ? `[${paramName}=${defaultValRaw}]` : paramName;
            lines.push(` * @param {${jsType}} ${displayName} - TODO: Describe ${paramName}.`);
        }
    }

    lines.push(` * @returns {${returnType}}`);
    lines.push(' *');
    lines.push(' * @example');
    lines.push(` * ${functionName}();`);
    lines.push(' */');

    return lines.join('\n');
}
function inferTypeFromPrefixOrDefault(name: string, defaultValue: string | undefined): string {
    if (name.startsWith('s')) return 'string';
    if (name.startsWith('arr')) return 'Array';
    if (name.startsWith('b')) return 'boolean';
    if (name.startsWith('n')) return 'number';
    if (defaultValue === '[]') return 'Array';
    if (defaultValue === 'true' || defaultValue === 'false') return 'boolean';
    if (!isNaN(Number(defaultValue))) return 'number';
    if (defaultValue?.startsWith("'") || defaultValue?.startsWith('"')) return 'string';
    return 'any';
}
function normalizeParameters(rawParams: string[]): string[] {
    const normalized: string[] = [];
    let buffer = '';
    let bracketCount = 0;

    for (const param of rawParams) {
        const openBraces = (param.match(/{/g) || []).length;
        const closeBraces = (param.match(/}/g) || []).length;
        bracketCount += openBraces - closeBraces;

        buffer += (buffer ? ', ' : '') + param;

        if (bracketCount === 0) {
            normalized.push(buffer.trim());
            buffer = '';
        }
    }

    if (buffer) {
        normalized.push(buffer.trim());
    }

    return normalized;
}

// --- KOMENDA VS CODE ---
export async function insertGeneratedJSDoc() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const doc = editor.document;
    const totalLines = doc.lineCount;
    const cursor = editor.selection.active;

    const functionRegexes = [
        /^(export\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
        /^(const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/,
        /^(const|let|var)\s+(\w+)\s*=\s*function\s*\(([^)]*)\)/
    ];

    let foundLine = -1;
    let fnName = '';
    let rawParams = '';

    for (let i = cursor.line; i >= 0; i--) {
        const line = doc.lineAt(i).text.trim();
        for (const regex of functionRegexes) {
            const match = line.match(regex);
            if (match) {
                fnName = match[2];
                rawParams = match[3];
                foundLine = i;
                break;
            }
        }
        if (foundLine !== -1) break;
    }

    if (foundLine === -1) {
        vscode.window.showErrorMessage('Cursor is not inside a recognized function.');
        return;
    }

    const paramList = normalizeParameters(rawParams.split(',').map(p => p.trim()));
    const jsdoc = generateJSDoc(fnName, paramList);

    const insertPos = new vscode.Position(foundLine, 0);

    await editor.edit(editBuilder => {
        editBuilder.insert(insertPos, jsdoc + '\n');
    });

    vscode.window.showInformationMessage(`JSDoc inserted for ${fnName}().`);
}
