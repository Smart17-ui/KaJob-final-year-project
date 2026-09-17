// frontend/src/features/admin/verifications/components/DocumentViewer.tsx

import { useState } from 'react';
import {
    X,
    ZoomIn,
    Download,
    ExternalLink,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MEDIA_BASE_URL =
    import.meta.env.VITE_API_URL?.replace('/api', '') ||
    'http://127.0.0.1:8000';

interface Document {
    id: number;
    document_type: string;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
}

interface DocumentViewerProps {
    documents: Document[];
    userName: string;
}

export const DocumentViewer = ({
    documents,
    userName,
}: DocumentViewerProps) => {
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    const getFileUrl = (filePath?: string) => {
        if (!filePath) return '';
        return `${MEDIA_BASE_URL}${filePath}`;
    };

    const isImage = (mimeType?: string) => mimeType?.startsWith('image/');
    const isPdf = (mimeType?: string) => mimeType === 'application/pdf';

    const formatDocType = (docType?: string) => {
        if (!docType) return 'Document';
        return docType.replace(/_/g, ' ');
    };

    if (!documents || documents.length === 0) {
        return (
            <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-admin-card">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-amber-900 mb-1">
                            No Documents Uploaded
                        </h3>
                        <p className="text-sm text-amber-700">
                            This user submitted a verification request without
                            uploading any documents. You cannot verify their
                            identity without seeing their NRC and selfie.
                        </p>
                        <p className="text-xs text-amber-600 mt-3 font-medium">
                            ⚠️ Recommended action: Reject this request and ask
                            the user to resubmit with documents.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const activeDoc = documents[activeTab];

    return (
        <div className="space-y-4">
            {/* Document tabs */}
            <div className="flex gap-2 border-b border-admin-border-light pb-2 overflow-x-auto">
                {documents.map((doc, index) => (
                    <button
                        key={doc.id}
                        onClick={() => setActiveTab(index)}
                        className={`
                            px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap
                            transition-colors
                            ${
                                index === activeTab
                                    ? 'bg-admin-primary-50 text-admin-primary-700 border border-admin-primary-200'
                                    : 'text-admin-text-secondary hover:bg-admin-bg-hover'
                            }
                        `}
                    >
                        {formatDocType(doc.document_type)}
                    </button>
                ))}
            </div>

            {/* Document preview */}
            {activeDoc && (
                <div className="bg-admin-bg-hover rounded-admin-card overflow-hidden">
                    <div className="relative bg-gray-100 flex items-center justify-center min-h-[400px] p-4">
                        {isImage(activeDoc.mime_type) ? (
                            <img
                                src={getFileUrl(activeDoc.file_path)}
                                alt={formatDocType(activeDoc.document_type)}
                                className="max-h-[500px] w-auto object-contain rounded-md shadow-md cursor-zoom-in"
                                onClick={() => setSelectedDoc(activeDoc)}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML =
                                        '<p class="text-admin-text-secondary">Image failed to load</p>';
                                }}
                            />
                        ) : isPdf(activeDoc.mime_type) ? (
                            <iframe
                                src={getFileUrl(activeDoc.file_path)}
                                className="w-full h-[500px] rounded-md"
                                title={formatDocType(activeDoc.document_type)}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-admin-text-secondary mb-4">
                                    Preview not available for this file type
                                </p>
                                <a
                                    href={getFileUrl(activeDoc.file_path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-admin-primary-600 hover:underline"
                                >
                                    <ExternalLink size={16} />
                                    Open in new tab
                                </a>
                            </div>
                        )}
                    </div>

                    {/* File info bar */}
                    <div className="flex items-center justify-between p-4 bg-white border-t border-admin-border-light">
                        <div>
                            <p className="text-sm font-medium text-admin-text-primary">
                                {activeDoc.file_name || 'document'}
                            </p>
                            <p className="text-xs text-admin-text-secondary">
                                {formatDocType(activeDoc.document_type)} •{' '}
                                {activeDoc.file_size
                                    ? `${(activeDoc.file_size / 1024).toFixed(
                                          1
                                      )} KB`
                                    : '—'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {isImage(activeDoc.mime_type) && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={<ZoomIn size={14} />}
                                    onClick={() => setSelectedDoc(activeDoc)}
                                >
                                    Zoom
                                </Button>
                            )}
                            <a
                                href={getFileUrl(activeDoc.file_path)}
                                download={activeDoc.file_name}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={<Download size={14} />}
                                >
                                    Download
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Full-screen zoom modal */}
            {selectedDoc && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedDoc(null)}
                >
                    <button
                        onClick={() => setSelectedDoc(null)}
                        className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={getFileUrl(selectedDoc.file_path)}
                        alt={formatDocType(selectedDoc.document_type)}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default DocumentViewer;
