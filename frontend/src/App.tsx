import { useState } from 'react';
import {
  LayoutDashboard, DollarSign, Package, LogOut, Bell,
  Eye, EyeOff, Plus, Edit2, TrendingUp, Clock, Users, X, Download, Menu
} from 'lucide-react';
import { ScissorsIcon, CombIcon } from './components/icons/BarbershopIcons';
import './index.css';

type Role = 'admin' | 'barber';
type Screen = 'dashboard' | 'caja' | 'inventory';

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type Barber = {
  id: string;
  name: string;
  phone: string;
  username: string;
  active: boolean;
};

type QueueItem = {
  id: string;
  clientName: string;
  service: string;
  barberId: string;
  status: 'waiting' | 'in_service' | 'completed';
  createdAt: string;
};

type Payment = {
  id: string;
  service: string;
  barberId: string;
  amount: number;
  paymentMethod: 'efectivo' | 'yape' | 'plin';
  timestamp: string;
};

type InventoryItem = {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
};

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  const handleLogin = (email: string, _password: string, role: Role) => {
    setUser({
      id: role === 'admin' ? 'admin-1' : '1',
      name: role === 'admin' ? 'Administrador' : 'Carlos Quispe',
      email,
      role,
    });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('dashboard');
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  if (user.role === 'barber') {
    return <BarberView user={user} onLogout={handleLogout} />;
  }

  return (
    <AdminView
      user={user}
      currentScreen={currentScreen}
      setCurrentScreen={setCurrentScreen}
      onLogout={handleLogout}
    />
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (email: string, password: string, role: Role) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, role);
  };

  return (
    <div className="min-h-screen barber-pole-bg bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <ScissorsIcon className="w-16 h-16 text-[#c9a84c] mb-4" />
          <h1 className="text-3xl font-bold text-[#c9a84c] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            BARBER VES
          </h1>
          <p className="text-[#9a9ab0] text-sm">Sistema de Control Interno</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder={role === 'admin' ? 'Correo electrónico' : 'Usuario'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border-b-2 border-[#9a9ab0] focus:border-[#c9a84c] outline-none transition-colors"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border-b-2 border-[#9a9ab0] focus:border-[#c9a84c] outline-none transition-colors pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9ab0]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button type="submit" className="w-full btn-gold">
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-6 flex gap-2">
          {(['admin', 'barber'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                role === r
                  ? 'bg-[#c9a84c] text-[#0a0a0f]'
                  : 'bg-[#12121a] text-[#9a9ab0] border border-[#9a9ab0]'
              }`}
            >
              {r === 'admin' ? 'Administrador' : 'Barbero'}
            </button>
          ))}
        </div>

        <p className="text-center text-[#9a9ab0] text-xs mt-8">Villa El Salvador, Lima 2026</p>
      </div>
    </div>
  );
}

// ─── Admin layout ─────────────────────────────────────────────────────────────
function AdminView({ user, currentScreen, setCurrentScreen, onLogout }: {
  user: User;
  currentScreen: Screen;
  setCurrentScreen: (s: Screen) => void;
  onLogout: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'caja', label: 'Caja', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventario', icon: <Package className="w-5 h-5" /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-[#c9a84c]/20">
        <div className="flex items-center gap-3">
          <ScissorsIcon className="w-8 h-8 text-[#c9a84c]" />
          <div>
            <h2 className="text-[#c9a84c] font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              BARBER VES
            </h2>
            <p className="text-[#9a9ab0] text-xs">Control Interno</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setCurrentScreen(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentScreen === item.id
                ? 'bg-[#c9a84c] text-[#0a0a0f]'
                : 'text-[#9a9ab0] hover:bg-[#12121a]'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#9a9ab0] hover:bg-[#8b0000] hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </nav>

      <div className="p-4 border-t border-[#c9a84c]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user.name}</p>
            <p className="text-[#9a9ab0] text-xs">Administrador</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar desktop */}
      <div className="hidden md:flex w-64 bg-[#0d0d14] flex-col flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-[#0d0d14] flex flex-col z-50">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d0d14] border-b border-[#c9a84c]/20">
          <button onClick={() => setSidebarOpen(true)} className="text-[#c9a84c]">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-[#c9a84c] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            BARBER VES
          </span>
          <button className="w-8 h-8 rounded-full bg-[#12121a] flex items-center justify-center text-[#c9a84c]">
            <Bell className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {currentScreen === 'dashboard' && <DashboardScreen user={user} />}
          {currentScreen === 'caja' && <CajaScreen />}
          {currentScreen === 'inventory' && <InventoryScreen />}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardScreen({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'cola' | 'barberos'>('resumen');
  const [payments] = useState<Payment[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddBarber, setShowAddBarber] = useState(false);

  const totalsByMethod = payments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalToday = payments.reduce((sum, p) => sum + p.amount, 0);

  const earningsByBarber = payments.reduce((acc, p) => {
    const barber = barbers.find(b => b.id === p.barberId);
    const name = barber?.name || 'Desconocido';
    acc[name] = (acc[name] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const currentDate = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'cola', label: 'Cola de Turnos' },
    { id: 'barberos', label: 'Barberos' },
  ] as const;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
            Buenos días, {user.name}
          </h1>
          <p className="text-[#9a9ab0] text-xs md:text-sm capitalize">{currentDate}</p>
        </div>
        <button className="hidden md:flex w-10 h-10 rounded-full bg-[#12121a] items-center justify-center text-[#c9a84c]">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-4 md:gap-6 mb-6 border-b border-[#c9a84c]/20 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 font-medium text-sm md:text-base whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]'
                : 'text-[#9a9ab0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumen' && (
        <ResumenTab totalsByMethod={totalsByMethod} totalToday={totalToday} earningsByBarber={earningsByBarber} />
      )}
      {activeTab === 'cola' && (
        <ColaTab queue={queue} barbers={barbers} setQueue={setQueue} showAddClient={showAddClient} setShowAddClient={setShowAddClient} />
      )}
      {activeTab === 'barberos' && (
        <BarberosTab barbers={barbers} setBarbers={setBarbers} showAddBarber={showAddBarber} setShowAddBarber={setShowAddBarber} />
      )}
    </div>
  );
}

function ResumenTab({ totalsByMethod, totalToday, earningsByBarber }: {
  totalsByMethod: Record<string, number>;
  totalToday: number;
  earningsByBarber: Record<string, number>;
}) {
  const cards = [
    { label: 'Efectivo Hoy', value: totalsByMethod.efectivo || 0, icon: <DollarSign className="w-8 h-8 text-[#00c896]" />, highlight: false },
    { label: 'Yape', value: totalsByMethod.yape || 0, icon: <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white font-bold text-sm">Y</div>, highlight: false },
    { label: 'Plin', value: totalsByMethod.plin || 0, icon: <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-sm">P</div>, highlight: false },
    { label: 'Total del Día', value: totalToday, icon: <DollarSign className="w-8 h-8 text-[#c9a84c]" />, highlight: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`glass-card p-4 md:p-6 ${card.highlight ? 'border-[#c9a84c] border-2' : ''}`}>
            <div className="flex items-center gap-3 mb-2">
              {card.icon}
              <div>
                <p className="text-[#9a9ab0] text-xs md:text-sm">{card.label}</p>
                <h3 className={`text-lg md:text-2xl font-bold ${card.highlight ? 'text-[#c9a84c]' : 'text-white'}`}>
                  S/. {card.value.toFixed(2)}
                </h3>
              </div>
            </div>
            {card.label === 'Efectivo Hoy' && (
              <div className="flex items-center gap-1 text-[#00c896] text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12%</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-white mb-4">Ingresos por Barbero Hoy</h3>
        <div className="space-y-4">
          {Object.entries(earningsByBarber).map(([name, amount]) => {
            const max = Math.max(...Object.values(earningsByBarber));
            return (
              <div key={name}>
                <div className="flex justify-between mb-2">
                  <span className="text-white text-sm md:text-base">{name}</span>
                  <span className="text-[#c9a84c] font-bold text-sm md:text-base">S/. {amount.toFixed(2)}</span>
                </div>
                <div className="w-full h-3 bg-[#0a0a0f] rounded-full overflow-hidden">
                  <div className="h-full bg-[#c9a84c] rounded-full transition-all" style={{ width: `${(amount / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ColaTab({ queue, barbers, setQueue, showAddClient, setShowAddClient }: {
  queue: QueueItem[];
  barbers: Barber[];
  setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  showAddClient: boolean;
  setShowAddClient: (v: boolean) => void;
}) {
  const [newClient, setNewClient] = useState({ name: '', service: 'Corte Clásico', barberId: '' });

  const handleAdd = () => {
    if (!newClient.name || !newClient.barberId) return;
    const item: QueueItem = {
      id: Date.now().toString(),
      clientName: newClient.name,
      service: newClient.service,
      barberId: newClient.barberId,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    setQueue(prev => [...prev, item]);
    setNewClient({ name: '', service: 'Corte Clásico', barberId: '' });
    setShowAddClient(false);
  };

  const getWaiting = (iso: string) => `${Math.floor((Date.now() - new Date(iso).getTime()) / 60000)} min`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-white">Cola de Espera</h2>
        <button onClick={() => setShowAddClient(true)} className="btn-gold flex items-center gap-2 text-sm md:text-base px-3 py-2 md:px-6 md:py-3">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Registrar Cliente</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      <div className="space-y-4">
        {queue.map((item) => {
          const barber = barbers.find(b => b.id === item.barberId);
          return (
            <div key={item.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-white font-bold text-base md:text-lg">{item.clientName}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-xs border border-[#c9a84c]">
                    {item.service}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#12121a] text-[#9a9ab0] text-xs">
                    {barber?.name || 'Sin asignar'}
                  </span>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-3">
                <span className={item.status === 'waiting' ? 'badge-waiting' : 'badge-active'}>
                  {item.status === 'waiting' ? 'ESPERA' : 'EN ATENCIÓN'}
                </span>
                <p className="text-[#9a9ab0] text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {getWaiting(item.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {queue.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Users className="w-16 h-16 text-[#9a9ab0] mx-auto mb-4" />
            <p className="text-[#9a9ab0]">No hay clientes en espera</p>
          </div>
        )}
      </div>

      {showAddClient && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#c9a84c]">Registrar Cliente</h2>
              <button onClick={() => setShowAddClient(false)} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre del cliente" value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none"
              />
              <select value={newClient.service} onChange={(e) => setNewClient({ ...newClient, service: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none">
                {['Corte Clásico', 'Corte + Barba', 'Barba', 'Corte Niño'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={newClient.barberId} onChange={(e) => setNewClient({ ...newClient, barberId: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none">
                <option value="">Seleccionar barbero</option>
                {barbers.filter(b => b.active).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <button onClick={handleAdd} disabled={!newClient.name || !newClient.barberId} className="w-full btn-gold disabled:opacity-50">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BarberosTab({ barbers, setBarbers, showAddBarber, setShowAddBarber }: {
  barbers: Barber[];
  setBarbers: React.Dispatch<React.SetStateAction<Barber[]>>;
  showAddBarber: boolean;
  setShowAddBarber: (v: boolean) => void;
}) {
  const [form, setForm] = useState({ name: '', phone: '', username: '', password: '', confirm: '' });

  const handleAdd = () => {
    if (form.password !== form.confirm) { alert('Las contraseñas no coinciden'); return; }
    const barber: Barber = { id: Date.now().toString(), name: form.name, phone: form.phone, username: form.username, active: true };
    setBarbers(prev => [...prev, barber]);
    setForm({ name: '', phone: '', username: '', password: '', confirm: '' });
    setShowAddBarber(false);
  };

  const toggle = (id: string) => setBarbers(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-white">Barberos Registrados</h2>
        <button onClick={() => setShowAddBarber(true)} className="btn-gold flex items-center gap-2 text-sm md:text-base px-3 py-2 md:px-6 md:py-3">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Agregar Barbero</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      <div className="space-y-4">
        {barbers.map((barber) => (
          <div key={barber.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold text-lg flex-shrink-0">
                {barber.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-white font-bold">{barber.name}</h3>
                <p className="text-[#9a9ab0] text-sm">{barber.phone}</p>
                <p className="text-[#9a9ab0] text-xs">@{barber.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-16 sm:ml-0">
              <span className={barber.active ? 'badge-active' : 'badge-inactive'}>
                {barber.active ? 'Activo' : 'Inactivo'}
              </span>
              <button onClick={() => toggle(barber.id)}
                className="px-4 py-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all text-sm">
                {barber.active ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddBarber && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#c9a84c]">Agregar Barbero</h2>
              <button onClick={() => setShowAddBarber(false)} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              {[
                { ph: 'Nombre completo', key: 'name', type: 'text' },
                { ph: 'Teléfono', key: 'phone', type: 'tel' },
                { ph: 'Usuario', key: 'username', type: 'text' },
                { ph: 'Contraseña', key: 'password', type: 'password' },
                { ph: 'Confirmar contraseña', key: 'confirm', type: 'password' },
              ].map(({ ph, key, type }) => (
                <input key={key} type={type} placeholder={ph} value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none"
                />
              ))}
              <button onClick={handleAdd} disabled={!form.name || !form.phone || !form.username || !form.password}
                className="w-full btn-gold disabled:opacity-50">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Caja ─────────────────────────────────────────────────────────────────────
function CajaScreen() {
  const [payments] = useState<Payment[]>([]);

  const byMethod = payments.reduce((acc, p) => { acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount; return acc; }, {} as Record<string, number>);
  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Reporte de Caja — Hoy</h1>

      <div className="max-w-lg mx-auto glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#c9a84c]">Resumen del Día</h2>
          <button className="px-4 py-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        <div className="w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full border-[20px] border-[#00c896] relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-[#9a9ab0] text-xs md:text-sm">Total</p>
            <p className="text-[#c9a84c] text-xl md:text-2xl font-bold">S/. {total.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Efectivo', key: 'efectivo' },
            { label: 'Yape', key: 'yape' },
            { label: 'Plin', key: 'plin' },
          ].map(({ label, key }) => (
            <div key={key} className="flex justify-between py-2 border-b border-[#9a9ab0]/20">
              <span className="text-[#9a9ab0]">{label}</span>
              <span className="text-white font-bold">S/. {(byMethod[key] || 0).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 border-t-2 border-[#c9a84c]">
            <span className="text-[#c9a84c] font-bold">TOTAL</span>
            <span className="text-[#c9a84c] text-xl font-bold">S/. {total.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-[#9a9ab0] text-xs text-center italic mt-6">
          Los pagos son registrados por los barberos al finalizar cada servicio
        </p>
      </div>
    </div>
  );
}

// ─── Inventory ────────────────────────────────────────────────────────────────
function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', currentStock: '', minStock: '', unit: 'unidades' });

  const handleAdd = () => {
    const item: InventoryItem = {
      id: Date.now().toString(),
      name: form.name,
      currentStock: parseFloat(form.currentStock),
      minStock: parseFloat(form.minStock),
      unit: form.unit,
      lastUpdated: new Date().toISOString(),
    };
    setItems(prev => [...prev, item]);
    setForm({ name: '', currentStock: '', minStock: '', unit: 'unidades' });
    setShowAdd(false);
  };

  const pct = (item: InventoryItem) => (item.currentStock / (item.minStock * 2)) * 100;
  const status = (p: number) => p > 50 ? { color: 'progress-high', label: 'Normal' } : p > 20 ? { color: 'progress-medium', label: 'Bajo' } : { color: 'progress-low', label: 'Crítico' };
  const critical = items.filter(i => pct(i) < 20);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Gestión de Inventario</h1>

      {critical.length > 0 && (
        <div className="glass-card p-4 mb-6 bg-[#e74c3c]/10 border border-[#e74c3c]">
          <p className="text-[#e74c3c] font-bold">
            ⚠️ {critical.length} insumo{critical.length > 1 ? 's' : ''} con stock crítico
          </p>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Agregar Insumo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const p = pct(item);
          const s = status(p);
          return (
            <div key={item.id} className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-bold text-base md:text-lg">{item.name}</h3>
                <CombIcon className="w-6 h-6 text-[#c9a84c]" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#9a9ab0]">Stock actual</span>
                    <span className={`font-bold ${p < 20 ? 'text-[#e74c3c]' : 'text-white'}`}>
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} transition-all`} style={{ width: `${Math.min(p, 100)}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9a9ab0]">Mínimo</span>
                  <span className="text-[#9a9ab0]">{item.minStock} {item.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9a9ab0]">Actualizado</span>
                  <span className="text-[#9a9ab0] text-xs">{new Date(item.lastUpdated).toLocaleDateString('es-PE')}</span>
                </div>
                <button className="w-full py-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all flex items-center justify-center gap-2 text-sm">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[#c9a84c] text-sm italic text-center mt-8">
        El stock se descuenta automáticamente al finalizar cada servicio
      </p>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#c9a84c]">Agregar Insumo</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre del insumo" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none"
              />
              <input type="number" placeholder="Stock inicial" value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none"
              />
              <input type="number" placeholder="Stock mínimo" value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none"
              />
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none">
                <option value="unidades">Unidades</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="gr">Gramos (gr)</option>
              </select>
              <button onClick={handleAdd} disabled={!form.name || !form.currentStock || !form.minStock} className="w-full btn-gold disabled:opacity-50">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Barber view (mobile) ─────────────────────────────────────────────────────
function BarberView({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [turnoActivo, setTurnoActivo] = useState<QueueItem | null>(null);
  const [pagoForm, setPagoForm] = useState({ amount: '', method: 'efectivo' as Payment['paymentMethod'] });

  const abrirModalPago = (item: QueueItem) => {
    setTurnoActivo(item);
    setPagoForm({ amount: '', method: 'efectivo' });
  };

  const confirmarPago = () => {
    if (!turnoActivo || !pagoForm.amount) return;
    const p: Payment = {
      id: Date.now().toString(),
      service: turnoActivo.service,
      barberId: user.id,
      amount: parseFloat(pagoForm.amount),
      paymentMethod: pagoForm.method,
      timestamp: new Date().toISOString(),
    };
    setPayments(prev => [...prev, p]);
    setQueue(prev => prev.filter(q => q.id !== turnoActivo.id));
    setTurnoActivo(null);
  };

  const byMethod = payments.reduce((acc, p) => { acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount; return acc; }, {} as Record<string, number>);
  const total = payments.reduce((s, p) => s + p.amount, 0);

  const currentDate = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold text-xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Hola, {user.name}</h1>
            <p className="text-[#9a9ab0] text-sm capitalize">{currentDate}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <span className="badge-active">Activo</span>
          <button onClick={onLogout} className="w-10 h-10 rounded-full bg-[#8b0000] flex items-center justify-center text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#c9a84c] mb-4">Mi Cola de Hoy</h2>
        <div className="space-y-3">
          {queue.map((item, i) => (
            <div key={item.id} className="glass-card p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">{item.clientName}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="px-2 py-1 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-xs border border-[#c9a84c]">
                      {item.service}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-[#9a9ab0]/20 text-[#9a9ab0] text-xs">~30 min</span>
                  </div>
                </div>
              </div>
              <button onClick={() => abrirModalPago(item)}
                className="w-full bg-[#00c896] text-white font-bold py-3 rounded-lg hover:bg-[#00b087] transition-all">
                Marcar Finalizado
              </button>
              <p className="text-[#c9a84c] text-xs text-center mt-2 italic">Insumos descontados automáticamente</p>
            </div>
          ))}
          {queue.length === 0 && (
            <div className="glass-card p-12 text-center">
              <ScissorsIcon className="w-16 h-16 text-[#9a9ab0] mx-auto mb-4" />
              <p className="text-[#9a9ab0]">No tienes clientes en espera</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-[#c9a84c] mb-4">Mis Ingresos de Hoy</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[['Efectivo', 'efectivo'], ['Yape', 'yape'], ['Plin', 'plin']].map(([label, key]) => (
            <div key={key} className="bg-[#0a0a0f] p-3 rounded-lg">
              <p className="text-[#9a9ab0] text-xs mb-1">{label}</p>
              <p className="text-white font-bold text-sm">S/. {(byMethod[key] || 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#c9a84c] p-4 rounded-lg text-center">
          <p className="text-[#0a0a0f] text-sm mb-1">Total del Día</p>
          <p className="text-[#0a0a0f] text-3xl font-bold">S/. {total.toFixed(2)}</p>
        </div>
        <p className="text-[#9a9ab0] text-sm text-center mt-3">Buen trabajo hoy</p>
      </div>

      {/* Modal de pago */}
      {turnoActivo && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#c9a84c]">Registrar Cobro</h2>
              <button onClick={() => setTurnoActivo(null)} className="text-[#9a9ab0]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="glass-card p-3 mb-5 bg-[#0a0a0f]/50">
              <p className="text-white font-bold">{turnoActivo.clientName}</p>
              <p className="text-[#c9a84c] text-sm">{turnoActivo.service}</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a84c] font-bold">S/.</span>
                <input
                  type="number" step="0.01" placeholder="0.00"
                  value={pagoForm.amount}
                  onChange={(e) => setPagoForm({ ...pagoForm, amount: e.target.value })}
                  className="w-full bg-[#0a0a0f] text-white px-4 py-3 pl-12 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none"
                  autoFocus
                />
              </div>

              <p className="text-[#9a9ab0] text-sm">Método de pago:</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'efectivo', label: 'Efectivo', active: 'bg-[#00c896] text-white' },
                  { id: 'yape',     label: 'Yape',     active: 'bg-purple-600 text-white' },
                  { id: 'plin',     label: 'Plin',     active: 'bg-blue-500 text-white'   },
                ] as const).map(({ id, label, active }) => (
                  <button key={id} onClick={() => setPagoForm({ ...pagoForm, method: id })}
                    className={`py-3 rounded-lg font-medium transition-all text-sm ${
                      pagoForm.method === id ? active : 'bg-[#12121a] text-[#9a9ab0] border border-[#9a9ab0]'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              <button
                onClick={confirmarPago}
                disabled={!pagoForm.amount}
                className="w-full btn-gold disabled:opacity-50 mt-2"
              >
                Confirmar y Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
