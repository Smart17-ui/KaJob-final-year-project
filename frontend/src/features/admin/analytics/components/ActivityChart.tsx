// frontend/src/features/admin/analytics/components/ActivityChart.tsx

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

import { Card } from '@/components/ui/Card';
import type { DailySummary } from '@/types/admin';

interface Props {
    data: DailySummary[];
    loading?: boolean;
}

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
};

export const ActivityChart = ({ data, loading }: Props) => {
    // Show at most last 90 days for readability
    const chartData = (data || []).slice(-90).map((d) => ({
        date: formatDate(d.date),
        rawDate: d.date,
        'Jobs Created': d.jobs_created,
        'Jobs Completed': d.jobs_completed,
        'New Users': d.new_users,
    }));

    return (
        <Card padding="md">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-admin-text-primary">
                    Activity Over Time
                </h3>
                <p className="text-xs text-admin-text-secondary mt-0.5">
                    Jobs created, completed, and new users per day
                </p>
            </div>

            {loading ? (
                <div className="h-72 flex items-center justify-center text-admin-text-tertiary text-sm">
                    Loading chart...
                </div>
            ) : chartData.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-admin-text-tertiary text-sm">
                    No activity data for this period.
                </div>
            ) : (
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="createdGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0.35}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="completedGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#10b981"
                                        stopOpacity={0.35}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#10b981"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="usersGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#8b5cf6"
                                        stopOpacity={0.35}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#8b5cf6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                stroke="#cbd5e1"
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                stroke="#cbd5e1"
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                                iconType="circle"
                            />

                            <Area
                                type="monotone"
                                dataKey="Jobs Created"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#createdGradient)"
                            />
                            <Area
                                type="monotone"
                                dataKey="Jobs Completed"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#completedGradient)"
                            />
                            <Area
                                type="monotone"
                                dataKey="New Users"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="url(#usersGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
};

export default ActivityChart;
