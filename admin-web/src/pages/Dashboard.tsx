import { useEffect, useState } from 'react';
import { Users, FileText, Home, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
    stats: {
        label: string;
        value: number;
        type: string;
    }[];
    recentActivities: {
        id: string;
        user: string;
        action: string;
        target: string;
        time: string;
    }[];
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setData(res.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'users': return Users;
            case 'listings': return Home;
            case 'reports': return FileText;
            case 'bookings': return CheckCircle;
            default: return Home;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'users': return 'bg-[#FF9F1C]';
            case 'listings': return 'bg-[#2EC4B6]';
            case 'reports': return 'bg-[#FF5D5D]';
            case 'bookings': return 'bg-[#CBF3F0]';
            default: return 'bg-gray-200';
        }
    };

    if (loading) {
        return <div className="p-8 text-center font-bold text-xl">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black uppercase mb-2">Tổng quan</h1>
                <p className="text-gray-600 font-bold">Chào mừng trở lại, Admin!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data?.stats.map((stat, index) => {
                    const Icon = getIcon(stat.type);
                    return (
                        <div key={index} className="card-brutal flex items-center space-x-4 hover:-translate-y-1 transition-transform">
                            <div className={`w-12 h-12 ${getColor(stat.type)} border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                                <Icon size={24} className="text-black" strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase">{stat.label}</p>
                                <p className="text-2xl font-black">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-brutal">
                    <h2 className="text-xl font-black uppercase mb-4">Hoạt động gần đây</h2>
                    <div className="space-y-4">
                        {data?.recentActivities.length === 0 ? (
                            <p className="text-gray-500 font-bold text-center py-4">Chưa có hoạt động nào</p>
                        ) : (
                            data?.recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center space-x-3 p-3 border-2 border-black rounded-lg bg-gray-50">
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                    <p className="font-medium text-sm">
                                        <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-bold">{activity.target}</span>
                                    </p>
                                    <span className="text-xs text-gray-500 ml-auto font-bold">
                                        {new Date(activity.time).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card-brutal">
                    <h2 className="text-xl font-black uppercase mb-4">Thống kê nhanh</h2>
                    <div className="h-48 bg-gray-100 border-2 border-black rounded-lg flex items-center justify-center font-bold text-gray-400">
                        Biểu đồ thống kê (Coming Soon)
                    </div>
                </div>
            </div>
        </div>
    );
}
