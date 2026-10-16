import { useState } from 'react';
import {
    AlertTriangle,
    Download,
    ExternalLink,
    FileText,
    Image as ImageIcon,
    X,
    ZoomIn,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import API_BASE_URL from '@/api/config';

const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

interface Document {
    id: number;
    document_type: string;
    document_type_display?: string;
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
}

interface DocumentViewerProps {
    documents: Document[];
    userName: string;
}

export const DocumentViewer = ({ documents, userName }: DocumentViewerProps) => {
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [imageError, setImageError] = useState(false);

    const getFileUrl = (fileUrl?: string) => {
        if (!fileUrl) return '';
        if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

        const base = MEDIA_BASE_URL.replace(/\/$/, '');
        const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
        return `${base}${path}`;
    };

    const isImage = (mimeType?: string) => mimeType?.startsWith('image/');
    const isPdf = (mimeType?: string) => mimeType === 'application/pdf';
    const formatDocType = (docType?: string) =>
        (docType || 'Document')
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    const getDocLabel = (doc: Document) =>
        doc.document_type_display || formatDocType(doc.document_type);
    const formatFileSize = (size: number) => {
        if (!size) return 'Size unavailable';
        return size >= 1024 * 1024
            ? `${(size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.max(1, Math.round(size / 1024))} KB`;
    };

    const handleTabChange = (index: number) => {
        setActiveTab(index);
        setImageError(false);
    };

    if (!documents?.length) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700 shadow-sm">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            No verification documents
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                            {userName} submitted a verification request without attaching supporting files.
                        </p>
                        <p className="mt-3 text-xs font-medium text-amber-800">
                            Request the required documents before making a decision.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const activeIndex = Math.min(activeTab, documents.length - 1);
    const activeDoc = documents[activeIndex];
    const docLabel = getDocLabel(activeDoc);
    const fileUrl = getFileUrl(activeDoc.file_url);

    return (
        <div className="space-y-4 sm:space-y-5">
            <div
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
                role="tablist"
                aria-label="Submitted verification documents"
            >
                {documents.map((doc, index) => (
                    <button
                        key={doc.id}
                        type="button"
                        role="tab"
                        aria-selected={index === activeIndex}
                        tabIndex={index === activeIndex ? 0 : -1}
                        onClick={() => handleTabChange(index)}
                        className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                            index === activeIndex
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {isPdf(doc.mime_type) ? (
                            <FileText size={16} />
                        ) : (
                            <ImageIcon size={16} />
                        )}
                        {getDocLabel(doc)}
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-slate-500">
                            {index + 1}
                        </span>
                    </button>
                ))}
            </div>

            <section
                id={`verification-document-${activeDoc.id}`}
                role="tabpanel"
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
                <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            {isPdf(activeDoc.mime_type) ? (
                                <FileText size={19} />
                            ) : (
                                <ImageIcon size={19} />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                                {activeDoc.file_name || docLabel}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {docLabel} <span aria-hidden="true">·</span>{' '}
                                {formatFileSize(activeDoc.file_size)}
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {isImage(activeDoc.mime_type) && !imageError && (
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={<ZoomIn size={14} />}
                                onClick={() => setSelectedDoc(activeDoc)}
                            >
                                Enlarge
                            </Button>
                        )}
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <ExternalLink size={14} />
                            Open file
                        </a>
                        <a
                            href={fileUrl}
                            download={activeDoc.file_name}
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        >
                            <Download size={14} />
                            Download
                        </a>
                    </div>
                </div>

                <div className="relative flex min-h-[320px] items-center justify-center bg-slate-100 p-3 sm:min-h-[440px] sm:p-6">
                    {isImage(activeDoc.mime_type) ? (
                        imageError ? (
                            <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                                <ImageIcon size={24} className="mx-auto text-slate-400" />
                                <p className="mt-3 text-sm font-semibold text-slate-800">
                                    Preview unavailable
                                </p>
                                <p className="mb-4 mt-1 text-sm leading-5 text-slate-500">
                                    This image could not be loaded. Open or download the file to review it.
                                </p>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                                >
                                    <ExternalLink size={16} />
                                    Open in new tab
                                </a>
                            </div>
                        ) : (
                            <img
                                key={activeDoc.id}
                                src={fileUrl}
                                alt={`${docLabel} submitted by ${userName}`}
                                className="max-h-[65vh] max-w-full cursor-zoom-in rounded-lg object-contain shadow-lg ring-1 ring-black/5"
                                onClick={() => setSelectedDoc(activeDoc)}
                                onError={() => setImageError(true)}
                            />
                        )
                    ) : isPdf(activeDoc.mime_type) ? (
                        <iframe
                            src={fileUrl}
                            className="h-[65vh] min-h-[420px] w-full rounded-lg bg-white shadow-sm"
                            title={`${docLabel} submitted by ${userName}`}
                        />
                    ) : (
                        <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                            <FileText size={24} className="mx-auto text-slate-400" />
                            <p className="mt-3 text-sm font-semibold text-slate-800">
                                Preview not supported
                            </p>
                            <p className="mb-4 mt-1 text-sm leading-5 text-slate-500">
                                Open or download this file to review it.
                            </p>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                            >
                                <ExternalLink size={16} />
                                Open in new tab
                            </a>
                        </div>
                    )}
                </div>
            </section>

            {selectedDoc && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-3 backdrop-blur-sm sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${getDocLabel(selectedDoc)} preview`}
                    onClick={() => setSelectedDoc(null)}
                >
                    <button
                        type="button"
                        onClick={() => setSelectedDoc(null)}
                        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white sm:right-5 sm:top-5"
                        aria-label="Close document preview"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={getFileUrl(selectedDoc.file_url)}
                        alt={`${getDocLabel(selectedDoc)} submitted by ${userName}`}
                        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default DocumentViewer;
