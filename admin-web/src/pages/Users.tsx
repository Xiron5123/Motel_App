import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Lock, Unlock, User as UserIcon, Edit, Trash2, X, Save } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'RENTER' | 'LANDLORD' | 'ADMIN';
    isActive: boolean;
    avatar: string | null;
    createdAt: string;
}

interface EditUserModalProps {
    user: User;
    onClose: () => void;
    onSave: (updatedUser: Partial<User>) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white border-4 border-black p-6 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black uppercase">Chỉnh sửa người dùng</h2>
                    <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-bold mb-1">Họ và tên</label>
                        <input
                            type="text"
                            className="input-brutal w-full"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Email</label>
                        <input
                            type="email"
                            className="input-brutal w-full"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Số điện thoại</label>
                        <input
                            type="text"
                            className="input-brutal w-full"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Vai trò</label>
                        <select
                            className="input-brutal w-full"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                        >
                            <option value="RENTER">Người thuê (RENTER)</option>
                            <option value="LANDLORD">Chủ trọ (LANDLORD)</option>
                            <option value="ADMIN">Quản trị viên (ADMIN)</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 font-bold border-2 border-black hover:bg-gray-100"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-brutal px-6 py-2 flex items-center space-x-2"
                        >
                            {loading ? <span>Đang lưu...</span> : <><Save size={18} /> <span>Lưu thay đổi</span></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users', {
                params: { page, limit: 10, search },
            });
            setUsers(res.data.data);
            setTotalPages(res.data.meta.totalPages);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(debounce);
    }, [page, search]);

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
            setUsers(users.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Không thể cập nhật trạng thái người dùng');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            alert('Đã xóa người dùng thành công');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Không thể xóa người dùng');
        }
    };

    const handleUpdateUser = async (updatedData: Partial<User>) => {
        if (!editingUser) return;
        try {
            await api.patch(`/users/${editingUser.id}`, updatedData);
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updatedData } : u));
            alert('Cập nhật thông tin thành công');
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black uppercase">Quản lý người dùng</h1>
                <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="input-brutal pl-10 py-2 text-sm"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card-brutal overflow-hidden p-0">
                <table className="w-full text-left">
                    <thead className="bg-black text-white uppercase font-bold">
                        <tr>
                            <th className="p-4">Người dùng</th>
                            <th className="p-4">Liên hệ</th>
                            <th className="p-4">Vai trò</th>
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center font-bold">Đang tải...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center font-bold">Không tìm thấy người dùng nào</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border-2 border-black overflow-hidden">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold">{user.name}</p>
                                                <p className="text-xs text-gray-500">Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-sm">{user.email}</p>
                                        <p className="text-sm">{user.phone || 'Chưa cập nhật'}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`badge-brutal ${user.role === 'ADMIN' ? 'bg-[#FF9F1C] text-black' :
                                            user.role === 'LANDLORD' ? 'bg-[#2EC4B6] text-white' : 'bg-gray-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`badge-brutal ${user.isActive ? 'bg-[#CBF3F0] text-[#2EC4B6]' : 'bg-[#FFD6D6] text-[#FF5D5D]'}`}>
                                            {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 border-2 border-black rounded-lg transition-all hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {user.role !== 'ADMIN' && (
                                                <>
                                                    <button
                                                        onClick={() => toggleStatus(user.id, user.isActive)}
                                                        className={`p-2 border-2 border-black rounded-lg transition-all hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${user.isActive ? 'bg-[#FF5D5D] text-white' : 'bg-[#2EC4B6] text-white'
                                                            }`}
                                                        title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                                    >
                                                        {user.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 border-2 border-black rounded-lg transition-all hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-black text-white"
                                                        title="Xóa người dùng"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center space-x-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn-brutal px-4 py-2 text-sm disabled:opacity-50"
                >
                    Trước
                </button>
                <span className="flex items-center font-bold px-4">
                    Trang {page} / {totalPages}
                </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="btn-brutal px-4 py-2 text-sm disabled:opacity-50"
                >
                    Sau
                </button>
            </div>

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleUpdateUser}
                />
            )}
        </div>
    );
}
