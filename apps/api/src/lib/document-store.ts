const documentTextStore = new Map<string, string>();

export function storeDocumentText(documentId: string, text: string): void {
    documentTextStore.set(documentId, text);
}

export function getDocumentText(documentId: string): string | undefined {
    return documentTextStore.get(documentId);
}

export function deleteDocumentText(documentId: string): void {
    documentTextStore.delete(documentId)
}