import { useState, useEffect } from 'react';
import {
  LayoutDashboard, DollarSign, Package, LogOut, Bell, Settings,
  Eye, EyeOff, Plus, Edit2, TrendingUp, Clock, Users, X, Download, Menu, Trash2, KeyRound,
  BarChart2, Clipboard, ChevronRight,
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
type ApiReporte = { id: number; fecha: string; totalEfectivo: number; totalYape: number; totalPlin: number; totalGeneral: number };
type Auth = { token: string; rol: string; nombre: string; email: string };
type Screen = 'dashboard' | 'barberos' | 'insumos' | 'pagos' | 'reportes' | 'configuracion';

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

  const handleAuthUpdate = () => {
    const a = getAuth();
    if (a) setAuthState(a);
  };

  if (!auth) return <LoginScreen onLogin={handleLogin} />;
  if (auth.rol === 'BARBERO') return <BarberView nombre={auth.nombre} email={auth.email} onLogout={handleLogout} />;

  return <AdminView nombre={auth.nombre} screen={screen} setScreen={setScreen} onLogout={handleLogout} onAuthUpdate={handleAuthUpdate} />;
}

// ─── Login ────────────────────────────────────────────────────────────────────
type LoginMode = 'login' | 'forgot_email' | 'forgot_code';

function LoginScreen({ onLogin }: { onLogin: (token: string, rol: string, nombre: string, email: string) => void }) {
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Recuperación
  const [recEmail, setRecEmail] = useState('');
  const [recCode, setRecCode] = useState('');
  const [recPwd, setRecPwd] = useState('');
  const [recMsg, setRecMsg] = useState('');

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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/api/auth/enviar-codigo-recuperacion', { email: recEmail });
      setRecMsg('Código enviado. Revisa tu correo (válido 15 min).');
      setMode('forgot_code');
    } catch (err: unknown) {
      setError((err as Error).message || 'Correo no registrado.');
    } finally { setLoading(false); }
  };

  const handleResetPwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/api/auth/restablecer-password', undefined, {
        email: recEmail, codigo: recCode, nuevaContrasena: recPwd,
      });
      setRecMsg('¡Contraseña actualizada! Ya puedes iniciar sesión.');
      setTimeout(() => { setMode('login'); setRecMsg(''); setRecEmail(''); setRecCode(''); setRecPwd(''); }, 2000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Código incorrecto o expirado.');
    } finally { setLoading(false); }
  };

  const header = (
    <div className="flex flex-col items-center mb-8">
      <ScissorsIcon className="w-16 h-16 text-[#c9a84c] mb-4" />
      <h1 className="text-3xl font-bold text-[#c9a84c] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>BARBER VES</h1>
      <p className="text-[#9a9ab0] text-sm">Sistema de Control Interno</p>
    </div>
  );

  if (mode === 'forgot_email') return (
    <div className="min-h-screen barber-pole-bg bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        {header}
        <h2 className="text-white font-bold text-lg mb-2">Recuperar contraseña</h2>
        <p className="text-[#9a9ab0] text-sm mb-6">Ingresa tu correo y te enviaremos un código de 6 dígitos.</p>
        <form onSubmit={handleSendCode} className="space-y-4">
          <input type="email" placeholder="Correo electrónico" value={recEmail}
            onChange={e => setRecEmail(e.target.value)} required
            className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border-b-2 border-[#9a9ab0] focus:border-[#c9a84c] outline-none transition-colors" />
          {error && <p className="text-[#e74c3c] text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-gold disabled:opacity-60">
            {loading ? 'Enviando...' : 'Enviar código'}
          </button>
          <button type="button" onClick={() => { setMode('login'); setError(''); }}
            className="w-full text-[#9a9ab0] text-sm hover:text-white transition-colors">
            ← Volver al inicio de sesión
          </button>
        </form>
      </div>
    </div>
  );

  if (mode === 'forgot_code') return (
    <div className="min-h-screen barber-pole-bg bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        {header}
        <h2 className="text-white font-bold text-lg mb-2">Nueva contraseña</h2>
        {recMsg && <p className="text-[#00c896] text-sm mb-4">{recMsg}</p>}
        <form onSubmit={handleResetPwd} className="space-y-4">
          <input type="text" placeholder="Código de 6 dígitos" value={recCode} maxLength={6}
            onChange={e => setRecCode(e.target.value)} required
            className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border-b-2 border-[#9a9ab0] focus:border-[#c9a84c] outline-none transition-colors tracking-widest text-center text-xl" />
          <input type="password" placeholder="Nueva contraseña" value={recPwd}
            onChange={e => setRecPwd(e.target.value)} required
            className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border-b-2 border-[#9a9ab0] focus:border-[#c9a84c] outline-none transition-colors" />
          {error && <p className="text-[#e74c3c] text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-gold disabled:opacity-60">
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
          <button type="button" onClick={() => { setMode('forgot_email'); setError(''); setRecMsg(''); }}
            className="w-full text-[#9a9ab0] text-sm hover:text-white transition-colors">
            ← Reenviar código
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen barber-pole-bg bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        {header}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" placeholder="Correo electrónico" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border-b-2 border-[#9a9ab0] focus:border-[#c9a84c] outline-none transition-colors"
            required />
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border-b-2 border-[#9a9ab0] focus:border-[#c9a84c] outline-none transition-colors pr-12"
              required />
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
        <button onClick={() => { setMode('forgot_email'); setError(''); }}
          className="w-full text-[#9a9ab0] text-sm hover:text-[#c9a84c] transition-colors mt-4">
          ¿Olvidaste tu contraseña?
        </button>
        <p className="text-center text-[#9a9ab0] text-xs mt-6">Villa El Salvador, Lima 2026</p>
      </div>
    </div>
  );
}

// ─── Admin layout ─────────────────────────────────────────────────────────────
function AdminView({ nombre, screen, setScreen, onLogout, onAuthUpdate }: {
  nombre: string; screen: Screen; setScreen: (s: Screen) => void; onLogout: () => void; onAuthUpdate: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertas, setAlertas] = useState<ApiInsumo[]>([]);
  const [showBell, setShowBell] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<number>>(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = JSON.parse(localStorage.getItem('bell_seen') || 'null');
      return saved?.date === today ? new Set<number>(saved.ids) : new Set<number>();
    } catch { return new Set<number>(); }
  });

  useEffect(() => {
    api.get<ApiInsumo[]>('/api/insumos/alertas').then(data => setAlertas(data ?? [])).catch(console.error);
  }, []);

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

  const navGroups: { label: string; items: { id: Screen; label: string; icon: React.ReactNode }[] }[] = [
    {
      label: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'barberos', label: 'Admin. Barberos', icon: <Users className="w-5 h-5" /> },
      ],
    },
    {
      label: 'GESTIÓN',
      items: [
        { id: 'insumos', label: 'Insumos', icon: <Package className="w-5 h-5" /> },
        { id: 'pagos', label: 'Pagos', icon: <DollarSign className="w-5 h-5" /> },
      ],
    },
    {
      label: 'REPORTES',
      items: [
        { id: 'reportes', label: 'Reporte', icon: <BarChart2 className="w-5 h-5" /> },
      ],
    },
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="text-[#9a9ab0]/50 text-[10px] font-bold tracking-widest px-4 py-2">{group.label}</p>
            {group.items.map((item) => (
              <button key={item.id}
                onClick={() => { setScreen(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  screen === item.id ? 'bg-[#c9a84c] text-[#0a0a0f]' : 'text-[#9a9ab0] hover:bg-[#12121a]'
                }`}>
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
        <div className="pt-2 border-t border-[#c9a84c]/20">
          <button onClick={() => { setScreen('configuracion'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all mb-1 ${
              screen === 'configuracion' ? 'bg-[#c9a84c] text-[#0a0a0f]' : 'text-[#9a9ab0] hover:bg-[#12121a]'
            }`}>
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Configuración</span>
          </button>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#9a9ab0] hover:bg-[#8b0000] hover:text-white transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
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
      <div className="flex-1 flex flex-col min-h-0">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d0d14] border-b border-[#c9a84c]/20">
          <button onClick={() => setSidebarOpen(true)} className="text-[#c9a84c]">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-[#c9a84c] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>BARBER VES</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={toggleBell}
                className="flex w-9 h-9 rounded-full bg-[#12121a] items-center justify-center text-[#c9a84c]">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold pointer-events-none">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showBell && (
                <div className="absolute right-0 top-11 w-72 max-w-[calc(100vw-2rem)] bg-[#12121a] border border-[#9a9ab0]/20 rounded-xl shadow-2xl z-50 overflow-hidden">
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
            <div className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold text-sm">
              {nombre.charAt(0)}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          {screen === 'dashboard' && <DashboardScreen nombre={nombre} alertas={alertas} />}
          {screen === 'barberos' && <BarberosAdminScreen />}
          {screen === 'insumos' && <InventoryScreen />}
          {screen === 'pagos' && <CajaScreen />}
          {screen === 'reportes' && <ReporteScreen />}
          {screen === 'configuracion' && <ConfiguracionScreen onLogout={onLogout} onAuthUpdate={onAuthUpdate} />}
        </div>
      </div>
    </div>
  );
}

// ─── Configuración ────────────────────────────────────────────────────────────
type ConfigSection = 'email' | 'password' | 'recuperar';

function ConfiguracionScreen({ onLogout, onAuthUpdate }: { onLogout: () => void; onAuthUpdate: () => void }) {
  const auth = getAuth();
  const [currentEmail, setCurrentEmail] = useState(auth?.email ?? '');
  const nombre = auth?.nombre ?? '';
  const [section, setSection] = useState<ConfigSection>('email');

  // Cambiar email
  const [emailForm, setEmailForm] = useState({ nuevoEmail: '', contrasenaActual: '' });
  const [emailMsg, setEmailMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Cambiar contraseña
  const [pwForm, setPwForm] = useState({ contrasenaActual: '', nuevaContrasena: '', confirmar: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Recuperar contraseña
  const [recStep, setRecStep] = useState<'send' | 'code'>('send');
  const [recForm, setRecForm] = useState({ codigo: '', nuevaContrasena: '', confirmar: '' });
  const [recMsg, setRecMsg] = useState('');
  const [recLoading, setRecLoading] = useState(false);

  const handleCambiarEmail = async () => {
    if (!emailForm.nuevoEmail || !emailForm.contrasenaActual) return;
    setEmailLoading(true); setEmailMsg('');
    try {
      const res = await api.put<{ token: string; rol: string; nombre: string; email: string }>(
        '/api/perfil/email', undefined, { nuevoEmail: emailForm.nuevoEmail, contrasenaActual: emailForm.contrasenaActual }
      );
      setAuth(res.token, res.rol, res.nombre, res.email);
      onAuthUpdate();
      setCurrentEmail(res.email);
      setEmailForm({ nuevoEmail: '', contrasenaActual: '' });
      setEmailMsg('✓ Correo actualizado correctamente');
    } catch (err: unknown) {
      setEmailMsg((err as Error).message);
    } finally { setEmailLoading(false); }
  };

  const handleCambiarPassword = async () => {
    if (!pwForm.contrasenaActual || !pwForm.nuevaContrasena) return;
    if (pwForm.nuevaContrasena !== pwForm.confirmar) { setPwMsg('Las contraseñas no coinciden'); return; }
    setPwLoading(true); setPwMsg('');
    try {
      await api.put('/api/perfil/password', undefined, { contrasenaActual: pwForm.contrasenaActual, nuevaContrasena: pwForm.nuevaContrasena });
      setPwMsg('✓ Contraseña actualizada correctamente');
      setPwForm({ contrasenaActual: '', nuevaContrasena: '', confirmar: '' });
    } catch (err: unknown) {
      setPwMsg((err as Error).message);
    } finally { setPwLoading(false); }
  };

  const handleEnviarCodigo = async () => {
    setRecLoading(true); setRecMsg('');
    try {
      await api.post('/api/auth/enviar-codigo-recuperacion', { email: currentEmail });
      setRecStep('code');
      setRecMsg('Código enviado. Revisa tu correo (válido 15 min).');
    } catch (err: unknown) {
      setRecMsg((err as Error).message);
    } finally { setRecLoading(false); }
  };

  const handleRecuperar = async () => {
    if (!recForm.codigo || !recForm.nuevaContrasena) return;
    if (recForm.nuevaContrasena !== recForm.confirmar) { setRecMsg('Las contraseñas no coinciden'); return; }
    setRecLoading(true); setRecMsg('');
    try {
      await api.post('/api/auth/restablecer-password', undefined, {
        email: currentEmail, codigo: recForm.codigo, nuevaContrasena: recForm.nuevaContrasena,
      });
      setRecMsg('✓ Contraseña restablecida. Cerrando sesión...');
      setTimeout(onLogout, 2000);
    } catch (err: unknown) {
      setRecMsg((err as Error).message);
    } finally { setRecLoading(false); }
  };

  const inputCls = 'w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none';

  const sections: { id: ConfigSection; label: string }[] = [
    { id: 'email', label: 'Cambiar correo' },
    { id: 'password', label: 'Cambiar contraseña' },
    { id: 'recuperar', label: 'Olvidé mi contraseña' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Configuración</h2>
      <p className="text-[#9a9ab0] text-sm mb-6">Administra los datos de tu cuenta</p>

      {/* Perfil */}
      <div className="glass-card p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold text-xl flex-shrink-0">
          {nombre.charAt(0)}
        </div>
        <div>
          <p className="text-white font-semibold text-base">{nombre}</p>
          <p className="text-[#9a9ab0] text-sm">{currentEmail}</p>
          <p className="text-[#c9a84c]/70 text-xs mt-1">Administrador</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map(s => (
          <button key={s.id} onClick={() => { setSection(s.id); setEmailMsg(''); setPwMsg(''); setRecMsg(''); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              section === s.id ? 'bg-[#c9a84c] text-[#0a0a0f]' : 'bg-[#12121a] text-[#9a9ab0] hover:text-white'
            }`}>
            {s.label}
            {section === s.id && <ChevronRight className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* Cambiar correo */}
      {section === 'email' && (
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-white font-semibold mb-1">Cambiar correo electrónico</h3>
            <p className="text-[#9a9ab0] text-xs">Correo actual: <span className="text-white">{currentEmail}</span></p>
          </div>
          <input type="email" placeholder="Nuevo correo electrónico" value={emailForm.nuevoEmail}
            onChange={e => setEmailForm({ ...emailForm, nuevoEmail: e.target.value })} className={inputCls} />
          <input type="password" placeholder="Contraseña actual (para confirmar)" value={emailForm.contrasenaActual}
            onChange={e => setEmailForm({ ...emailForm, contrasenaActual: e.target.value })} className={inputCls} />
          {emailMsg && <p className={`text-sm ${emailMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{emailMsg}</p>}
          <button onClick={handleCambiarEmail} disabled={emailLoading || !emailForm.nuevoEmail || !emailForm.contrasenaActual}
            className="w-full btn-gold disabled:opacity-50">
            {emailLoading ? 'Guardando...' : 'Actualizar correo'}
          </button>
        </div>
      )}

      {/* Cambiar contraseña */}
      {section === 'password' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-white font-semibold">Cambiar contraseña</h3>
          <input type="password" placeholder="Contraseña actual" value={pwForm.contrasenaActual}
            onChange={e => setPwForm({ ...pwForm, contrasenaActual: e.target.value })} className={inputCls} />
          <input type="password" placeholder="Nueva contraseña" value={pwForm.nuevaContrasena}
            onChange={e => setPwForm({ ...pwForm, nuevaContrasena: e.target.value })} className={inputCls} />
          <input type="password" placeholder="Confirmar nueva contraseña" value={pwForm.confirmar}
            onChange={e => setPwForm({ ...pwForm, confirmar: e.target.value })} className={inputCls} />
          {pwMsg && <p className={`text-sm ${pwMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{pwMsg}</p>}
          <button onClick={handleCambiarPassword}
            disabled={pwLoading || !pwForm.contrasenaActual || !pwForm.nuevaContrasena || !pwForm.confirmar}
            className="w-full btn-gold disabled:opacity-50">
            {pwLoading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </div>
      )}

      {/* Recuperar contraseña */}
      {section === 'recuperar' && (
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="text-white font-semibold mb-1">Recuperar contraseña</h3>
            <p className="text-[#9a9ab0] text-xs">Usa esta opción si no recuerdas tu contraseña actual.</p>
          </div>
          {recStep === 'send' ? (
            <>
              <p className="text-[#9a9ab0] text-sm">
                Se enviará un código de verificación a: <span className="text-white">{currentEmail}</span>
              </p>
              {recMsg && <p className="text-red-400 text-sm">{recMsg}</p>}
              <button onClick={handleEnviarCodigo} disabled={recLoading} className="w-full btn-gold disabled:opacity-50">
                {recLoading ? 'Enviando...' : 'Enviar código al correo'}
              </button>
            </>
          ) : (
            <>
              {recMsg && <p className={`text-sm ${recMsg.startsWith('✓') ? 'text-green-400' : 'text-[#9a9ab0]'}`}>{recMsg}</p>}
              <input type="text" placeholder="Código de 6 dígitos" value={recForm.codigo}
                onChange={e => setRecForm({ ...recForm, codigo: e.target.value })} className={inputCls} />
              <input type="password" placeholder="Nueva contraseña" value={recForm.nuevaContrasena}
                onChange={e => setRecForm({ ...recForm, nuevaContrasena: e.target.value })} className={inputCls} />
              <input type="password" placeholder="Confirmar nueva contraseña" value={recForm.confirmar}
                onChange={e => setRecForm({ ...recForm, confirmar: e.target.value })} className={inputCls} />
              {recMsg && recMsg.startsWith('Las') && <p className="text-red-400 text-sm">{recMsg}</p>}
              <button onClick={handleRecuperar} disabled={recLoading || !recForm.codigo || !recForm.nuevaContrasena || !recForm.confirmar}
                className="w-full btn-gold disabled:opacity-50">
                {recLoading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
              <button onClick={() => { setRecStep('send'); setRecMsg(''); setRecForm({ codigo: '', nuevaContrasena: '', confirmar: '' }); }}
                className="w-full text-[#9a9ab0] text-sm hover:text-white transition-colors py-1">
                Reenviar código
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardScreen({ nombre, alertas }: { nombre: string; alertas: ApiInsumo[] }) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'cola' | 'servicios'>('resumen');
  const [barberos, setBarberos] = useState<ApiBarbero[]>([]);
  const [turnos, setTurnos] = useState<ApiTurno[]>([]);
  const [servicios, setServicios] = useState<ApiServicio[]>([]);
  const [transacciones, setTransacciones] = useState<ApiTransaccion[]>([]);
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
    ]).then(([b, t, s, tr]) => {
      setBarberos(b ?? []); setTurnos(t ?? []); setServicios(s ?? []);
      setTransacciones(tr ?? []);
      try { sessionStorage.setItem('cache_admin', JSON.stringify({ b, t, s, tr })); } catch {}
    }).catch(console.error);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('cache_admin');
      if (raw) {
        const { b, t, s, tr } = JSON.parse(raw);
        setBarberos(b ?? []); setTurnos(t ?? []); setServicios(s ?? []);
        setTransacciones(tr ?? []);
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
            <div className="absolute right-0 top-12 w-72 max-w-[calc(100vw-2rem)] bg-[#12121a] border border-[#9a9ab0]/20 rounded-xl shadow-2xl z-50 overflow-hidden">
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

      <div className="flex gap-4 md:gap-6 mb-6 border-b border-[#c9a84c]/20 overflow-x-auto scrollbar-hide">
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
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [editBarbero, setEditBarbero] = useState<ApiBarbero | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', telefono: '' });
  const [editLoading, setEditLoading] = useState(false);
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
      await api.put(`/api/usuarios/${pwdBarbero.usuario.id}/contrasena`, undefined, { nuevaContrasena: pwdForm.password });
      setPwdBarbero(null);
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setPwdLoading(false);
    }
  };

  const openEdit = (b: ApiBarbero) => {
    setEditBarbero(b);
    setEditForm({ nombre: b.nombre, telefono: b.telefono });
  };

  const handleEdit = async () => {
    if (!editBarbero || !editForm.nombre || !editForm.telefono) return;
    setEditLoading(true);
    try {
      await api.put(`/api/barberos/${editBarbero.id}`, { nombre: editForm.nombre, telefono: editForm.telefono });
      setEditBarbero(null);
      onRefresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.nombre || !form.email || !form.telefono) return;
    setLoading(true);
    try {
      const usuario = await api.post<ApiUsuario>('/api/auth/registro', { rol: 'BARBERO' }, {
        nombre: form.nombre,
        email: form.email,
      });
      await api.post('/api/barberos/perfil', { idUsuario: String(usuario.id), telefono: form.telefono });
      setForm({ nombre: '', email: '', telefono: '' });
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
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pl-16 sm:pl-0">
              <span className={b.estado === 'ACTIVO' ? 'badge-active' : 'badge-inactive'}>
                {b.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
              </span>
              <button onClick={() => toggleEstado(b)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all text-sm">
                {b.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => openEdit(b)}
                className="p-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all"
                title="Editar barbero">
                <Edit2 className="w-4 h-4" />
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
              ].map(({ ph, key, type }) => (
                <input key={key} type={type} placeholder={ph} value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
              ))}
              <div className="bg-[#12121a] rounded-lg px-4 py-3 text-sm text-[#9a9ab0]">
                Contraseña inicial: <span className="text-[#c9a84c] font-mono font-bold">Barber1234</span>
                <p className="text-xs mt-1">El barbero puede cambiarla con "Olvidé mi contraseña".</p>
              </div>
              <button onClick={handleAdd}
                disabled={loading || !form.nombre || !form.email || !form.telefono}
                className="w-full btn-gold disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editBarbero && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#c9a84c]">Editar Barbero</h2>
              <button onClick={() => setEditBarbero(null)} className="text-[#9a9ab0] hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f] mb-5">
              <div className="w-10 h-10 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold flex-shrink-0">
                {editForm.nombre.charAt(0) || editBarbero.nombre.charAt(0)}
              </div>
              <p className="text-[#9a9ab0] text-sm">{editBarbero.usuario.email}</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre completo"
                value={editForm.nombre}
                onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={editForm.telefono}
                onChange={e => setEditForm({ ...editForm, telefono: e.target.value })}
                className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none"
              />
              <button onClick={handleEdit}
                disabled={editLoading || !editForm.nombre || !editForm.telefono}
                className="w-full btn-gold disabled:opacity-50">
                {editLoading ? 'Guardando...' : 'Guardar Cambios'}
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
type ServicioForm = { nombre: string; precio: string; descripcion: string };

function ServicioFormFields({ f, setF }: { f: ServicioForm; setF: (v: ServicioForm) => void }) {
  return (
    <div className="space-y-4">
      <input type="text" placeholder="Nombre del servicio" value={f.nombre}
        onChange={(e) => setF({ ...f, nombre: e.target.value })}
        className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
      <input type="number" step="0.01" placeholder="Precio (S/.)" value={f.precio}
        onChange={(e) => setF({ ...f, precio: e.target.value })}
        className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
      <input type="text" placeholder="Descripción (opcional)" value={f.descripcion}
        onChange={(e) => setF({ ...f, descripcion: e.target.value })}
        className="w-full bg-[#0a0a0f] text-white px-4 py-3 rounded-lg border border-[#9a9ab0] focus:border-[#c9a84c] outline-none" />
    </div>
  );
}

function ServiciosTab({ servicios, onRefresh }: {
  servicios: ApiServicio[];
  onRefresh: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<ServicioForm>({ nombre: '', precio: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [editServicio, setEditServicio] = useState<ApiServicio | null>(null);
  const [editForm, setEditForm] = useState<ServicioForm>({ nombre: '', precio: '', descripcion: '' });
  const [editLoading, setEditLoading] = useState(false);

  const openEdit = (s: ApiServicio) => {
    setEditServicio(s);
    setEditForm({ nombre: s.nombre, precio: String(s.precio), descripcion: s.descripcion || '' });
  };

  const handleEdit = async () => {
    if (!editServicio || !editForm.nombre || !editForm.precio) return;
    setEditLoading(true);
    try {
      await api.put(`/api/servicios/${editServicio.id}`, {
        nombre: editForm.nombre,
        precio: editForm.precio,
        descripcion: editForm.descripcion,
      });
      setEditServicio(null);
      onRefresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setEditLoading(false);
    }
  };

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
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="text-[#c9a84c] hover:text-white transition-colors" title="Editar">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteServicio(s.id)} className="text-[#e74c3c] hover:text-white transition-colors" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[#c9a84c] text-xl font-bold mb-1">S/. {Number(s.precio).toFixed(2)}</p>
            {s.descripcion && <p className="text-[#9a9ab0] text-sm mb-2">{s.descripcion}</p>}
          </div>
        ))}
        {servicios.length === 0 && (
          <div className="glass-card p-12 text-center col-span-full">
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
            <ServicioFormFields f={form} setF={setForm} />
            <button onClick={handleAdd} disabled={loading || !form.nombre || !form.precio}
              className="w-full btn-gold disabled:opacity-50 mt-4">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {editServicio && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#c9a84c]">Editar Servicio</h2>
              <button onClick={() => setEditServicio(null)} className="text-[#9a9ab0]"><X className="w-6 h-6" /></button>
            </div>
            <ServicioFormFields f={editForm} setF={setEditForm} />
            <button onClick={handleEdit} disabled={editLoading || !editForm.nombre || !editForm.precio}
              className="w-full btn-gold disabled:opacity-50 mt-4">
              {editLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
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
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  const load = () => api.get<ApiTransaccion[]>('/api/caja/transacciones').then(setTransacciones).catch(console.error);
  useEffect(() => { load(); }, []);

  const isSunday = new Date().getDay() === 0;

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
      try { await downloadExcel(); } catch { /* silently skip if excel fails */ }
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setClosing(false);
    }
  };

  const handleReporteSemanal = async () => {
    setWeeklyLoading(true);
    try {
      const hoy = new Date();
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - 6);
      const desde = lunes.toISOString().slice(0, 10);
      const hasta = hoy.toISOString().slice(0, 10);
      await downloadExcel(desde, hasta);
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setWeeklyLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Reporte de Caja — Hoy</h1>

      <div className="max-w-lg mx-auto glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-lg font-bold text-[#c9a84c]">Resumen del Día</h2>
          <div className="flex flex-wrap gap-2 self-end sm:self-auto">
            {isSunday && (
              <button onClick={handleReporteSemanal} disabled={weeklyLoading}
                className="px-3 py-2 rounded-lg bg-purple-900/60 text-purple-300 hover:bg-purple-700 hover:text-white transition-all flex items-center gap-2 text-sm disabled:opacity-50">
                <Download className="w-4 h-4" />
                {weeklyLoading ? '...' : 'Reporte Semanal'}
              </button>
            )}
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

// ─── Barberos Admin screen ────────────────────────────────────────────────────
function BarberosAdminScreen() {
  const [barberos, setBarberos] = useState<ApiBarbero[]>([]);
  const refresh = () =>
    api.get<ApiBarbero[]>('/api/barberos').then(d => setBarberos(d ?? [])).catch(console.error);
  useEffect(() => { refresh(); }, []);
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Administración de Barberos</h1>
      <BarberosTab barberos={barberos} onRefresh={refresh} />
    </div>
  );
}

// ─── Reporte screen ───────────────────────────────────────────────────────────
function ReporteScreen() {
  const [reportes, setReportes] = useState<ApiReporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [descargandoMes, setDescargandoMes] = useState(false);

  useEffect(() => {
    api.get<ApiReporte[]>('/api/caja/reportes')
      .then(d => setReportes(d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Genera lista de meses únicos presentes en los reportes + mes actual
  const mesesDisponibles = (() => {
    const set = new Set<string>();
    const hoy = new Date();
    set.add(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`);
    for (const r of reportes) {
      const [year, month] = r.fecha.split('-');
      set.add(`${year}-${month}`);
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  })();

  const fmtMes = (ym: string) => {
    const [y, m] = ym.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  };

  const handleDescargarMes = async () => {
    const ym = mesSeleccionado || mesesDisponibles[0];
    if (!ym) return;
    const [y, m] = ym.split('-').map(Number);
    const desde = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const hasta = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;
    setDescargandoMes(true);
    try {
      await downloadExcel(desde, hasta);
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setDescargandoMes(false);
    }
  };

  const fmt = (n: number) => `S/. ${Number(n).toFixed(2)}`;
  const fmtFecha = (f: string) => new Date(f + 'T00:00:00').toLocaleDateString('es-PE', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

  const mesActivo = mesSeleccionado || mesesDisponibles[0] || '';
  const reportesFiltrados = reportes.filter(r => r.fecha.startsWith(mesActivo));
  const totalMes = reportesFiltrados.reduce((acc, r) => acc + Number(r.totalGeneral), 0);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Historial de Cierres de Caja</h1>

      {loading && <p className="text-[#9a9ab0] text-center py-12">Cargando reportes...</p>}

      {!loading && reportes.length === 0 && (
        <div className="glass-card p-12 text-center">
          <BarChart2 className="w-16 h-16 text-[#9a9ab0] mx-auto mb-4" />
          <p className="text-[#9a9ab0]">Aún no hay cierres de caja registrados.</p>
          <p className="text-[#9a9ab0] text-sm mt-1">Usa el botón "Cerrar Caja" en la pantalla de Pagos.</p>
        </div>
      )}

      {!loading && reportes.length > 0 && (
        <>
          {/* Selector de mes + descarga mensual */}
          <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={mesActivo}
              onChange={e => setMesSeleccionado(e.target.value)}
              className="flex-1 bg-[#12121a] border border-[#9a9ab0]/30 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#c9a84c] transition-colors capitalize">
              {mesesDisponibles.map(ym => (
                <option key={ym} value={ym} className="capitalize">{fmtMes(ym)}</option>
              ))}
            </select>
            <div className="flex items-center gap-3 flex-shrink-0">
              {reportesFiltrados.length > 0 && (
                <p className="text-[#c9a84c] font-bold text-sm">
                  Total: {fmt(totalMes)}
                </p>
              )}
              <button onClick={handleDescargarMes} disabled={descargandoMes}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#c9a84c] text-[#0a0a0f] font-bold text-sm hover:bg-[#b8973b] transition-all disabled:opacity-50">
                <Download className="w-4 h-4" />
                {descargandoMes ? 'Descargando...' : 'Excel del Mes'}
              </button>
            </div>
          </div>

          {/* Reportes del mes seleccionado */}
          {reportesFiltrados.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-[#9a9ab0]">No hay cierres registrados en {fmtMes(mesActivo)}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportesFiltrados.map((r) => (
                <div key={r.id} className="glass-card p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-bold capitalize">{fmtFecha(r.fecha)}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="text-[#9a9ab0] text-xs">Efectivo: <span className="text-white font-medium">{fmt(r.totalEfectivo)}</span></span>
                        <span className="text-[#9a9ab0] text-xs">Yape: <span className="text-purple-400 font-medium">{fmt(r.totalYape)}</span></span>
                        <span className="text-[#9a9ab0] text-xs">Plin: <span className="text-blue-400 font-medium">{fmt(r.totalPlin)}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <p className="text-[#c9a84c] text-xl font-bold">{fmt(r.totalGeneral)}</p>
                      <button
                        onClick={async () => { try { await downloadExcel(r.fecha, r.fecha); } catch (e: unknown) { alert((e as Error).message); } }}
                        className="p-2 rounded-lg bg-[#12121a] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all"
                        title="Descargar Excel de este día">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Barber view ──────────────────────────────────────────────────────────────
type BarberScreen = 'cola' | 'insumos';

function BarberView({ nombre, email, onLogout }: { nombre: string; email: string; onLogout: () => void }) {
  const [todosTurnos, setTodosTurnos] = useState<ApiTurno[]>([]);
  const [transacciones, setTransacciones] = useState<ApiTransaccion[]>([]);
  const [myBarbero, setMyBarbero] = useState<ApiBarbero | null>(null);
  const [insumos, setInsumos] = useState<ApiInsumo[]>([]);
  const [turnoActivo, setTurnoActivo] = useState<ApiTurno | null>(null);
  const [split, setSplit] = useState({ efectivo: '', yape: '', plin: '' });
  const [cobrandoId, setCobrandoId] = useState<number | null>(null);
  const [agotados, setAgotados] = useState<Set<number>>(new Set());
  const [showAgotados, setShowAgotados] = useState(false);
  const [cubrirTurno, setCubrirTurno] = useState<ApiTurno | null>(null);
  const [barberScreen, setBarberScreen] = useState<BarberScreen>('cola');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      await api.post('/api/caja/cobrar-split', undefined, {
        idTurno: turnoActivo.id,
        efectivo: parseFloat(split.efectivo) || 0,
        yape:     parseFloat(split.yape)     || 0,
        plin:     parseFloat(split.plin)     || 0,
      });
      for (const id of agotados) {
        await api.patch<ApiInsumo>(`/api/insumos/${id}/agotar`);
      }
      setTurnoActivo(null);
      setSplit({ efectivo: '', yape: '', plin: '' });
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

  const navItems: { id: BarberScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'cola', label: 'Cola de Atención', icon: <Clipboard className="w-5 h-5" /> },
    { id: 'insumos', label: 'Insumos', icon: <Package className="w-5 h-5" /> },
  ];

  const currentDate = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  const SidebarNav = ({ onSelect }: { onSelect?: () => void }) => (
    <nav>
      <p className="text-[#9a9ab0] text-xs font-semibold tracking-widest mb-2 px-2">BARBERO</p>
      {navItems.map(item => (
        <button key={item.id} onClick={() => { setBarberScreen(item.id); onSelect?.(); }}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all text-left ${
            barberScreen === item.id ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'text-[#9a9ab0] hover:bg-[#12121a] hover:text-white'
          }`}>
          {item.icon}
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#9a9ab0]/10">
        <button onClick={() => setSidebarOpen(true)}
          className="md:hidden w-10 h-10 rounded-lg bg-[#12121a] flex items-center justify-center text-[#9a9ab0] hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c9a84c] hidden md:flex items-center justify-center text-[#0a0a0f] font-bold text-lg">
            {nombre.charAt(0)}
          </div>
          <div>
            <h1 className="text-white font-bold">Hola, {nombre}</h1>
            <p className="text-[#9a9ab0] text-xs capitalize">{currentDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f0f17] p-4 flex flex-col z-50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#0a0a0f] font-bold text-sm">
                    {nombre.charAt(0)}
                  </div>
                  <span className="text-white font-bold text-sm truncate max-w-[120px]">{nombre}</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-[#9a9ab0] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarNav onSelect={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-[#0f0f17] border-r border-[#9a9ab0]/10 p-4 flex-shrink-0">
          <SidebarNav />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Cola de Atención */}
          {barberScreen === 'cola' && (
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
              {!myBarbero && (
                <div className="glass-card p-6 mb-6 border border-[#e74c3c]">
                  <p className="text-[#e74c3c] text-center">No se encontró tu perfil de barbero. Contacta al administrador.</p>
                </div>
              )}

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
                                <span className="px-2 py-1 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-xs border border-[#c9a84c]">{turno.servicio.nombre}</span>
                                <span className="px-2 py-1 rounded-full bg-[#9a9ab0]/20 text-[#9a9ab0] text-xs">S/. {Number(turno.servicio.precio).toFixed(2)}</span>
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
                              <button onClick={() => { setTurnoActivo(turno); setSplit({ efectivo: '', yape: '', plin: '' }); }}
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
                  {transacciones.length > 0
                    ? `${transacciones.length} servicio${transacciones.length > 1 ? 's' : ''} completado${transacciones.length > 1 ? 's' : ''}`
                    : 'Buen trabajo hoy'}
                </p>
              </div>
            </div>
          )}

          {/* Insumos (read-only) */}
          {barberScreen === 'insumos' && (
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Insumos</h2>
              {insumos.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Package className="w-16 h-16 text-[#9a9ab0] mx-auto mb-4" />
                  <p className="text-[#9a9ab0]">No hay insumos registrados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insumos.map(ins => {
                    const pct = ins.stockMinimo > 0 ? ins.stock / ins.stockMinimo : 1;
                    const color = ins.stock === 0 ? '#e74c3c' : pct <= 1 ? '#f39c12' : '#00c896';
                    return (
                      <div key={ins.id} className="glass-card p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-bold">{ins.nombre}</h3>
                            <p className="text-[#9a9ab0] text-xs mt-0.5">{fmtUnidad(ins.unidad, ins.stock)}</p>
                          </div>
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ml-2`} style={{ backgroundColor: color }} />
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold" style={{ color }}>{ins.stock}</p>
                            <p className="text-[#9a9ab0] text-xs">{fmtUnidad(ins.unidad, ins.stock)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#9a9ab0] text-xs">Mínimo</p>
                            <p className="text-white text-sm font-medium">{ins.stockMinimo} {fmtUnidad(ins.unidad, ins.stockMinimo)}</p>
                          </div>
                        </div>
                        {ins.stock === 0 && (
                          <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#e74c3c]/10 border border-[#e74c3c]/30 text-center">
                            <p className="text-[#e74c3c] text-xs font-medium">Agotado</p>
                          </div>
                        )}
                        {ins.stock > 0 && pct <= 1 && (
                          <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#f39c12]/10 border border-[#f39c12]/30 text-center">
                            <p className="text-[#f39c12] text-xs font-medium">Stock bajo</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {turnoActivo && (() => {
        const precio = Number(turnoActivo.servicio.precio);
        const e = parseFloat(split.efectivo) || 0;
        const y = parseFloat(split.yape)     || 0;
        const p = parseFloat(split.plin)     || 0;
        const asignado = e + y + p;
        const restante = precio - asignado;
        const exacto = Math.abs(restante) < 0.001;

        return (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#c9a84c]">Registrar Cobro</h2>
              <button onClick={() => { setTurnoActivo(null); setSplit({ efectivo: '', yape: '', plin: '' }); setAgotados(new Set()); setShowAgotados(false); }}
                className="text-[#9a9ab0] hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="glass-card p-3 mb-5 bg-[#0a0a0f]/50">
              <p className="text-white font-bold">{turnoActivo.nombreCliente}</p>
              <p className="text-[#c9a84c] text-sm">{turnoActivo.servicio.nombre}</p>
              <p className="text-[#c9a84c] text-2xl font-bold mt-1">S/. {precio.toFixed(2)}</p>
            </div>

            <div className="space-y-3 mb-4">
              <p className="text-[#9a9ab0] text-sm">Distribución del pago:</p>
              {([
                { key: 'efectivo', label: 'Efectivo', color: 'text-[#00c896]', border: 'focus:border-[#00c896]' },
                { key: 'yape',     label: 'Yape',     color: 'text-purple-400', border: 'focus:border-purple-400' },
                { key: 'plin',     label: 'Plin',     color: 'text-blue-400',   border: 'focus:border-blue-400' },
              ] as const).map(({ key, label, color, border }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className={`w-20 text-sm font-medium ${color}`}>{label}</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9ab0] text-sm">S/.</span>
                    <input
                      type="number" min="0" step="0.10"
                      placeholder="0.00"
                      value={split[key]}
                      onChange={ev => setSplit(prev => ({ ...prev, [key]: ev.target.value }))}
                      className={`w-full bg-[#12121a] border border-[#9a9ab0]/30 ${border} rounded-lg pl-9 pr-3 py-2.5 text-white text-sm outline-none transition-colors`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Indicador de totales */}
            <div className={`flex justify-between items-center px-3 py-2 rounded-lg mb-4 text-sm ${exacto ? 'bg-[#00c896]/10 border border-[#00c896]/30' : 'bg-[#12121a] border border-[#9a9ab0]/20'}`}>
              <span className="text-[#9a9ab0]">Asignado</span>
              <span className={exacto ? 'text-[#00c896] font-bold' : asignado > precio ? 'text-[#e74c3c] font-bold' : 'text-white font-bold'}>
                S/. {asignado.toFixed(2)} / {precio.toFixed(2)}
              </span>
              {!exacto && restante > 0 && <span className="text-[#9a9ab0] text-xs">Faltan S/. {restante.toFixed(2)}</span>}
              {!exacto && restante < 0 && <span className="text-[#e74c3c] text-xs">Excede S/. {Math.abs(restante).toFixed(2)}</span>}
            </div>

            <div className="border border-[#9a9ab0]/30 rounded-lg overflow-hidden mb-4">
              <button onClick={() => setShowAgotados(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#12121a] text-[#9a9ab0] text-sm hover:text-white transition-colors">
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
                              sel ? 'bg-red-700 border-red-500 text-white' : 'bg-transparent border-[#9a9ab0]/40 text-[#9a9ab0] hover:border-red-500 hover:text-red-400'
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

            <button onClick={confirmarPago} disabled={!exacto || cobrandoId === turnoActivo.id}
              className="w-full btn-gold disabled:opacity-50">
              {cobrandoId === turnoActivo.id ? 'Procesando...' : 'Confirmar y Finalizar'}
            </button>
          </div>
        </div>
        );
      })()}

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
