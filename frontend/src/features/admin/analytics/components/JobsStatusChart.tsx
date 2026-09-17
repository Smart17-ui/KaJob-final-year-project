// frontend/src/features/admin/analytics/components/JobsStatusChart.tsx

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from 'recharts';

import { Card } from '@/components/ui/Card';
import type { PlatformStats } from '@/types/admin';

interface Props {
    stats: PlatformStats | null;
    loading?: boolean;
}

const COLORS: Record<string, string> = {
    Open: '#94a3b8',        // slate
    Assigned: '#3b82f6',    // blue
    'In Progress': '#f59e0b', // amber
    Completed: '#10b981',   // emerald
    Cancelled: '#ef4444',   // red
};

export const JobsStatusChart = ({ stats, loading }: Props) => {
    const segments = stats
        ? [
              { name: 'Open', value: stats.jobs.open },
              { name: 'Assigned', value: stats.jobs.assigned },
              { name: 'In Progress', value: stats.jobs.in_progress },
              { name: 'Completed', value: stats.jobs.completed },
              { name: 'Cancelled', value: stats.jobs.cancelled },
          ].filter((s) => s.value > 0)
        : [];

    const total = segments.reduce((sum, s) => sum + s.value, 0);

    return (
        <Card padding="md">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-admin-text-primary">
                    Jobs by Status
                </h3>
                <p className="text-xs text-admin-text-secondary mt-0.5">
                    Current state of all jobs on the platform
                </p>
            </div>

            {loading ? (
                <div className="h-72 flex items-center justify-center text-admin-text-tertiary text-sm">
                    Loading chart...
                </div>
            ) : total === 0 ? (
                <div className="h-72 flex items-center justify-center text-admin-text-tertiary text-sm">
                    No jobs yet.
                </div>
            ) : (
                <div className="h-72 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={segments}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {segments.map((segment) => (
                                    <Cell
                                        key={segment.name}
                                        fill={COLORS[segment.name] || '#cbd5e1'}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: 12 }}
                                iconType="circle"
                                layout="horizontal"
                                verticalAlign="bottom"
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center total label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center -mt-8">
                            <div className="text-2xl font-bold text-admin-text-primary">
                                {total}
                            </div>
                            <div className="text-[10px] uppercase tracking-wide text-admin-text-tertiary">
                                Total Jobs
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default JobsStatusChart;
