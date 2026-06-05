import { DocFoldingProvider } from './doc_folding_provider';

export class JSDocFoldingProvider extends DocFoldingProvider {
    languageIds = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
    protected docRegex = /\/\*\*([\s\S]*?)\*\//g;
}