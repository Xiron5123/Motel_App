import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user } = res.data;

            if (user.role !== 'ADMIN') {
                setError('Bạn không có quyền truy cập vào trang này.');
                setLoading(false);
                return;
            }

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFDEE9] bg-opacity-30">
            <div className="card-brutal w-full max-w-md transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black mb-2">XMotel Admin</h1>
                    <p className="font-bold text-gray-600">TRUY CẬP HỆ THỐNG</p>
                </div>

                {error && (
                    <div className="bg-[#FF5D5D] border-4 border-black text-white px-4 py-3 mb-6 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-black" />
                            </div>
                            <input
                                type="email"
                                required
                                className="input-brutal pl-10"
                                placeholder="ADMIN@XMOTELR.COM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase">Mật khẩu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-black" />
                            </div>
                            <input
                                type="password"
                                required
                                className="input-brutal pl-10"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn-brutal btn-brutal-primary w-full flex justify-center items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP NGAY'}
                    </button>
                </form>
            </div>
        </div>
    );
}
