import { DocFoldingProvider } from './doc_folding_provider';

export class PythonFoldingProvider extends DocFoldingProvider {
    languageIds = ['python'];
    protected docRegex = /("""|''')([\s\S]*?)(\1)/g;
}