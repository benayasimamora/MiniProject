'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  Mail,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Ticket,
  Trash,
  Users,
  X,
  XCircle,
  ChevronDown,
  Paperclip,
  AlertTriangle,
  Info
} from 'lucide-react'

// Mock data
const mockEvents = [
  {
    id: 1,
    title: 'Music Festival 2025',
    date: '2025-06-15',
    location: 'Jakarta Convention Center',
    status: 'upcoming',
    ticketsSold: 182,
    totalRevenue: 18200000,
    imageUrl: '/api/placeholder/400/200?text=Music+Festival',
    availableSeats: 500,
  },
  {
    id: 2,
    title: 'Tech Conference 2025',
    date: '2025-07-20',
    location: 'Grand Ballroom Hotel Mulia',
    status: 'upcoming',
    ticketsSold: 145,
    totalRevenue: 29000000,
    imageUrl: '/api/placeholder/400/200?text=Tech+Conference',
    availableSeats: 300,
  },
  {
    id: 3,
    title: 'Business Workshop',
    date: '2025-05-25',
    location: 'Kota Kasablanka Mall',
    status: 'upcoming',
    ticketsSold: 78,
    totalRevenue: 7800000,
    imageUrl: '/api/placeholder/400/200?text=Business+Workshop',
    availableSeats: 100,
  },
]

const mockTransactions = [
  {
    id: 'TRX-001',
    eventId: 1,
    eventName: 'Music Festival 2025',
    customer: 'Budi Santoso',
    customerEmail: 'budi@example.com',
    date: '2025-05-05',
    amount: 1000000,
    status: 'pending',
    paymentProof: '/api/placeholder/300/200?text=Bukti+TRX-001',
    couponUsed: 'DISC10',
    pointsUsed: 50,
  },
  {
    id: 'TRX-002',
    eventId: 1,
    eventName: 'Music Festival 2025',
    customer: 'Siti Rahayu',
    customerEmail: 'siti@example.com',
    date: '2025-05-06',
    amount: 1500000,
    status: 'accepted',
    paymentProof: '/api/placeholder/300/200?text=Bukti+TRX-002',
    couponUsed: null,
    pointsUsed: 0,
  },
  {
    id: 'TRX-003',
    eventId: 2,
    eventName: 'Tech Conference 2025',
    customer: 'Ahmad Hidayat',
    customerEmail: 'ahmad@example.com',
    date: '2025-05-07',
    amount: 2000000,
    status: 'rejected',
    paymentProof: '/api/placeholder/300/200?text=Bukti+TRX-003',
    couponUsed: 'TECH20',
    pointsUsed: 100,
  },
  {
    id: 'TRX-004',
    eventId: 3,
    eventName: 'Business Workshop',
    customer: 'Dewi Pratiwi',
    customerEmail: 'dewi@example.com',
    date: '2025-05-08',
    amount: 800000,
    status: 'pending',
    paymentProof: '/api/placeholder/300/200?text=Bukti+TRX-004',
    couponUsed: null,
    pointsUsed: 20,
  }
]

const mockAttendees = [
  {
    id: 1,
    name: 'Budi Santoso',
    email: 'budi@example.com',
    eventId: 1,
    eventName: 'Music Festival 2025',
    ticketQuantity: 2,
    ticketType: 'VIP',
    totalPaid: 1000000
  },
  {
    id: 2,
    name: 'Siti Rahayu',
    email: 'siti@example.com',
    eventId: 1,
    eventName: 'Music Festival 2025',
    ticketQuantity: 3,
    ticketType: 'Regular',
    totalPaid: 1500000
  },
  {
    id: 3,
    name: 'Ahmad Hidayat',
    email: 'ahmad@example.com',
    eventId: 2,
    eventName: 'Tech Conference 2025',
    ticketQuantity: 1,
    ticketType: 'VIP',
    totalPaid: 2000000 // This should be 0 or refunded if rejected and linked to TRX-003
  },
  {
    id: 4,
    name: 'Dewi Pratiwi',
    email: 'dewi@example.com',
    eventId: 3,
    eventName: 'Business Workshop',
    ticketQuantity: 2,
    ticketType: 'Regular',
    totalPaid: 800000
  },
  {
    id: 5,
    name: 'Eko Wibowo',
    email: 'eko@example.com',
    eventId: 1,
    eventName: 'Music Festival 2025',
    ticketQuantity: 1,
    ticketType: 'Early Bird',
    totalPaid: 750000
  },
]

// Chart data (simplified for this example, use a library like Recharts or Chart.js for real charts)
const monthlyRevenueData = [
  { name: 'Jan', revenue: 5000000 }, { name: 'Feb', revenue: 7500000 },
  { name: 'Mar', revenue: 12000000 }, { name: 'Apr', revenue: 8500000 },
  { name: 'May', revenue: 15000000 }, { name: 'Jun', revenue: 0 }, // Assuming current month is May for mock
  // ... other months
];

const ticketSalesData = [
  { name: 'Jan', sales: 50 }, { name: 'Feb', sales: 75 },
  { name: 'Mar', sales: 120 }, { name: 'Apr', sales: 85 },
  { name: 'May', sales: 150 }, { name: 'Jun', sales: 0 },
  // ... other months
];


// Dashboard component
export default function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentEventForEdit, setCurrentEventForEdit] = useState<number | null>(null) // For editing an event
  const [filterStatus, setFilterStatus] = useState('all')
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [statisticsPeriod, setStatisticsPeriod] = useState('month')
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null)
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<number | 'all'>(mockEvents[0]?.id || 'all');


  // Function to show notification and auto-hide
  const showNotif = (type: 'success' | 'error' | 'info', message: string, duration = 3000) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  // Function for transaction handling
  const handleTransactionAction = (transaction: any, action: 'accept' | 'reject') => {
    console.log(`Transaction ${transaction.id} ${action}ed`);
    // In a real app, this would call an API endpoint
    // Update mock data for demo purposes
    const updatedTransactions = mockTransactions.map(t =>
      t.id === transaction.id ? { ...t, status: action } : t
    );
    // For simplicity, not directly modifying mockTransactions state here as it's not a state variable
    // In a real app, you'd refetch or update state from API response.
    
    let message = '';
    if (action === 'accept') {
      message = `Transaksi ${transaction.id} oleh ${transaction.customer} telah diterima. Email konfirmasi dikirim.`;
      // Simulate adding attendee if not already there from a pending state
    } else {
      message = `Transaksi ${transaction.id} oleh ${transaction.customer} telah ditolak. Email notifikasi dikirim.`;
      if (transaction.couponUsed) {
        message += ` Kupon ${transaction.couponUsed} dikembalikan.`;
      }
      if (transaction.pointsUsed > 0) {
        message += ` Poin (${transaction.pointsUsed}) dikembalikan.`;
      }
      message += ` Kursi untuk event ${transaction.eventName} telah dipulihkan.`;
    }
    
    showNotif('success', message, 5000);
    setShowTransactionModal(false);
    setSelectedTransaction(null);

    // Manually trigger re-render of filtered transactions if needed, or better, manage transactions in state
    // For now, we rely on the filterStatus change or other state change to re-render the list.
    // To see immediate change, we'd need to manage mockTransactions in a state:
    // setMockTransactionsState(updatedTransactions);
  }

  // Filter transactions based on status
  const filteredTransactions = mockTransactions.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  // Filter attendees based on selected event
  const filteredAttendees = mockAttendees.filter(attendee => {
    if (selectedEventForAttendees === 'all') return true;
    return attendee.eventId === selectedEventForAttendees;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">Akan Datang</span>;
      case 'completed': return <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Selesai</span>;
      case 'cancelled': return <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">Dibatalkan</span>;
      case 'pending': return <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">Menunggu</span>;
      case 'accepted': return <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Diterima</span>;
      case 'rejected': return <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">Ditolak</span>;
      default: return <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  // Calculate overview stats
  const totalTicketsSold = mockEvents.reduce((sum, event) => sum + event.ticketsSold, 0);
  const totalRevenue = mockEvents.reduce((sum, event) => sum + event.totalRevenue, 0);
  const pendingTransactionsCount = mockTransactions.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Notification Popup */}
        {notification && (
            <div 
                className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 flex items-start space-x-2
                ${notification.type === 'success' ? 'bg-green-500 text-white' : ''}
                ${notification.type === 'error' ? 'bg-red-500 text-white' : ''}
                ${notification.type === 'info' ? 'bg-blue-500 text-white' : ''}
            `}>
                {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
                {notification.type === 'error' && <AlertTriangle className="h-5 w-5" />}
                {notification.type === 'info' && <Info className="h-5 w-5" />}
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} className="ml-auto -mt-1 -mr-1">
                    <X className="h-5 w-5" />
                </button>
            </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="flex justify-between items-center px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center">
                        {/* Replace with your actual logo */}
                        <Ticket className="h-8 w-8 text-blue-600" /> 
                        <span className="ml-2 text-xl font-bold text-gray-800">
                            TiketKita
                        </span>
                    </Link>
                    <h1 className="ml-6 text-lg font-medium text-gray-600 hidden md:block">
                        Organizer Dashboard
                    </h1>
                </div>
                
                <div className="flex items-center space-x-3">
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Cari event..."
                            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="relative">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <Mail className="h-5 w-5 text-gray-500" />
                            {pendingTransactionsCount > 0 && (
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500" />
                            )}
                        </button>
                    </div>
                    
                    <div className="relative group">
                        <button className="flex items-center p-1 rounded-full hover:bg-gray-100">
                            <img 
                                src="/api/placeholder/32/32?text=JO" // Placeholder for user avatar
                                alt="Profile" 
                                className="h-8 w-8 rounded-full border border-gray-300" 
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700 hidden lg:block">
                                John Organizer
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-500 ml-1 hidden lg:block" />
                        </button>
                        {/* Simple Dropdown for Profile Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil Saya</Link>
                            <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Pengaturan Akun</Link>
                            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Keluar</button>
                        </div>
                    </div>
                    
                    <button 
                        className="sm:hidden p-2 rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6 text-gray-600" />
                        ) : (
                            <Menu className="h-6 w-6 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>
        </header>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
            <div className="sm:hidden bg-white shadow-lg border-b border-gray-200 py-2">
                <nav className="flex flex-col px-2 space-y-1">
                    {[
                        { label: 'Overview', icon: BarChart, tab: 'overview' },
                        { label: 'Kelola Event', icon: Calendar, tab: 'events' },
                        { label: 'Transaksi', icon: CreditCard, tab: 'transactions' },
                        { label: 'Peserta', icon: Users, tab: 'attendees' },
                        { label: 'Pengaturan', icon: Settings, tab: 'settings' },
                    ].map(item => (
                        <button 
                            key={item.tab}
                            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium
                                ${activeTab === item.tab ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                            onClick={() => {
                                setActiveTab(item.tab);
                                setMobileMenuOpen(false);
                            }}
                        >
                            <item.icon className={`h-5 w-5 mr-3 ${activeTab === item.tab ? 'text-blue-500' : 'text-gray-400'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
        )}

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Hidden on mobile */}
            <aside className="hidden sm:flex sm:flex-col w-64 border-r border-gray-200 bg-white p-4">
                <nav className="flex flex-col space-y-1">
                     {[
                        { label: 'Overview', icon: BarChart, tab: 'overview' },
                        { label: 'Kelola Event', icon: Calendar, tab: 'events' },
                        { label: 'Transaksi', icon: CreditCard, tab: 'transactions' },
                        { label: 'Peserta', icon: Users, tab: 'attendees' },
                        { label: 'Pengaturan', icon: Settings, tab: 'settings' },
                    ].map(item => (
                        <button 
                            key={item.tab}
                            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium
                                ${activeTab === item.tab ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                            onClick={() => setActiveTab(item.tab)}
                        >
                            <item.icon className={`h-5 w-5 mr-3 ${activeTab === item.tab ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
                            <p className="text-gray-600 mt-1">Selamat datang kembali, John Organizer!</p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[
                                { title: 'Total Event Aktif', value: mockEvents.filter(e => e.status === 'upcoming').length, icon: Calendar, trend: "+1 bulan ini", color: "blue" },
                                { title: 'Transaksi Pending', value: pendingTransactionsCount, icon: Clock, trend: `${mockTransactions.filter(t=>t.status==='pending').length} menunggu`, color: "yellow" },
                                { title: 'Total Tiket Terjual', value: totalTicketsSold, icon: Ticket, trend: "+45 bulan ini", color: "green" },
                                { title: 'Total Pendapatan', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, icon: DollarSign, trend: `+Rp 5.3jt bulan ini`, color: "indigo" },
                            ].map(card => (
                                <div key={card.title} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className={`text-sm font-medium text-gray-500`}>{card.title}</h3>
                                        <card.icon className={`h-5 w-5 text-${card.color}-500`} />
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                                    {card.trend && <p className={`text-xs mt-2 ${card.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`}>{card.trend}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Statistik Penjualan ({currentYear})</h2>
                                <div className="flex space-x-1 mt-2 sm:mt-0 border border-gray-300 rounded-md p-0.5">
                                    {['day', 'month', 'year'].map(period => (
                                        <button 
                                            key={period}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize
                                                ${statisticsPeriod === period ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                                            onClick={() => setStatisticsPeriod(period)}
                                        >
                                            {period === 'day' ? 'Harian' : period === 'month' ? 'Bulanan' : 'Tahunan'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-medium mb-4 text-gray-700">Pendapatan (Placeholder)</h3>
                                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                        <BarChart className="h-16 w-16 opacity-50" />
                                        <p className="ml-2">Grafik Pendapatan {statisticsPeriod}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-medium mb-4 text-gray-700">Penjualan Tiket (Placeholder)</h3>
                                     <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                        <BarChart className="h-16 w-16 opacity-50" />
                                        <p className="ml-2">Grafik Penjualan Tiket {statisticsPeriod}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">Aktivitas Transaksi Terbaru</h2>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <ul className="divide-y divide-gray-200">
                                {mockTransactions.slice(0, 5).map((transaction) => (
                                    <li key={transaction.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className={`p-2 rounded-full ${
                                                    transaction.status === 'accepted' ? 'bg-green-100 text-green-600' :
                                                    transaction.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                                                    'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {transaction.status === 'accepted' ? <CheckCircle className="h-5 w-5" /> :
                                                    transaction.status === 'rejected' ? <XCircle className="h-5 w-5" /> :
                                                    <Clock className="h-5 w-5" />}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{transaction.customer} - {transaction.eventName}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {transaction.status === 'accepted' ? 'Pembayaran diterima' :
                                                        transaction.status === 'rejected' ? 'Pembayaran ditolak' :
                                                        'Menunggu konfirmasi'} - ID: {transaction.id}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">Rp {transaction.amount.toLocaleString('id-ID')}</p>
                                                <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'})}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                </ul>
                                {mockTransactions.length > 5 && (
                                    <div className="p-4 text-center border-t border-gray-200">
                                        <button 
                                            onClick={() => setActiveTab('transactions')}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            Lihat Semua Transaksi
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <h2 className="text-2xl font-semibold text-gray-900">Kelola Event Anda</h2>
                            <Link 
                                href="/create-event" // Assuming a route for creating events
                                className="mt-2 sm:mt-0 inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 text-sm font-medium"
                            >
                                <Calendar className="h-4 w-4 mr-2"/> Buat Event Baru
                            </Link>
                        </div>

                        {/* Event List */}
                        {mockEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mockEvents.map(event => (
                                    <div 
                                        key={event.id} 
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group"
                                    >
                                        <img 
                                            src={event.imageUrl || '/api/placeholder/400/200?text=Event+Image'} 
                                            alt={event.title} 
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                                        />
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{event.title}</h3>
                                            <div className="flex items-center text-gray-500 text-xs mb-1">
                                                <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                                {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center text-gray-500 text-xs mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.145l.002-.001L10 18.477l-.308.155-.002.001a5.741 5.741 0 00-.281.145l-.018.008-.006.003zM10 16.575l3.536-3.536A5 5 0 0010 5.05 5 5 0 003.464 9.964L10 16.575z" clipRule="evenodd" /></svg>
                                                {event.location}
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-xs mb-4">
                                                {getStatusBadge(event.status)}
                                                <span className="font-medium text-gray-600">
                                                    {event.ticketsSold} / {event.availableSeats + event.ticketsSold} Tiket
                                                </span>
                                            </div>
                                            <div className="mt-auto border-t border-gray-200 pt-4">
                                                <div className="flex justify-between items-center space-x-2">
                                                    <button 
                                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                                        onClick={() => {
                                                            setCurrentEventForEdit(event.id);
                                                            // Potentially open an edit modal or navigate to an edit page
                                                            showNotif('info', `Fitur edit untuk "${event.title}" belum diimplementasikan.`);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                                    </button>
                                                    <button 
                                                        className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center"
                                                        onClick={() => showNotif('info', `Melihat detail "${event.title}"...`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" /> Detail
                                                    </button>
                                                    <button 
                                                        className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center"
                                                        onClick={() => showNotif('error', `Menghapus "${event.title}" (simulasi)...`)}
                                                    >
                                                        <Trash className="h-4 w-4 mr-1" /> Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Belum Ada Event</h3>
                                <p className="text-sm text-gray-500 mt-1">Mulai buat event pertama Anda sekarang!</p>
                                <Link 
                                    href="/create-event"
                                    className="mt-4 inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 text-sm font-medium"
                                >
                                    + Buat Event
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <h2 className="text-2xl font-semibold text-gray-900">Kelola Transaksi</h2>
                            <div className="flex space-x-1 mt-2 sm:mt-0 border border-gray-300 rounded-md p-0.5">
                                {['all', 'pending', 'accepted', 'rejected'].map(status => (
                                    <button 
                                        key={status}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize
                                            ${filterStatus === status ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                                        onClick={() => setFilterStatus(status)}
                                    >
                                        {status === 'all' ? 'Semua' : status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Transaction List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                            <table className="w-full min-w-max text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['ID Transaksi', 'Event', 'Customer', 'Tanggal', 'Jumlah', 'Status', 'Aksi'].map(header => (
                                            <th key={header} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredTransactions.length > 0 ? filteredTransactions.map(transaction => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{transaction.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">{transaction.eventName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-medium text-gray-800">{transaction.customer}</div>
                                                <div className="text-xs text-gray-500">{transaction.customerEmail}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">{new Date(transaction.date).toLocaleDateString('id-ID')}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium">Rp {transaction.amount.toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(transaction.status)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedTransaction(transaction);
                                                        setShowTransactionModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-xs py-1 px-2 rounded-md hover:bg-blue-50"
                                                >
                                                    <Eye className="h-3.5 w-3.5 mr-1" /> Lihat Bukti
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-gray-500">
                                                <CreditCard className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                                Tidak ada transaksi dengan status "{filterStatus}".
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* Attendees Tab */}
                {activeTab === 'attendees' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <h2 className="text-2xl font-semibold text-gray-900">Daftar Peserta</h2>
                            <div className="mt-2 sm:mt-0">
                                <label htmlFor="eventFilterAttendees" className="sr-only">Filter berdasarkan event</label>
                                <select
                                    id="eventFilterAttendees"
                                    value={selectedEventForAttendees}
                                    onChange={(e) => setSelectedEventForAttendees(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                >
                                    <option value="all">Semua Event</option>
                                    {mockEvents.map(event => (
                                        <option key={event.id} value={event.id}>{event.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                            <table className="w-full min-w-max text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Nama Peserta', 'Email', 'Event', 'Jml Tiket', 'Tipe Tiket', 'Total Bayar'].map(header => (
                                            <th key={header} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredAttendees.length > 0 ? filteredAttendees.map(attendee => (
                                        <tr key={attendee.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{attendee.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">{attendee.email}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">{attendee.eventName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center text-gray-600">{attendee.ticketQuantity}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">{attendee.ticketType}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium">Rp {attendee.totalPaid.toLocaleString('id-ID')}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-500">
                                                <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                                Tidak ada peserta untuk event yang dipilih.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                         {filteredAttendees.length > 0 && (
                            <div className="text-sm text-gray-600">
                                Menampilkan {filteredAttendees.length} peserta.
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab (Placeholder) */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900">Pengaturan Akun</h2>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Settings className="h-16 w-16 opacity-50" />
                                <p className="mt-4">Halaman pengaturan akan segera hadir.</p>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>

        {/* Transaction Modal */}
        {showTransactionModal && selectedTransaction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Detail Transaksi: {selectedTransaction.id}</h3>
                        <button onClick={() => setShowTransactionModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                        <p><strong>Event:</strong> {selectedTransaction.eventName}</p>
                        <p><strong>Customer:</strong> {selectedTransaction.customer} ({selectedTransaction.customerEmail})</p>
                        <p><strong>Tanggal Transaksi:</strong> {new Date(selectedTransaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p><strong>Jumlah:</strong> Rp {selectedTransaction.amount.toLocaleString('id-ID')}</p>
                        <p><strong>Status Saat Ini:</strong> {getStatusBadge(selectedTransaction.status)}</p>
                        {selectedTransaction.couponUsed && <p><strong>Kupon Digunakan:</strong> {selectedTransaction.couponUsed}</p>}
                        {selectedTransaction.pointsUsed > 0 && <p><strong>Poin Digunakan:</strong> {selectedTransaction.pointsUsed}</p>}

                        <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Bukti Pembayaran:</h4>
                            {selectedTransaction.paymentProof ? (
                                <img 
                                    src={selectedTransaction.paymentProof} 
                                    alt="Bukti Pembayaran" 
                                    className="w-full max-h-64 object-contain rounded-md border border-gray-200" 
                                />
                            ) : (
                                <p className="text-gray-500 italic">Bukti pembayaran tidak tersedia.</p>
                            )}
                        </div>
                    </div>

                    {selectedTransaction.status === 'pending' && (
                        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <button 
                                onClick={() => handleTransactionAction(selectedTransaction, 'reject')}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center"
                            >
                                <XCircle className="h-4 w-4 mr-2"/> Tolak Transaksi
                            </button>
                            <button 
                                onClick={() => handleTransactionAction(selectedTransaction, 'accept')}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
                            >
                                <CheckCircle className="h-4 w-4 mr-2"/> Terima Transaksi
                            </button>
                        </div>
                    )}
                     {selectedTransaction.status !== 'pending' && (
                        <div className="mt-6 text-right">
                             <button 
                                onClick={() => setShowTransactionModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                            >
                                Tutup
                            </button>
                        </div>
                     )}
                </div>
            </div>
        )}

        {/* Footer (Optional) */}
        <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white mt-auto">
            © {new Date().getFullYear()} TiketKita Organizer Dashboard. All rights reserved.
        </footer>
    </div>
  )
}