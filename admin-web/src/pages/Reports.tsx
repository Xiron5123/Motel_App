import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';

interface Report {
    id: string;
    reason: string;
    status: 'PENDING' | 'RESOLVED' | 'REJECTED';
    createdAt: string;
    reporter: {
        id: string;
        name: string;
        email: string;
    };
    message?: {
        id: string;
        content: string;
        sender: {
            name: string;
        };
    };
}

export default function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED'>('ALL');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const fetchReports = async () => {
        try {
            const res = await api.get('/reports');
            setReports(res.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'RESOLVED' | 'REJECTED') => {
        if (!window.confirm(`Bạn có chắc chắn muốn ${status === 'RESOLVED' ? 'xử lý' : 'từ chối'} báo cáo này?`)) return;

        try {
            await api.patch(`/reports/${id}/status`, { status });
            setReports(reports.map(r => r.id === id ? { ...r, status } : r));
            setSelectedReport(null);
        } catch (error) {
            alert('Cập nhật thất bại');
        }
    };

    const filteredReports = reports.filter(r => filter === 'ALL' || r.status === filter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock size={12} /> Chờ xử lý</span>;
            case 'RESOLVED':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> Đã xử lý</span>;
            case 'REJECTED':
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle size={12} /> Từ chối</span>;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Báo cáo vi phạm</h1>
                <div className="flex gap-2">
                    {(['ALL', 'PENDING', 'RESOLVED', 'REJECTED'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {f === 'ALL' ? 'Tất cả' : f === 'PENDING' ? 'Chờ xử lý' : f === 'RESOLVED' ? 'Đã xử lý' : 'Từ chối'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người báo cáo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lý do</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{report.reporter.name}</div>
                                        <div className="text-sm text-gray-500">{report.reporter.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">{report.reason}</div>
                                        {report.message && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <MessageSquare size={12} /> Tin nhắn
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(report.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: vi })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredReports.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Không có báo cáo nào
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Chi tiết báo cáo</h2>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Người báo cáo</label>
                                <p className="text-gray-900">{selectedReport.reporter.name} ({selectedReport.reporter.email})</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500">Lý do</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">{selectedReport.reason}</p>
                            </div>

                            {selectedReport.message && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Nội dung tin nhắn bị báo cáo</label>
                                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                        <p className="text-xs font-bold text-blue-800 mb-1">{selectedReport.message.sender.name}</p>
                                        <p className="text-gray-800">{selectedReport.message.content}</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Đóng
                                </button>

                                {selectedReport.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedReport.id, 'REJECTED')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                                        >
                                            Từ chối
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                                        >
                                            Xử lý vi phạm
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
