// frontend/src/features/admin/verifications/VerificationsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';

import { adminVerificationsApi } from '@/api/admin/verifications';
import type { PendingVerification } from '@/types/admin';

import { VerificationStats } from './components/VerificationStats';
import { VerificationsTable } from './components/VerificationsTable';

// ============================================
// TABS
// ============================================

const TABS = [
    { id: 'PENDING', label: 'Pending' },
    { id: 'VERIFIED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
];

// Map UI tab id → backend status value
const TAB_TO_STATUS: Record<string, string> = {
    PENDING: 'UNDER_REVIEW',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED',
};

// ============================================
// COMPONENT
// ============================================

export const VerificationsPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [verifications, setVerifications] = useState<PendingVerification[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Stats
    const [stats, setStats] = useState({
        pending: 0,
        verified: 0,
        rejected: 0,
    });

    // Tab
    const [activeTab, setActiveTab] = useState(
        searchParams.get('tab') || 'PENDING'
    );

    // Pagination
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState(20);

    // ============ FETCH ============
    const fetchVerifications = useCallback(async () => {
        try {
            setLoading(true);

            // Backend filters by status — one request per tab.
            const wantedStatus = TAB_TO_STATUS[activeTab];

            const data = await adminVerificationsApi.getVerifications({
                status: wantedStatus as any,
                page,
                page_size: pageSize,
            });

            const results: PendingVerification[] =
                (data as any)?.results || [];
            const count = (data as any)?.count || 0;

            setVerifications(results);
            setTotalCount(count);
        } catch (error: any) {
            showToast({
                type: 'error',
                title: 'Failed to load verifications',
                message: error.message,
            });
            setVerifications([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, pageSize, showToast]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await adminVerificationsApi.getStats();
            setStats({
                pending: data?.pending || 0,
                verified: data?.verified || 0,
                rejected: data?.rejected || 0,
            });
        } catch (error) {
            console.warn('Failed to load verification stats');
        }
    }, []);

    useEffect(() => {
        fetchVerifications();
    }, [fetchVerifications]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Sync URL params
    useEffect(() => {
        const params: Record<string, string> = {};
        if (activeTab !== 'PENDING') params.tab = activeTab;
        if (page > 1) params.page = String(page);
        setSearchParams(params, { replace: true });
    }, [activeTab, page, setSearchParams]);

    // Reset page on tab change
    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    // ============ HANDLERS ============
    const handleReview = (v: PendingVerification) => {
        navigate(`/admin/verifications/${v.id}`);
    };

    const handleRefresh = () => {
        fetchVerifications();
        fetchStats();
    };

    // ============ RENDER ============
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Verifications' }]}
                title="Verifications"
                description="Review pending user verifications."
                actions={
                    <Button
                        variant="secondary"
                        icon={<RefreshCw size={16} />}
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                }
            />

            {/* Stats */}
            <VerificationStats
                pending={stats.pending}
                verified={stats.verified}
                rejected={stats.rejected}
                loading={loading}
            />

            {/* Tabs */}
            <div className="mb-4 border-b border-admin-border-light">
                <nav className="flex items-center gap-1">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative px-4 py-3 text-sm font-medium
                                    transition-colors duration-150
                                    ${isActive
                                        ? 'text-admin-primary-600'
                                        : 'text-admin-text-secondary hover:text-admin-text-primary'
                                    }
                                `}
                            >
                                {tab.label}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-admin-primary-500" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Table */}
            <Card padding="none">
                <VerificationsTable
                    verifications={verifications}
                    loading={loading}
                    onReview={handleReview}
                />

                {!loading && verifications.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                    />
                )}
            </Card>
        </div>
    );
};

export default VerificationsPage;
