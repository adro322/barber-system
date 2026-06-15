import { useState, useEffect } from 'react';
import {
  LayoutDashboard, DollarSign, Package, LogOut, Bell,
  Eye, EyeOff, Plus, Edit2, TrendingUp, Clock, Users, X, Download, Menu, Trash2, KeyRound,
} from 'lucide-react';
import { ScissorsIcon, CombIcon } from './components/icons/BarbershopIcons';
import './index.css';
import { api, setAuth, clearAuth, getAuth, downloadExcel } from './api';

// ─── API types ────────────────────────────────────────────────────────────────
type ApiUsuario = { id: number; nombre: string; email: string; activo: boolean; rol: { id: number; nombre: string } };
type ApiBarbero = { id: number; nombre: string; telefono: string; estado: string; usuario: ApiUsuario };
type ApiServicio = { id: number; nombre: string; precio: number; descripcion: string };
type ApiTurno = { id: number; nombreCliente: string; estado: string; fechaHora: string; barbero?: ApiBarbero; servicio: ApiServicio };
type ApiTransaccion = { id: number; monto: number; tipoPago: string; fecha: string; barbero: ApiBarbero; turno: { id: number; nombreCliente: string; servicio: ApiServicio } };
type ApiInsumo = { id: number; nombre: string; stock: number; stockMinimo: number; unidad: string };
type Auth = { token: string; rol: string; nombre: string; email: string };
type Screen = 'dashboard' | 'caja' | 'inventory';

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuthState] = useState<Auth | null>(() => getAuth());
  const [screen, setScreen] = useState<Screen>('dashboard');

  const handleLogin = (token: string, rol: string, nombre: string, email: string) => {
    setAuth(token, rol, nombre, email);
    setAuthState({ token, rol, nombre, email });
  };

  const handleLogout = () => {
    clearAuth();
    setAuthState(null);
    setScreen('dashboard');
  };

  if (!auth) return <LoginScreen onLogin={handleLogin} />;
  if (auth.rol === 'BARBERO') return <BarberView nombre={auth.nombre} email={auth.email} onLogout={handleLogout} />;

  return <AdminView nombre={auth.nombre} screen={screen} setScreen={setScreen} onLogout={handleLogout} />;
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string, rol: string, nombre: string, email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post<{ token: string; rol: string; nombre: string; email: string }>(
        '/api/auth/login', undefined, { email, contrasena: password }
      );
      onLogin(data.token, data.rol, data.nombre, data.email);
    } catch {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
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
            type="email"
            placeholder="Correo electrónico"
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
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9ab0]">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="text-[#e74c3c] text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-gold disabled:opacity-60">
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="text-center text-[#9a9ab0] text-xs mt-8">Villa El Salvador, Lima 2026</p>
      </div>
    </div>
  );
}

// ─── Admin layout ─────────────────────────────────────────────────────────────
function AdminView({ nombre, screen, setScreen, onLogout }: {
  nombre: string; screen: Screen; setScreen: (s: Screen) => void; onLogout: () => void;
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
            <h2 className="text-[#c9a84c] font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>BARBER VES</h2>
            <p className="text-[#9a9ab0] text-xs">Control Interno</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button key={item.id}
            onClick={() => { setScreen(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              screen === item.id ? 'bg-[#c9a84c] text-[#0a0a0f]' : 'text-[#9a9ab0] hover:bg-[#12121a]'
            }`}>
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#9a9ab0] hover:bg-[#8b0000] hover:text-white transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </nav>
      <div className="p-4 border-t border-[#c9a84c]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold">
            {nombre.charAt(0)}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{nombre}</p>
            <p className="text-[#9a9ab0] text-xs">Administrador</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <div className="hidden md:flex w-64 bg-[#0d0d14] flex-col flex-shrink-0">
        <SidebarContent />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-[#0d0d14] flex flex-col z-50">
            <SidebarContent />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d0d14] border-b border-[#c9a84c]/20">
          <button onClick={() => setSidebarOpen(true)} className="text-[#c9a84c]">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-[#c9a84c] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>BARBER VES</span>
          <div className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold text-sm">
            {nombre.charAt(0)}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {screen === 'dashboard' && <DashboardScreen nombre={nombre} />}
          {screen === 'caja' && <CajaScreen />}
          {screen === 'inventory' && <InventoryScreen />}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardScreen({ nombre }: { nombre: string }) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'cola' | 'barberos' | 'servicios'>('resumen');
  const [barberos, setBarberos] = useState<ApiBarbero[]>([]);
  const [turnos, setTurnos] = useState<ApiTurno[]>([]);
  const [servicios, setServicios] = useState<ApiServicio[]>([]);
  const [transacciones, setTransacciones] = useState<ApiTransaccion[]>([]);
  const [alertas, setAlertas] = useState<ApiInsumo[]>([]);
  const [showBell, setShowBell] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<number>>(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = JSON.parse(localStorage.getItem('bell_seen') || 'null');
      return saved?.date === today ? new Set<number>(saved.ids) : new Set<number>();
    } catch { return new Set<number>(); }
  });

  const refresh = () =>
    Promise.all([
      api.get<ApiBarbero[]>('/api/barberos'),
      api.get<ApiTurno[]>('/api/turnos'),
      api.get<ApiServicio[]>('/api/servicios'),
      api.get<ApiTransaccion[]>('/api/caja/transacciones'),
      api.get<ApiInsumo[]>('/api/insumos/alertas'),
    ]).then(([b, t, s, tr, al]) => {
      setBarberos(b); setTurnos(t); setServicios(s); setTransacciones(tr); setAlertas(al);
      try { sessionStorage.setItem('cache_admin', JSON.stringify({ b, t, s, tr, al })); } catch {}
    }).catch(console.error);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('cache_admin');
      if (raw) {
        const { b, t, s, tr, al } = JSON.parse(raw);
        setBarberos(b ?? []); setTurnos(t ?? []); setServicios(s ?? []);
        setTransacciones(tr ?? []); setAlertas(al ?? []);
      }
    } catch {}
    refresh();
  }, []);

  const totalsByMethod: Record<string, number> = {};
  let totalHoy = 0;
  for (const t of transacciones) {
    const k = t.tipoPago.toLowerCase();
    totalsByMethod[k] = (totalsByMethod[k] || 0) + t.monto;
    totalHoy += t.monto;
  }
  const earningsByBarber: Record<string, number> = {};
  for (const t of transacciones) {
    const key = t.barbero?.nombre ?? 'Sin asignar';
    earningsByBarber[key] = (earningsByBarber[key] || 0) + t.monto;
  }

  const currentDate = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const unreadCount = alertas.filter(a => !seenIds.has(a.id)).length;

  const toggleBell = () => {
    if (!showBell) {
      const updated = new Set([...seenIds, ...alertas.map(a => a.id)]);
      setSeenIds(updated);
      localStorage.setItem('bell_seen', JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        ids: [...updated],
      }));
    }
    setShowBell(v => !v);
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'cola', label: 'Cola de Turnos' },
    { id: 'barberos', label: 'Barberos' },
    { id: 'servicios', label: 'Servicios' },
  ] as const;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Buenos días, {nombre}</h1>
          <p className="text-[#9a9ab0] text-xs md:text-sm capitalize">{currentDate}</p>
        </div>
        <div className="relative">
          <button onClick={toggleBell}
            className="flex w-10 h-10 rounded-full bg-[#12121a] items-center justify-center text-[#c9a84c]">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold pointer-events-none">
                {unreadCount}
              </span>
            )}
          </button>
          {showBell && (
            <div className="absolute right-0 top-12 w-72 bg-[#12121a] border border-[#9a9ab0]/20 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#9a9ab0]/20 flex items-center justify-between">
                <span className="text-white font-semibold text-sm">Alertas de Stock</span>
                <button onClick={() => setShowBell(false)} className="text-[#9a9ab0] hover:text-white text-xl leading-none">&times;</button>
              </div>
              {alertas.length === 0 ? (
                <div className="px-4 py-6 text-center text-[#9a9ab0] text-sm">No hay notificaciones</div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-[#9a9ab0]/10">
                  {[...alertas].sort((a, b) => b.id - a.id).map(al => (
                    <div key={al.id} className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{al.nombre}</p>
                      <p className="text-red-400 text-xs mt-0.5">Stock: {al.stock} / Mínimo: {al.stockMinimo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 md:gap-6 mb-6 border-b border-[#c9a84c]/20 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`pb-3 font-medium text-sm md:text-base whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-[#9a9ab0]'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumen' && (
        <ResumenTab totalsByMethod={totalsByMethod} totalToday={totalHoy} earningsByBarber={earningsByBarber} />
      )}
      {activeTab === 'cola' && (
        <ColaTab turnos={turnos} barberos={barberos} servicios={servicios}
          onRefresh={refresh} />
      )}
      {activeTab === 'barberos' && (
        <BarberosTab barberos={barberos} onRefresh={refresh} />
      )}
      {activeTab === 'servicios' && (
        <ServiciosTab servicios={servicios} onRefresh={refresh} />
      )}
    </div>
  );
}

// ─── Resumen tab ──────────────────────────────────────────────────────────────
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

  const hasEarnings = Object.keys(earningsByBarber).length > 0;
  const maxEarning = hasEarnings ? Math.max(...Object.values(earningsByBarber)) : 1;

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
            {card.label === 'Efectivo Hoy' && totalToday > 0 && (
              <div className="flex items-center gap-1 text-[#00c896] text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>En curso</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-4 md:p-6">
        <h3 className="text-base md:text-lg font-bold text-white mb-4">Ingresos por Barbero Hoy</h3>
        {hasEarnings ? (
          <div className="space-y-4">
            {Object.entries(earningsByBarber).map(([name, amount]) => (
              <div key={name}>
                <div className="flex justify-between mb-2">
                  <span className="text-white text-sm md:text-base">{name}</span>
                  <span className="text-[#c9a84c] font-bold text-sm md:text-base">S/. {amount.toFixed(2)}</span>
                </div>
                <div className="w-full h-3 bg-[#0a0a0f] rounded-full overflow-hidden">
                  <div className="h-full bg-[#c9a84c] rounded-full transition-all" style={{ width: `${(amount / maxEarning) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#9a9ab0] text-center py-4">Sin ingresos registrados hoy</p>
        )}
      </div>
    </div>
  );
}

// ─── Cola tab ─────────────────────────────────────────────────────────────────
function ColaTab({ turnos, barberos, servicios, onRefresh }: {
  turnos: ApiTurno[];
  barberos: ApiBarbero[];
  servicios: ApiServicio[];
  onRefresh: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ cliente: '', idServicio: '', idBarbero: '' });
  const [loading, setLoading] = useState(false);

  const activeBarberos = barberos.filter(b => b.estado === 'ACTIVO');

  const handleAdd = async () => {
    if (!form.cliente || !form.idServicio) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { cliente: form.cliente, idServicio: form.idServicio };
      if (form.idBarbero) params.idBarbero = form.idBarbero;
      await api.post('/api/turnos', params);
      setForm({ cliente: '', idServicio: '', idBarbero: '' });
      setShowAdd(false);
      onRefresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getWaiting = (iso: string) =>
    `${Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))} min`;

  const estadoBadge = (estado: string) => {
    if (estado === 'ESPERA') return 'badge-waiting';
    if (estado === 'ATENDIENDO') return 'badge-active';
    if (estado === 'FINALIZADO') return 'badge-inactive';
    return 'badge-inactive';
  };

  const estadoLabel = (estado: string) => {
    if (estado === 'ESPERA') return 'ESPERA';
    if (estado === 'ATENDIENDO') return 'EN ATENCIÓN';
    if (estado === 'FINALIZADO') return 'FINALIZADO';
    return estado;
  };

  const sortedTurnos = [...turnos].sort((a, b) =>
    new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-white">Cola de Espera</h2>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2 text-sm md:text-base px-3 py-2 md:px-6 md:py-3">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Registrar Cliente</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      <div className="space-y-4">
        {sortedTurnos.map((turno) => (
          <div key={turno.id} className={`glass-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${turno.estado === 'FINALIZADO' ? 'opacity-50' : ''}`}>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base md:text-lg">{turno.nombreCliente}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-xs border border-[#c9a84c]">
                  {turno.servicio.nombre} — S/. {Number(turno.servicio.precio).toFixed(2)}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#12121a] text-[#9a9ab0] text-xs">
                  {turno.barbero?.nombre ?? 'Sin asignar'}
                </span>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-3">
              <span className={estadoBadge(turno.estado)}>{estadoLabel(turno.estado)}</span>
              {turno.estado !== 'FINALIZADO' && (
                <p className="text-[#9a9ab0] text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {getWaiting(turno.fechaHora)}
                </p>
              )}
            </div>
          </div>
        ))}
        {turnos.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Users className="w-16 h-16 text-[#9a9ab0] mx-auto mb-4" />
            <p className="text-[#9a9ab0]">No hay clientes en espera</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#c9a84c]">Registrar Cliente</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre del cliente" value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
              <select value={form.idServicio} onChange={(e) => setForm({ ...form, idServicio: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none">
                <option value="">Seleccionar servicio</option>
                {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} — S/. {Number(s.precio).toFixed(2)}</option>)}
              </select>
              <select value={form.idBarbero} onChange={(e) => setForm({ ...form, idBarbero: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none">
                <option value="">Barbero (opcional)</option>
                {activeBarberos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
              <button onClick={handleAdd} disabled={loading || !form.cliente || !form.idServicio}
                className="w-full btn-gold disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Barberos tab ─────────────────────────────────────────────────────────────
function BarberosTab({ barberos, onRefresh }: { barberos: ApiBarbero[]; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwdBarbero, setPwdBarbero] = useState<ApiBarbero | null>(null);
  const [pwdForm, setPwdForm] = useState({ password: '', confirm: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);

  const openChangePwd = (b: ApiBarbero) => {
    setPwdBarbero(b);
    setPwdForm({ password: '', confirm: '' });
    setShowPwd(false);
    setShowPwdConfirm(false);
  };

  const pwdMatch = pwdForm.password && pwdForm.confirm && pwdForm.password === pwdForm.confirm;
  const pwdMismatch = pwdForm.confirm.length > 0 && pwdForm.password !== pwdForm.confirm;

  const handleChangePwd = async () => {
    if (!pwdBarbero || !pwdMatch) return;
    if (pwdForm.password.length < 6) { alert('Mínimo 6 caracteres'); return; }
    setPwdLoading(true);
    try {
      await api.put(`/api/usuarios/${pwdBarbero.usuario.id}/contrasena`, { nuevaContrasena: pwdForm.password });
      setPwdBarbero(null);
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleAdd = async () => {
    if (form.password !== form.confirm) { alert('Las contraseñas no coinciden'); return; }
    if (!form.nombre || !form.email || !form.telefono || !form.password) return;
    setLoading(true);
    try {
      const usuario = await api.post<ApiUsuario>('/api/auth/registro', { rol: 'BARBERO' }, {
        nombre: form.nombre,
        email: form.email,
        contrasena: form.password,
      });
      await api.post('/api/barberos/perfil', { idUsuario: String(usuario.id), telefono: form.telefono });
      setForm({ nombre: '', email: '', telefono: '', password: '', confirm: '' });
      setShowAdd(false);
      onRefresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEstado = async (barbero: ApiBarbero) => {
    const nuevoEstado = barbero.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      await api.patch(`/api/barberos/${barbero.id}/estado`, { estado: nuevoEstado });
      onRefresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const deleteBarbero = async (id: number) => {
    if (!confirm('¿Eliminar este barbero?')) return;
    try {
      await api.del(`/api/barberos/${id}`);
      onRefresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-white">Barberos Registrados</h2>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2 text-sm md:text-base px-3 py-2 md:px-6 md:py-3">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Agregar Barbero</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      <div className="space-y-4">
        {barberos.map((b) => (
          <div key={b.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold text-lg flex-shrink-0">
                {b.nombre.charAt(0)}
              </div>
              <div>
                <h3 className="text-white font-bold">{b.nombre}</h3>
                <p className="text-[#9a9ab0] text-sm">{b.telefono}</p>
                <p className="text-[#9a9ab0] text-xs">{b.usuario.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-16 sm:ml-0">
              <span className={b.estado === 'ACTIVO' ? 'badge-active' : 'badge-inactive'}>
                {b.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
              </span>
              <button onClick={() => toggleEstado(b)}
                className="px-4 py-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all text-sm">
                {b.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => openChangePwd(b)}
                className="p-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all"
                title="Cambiar contraseña">
                <KeyRound className="w-4 h-4" />
              </button>
              <button onClick={() => deleteBarbero(b.id)}
                className="p-2 rounded-lg bg-[#12121a] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {barberos.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Users className="w-16 h-16 text-[#9a9ab0] mx-auto mb-4" />
            <p className="text-[#9a9ab0]">No hay barberos registrados</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#c9a84c]">Agregar Barbero</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              {[
                { ph: 'Nombre completo', key: 'nombre', type: 'text' },
                { ph: 'Correo electrónico', key: 'email', type: 'email' },
                { ph: 'Teléfono', key: 'telefono', type: 'tel' },
                { ph: 'Contraseña', key: 'password', type: 'password' },
                { ph: 'Confirmar contraseña', key: 'confirm', type: 'password' },
              ].map(({ ph, key, type }) => (
                <input key={key} type={type} placeholder={ph} value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
              ))}
              <button onClick={handleAdd} disabled={loading || !form.nombre || !form.email || !form.telefono || !form.password}
                className="w-full btn-gold disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pwdBarbero && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#c9a84c]">Cambiar Contraseña</h2>
              <button onClick={() => setPwdBarbero(null)} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f] mb-5">
              <div className="w-10 h-10 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold flex-shrink-0">
                {pwdBarbero.nombre.charAt(0)}
              </div>
              <div>
                <p className="text-white font-bold">{pwdBarbero.nombre}</p>
                <p className="text-[#9a9ab0] text-sm">{pwdBarbero.usuario.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Nueva contraseña"
                  value={pwdForm.password}
                  onChange={(e) => setPwdForm({ ...pwdForm, password: e.target.value })}
                  className="w-full bg-[#0a0a0f] text-white px-4 py-3 pr-12 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9ab0] hover:text-white transition-colors">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPwdConfirm ? 'text' : 'password'}
                  placeholder="Confirmar contraseña"
                  value={pwdForm.confirm}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  className={`w-full bg-[#0a0a0f] text-white px-4 py-3 pr-12 rounded-lg border outline-none transition-colors ${
                    pwdMismatch
                      ? 'border-[#e74c3c] focus:border-[#e74c3c]'
                      : pwdMatch
                      ? 'border-[#00c896] focus:border-[#00c896]'
                      : 'border-[#9a9ab0] focus:border-[#c9a84c]'
                  }`}
                />
                <button type="button" onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9ab0] hover:text-white transition-colors">
                  {showPwdConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {pwdMismatch && (
                <p className="text-[#e74c3c] text-sm">Las contraseñas no coinciden</p>
              )}
              {pwdMatch && (
                <p className="text-[#00c896] text-sm">Las contraseñas coinciden ✓</p>
              )}

              <button onClick={handleChangePwd}
                disabled={pwdLoading || !pwdMatch}
                className="w-full btn-gold disabled:opacity-50">
                {pwdLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Servicios tab ────────────────────────────────────────────────────────────
function ServiciosTab({ servicios, onRefresh }: {
  servicios: ApiServicio[];
  onRefresh: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nombre: '', precio: '', descripcion: '' });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.nombre || !form.precio) return;
    setLoading(true);
    try {
      await api.post('/api/servicios', undefined, {
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        descripcion: form.descripcion,
      });
      setForm({ nombre: '', precio: '', descripcion: '' });
      setShowAdd(false);
      onRefresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteServicio = async (id: number) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      await api.del(`/api/servicios/${id}`);
      onRefresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-white">Servicios</h2>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2 text-sm md:text-base px-3 py-2 md:px-6 md:py-3">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span>Agregar Servicio</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicios.map((s) => (
          <div key={s.id} className="glass-card p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-bold">{s.nombre}</h3>
              <button onClick={() => deleteServicio(s.id)} className="text-[#e74c3c] hover:text-white transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[#c9a84c] text-xl font-bold mb-1">S/. {Number(s.precio).toFixed(2)}</p>
            {s.descripcion && <p className="text-[#9a9ab0] text-sm mb-2">{s.descripcion}</p>}
          </div>
        ))}
        {servicios.length === 0 && (
          <div className="glass-card p-12 text-center col-span-3">
            <p className="text-[#9a9ab0]">No hay servicios registrados</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#c9a84c]">Agregar Servicio</h2>
              <button onClick={() => setShowAdd(false)} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre del servicio" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
              <input type="number" step="0.01" placeholder="Precio (S/.)" value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
              <input type="text" placeholder="Descripción (opcional)" value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
              <button onClick={handleAdd} disabled={loading || !form.nombre || !form.precio}
                className="w-full btn-gold disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar'}
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
  const [transacciones, setTransacciones] = useState<ApiTransaccion[]>([]);
  const [closing, setClosing] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const load = () => api.get<ApiTransaccion[]>('/api/caja/transacciones').then(setTransacciones).catch(console.error);
  useEffect(() => { load(); }, []);

  const byMethod: Record<string, number> = {};
  let total = 0;
  for (const t of transacciones) {
    const k = t.tipoPago.toLowerCase();
    byMethod[k] = (byMethod[k] || 0) + t.monto;
    total += t.monto;
  }

  const handleExport = async () => {
    try { await downloadExcel(); } catch (err: unknown) { alert((err as Error).message); }
  };

  const handleCierre = async () => {
    if (!confirm('¿Cerrar caja y enviar resumen al administrador?')) return;
    setClosing(true);
    setMensaje('');
    try {
      await api.post('/api/caja/cierre');
      setMensaje('Caja cerrada. Se envió el resumen al correo del administrador.');
      load();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Reporte de Caja — Hoy</h1>

      <div className="max-w-lg mx-auto glass-card p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#c9a84c]">Resumen del Día</h2>
          <div className="flex gap-2">
            <button onClick={handleExport}
              className="px-3 py-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button onClick={handleCierre} disabled={closing}
              className="px-3 py-2 rounded-lg bg-[#8b0000] text-white hover:bg-red-700 transition-all text-sm disabled:opacity-50">
              {closing ? '...' : 'Cerrar Caja'}
            </button>
          </div>
        </div>

        {mensaje && <p className="text-[#00c896] text-sm text-center mb-4">{mensaje}</p>}

        <div className="w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full border-[20px] border-[#00c896] relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-[#9a9ab0] text-xs md:text-sm">Total</p>
            <p className="text-[#c9a84c] text-xl md:text-2xl font-bold">S/. {total.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {[{ label: 'Efectivo', key: 'efectivo' }, { label: 'Yape', key: 'yape' }, { label: 'Plin', key: 'plin' }].map(({ label, key }) => (
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
      </div>

      {transacciones.length > 0 && (
        <div className="glass-card p-4 md:p-6">
          <h3 className="text-white font-bold mb-4">Transacciones del Día</h3>
          <div className="space-y-2">
            {transacciones.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#9a9ab0]/10 gap-1">
                <div>
                  <p className="text-white text-sm font-medium">{t.turno.nombreCliente} — {t.turno.servicio.nombre}</p>
                  <p className="text-[#9a9ab0] text-xs">{t.barbero.nombre} · {new Date(t.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded text-xs bg-[#12121a] text-[#9a9ab0]">{t.tipoPago}</span>
                  <span className="text-[#c9a84c] font-bold">S/. {Number(t.monto).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {transacciones.length === 0 && (
        <p className="text-[#9a9ab0] text-sm italic text-center mt-4">
          Los pagos son registrados por los barberos al finalizar cada servicio
        </p>
      )}
    </div>
  );
}

// ─── Inventory ────────────────────────────────────────────────────────────────
function fmtUnidad(unidad: string, cantidad: number): string {
  const plural: Record<string, string> = { unidad: 'Unidades', frasco: 'Frascos', pote: 'Potes' };
  const singular: Record<string, string> = { unidad: 'Unidad', frasco: 'Frasco', pote: 'Pote' };
  return cantidad === 1 ? (singular[unidad] ?? unidad) : (plural[unidad] ?? unidad);
}

function InventoryScreen() {
  const [items, setItems] = useState<ApiInsumo[]>([]);
  const [autoIds, setAutoIds] = useState<Set<number>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<ApiInsumo | null>(null);
  const [form, setForm] = useState({ nombre: '', stock: '', stockMinimo: '', unidad: 'unidad', autoDescuento: false });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [insumos, detalles] = await Promise.all([
      api.get<ApiInsumo[]>('/api/insumos').catch(() => [] as ApiInsumo[]),
      api.get<{ insumo: { id: number } }[]>('/api/detalle-servicio').catch(() => []),
    ]);
    setItems(insumos);
    setAutoIds(new Set(detalles.map(d => d.insumo.id)));
  };
  useEffect(() => { load(); }, []);

  const openEdit = (item: ApiInsumo) => {
    setEditItem(item);
    setForm({ nombre: item.nombre, stock: String(item.stock), stockMinimo: String(item.stockMinimo), unidad: item.unidad, autoDescuento: autoIds.has(item.id) });
  };

  const handleSave = async () => {
    if (!form.nombre || !form.stock || !form.stockMinimo) return;
    const stock = Math.max(0, parseFloat(form.stock));
    const stockMinimo = Math.max(0, parseFloat(form.stockMinimo));
    setLoading(true);
    const body = { nombre: form.nombre, stock, stockMinimo, unidad: form.unidad };
    try {
      let id: number;
      if (editItem) {
        await api.put(`/api/insumos/${editItem.id}`, undefined, body);
        id = editItem.id;
        setEditItem(null);
      } else {
        const nuevo = await api.post<ApiInsumo>('/api/insumos', undefined, body);
        id = nuevo.id;
        setShowAdd(false);
      }
      const tenia = autoIds.has(id);
      if (form.autoDescuento && !tenia) await api.post(`/api/detalle-servicio/insumo/${id}/activar`);
      else if (!form.autoDescuento && tenia) await api.del(`/api/detalle-servicio/insumo/${id}/desactivar`);
      setForm({ nombre: '', stock: '', stockMinimo: '', unidad: 'unidad', autoDescuento: false });
      load();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('¿Eliminar este insumo?')) return;
    try { await api.del(`/api/insumos/${id}`); load(); } catch (err: unknown) { alert((err as Error).message); }
  };

  const pct = (item: ApiInsumo) => item.stockMinimo > 0 ? (item.stock / (item.stockMinimo * 2)) * 100 : 100;
  const statusBar = (p: number) => p > 50 ? 'progress-high' : p > 20 ? 'progress-medium' : 'progress-low';
  const critical = items.filter(i => pct(i) < 20);

  const FormModal = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#c9a84c]">{title}</h2>
          <button onClick={onClose} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Nombre del insumo" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
          <div className="flex items-center gap-3">
            <label className="text-[#9a9ab0] text-sm w-10 shrink-0">Max</label>
            <input type="number" placeholder="Stock actual" value={form.stock} min="0"
              onChange={(e) => setForm({ ...form, stock: String(Math.max(0, Number(e.target.value))) })}
              className="flex-1 bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[#9a9ab0] text-sm w-10 shrink-0">Min</label>
            <input type="number" placeholder="Stock mínimo (alerta)" value={form.stockMinimo} min="0"
              onChange={(e) => setForm({ ...form, stockMinimo: String(Math.max(0, Number(e.target.value))) })}
              className="flex-1 bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
          </div>
          <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}
            className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none">
            <option value="unidad">Unidad</option>
            <option value="frasco">Frasco</option>
            <option value="pote">Pote</option>
          </select>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => setForm({ ...form, autoDescuento: !form.autoDescuento })}
              className={`w-12 h-6 rounded-full transition-colors relative ${form.autoDescuento ? 'bg-[#c9a84c]' : 'bg-[#9a9ab0]/40'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.autoDescuento ? 'left-7' : 'left-1'}`} />
            </div>
            <span className="text-[#9a9ab0] text-sm">Descuento automático <span className="text-[#9a9ab0]/60">(1 por cada atención)</span></span>
          </label>
          <button onClick={handleSave} disabled={loading || !form.nombre || !form.stock || !form.stockMinimo}
            className="w-full btn-gold disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Gestión de Inventario</h1>

      {critical.length > 0 && (
        <div className="glass-card p-4 mb-6 bg-[#e74c3c]/10 border border-[#e74c3c]">
          <p className="text-[#e74c3c] font-bold">
            ⚠️ {critical.length} insumo{critical.length > 1 ? 's' : ''} con stock crítico: {critical.map(i => i.nombre).join(', ')}
          </p>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button onClick={() => { setShowAdd(true); setEditItem(null); setForm({ nombre: '', stock: '', stockMinimo: '', unidad: 'unidad', autoDescuento: false }); }}
          className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Agregar Insumo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const p = pct(item);
          return (
            <div key={item.id} className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-bold text-base md:text-lg">{item.nombre}</h3>
                <CombIcon className="w-6 h-6 text-[#c9a84c]" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#9a9ab0]">Stock actual</span>
                    <span className={`font-bold ${p < 20 ? 'text-[#e74c3c]' : 'text-white'}`}>
                      {item.stock} {fmtUnidad(item.unidad, item.stock)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                    <div className={`h-full ${statusBar(p)} transition-all`} style={{ width: `${Math.min(p, 100)}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9a9ab0]">Mínimo</span>
                  <span className="text-[#9a9ab0]">{item.stockMinimo} {fmtUnidad(item.unidad, item.stockMinimo)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)}
                    className="flex-1 py-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all flex items-center justify-center gap-2 text-sm">
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button onClick={() => deleteItem(item.id)}
                    className="py-2 px-3 rounded-lg bg-[#12121a] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[#c9a84c] text-sm italic text-center mt-8">
        El stock se descuenta automáticamente al finalizar cada servicio
      </p>

      {showAdd && !editItem && (
        <FormModal title="Agregar Insumo" onClose={() => setShowAdd(false)} />
      )}
      {editItem && (
        <FormModal title="Editar Insumo" onClose={() => setEditItem(null)} />
      )}
    </div>
  );
}

// ─── Barber view (mobile) ─────────────────────────────────────────────────────
function BarberView({ nombre, email, onLogout }: { nombre: string; email: string; onLogout: () => void }) {
  const [todosTurnos, setTodosTurnos] = useState<ApiTurno[]>([]);
  const [transacciones, setTransacciones] = useState<ApiTransaccion[]>([]);
  const [myBarbero, setMyBarbero] = useState<ApiBarbero | null>(null);
  const [insumos, setInsumos] = useState<ApiInsumo[]>([]);
  const [turnoActivo, setTurnoActivo] = useState<ApiTurno | null>(null);
  const [tipoPago, setTipoPago] = useState<'EFECTIVO' | 'YAPE' | 'PLIN'>('EFECTIVO');
  const [cobrandoId, setCobrandoId] = useState<number | null>(null);
  const [agotados, setAgotados] = useState<Set<number>>(new Set());
  const [showAgotados, setShowAgotados] = useState(false);
  const [cubrirTurno, setCubrirTurno] = useState<ApiTurno | null>(null);

  const load = async () => {
    const [barberos, allTurnos, allTransacciones, allInsumos] = await Promise.all([
      api.get<ApiBarbero[]>('/api/barberos').catch(() => [] as ApiBarbero[]),
      api.get<ApiTurno[]>('/api/turnos').catch(() => [] as ApiTurno[]),
      api.get<ApiTransaccion[]>('/api/caja/transacciones').catch(() => [] as ApiTransaccion[]),
      api.get<ApiInsumo[]>('/api/insumos').catch(() => [] as ApiInsumo[]),
    ]);
    const me = barberos.find(b => b.usuario.email === email) ?? null;
    const myTr = me ? allTransacciones.filter(t => t.barbero?.id === me.id) : [];
    setMyBarbero(me);
    setInsumos(allInsumos);
    setTodosTurnos(allTurnos);
    setTransacciones(myTr);
    try {
      sessionStorage.setItem('cache_barbero', JSON.stringify({ me, turnos: allTurnos, insumos: allInsumos, tr: myTr }));
    } catch {}
  };

  const asignarme = async (turno: ApiTurno) => {
    if (!myBarbero) return;
    try {
      await api.put<ApiTurno>(`/api/turnos/${turno.id}/asignar`, { idBarbero: String(myBarbero.id) });
      load();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const cubrir = async () => {
    if (!myBarbero || !cubrirTurno) return;
    try {
      await api.put<ApiTurno>(`/api/turnos/${cubrirTurno.id}/asignar`, { idBarbero: String(myBarbero.id) });
      setCubrirTurno(null);
      load();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('cache_barbero');
      if (raw) {
        const { me, turnos, insumos, tr } = JSON.parse(raw);
        if (me) setMyBarbero(me);
        setTodosTurnos(turnos ?? []);
        setInsumos(insumos ?? []);
        setTransacciones(tr ?? []);
      }
    } catch {}
    load();
  }, []);

  const toggleAgotado = (id: number) => {
    setAgotados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirmarPago = async () => {
    if (!turnoActivo) return;
    setCobrandoId(turnoActivo.id);
    try {
      await api.post('/api/caja/cobrar', { idTurno: String(turnoActivo.id), tipoPago });
      for (const id of agotados) {
        await api.patch<ApiInsumo>(`/api/insumos/${id}/agotar`);
      }
      setTurnoActivo(null);
      setAgotados(new Set());
      setShowAgotados(false);
      load();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setCobrandoId(null);
    }
  };

  const byMethod: Record<string, number> = {};
  let totalHoy = 0;
  for (const t of transacciones) {
    const k = t.tipoPago.toLowerCase();
    byMethod[k] = (byMethod[k] || 0) + t.monto;
    totalHoy += t.monto;
  }

  const currentDate = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold text-xl">
            {nombre.charAt(0)}
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Hola, {nombre}</h1>
            <p className="text-[#9a9ab0] text-sm capitalize">{currentDate}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          {myBarbero && (
            <span className={myBarbero.estado === 'ACTIVO' ? 'badge-active' : 'badge-inactive'}>
              {myBarbero.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
            </span>
          )}
          <button onClick={onLogout} className="w-10 h-10 rounded-full bg-[#8b0000] flex items-center justify-center text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!myBarbero && (
        <div className="glass-card p-6 mb-6 border border-[#e74c3c]">
          <p className="text-[#e74c3c] text-center">No se encontró tu perfil de barbero. Contacta al administrador.</p>
        </div>
      )}

      {/* Cola unificada del día */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#c9a84c] mb-4">Cola de Hoy</h2>
        <div className="space-y-3">
          {[...todosTurnos]
            .filter(t => t.estado !== 'FINALIZADO')
            .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
            .map((turno, i) => {
              const esMio = turno.barbero?.id === myBarbero?.id;
              const esDeOtro = !!turno.barbero && !esMio;
              const finalizado = turno.estado === 'FINALIZADO';

              return (
                <div key={turno.id} className={`glass-card p-4 ${finalizado ? 'opacity-50' : ''} ${esMio && !finalizado ? 'border border-[#00c896]/40' : ''}`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm
                      ${esMio && !finalizado ? 'bg-[#00c896] text-[#0a0a0f]' : finalizado ? 'bg-[#9a9ab0]/20 text-[#9a9ab0]' : 'bg-[#9a9ab0]/30 text-white'}`}>
                      {finalizado ? <ScissorsIcon className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{turno.nombreCliente}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="px-2 py-1 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-xs border border-[#c9a84c]">
                          {turno.servicio.nombre}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-[#9a9ab0]/20 text-[#9a9ab0] text-xs">
                          S/. {Number(turno.servicio.precio).toFixed(2)}
                        </span>
                      </div>
                      {turno.barbero && (
                        <p className={`text-xs mt-1 ${esMio ? 'text-[#00c896]' : 'text-[#9a9ab0]'}`}>
                          {finalizado ? `Atendido por ${turno.barbero.nombre}` : esMio ? 'En tu atención' : `Asignado a ${turno.barbero.nombre}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {!finalizado && !turno.barbero && (
                    <button onClick={() => asignarme(turno)}
                      className="w-full bg-[#c9a84c] text-[#0a0a0f] font-bold py-3 rounded-lg hover:bg-[#b8973b] transition-all">
                      Atender
                    </button>
                  )}

                  {!finalizado && esMio && (
                    <>
                      <button onClick={() => { setTurnoActivo(turno); setTipoPago('EFECTIVO'); }}
                        className="w-full bg-[#00c896] text-white font-bold py-3 rounded-lg hover:bg-[#00b087] transition-all">
                        Marcar Finalizado
                      </button>
                      <p className="text-[#c9a84c] text-xs text-center mt-2 italic">Insumos descontados automáticamente</p>
                    </>
                  )}

                  {!finalizado && esDeOtro && (
                    <button onClick={() => setCubrirTurno(turno)}
                      className="w-full mt-1 py-2 rounded-lg border border-[#9a9ab0]/40 text-[#9a9ab0] text-sm hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all">
                      Cubrir turno
                    </button>
                  )}
                </div>
              );
            })}
          {todosTurnos.filter(t => t.estado !== 'FINALIZADO').length === 0 && (
            <div className="glass-card p-8 text-center">
              <Users className="w-12 h-12 text-[#9a9ab0] mx-auto mb-3" />
              <p className="text-[#9a9ab0]">No hay clientes hoy</p>
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
          <p className="text-[#0a0a0f] text-3xl font-bold">S/. {totalHoy.toFixed(2)}</p>
        </div>
        <p className="text-[#9a9ab0] text-sm text-center mt-3">
          {transacciones.length > 0 ? `${transacciones.length} servicio${transacciones.length > 1 ? 's' : ''} completado${transacciones.length > 1 ? 's' : ''}` : 'Buen trabajo hoy'}
        </p>
      </div>

      {turnoActivo && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#c9a84c]">Registrar Cobro</h2>
              <button onClick={() => { setTurnoActivo(null); setAgotados(new Set()); setShowAgotados(false); }} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
            </div>

            <div className="glass-card p-3 mb-5 bg-[#0a0a0f]/50">
              <p className="text-white font-bold">{turnoActivo.nombreCliente}</p>
              <p className="text-[#c9a84c] text-sm">{turnoActivo.servicio.nombre}</p>
              <p className="text-[#c9a84c] text-2xl font-bold mt-1">S/. {Number(turnoActivo.servicio.precio).toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <p className="text-[#9a9ab0] text-sm">Método de pago:</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'EFECTIVO', label: 'Efectivo', active: 'bg-[#00c896] text-white' },
                  { id: 'YAPE', label: 'Yape', active: 'bg-purple-600 text-white' },
                  { id: 'PLIN', label: 'Plin', active: 'bg-blue-500 text-white' },
                ] as const).map(({ id, label, active }) => (
                  <button key={id} onClick={() => setTipoPago(id)}
                    className={`py-3 rounded-lg font-medium transition-all text-sm ${
                      tipoPago === id ? active : 'bg-[#12121a] text-[#9a9ab0] border border-[#9a9ab0]'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 border border-[#9a9ab0]/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowAgotados(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#12121a] text-[#9a9ab0] text-sm hover:text-white transition-colors"
                >
                  <span>¿Algún insumo se agotó? {agotados.size > 0 && <span className="ml-1 px-2 py-0.5 rounded-full bg-red-700 text-white text-xs">{agotados.size}</span>}</span>
                  <span>{showAgotados ? '▲' : '▼'}</span>
                </button>
                {showAgotados && (
                  <div className="p-3 bg-[#0a0a0f]/60">
                    {insumos.length === 0 ? (
                      <p className="text-[#9a9ab0] text-xs text-center py-2">No hay insumos registrados</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {insumos.map(ins => {
                          const sel = agotados.has(ins.id);
                          return (
                            <button key={ins.id} onClick={() => toggleAgotado(ins.id)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                sel
                                  ? 'bg-red-700 border-red-500 text-white'
                                  : 'bg-transparent border-[#9a9ab0]/40 text-[#9a9ab0] hover:border-red-500 hover:text-red-400'
                              }`}>
                              {sel ? '✕ ' : ''}{ins.nombre}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {agotados.size > 0 && (
                      <p className="text-[#9a9ab0] text-xs mt-2">
                        Se restará 1 unidad de: {insumos.filter(i => agotados.has(i.id)).map(i => i.nombre).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button onClick={confirmarPago} disabled={cobrandoId === turnoActivo.id}
                className="w-full btn-gold disabled:opacity-50 mt-3">
                {cobrandoId === turnoActivo.id ? 'Procesando...' : 'Confirmar y Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {cubrirTurno && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#c9a84c]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Cubrir turno</h2>
                <p className="text-[#9a9ab0] text-xs">Asignado a {cubrirTurno.barbero?.nombre}</p>
              </div>
            </div>

            <div className="bg-[#0a0a0f] rounded-lg p-4 mb-5 border border-[#9a9ab0]/20">
              <p className="text-white font-bold">{cubrirTurno.nombreCliente}</p>
              <p className="text-[#c9a84c] text-sm mt-1">{cubrirTurno.servicio.nombre}</p>
              <p className="text-[#9a9ab0] text-xs mt-3 leading-relaxed">
                Al confirmar, este turno quedará asignado a ti y quedará registrado que fuiste tú quien lo atendió.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCubrirTurno(null)}
                className="flex-1 py-3 rounded-lg border border-[#9a9ab0]/40 text-[#9a9ab0] font-medium hover:border-white hover:text-white transition-all">
                Cancelar
              </button>
              <button onClick={cubrir}
                className="flex-1 py-3 rounded-lg bg-[#c9a84c] text-[#0a0a0f] font-bold hover:bg-[#b8973b] transition-all">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
