
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, User } from 'lucide-react';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
        { path: '/users', label: 'Quản lý người dùng', icon: User },
        { path: '/reports', label: 'Báo cáo vi phạm', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-[#f0f0f0] flex font-mono">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r-4 border-black flex flex-col">
                <div className="p-6 border-b-4 border-black bg-[#FFE66D]">
                    <h1 className="text-2xl font-black uppercase tracking-tighter">XMotel Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isActive
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={3} />
                                <span className="font-bold uppercase">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t-4 border-black bg-gray-100">
                    <div className="flex items-center space-x-3 px-4 py-3 mb-4 border-2 border-black bg-white">
                        <div className="w-8 h-8 bg-black rounded-none flex items-center justify-center">
                            <User size={16} className="text-white" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate uppercase">{user.name}</p>
                            <p className="text-xs truncate font-medium">{user.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-3 px-4 py-2 border-2 border-black bg-[#FF5D5D] text-white font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <LogOut size={20} strokeWidth={3} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}
