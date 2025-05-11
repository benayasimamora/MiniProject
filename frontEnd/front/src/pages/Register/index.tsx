'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'

export default function Register() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('user') // Default role: user
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Handle register logic here
        console.log('Registering user:', { fullName, email, password, role })
        router.push('/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="">
                    <Link href="/">
                        <img
                            className="h-18 cursor-pointer transition-transform hover:scale-105"
                            src="/logo/logotiket.png"
                            alt="Logo"
                        />
                    </Link>
                </div>
            </div>

            {/* Register Form */}
            <div className="max-w-md mx-auto mt-12 px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                            Daftar Akun Baru
                        </h1>
                        <p className="text-gray-500">Buat akun untuk mulai menggunakan layanan kami</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 p-1 rounded-lg"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Daftar Sebagai</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div 
                                    className={`flex flex-col items-center justify-center py-4 px-3 border-2 rounded-xl cursor-pointer transition-all ${
                                        role === 'user' 
                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setRole('user')}
                                >
                                    <User 
                                        className={`h-8 w-8 mb-2 ${role === 'user' ? 'text-blue-600' : 'text-gray-400'}`} 
                                    />
                                    <span className={`font-medium ${role === 'user' ? 'text-blue-600' : 'text-gray-700'}`}>
                                        User
                                    </span>
                                    <span className="text-xs text-gray-500 text-center mt-1">
                                        Pesan tiket event
                                    </span>
                                </div>
                                
                                <div 
                                    className={`flex flex-col items-center justify-center py-4 px-3 border-2 rounded-xl cursor-pointer transition-all ${
                                        role === 'organizer' 
                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setRole('organizer')}
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke={role === 'organizer' ? '#2563eb' : '#9ca3af'} 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        className="h-8 w-8 mb-2"
                                    >
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <span className={`font-medium ${role === 'organizer' ? 'text-blue-600' : 'text-gray-700'}`}>
                                        Organizer
                                    </span>
                                    <span className="text-xs text-gray-500 text-center mt-1">
                                        Buat dan kelola event
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-indigo-700 mt-6"
                        >
                            Daftar Sekarang
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-sm text-gray-600">
                            Sudah punya akun?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-blue-600 hover:text-blue-800 transition-all underline"
                            >
                                Masuk
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}