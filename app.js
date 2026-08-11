const STORE_KEY = 'allaboard_v3';

// Initialize Store
function getStore() {
    try {
        const store = localStorage.getItem(STORE_KEY);
        if (store) {
            const parsed = JSON.parse(store);
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        }
    } catch(e) {}
    
    return {
        role: null,
        name: null,
        contractSigned: false,
        skillsRetried: false,
        documents: [
            { name: 'Identificacion_Oficial.pdf', status: 'Cargado con éxito', color: 'green' },
            { name: 'Comprobante_de_Domicilio.pdf', status: 'Cargado con éxito', color: 'green' }
        ]
    };
}

function saveStore(data) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch(e) {
        console.error("Local storage error:", e);
    }
}

// --- LOGIN LOGIC ---
// Clear stale role data if on login page so fresh login always works
if (document.getElementById('loginForm')) {
    const staleStore = getStore();
    staleStore.role = null;
    staleStore.name = null;
    saveStore(staleStore);
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Trim whitespace and convert to lowercase to avoid typo issues
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value.trim();
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '';

        // Accepted credentials
        const USERS = {
            'empleado@allaboard.com': { pass: 'pass123', role: 'EMPLEADO', name: 'Jesús' },
            'admin@allaboard.com':    { pass: 'pass123', role: 'ADMINISTRADOR', name: 'Ana Admin' },
            'jefe@allaboard.com':     { pass: 'pass123', role: 'JEFE', name: 'Carlos Jefe' },
        };

        const user = USERS[email];

        if (!user) {
            errorDiv.textContent = '❌ Correo no encontrado. Usa: empleado@allaboard.com / admin@allaboard.com / jefe@allaboard.com';
            return;
        }

        if (password !== user.pass) {
            errorDiv.textContent = '❌ Contraseña incorrecta. Usa: pass123';
            return;
        }

        // Save session and redirect
        const store = getStore();
        store.role = user.role;
        store.name = user.name;
        saveStore(store);
        window.location.href = 'app.html';
    });

    // Password Recovery Logic
    const forgotLink = document.getElementById('forgotLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const recoveryForm = document.getElementById('recoveryForm');
    const formTitle = document.getElementById('formTitle');

    if (forgotLink && backToLoginLink && recoveryForm) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            recoveryForm.style.display = 'block';
            formTitle.textContent = 'Recuperar contraseña';
        });

        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            recoveryForm.style.display = 'none';
            loginForm.style.display = 'block';
            formTitle.textContent = 'Inicia sesión en tu cuenta';
        });

        recoveryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const recEmail = document.getElementById('recoveryEmail').value.trim();
            const msgDiv = document.getElementById('recoveryMessage');
            if (recEmail) {
                msgDiv.style.color = 'var(--success)';
                msgDiv.textContent = '✓ Se ha enviado un enlace de recuperación a tu correo.';
                setTimeout(() => {
                    recoveryForm.reset();
                    msgDiv.textContent = '';
                    backToLoginLink.click();
                }, 3000);
            }
        });
    }
}

// --- APP LOGIC ---
const mainContent = document.getElementById('mainContent');
const sidebar = document.getElementById('sidebar');

if (mainContent && sidebar) {
    const store = getStore();
    if (!store.role) {
        window.location.href = 'index.html';
    }

    // Set Up Navbar
    document.getElementById('userNameDisplay').textContent = store.name;
    document.getElementById('userRoleDisplay').textContent = store.role;
    
    if (store.role === 'ADMINISTRADOR' || store.role === 'JEFE') {
        document.getElementById('roleBadgeContainer').innerHTML = `<span class="role-badge">${store.role}</span>`;
    }

    // Settings Dropdown
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsDropdown = document.getElementById('settingsDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    settingsBtn.addEventListener('click', () => {
        settingsDropdown.classList.toggle('hidden');
        notifPanel.classList.add('hidden');
    });

    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            settingsDropdown.classList.add('hidden');
            navigateTo('perfil_usuario');
        });
    }

    logoutBtn.addEventListener('click', () => {
        const resetStore = getStore();
        resetStore.role = null;
        resetStore.name = null;
        saveStore(resetStore);
        window.location.href = 'index.html';
    });

    // Notification Bell Panel
    const bellBtn = document.querySelector('.bell-btn');
    const notifPanel = document.createElement('div');
    notifPanel.id = 'notifPanel';
    notifPanel.className = 'dropdown-menu hidden';
    notifPanel.style.cssText = 'right:160px; min-width:320px; max-height:400px; overflow-y:auto;';
    notifPanel.innerHTML = `
        <div class="dropdown-header" style="display:flex;justify-content:space-between;align-items:center;">
            <strong>Notificaciones</strong>
            <span style="font-size:0.75rem;color:var(--text-muted);cursor:pointer" onclick="this.closest('#notifPanel').querySelector('.notif-list').querySelectorAll('.notif-unread').forEach(n=>{n.classList.remove('notif-unread')}); document.querySelector('.badge-dot').style.display='none'">Marcar todo leído</span>
        </div>
        <div class="notif-list">
            <div class="notif-item notif-unread" onclick="this.classList.remove('notif-unread')">
                <i data-lucide="file-check" style="color:var(--success);min-width:20px"></i>
                <div><strong>Trámite aprobado</strong><br><small class="text-muted">Tu contacto de emergencia fue validado · Hace 5 min</small></div>
            </div>
            <div class="notif-item notif-unread" onclick="this.classList.remove('notif-unread')">
                <i data-lucide="book-open" style="color:var(--primary-blue);min-width:20px"></i>
                <div><strong>Nueva capacitación añadida</strong><br><small class="text-muted">Introducción a ISO 9001 disponible · Hace 1 hr</small></div>
            </div>
            <div class="notif-item notif-unread" onclick="this.classList.remove('notif-unread')">
                <i data-lucide="alert-triangle" style="color:var(--warning);min-width:20px"></i>
                <div><strong>Curso próximo a vencer</strong><br><small class="text-muted">Políticas y Éticas expira en 3 días · Hace 2 hrs</small></div>
            </div>
            <div class="notif-item" onclick="this.classList.remove('notif-unread')">
                <i data-lucide="pen-tool" style="color:var(--purple);min-width:20px"></i>
                <div><strong>Firma requerida</strong><br><small class="text-muted">Contrato de Servicios Generales pendiente · Ayer</small></div>
            </div>
            <div class="notif-item" onclick="this.classList.remove('notif-unread')">
                <i data-lucide="user-check" style="color:var(--text-muted);min-width:20px"></i>
                <div><strong>Perfil actualizado</strong><br><small class="text-muted">Tus datos fueron guardados · Hace 2 días</small></div>
            </div>
        </div>
    `;
    document.body.appendChild(notifPanel);

    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifPanel.classList.toggle('hidden');
        settingsDropdown.classList.add('hidden');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!settingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
            settingsDropdown.classList.add('hidden');
        }
        if (!bellBtn.contains(e.target) && !notifPanel.contains(e.target)) {
            notifPanel.classList.add('hidden');
        }
    });

    // Navigation state
    let currentNav = 'inicio';
    let currentSidebarView = '';

    // Helper: hide/show Inicio navbar link based on role
    function syncNavbarForRole() {
        const inicioLink = document.querySelector('.main-nav a[data-nav="inicio"]');
        if (inicioLink) {
            inicioLink.style.display = store.role === 'JEFE' ? 'none' : '';
        }
    }

    // Navbar Nav Clicks
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentNav = link.getAttribute('data-nav');
            renderSidebar();
        });
    });

    // Render Sidebar based on Role and Nav
    function renderSidebar() {
        sidebar.innerHTML = '';
        const list = document.createElement('ul');
        list.className = 'sidebar-menu';

        const addSidebarItem = (title, icon, viewId) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.innerHTML = `<i data-lucide="${icon}"></i> ${title}`;
            if (currentSidebarView === viewId) a.classList.add('active');
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentSidebarView = viewId;
                renderSidebar(); // refresh active state
                renderMainContent();
            });
            li.appendChild(a);
            list.appendChild(li);
        };

        if (store.role === 'EMPLEADO') {
            sidebar.innerHTML = '<div class="sidebar-title">Secciones</div>';
            if (currentNav === 'inicio') {
                addSidebarItem('Resumen', 'layout-dashboard', 'emp_resumen');
                addSidebarItem('Progreso', 'trending-up', 'emp_progreso');
                addSidebarItem('Pendientes', 'list-todo', 'emp_pendientes');
                // Auto-navigate to Resumen immediately when Inicio is clicked
                if (!currentSidebarView || !['emp_resumen','emp_progreso','emp_pendientes'].includes(currentSidebarView)) {
                    currentSidebarView = 'emp_resumen';
                }
            } else if (currentNav === 'tramites') {
                addSidebarItem('Resumen', 'file-text', 'emp_tramites_resumen');
                addSidebarItem('Firmas', 'pen-tool', 'emp_tramites_firmas');
                addSidebarItem('Documentos', 'folder', 'emp_tramites_documentos');
                if (!currentSidebarView.startsWith('emp_tramites')) currentSidebarView = 'emp_tramites_resumen';
            } else if (currentNav === 'capacitaciones') {
                addSidebarItem('Catálogo', 'grid', 'emp_cap_catalogo');
                addSidebarItem('Tus Cursos', 'book-open', 'emp_cursos');
                if (!currentSidebarView.startsWith('emp_cap') && currentSidebarView !== 'emp_cursos') currentSidebarView = 'emp_cap_catalogo';
            }
        } 
        else if (store.role === 'ADMINISTRADOR') {
            sidebar.innerHTML = '<div class="sidebar-title">Administración</div>';
            // Map top navbar clicks to admin sidebar views
            if (currentNav === 'tramites') {
                currentSidebarView = 'adm_empleados';
                currentNav = 'inicio';
                document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
                const i = document.querySelector('[data-nav="inicio"]');
                if (i) i.classList.add('active');
            } else if (currentNav === 'capacitaciones') {
                currentSidebarView = 'adm_catalogo';
                currentNav = 'inicio';
                document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
                const i = document.querySelector('[data-nav="inicio"]');
                if (i) i.classList.add('active');
            }
            addSidebarItem('Inicio', 'home', 'adm_inicio');
            addSidebarItem('Mis áreas', 'briefcase', 'adm_areas');
            addSidebarItem('Empleados', 'users', 'adm_empleados');
            addSidebarItem('Catálogo de Capacitaciones', 'book-open', 'adm_catalogo');
            if (!currentSidebarView || currentSidebarView === '') currentSidebarView = 'adm_inicio';
        }
        else if (store.role === 'JEFE') {
            sidebar.innerHTML = '<div class="sidebar-title">Gestión</div>';
            // For jefe, top nav maps to sidebar sections
            if (currentNav === 'tramites') {
                currentSidebarView = 'jefe_perfiles';
                currentNav = 'inicio';
                document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
                document.querySelector('[data-nav="inicio"]').classList.add('active');
            } else if (currentNav === 'capacitaciones') {
                currentSidebarView = 'jefe_reportes';
                currentNav = 'inicio';
                document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
                document.querySelector('[data-nav="inicio"]').classList.add('active');
            }
            addSidebarItem('Inicio', 'home', 'jefe_inicio');
            addSidebarItem('Perfiles', 'users', 'jefe_perfiles');
            addSidebarItem('Permisos', 'key', 'jefe_permisos');
            addSidebarItem('Reportes', 'file-bar-chart', 'jefe_reportes');
            if (!currentSidebarView) currentSidebarView = 'jefe_inicio';
        }

        sidebar.appendChild(list);
        lucide.createIcons();
        syncNavbarForRole();
        renderMainContent();
    }

    // ── GLOBAL NAVIGATION HELPER ──────────────────────────────
    // Makes renderSidebar and renderMainContent callable from
    // inline onclick handlers inside dynamically generated HTML.
    window.navigateTo = (viewId) => {
        currentSidebarView = viewId;
        // Also sync the top navbar active state for employee nav changes
        if (viewId.startsWith('emp_tramites')) {
            currentNav = 'tramites';
            document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
            const t = document.querySelector('[data-nav="tramites"]');
            if (t) t.classList.add('active');
        } else if (viewId.startsWith('emp_cap') || viewId === 'emp_cursos') {
            currentNav = 'capacitaciones';
            document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
            const c = document.querySelector('[data-nav="capacitaciones"]');
            if (c) c.classList.add('active');
        } else if (['emp_resumen','emp_progreso','emp_pendientes'].includes(viewId)) {
            currentNav = 'inicio';
            document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
            const i = document.querySelector('[data-nav="inicio"]');
            if (i) i.classList.add('active');
        }
        renderSidebar();
    };

    // Expose openModal/closeModal globally too (needed by inline handlers)
    window.openModal  = (html) => {
        document.getElementById('modalContent').innerHTML = html;
        document.getElementById('modalContainer').classList.remove('hidden');
        lucide.createIcons();
    };
    window.closeModal = () => document.getElementById('modalContainer').classList.add('hidden');
    document.getElementById('modalContainer').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalContainer')) closeModal();
    });

    function renderMainContent() {
        mainContent.innerHTML = '';
        
        // PERFIL DE USUARIO VIEW
        if (currentSidebarView === 'perfil_usuario') {
            const prof = store.profileData || {
                telefono: '',
                direccion: '',
                puesto: 'Empleado General',
                fechaNacimiento: '',
                departamento: 'Operaciones'
            };
            
            mainContent.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title text-blue">Mi Perfil</h1>
                    <p class="page-subtitle">Actualiza tu información personal y de contacto.</p>
                </div>
                <div class="card" style="max-width: 600px;">
                    <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;">
                        <div style="width:80px;height:80px;background:var(--color-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--color-primary);">
                            <i data-lucide="user" style="width:40px;height:40px;"></i>
                        </div>
                        <div>
                            <h2 style="font-size:1.2rem;margin-bottom:4px;">${store.name || 'Usuario'}</h2>
                            <span class="badge badge-blue">${store.role}</span>
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Teléfono</label>
                            <input id="prof_tel" type="text" class="form-input" style="margin-top:6px;" value="${prof.telefono}" placeholder="Ej. 555-1234">
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Fecha de Nacimiento</label>
                            <input id="prof_fecha" type="date" class="form-input" style="margin-top:6px;" value="${prof.fechaNacimiento}">
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label style="font-weight:500;font-size:0.875rem;">Dirección</label>
                            <input id="prof_dir" type="text" class="form-input" style="margin-top:6px;" value="${prof.direccion}" placeholder="Tu dirección completa">
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Puesto</label>
                            <input id="prof_puesto" type="text" class="form-input" style="margin-top:6px;" value="${prof.puesto}" placeholder="Ej. Desarrollador">
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Departamento</label>
                            <input id="prof_depto" type="text" class="form-input" style="margin-top:6px;" value="${prof.departamento}">
                        </div>
                    </div>
                    
                    <div style="margin-top:24px;display:flex;justify-content:flex-end;">
                        <button id="btnSaveProfile" class="btn btn-primary">Guardar Cambios</button>
                    </div>
                    <div id="profToast" style="margin-top:10px;text-align:right;font-size:0.85rem;color:var(--success);display:none;">✓ Cambios guardados correctamente</div>
                </div>
            `;
            
            setTimeout(() => {
                const btnSave = document.getElementById('btnSaveProfile');
                if (btnSave) {
                    btnSave.addEventListener('click', () => {
                        const updatedProf = {
                            telefono: document.getElementById('prof_tel').value,
                            direccion: document.getElementById('prof_dir').value,
                            puesto: document.getElementById('prof_puesto').value,
                            fechaNacimiento: document.getElementById('prof_fecha').value,
                            departamento: document.getElementById('prof_depto').value
                        };
                        const s = getStore();
                        s.profileData = updatedProf;
                        saveStore(s);
                        store.profileData = updatedProf; // sync active store
                        const toast = document.getElementById('profToast');
                        toast.style.display = 'block';
                        setTimeout(() => toast.style.display = 'none', 3000);
                    });
                }
            }, 0);
            
            lucide.createIcons();
            return;
        }

        // EMPLEADO VIEWS
        if (currentSidebarView === 'emp_resumen') {
            mainContent.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title text-blue" style="font-size:2.2rem;">¡A bordo, ${store.name}!</h1>
                    <p class="page-subtitle">Aquí tienes un resumen de tu proceso de integración.</p>
                </div>
                <div class="grid-2col">
                    <div>
                        <div class="card">
                            <h3 class="card-title" style="margin-bottom:20px;">Progreso de onboarding</h3>
                            <div style="display:flex; align-items:center; gap:24px;">
                                <div style="width:110px; height:110px; position:relative; flex-shrink:0;">
                                    <svg viewBox="0 0 36 36" style="width:100%; height:100%;">
                                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#E2E2EE" stroke-width="4"/>
                                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1800DF" stroke-width="4"
                                        stroke-dasharray="50 100" stroke-dashoffset="0" transform="rotate(-90 18 18)"/>
                                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#4B8DF1" stroke-width="4"
                                        stroke-dasharray="25 100" stroke-dashoffset="-50" transform="rotate(-90 18 18)"/>
                                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#D97706" stroke-width="4"
                                        stroke-dasharray="25 100" stroke-dashoffset="-75" transform="rotate(-90 18 18)"/>
                                    </svg>
                                    <div style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:1.1rem; color:var(--color-text);">50%</div>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:10px; font-size:0.875rem;">
                                    <div style="display:flex; align-items:center; gap:8px;"><span style="width:10px;height:10px;background:#1800DF;border-radius:50%;display:inline-block;"></span> <span class="badge badge-blue">50%</span> Completado</div>
                                    <div style="display:flex; align-items:center; gap:8px;"><span style="width:10px;height:10px;background:#4B8DF1;border-radius:50%;display:inline-block;"></span> <span class="badge badge-blue" style="background:#E8F0FF;color:#4B8DF1;">25%</span> En curso</div>
                                    <div style="display:flex; align-items:center; gap:8px;"><span style="width:10px;height:10px;background:#D97706;border-radius:50%;display:inline-block;"></span> <span class="badge badge-yellow">25%</span> Pendiente</div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <h3 class="card-title" style="margin-bottom:16px;">Actividad reciente</h3>
                            <ul class="bullet-list">
                                <li>"Introducción a la empresa" completado</li>
                                <li>Se aprobó "Acuerdo de Confidencialidad"</li>
                                <li>Capacitación "Introducción a ISO 9001" ha sido añadida</li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <div class="card">
                            <h3 class="card-title" style="margin-bottom:16px;">Continúa tu onboarding</h3>
                            <ul class="bullet-list">
                                <li>Prevención de riesgos laborales<br><small class="text-muted">Tiempo estimado: 20 minutos</small></li>
                                <li>Aceptación del reglamento interno<br><small class="text-muted">Tiempo estimado: 10 minutos</small></li>
                                <li>Introducción a ISO 9001<br><small class="text-muted">Tiempo estimado: 50 minutos</small></li>
                            </ul>
                        </div>
                        <div class="card">
                            <h3 class="card-title" style="margin-bottom:16px;">Recursos rápidos</h3>
                            <div style="display:flex; flex-direction:column; gap:12px;">
                                <a href="#" onclick="alert('Abriendo Manual del empleado...'); return false;" style="color:var(--color-secondary2); display:flex; align-items:center; gap:8px;"><i data-lucide="book"></i> Manual del empleado</a>
                                <a href="#" onclick="alert('Abriendo Organigrama corporativo...'); return false;" style="color:var(--color-secondary2); display:flex; align-items:center; gap:8px;"><i data-lucide="users"></i> Organigrama</a>
                                <a href="#" onclick="alert('Abriendo Directorio de contactos...'); return false;" style="color:var(--color-secondary2); display:flex; align-items:center; gap:8px;"><i data-lucide="contact"></i> Directorio</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        else if (currentSidebarView === 'emp_progreso') {
            mainContent.innerHTML = `
                <div class="page-header"><h1 class="page-title">Tu Progreso</h1></div>
                <div class="grid-2col-even">
                    <div>
                        <div class="card">
                            <h3 class="card-title">Progreso de onboarding</h3>
                             <div class="chart-container" style="width:150px; height:150px; position:relative; margin-bottom:24px;">
                                <svg viewBox="0 0 36 36" style="width:100%; height:100%;">
                                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" stroke-width="4"/>
                                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#1a56db" stroke-width="4" stroke-dasharray="50, 100" />
                                </svg>
                                <div style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.5rem;">50%</div>
                            </div>
                            <div style="text-align:center; display:flex; flex-direction:column; gap:8px;">
                                <div><strong>Tiempo invertido:</strong> 4 hrs 35 min</div>
                                <div><strong>Capacitaciones completadas:</strong> 7</div>
                                <div><strong>Trámites completados:</strong> 3</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="card">
                            <h3 class="card-title">Progreso por sección</h3>
                            <div class="progress-container">
                                <div class="progress-label"><span>Capacitaciones</span> <span>50%</span></div>
                                <div class="progress-bar"><div class="progress-fill" style="width: 50%;"></div></div>
                            </div>
                            <div class="progress-container">
                                <div class="progress-label"><span>Trámites</span> <span>80%</span></div>
                                <div class="progress-bar"><div class="progress-fill" style="width: 80%;"></div></div>
                            </div>
                            <div class="progress-container">
                                <div class="progress-label"><span>Documentación</span> <span>30%</span></div>
                                <div class="progress-bar"><div class="progress-fill" style="width: 30%;"></div></div>
                            </div>
                        </div>
                        <div class="card">
                            <h3 class="card-title">Objetivos</h3>
                            <ul class="bullet-list" style="list-style:none;">
                                <li style="display:flex; align-items:center; gap:8px;"><i data-lucide="check-circle" style="color:var(--success)"></i> Perfil completado</li>
                                <li style="display:flex; align-items:center; gap:8px;"><i data-lucide="x-circle" style="color:var(--danger)"></i> Certificación pendiente</li>
                                <li style="display:flex; align-items:center; gap:8px;"><i data-lucide="check-circle" style="color:var(--success)"></i> Accesos configurados</li>
                                <li style="display:flex; align-items:center; gap:8px;"><i data-lucide="x-circle" style="color:var(--danger)"></i> Documentación faltante</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
        else if (currentSidebarView === 'emp_pendientes') {
            mainContent.innerHTML = `
                <div class="page-header"><h1 class="page-title">Pendientes</h1></div>
                <div class="info-banner">
                    <i data-lucide="zap" style="color:var(--status-warning)"></i>
                    <div>
                        <strong>Tu siguiente paso recomendado: Activar correo corporativo</strong><br>
                        Es necesario completarlo para recibir las certificaciones de cada capacitación
                    </div>
                </div>
                
                <div class="task-grid">
                    <div class="task-card">
                        <div class="task-header"><i data-lucide="mail"></i> Trámite</div>
                        <div class="task-title">Configuración de correo</div>
                        <div class="task-meta"><span>Hoy</span> <span>5 minutos</span></div>
                    </div>
                    <div class="task-card card-clickable" onclick="goToCurso()" title="Ver curso">
                        <div class="task-header"><i data-lucide="shield"></i> Capacitación</div>
                        <div class="task-title">Prevención de riesgos laborales</div>
                        <div class="task-meta"><span>Mañana</span> <span>20 minutos</span></div>
                        <div style="margin-top:10px;"><span style="font-size:0.78rem; color:var(--color-secondary2); font-weight:500;">Ver curso →</span></div>
                    </div>
                    <div class="task-card card-clickable" onclick="goToCurso()" title="Ver curso">
                        <div class="task-header"><i data-lucide="award"></i> Capacitación</div>
                        <div class="task-title">Introducción a ISO 9001</div>
                        <div class="task-meta"><span>Mañana</span> <span>20 minutos</span></div>
                        <div style="margin-top:10px;"><span style="font-size:0.78rem; color:var(--color-secondary2); font-weight:500;">Ver curso →</span></div>
                    </div>
                    <div class="task-card">
                        <div class="task-header"><i data-lucide="file-text"></i> Documentación</div>
                        <div class="task-title">Aceptación del reglamento interno</div>
                        <div class="task-meta"><span>Viernes</span> <span>10 minutos</span></div>
                    </div>
                    <div class="task-card">
                        <div class="task-header"><i data-lucide="file-text"></i> Documentación</div>
                        <div class="task-title">Código de conducta</div>
                        <div class="task-meta"><span>Viernes</span> <span>5 minutos</span></div>
                    </div>
                    <div class="task-card">
                        <div class="task-header"><i data-lucide="user"></i> Documentación</div>
                        <div class="task-title">Completar perfil</div>
                        <div class="task-meta"><span>Indefinido</span> <span>5 minutos</span></div>
                    </div>
                </div>
            `;
            window.goToCurso = () => {
                currentNav = 'capacitaciones';
                document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
                document.querySelector('[data-nav="capacitaciones"]').classList.add('active');
                currentSidebarView = 'emp_cursos';
                renderSidebar();
                renderMainContent();
            };
        }
        else if (currentSidebarView === 'emp_cursos') {
            mainContent.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title text-blue">Tus Cursos</h1>
                    <p class="page-subtitle">Selecciona un curso para ver el temario y comenzar a aprender.</p>
                </div>
                <div class="grid-2col" style="gap:24px;">
                    <!-- ISO 9001 Card -->
                    <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; cursor:pointer; border:1px solid #bfdbfe; transition:transform 0.2s;" onclick="navigateTo('emp_curso_iso9001')" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="background:linear-gradient(135deg, #1e3a8a, #3b82f6); padding:24px; color:white;">
                            <i data-lucide="shield-check" style="width:32px; height:32px; margin-bottom:12px;"></i>
                            <h3 style="font-size:1.1rem; margin-bottom:4px;">Introducción a ISO 9001</h3>
                            <p style="font-size:0.85rem; opacity:0.9;">Sistema de Gestión de Calidad</p>
                        </div>
                        <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                            <p class="text-muted" style="font-size:0.9rem; margin-bottom:16px; flex:1;">Comprende los fundamentos de la norma ISO 9001 y su aplicación en la empresa.</p>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="badge badge-blue">4 Módulos</span>
                                <span style="font-weight:600; color:var(--primary-blue); font-size:0.9rem;">Ver temario &rarr;</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Prevención Card -->
                    <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; cursor:pointer; border:1px solid #99f6e4; transition:transform 0.2s;" onclick="navigateTo('emp_curso_prevencion')" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="background:linear-gradient(135deg, #0f766e, #14b8a6); padding:24px; color:white;">
                            <i data-lucide="hard-hat" style="width:32px; height:32px; margin-bottom:12px;"></i>
                            <h3 style="font-size:1.1rem; margin-bottom:4px;">Prevención de Riesgos</h3>
                            <p style="font-size:0.85rem; opacity:0.9;">Seguridad Laboral Básica</p>
                        </div>
                        <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                            <p class="text-muted" style="font-size:0.9rem; margin-bottom:16px; flex:1;">Conoce los protocolos de seguridad y prevención de accidentes en tu área de trabajo.</p>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="badge" style="background:#ccfbf1; color:#0f766e;">4 Módulos</span>
                                <span style="font-weight:600; color:#0f766e; font-size:0.9rem;">Ver temario &rarr;</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        else if (currentSidebarView === 'emp_curso_iso9001') {
            mainContent.innerHTML = `
                <div class="page-header" style="display:flex; align-items:center; gap:16px;">
                    <button class="btn btn-outline" style="padding:8px;" onclick="navigateTo('emp_cursos')"><i data-lucide="arrow-left"></i> Volver</button>
                    <div>
                        <h1 class="page-title text-blue">Introducción a ISO 9001</h1>
                        <p class="page-subtitle">Sistema de Gestión de Calidad</p>
                    </div>
                </div>
                <div class="card" style="margin-bottom:24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 class="card-title">Descripción del curso</h3>
                        <button class="btn btn-primary" onclick="navigateTo('emp_visor_iso9001')">Comenzar Curso</button>
                    </div>
                    <p class="text-muted">Este curso te proporcionará una comprensión sólida de los fundamentos de la norma ISO 9001, esencial para nuestro Sistema de Gestión de Calidad. Aprenderás sobre la importancia de la calidad, los principios de gestión, y cómo tu rol contribuye a la mejora continua en All Aboard.</p>
                </div>
                <div class="card">
                    <h3 class="card-title" style="margin-bottom:16px;">Temario del curso</h3>
                    <div class="module-list">
                        <div class="module-item open" onclick="this.classList.toggle('open')">
                            <div class="module-header">Módulo 1: Introducción a la Calidad y la ISO 9001 <i data-lucide="chevron-down"></i></div>
                            <div class="module-content">
                                <ul class="bullet-list">
                                    <li>Historia de la calidad</li>
                                    <li>¿Qué es la ISO 9001?</li>
                                    <li>Beneficios de la certificación</li>
                                </ul>
                            </div>
                        </div>
                        <div class="module-item" onclick="this.classList.toggle('open')">
                            <div class="module-header">Módulo 2: Principios de Gestión de la Calidad <i data-lucide="chevron-down"></i></div>
                            <div class="module-content">
                                <ul class="bullet-list">
                                    <li>Enfoque al cliente</li>
                                    <li>Liderazgo</li>
                                    <li>Compromiso de las personas</li>
                                    <li>Enfoque a procesos</li>
                                    <li>Mejora</li>
                                    <li>Toma de decisiones basada en evidencia</li>
                                    <li>Gestión de las relaciones</li>
                                </ul>
                            </div>
                        </div>
                        <div class="module-item" onclick="this.classList.toggle('open')">
                            <div class="module-header">Módulo 3: Documentación del Sistema de Gestión de la Calidad <i data-lucide="chevron-down"></i></div>
                            <div class="module-content">
                                <ul class="bullet-list">
                                    <li>Documentación de calidad</li>
                                    <li>Política y objetivos de calidad</li>
                                    <li>Procedimientos e instrucciones de trabajo</li>
                                    <li>Registros de calidad</li>
                                    <li>Control de documentos y registros</li>
                                </ul>
                            </div>
                        </div>
                        <div class="module-item" onclick="this.classList.toggle('open')">
                            <div class="module-header">Módulo 4: Auditorías Internas y Mejora Continua <i data-lucide="chevron-down"></i></div>
                            <div class="module-content">
                                <ul class="bullet-list">
                                    <li>Auditorías internas de calidad</li>
                                    <li>No conformidades y acciones correctivas</li>
                                    <li>Mejora continua del SGC</li>
                                    <li>Participación del personal en la mejora</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        else if (currentSidebarView === 'emp_visor_iso9001') {
            mainContent.innerHTML = `
                <div style="display:flex; height:calc(100vh - 70px); margin:-24px; font-family: 'Inter', sans-serif;">
                    <!-- Sidebar -->
                    <div style="width:280px; background:var(--color-bg); border-right:1px solid var(--border-color); overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:16px;">
                        <button class="btn btn-outline" style="width:100%;" onclick="navigateTo('emp_curso_iso9001')"><i data-lucide="arrow-left"></i> Salir del curso</button>
                        <h3 style="font-size:1.1rem; color:var(--primary-blue); font-weight:700;">Introducción a ISO 9001</h3>
                        
                        <div class="visor-nav" style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                            <button id="nav-iso-1" class="btn" style="text-align:left; justify-content:flex-start; font-weight:500;" onclick="loadContentISO(1)">Módulo 1: Introducción</button>
                            <button id="nav-iso-2" class="btn btn-outline" style="text-align:left; justify-content:flex-start; border:none; font-weight:500;" onclick="loadContentISO(2)">Módulo 2: Principios</button>
                            <button id="nav-iso-3" class="btn btn-outline" style="text-align:left; justify-content:flex-start; border:none; font-weight:500;" onclick="loadContentISO(3)">Módulo 3: Documentación</button>
                            <button id="nav-iso-4" class="btn btn-outline" style="text-align:left; justify-content:flex-start; border:none; font-weight:500;" onclick="loadContentISO(4)">Módulo 4: Auditorías</button>
                            <button id="nav-iso-5" class="btn btn-outline" style="text-align:left; justify-content:flex-start; border:none; font-weight:600; color:#1e3a8a; margin-top:16px;" onclick="loadContentISO(5)"><i data-lucide="award"></i> Examen Final</button>
                        </div>
                    </div>
                    
                    <!-- Content Area -->
                    <div style="flex:1; padding:40px 60px; overflow-y:auto; background:#fff;" id="visorContent">
                        <!-- Content injected via JS -->
                    </div>
                </div>
            `;

            const isoData = {
                1: `
                    <h2 style="font-size:1.8rem; color:var(--primary-blue); margin-bottom:20px;">Módulo 1: Introducción a la Calidad y la ISO 9001</h2>
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">¿Qué es la Calidad?</h3>
                    <p style="margin-bottom:16px; line-height:1.6; color:var(--color-text);">La calidad no es solo cumplir con especificaciones técnicas; es satisfacer y superar las expectativas del cliente. Implica hacer las cosas bien desde la primera vez, reducir el desperdicio y buscar siempre la manera de mejorar. En All Aboard, la calidad es el pilar que sostiene la confianza de nuestros clientes.</p>
                    
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">¿Qué es la ISO 9001?</h3>
                    <p style="margin-bottom:16px; line-height:1.6; color:var(--color-text);">Es una norma internacional que establece los requisitos para un Sistema de Gestión de Calidad (SGC). Un SGC es un conjunto de políticas, procesos y procedimientos que nos ayudan a asegurar que nuestros servicios cumplen consistentemente con los requisitos del cliente y las regulaciones aplicables.</p>
                    
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Beneficios de la ISO 9001</h3>
                    <ul class="bullet-list" style="margin-bottom:32px;">
                        <li>Mayor satisfacción del cliente al entregar productos/servicios confiables.</li>
                        <li>Procesos más eficientes y reducción de errores.</li>
                        <li>Mejora de la comunicación interna y el compromiso del personal.</li>
                        <li>Ventaja competitiva en el mercado (muchos clientes exigen proveedores certificados).</li>
                    </ul>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                        <h3 style="color:#0f172a; margin-bottom:16px;"><i data-lucide="help-circle" style="color:var(--primary-blue);"></i> Quiz: Módulo 1</h3>
                        <p style="font-weight:600; margin-bottom:12px;">1. ¿Qué significa la calidad en el contexto de ISO 9001?</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Cumplir con especificaciones técnicas solamente.</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">b) Reducir costos a cualquier precio.</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true)">c) Satisfacer y superar las expectativas del cliente.</button>
                        </div>
                    </div>
                `,
                2: `
                    <h2 style="font-size:1.8rem; color:var(--primary-blue); margin-bottom:20px;">Módulo 2: Principios de Gestión de la Calidad</h2>
                    <p style="margin-bottom:20px; line-height:1.6; color:var(--color-text);">La ISO 9001 se basa en siete principios fundamentales que guían a la organización hacia la excelencia:</p>
                    <ol style="margin-bottom:32px; padding-left:20px; line-height:1.6; color:var(--color-text);">
                        <li style="margin-bottom:12px;"><strong>Enfoque al cliente:</strong> Entender y satisfacer las necesidades de los clientes es el objetivo principal.</li>
                        <li style="margin-bottom:12px;"><strong>Liderazgo:</strong> Los líderes establecen el propósito y la dirección, creando un ambiente donde el personal se involucra en lograr los objetivos de calidad.</li>
                        <li style="margin-bottom:12px;"><strong>Compromiso de las personas:</strong> Personal competente, empoderado y comprometido en todos los niveles.</li>
                        <li style="margin-bottom:12px;"><strong>Enfoque a procesos:</strong> Entender que los resultados se alcanzan más eficientemente cuando las actividades se gestionan como procesos interrelacionados.</li>
                        <li style="margin-bottom:12px;"><strong>Mejora:</strong> Las organizaciones exitosas tienen un enfoque continuo en la mejora.</li>
                        <li style="margin-bottom:12px;"><strong>Toma de decisiones basada en evidencia:</strong> Las decisiones basadas en el análisis y evaluación de datos tienen mayor probabilidad de producir los resultados deseados.</li>
                        <li style="margin-bottom:12px;"><strong>Gestión de las relaciones:</strong> Para el éxito sostenido, se deben gestionar las relaciones con las partes interesadas, como los proveedores.</li>
                    </ol>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                        <h3 style="color:#0f172a; margin-bottom:16px;"><i data-lucide="help-circle" style="color:var(--primary-blue);"></i> Quiz: Módulo 2</h3>
                        <p style="font-weight:600; margin-bottom:12px;">1. ¿Qué principio de gestión enfatiza la importancia de comprender y satisfacer las necesidades actuales y futuras?</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Liderazgo</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true)">b) Enfoque al cliente</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">c) Mejora</button>
                        </div>
                    </div>
                `,
                3: `
                    <h2 style="font-size:1.8rem; color:var(--primary-blue); margin-bottom:20px;">Módulo 3: Documentación del SGC</h2>
                    <p style="margin-bottom:16px; line-height:1.6; color:var(--color-text);">La documentación es vital porque comunica la intención y asegura la consistencia de las acciones. Incluye:</p>
                    <ul class="bullet-list" style="margin-bottom:32px;">
                        <li><strong>Política y objetivos de calidad:</strong> La dirección de la empresa en temas de calidad.</li>
                        <li><strong>Manual de calidad:</strong> Describe cómo funciona nuestro SGC en general.</li>
                        <li><strong>Procedimientos e instrucciones de trabajo:</strong> El "cómo se hace" paso a paso para asegurar la calidad operativa.</li>
                        <li><strong>Registros:</strong> Evidencia de que una actividad se realizó (ej. un reporte de inspección, un registro de asistencia).</li>
                    </ul>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                        <h3 style="color:#0f172a; margin-bottom:16px;"><i data-lucide="help-circle" style="color:var(--primary-blue);"></i> Quiz: Módulo 3</h3>
                        <p style="font-weight:600; margin-bottom:12px;">1. ¿Cuál es el propósito principal de los registros de calidad?</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Mostrar cómo realizar una tarea específica.</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true)">b) Proporcionar evidencia de que se han realizado las actividades.</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">c) Describir la estructura organizativa.</button>
                        </div>
                    </div>
                `,
                4: `
                    <h2 style="font-size:1.8rem; color:var(--primary-blue); margin-bottom:20px;">Módulo 4: Auditorías Internas y Mejora Continua</h2>
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Auditorías Internas</h3>
                    <p style="margin-bottom:16px; line-height:1.6; color:var(--color-text);">Son revisiones periódicas para comprobar que estamos siguiendo nuestros propios procedimientos y cumpliendo con la ISO 9001. No buscan culpables, sino áreas de oportunidad.</p>
                    
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">No Conformidades y Acciones Correctivas</h3>
                    <p style="margin-bottom:16px; line-height:1.6; color:var(--color-text);">Cuando algo no sale según lo planeado, se llama "No Conformidad". La "Acción Correctiva" es investigar por qué ocurrió (la causa raíz) y tomar medidas para que no vuelva a pasar.</p>

                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Mejora Continua</h3>
                    <p style="margin-bottom:24px; line-height:1.6; color:var(--color-text);">Todos tenemos un rol. Identificar problemas en tu día a día, proponer soluciones y seguir los procedimientos son tus contribuciones clave.</p>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                        <h3 style="color:#0f172a; margin-bottom:16px;"><i data-lucide="help-circle" style="color:var(--primary-blue);"></i> Quiz: Módulo 4</h3>
                        <p style="font-weight:600; margin-bottom:12px;">1. ¿Qué acción se toma para eliminar la causa de una no conformidad detectada y prevenir su recurrencia?</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Acción preventiva</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true)">b) Acción correctiva</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">c) Acción de contención</button>
                        </div>
                    </div>
                `,
                5: `
                    <h2 style="font-size:1.8rem; color:#1e3a8a; margin-bottom:20px;">Examen Final - ISO 9001</h2>
                    <p style="margin-bottom:32px; line-height:1.6; color:var(--color-text);">Responde las siguientes 3 preguntas para completar este curso.</p>
                    
                    <div style="display:flex; flex-direction:column; gap:32px;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                            <p style="font-weight:600; margin-bottom:12px;">1. La norma ISO 9001 se centra principalmente en:</p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Gestión ambiental</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true, true)">b) Sistema de Gestión de Calidad</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">c) Seguridad y salud ocupacional</button>
                            </div>
                        </div>

                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                            <p style="font-weight:600; margin-bottom:12px;">2. ¿Cuál NO es un principio de gestión de la calidad según ISO 9001?</p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Liderazgo</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">b) Enfoque al cliente</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true, true)">c) Maximización de beneficios</button>
                            </div>
                        </div>

                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                            <p style="font-weight:600; margin-bottom:12px;">3. Una "no conformidad" se refiere a:</p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true, true)">a) Un incumplimiento de un requisito</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">b) Una sugerencia de mejora</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">c) Un cliente insatisfecho</button>
                            </div>
                        </div>
                    </div>
                `
            };

            window.loadContentISO = (moduleId) => {
                // Update active state in sidebar
                for(let i=1; i<=5; i++) {
                    const btn = document.getElementById('nav-iso-'+i);
                    if (btn) {
                        if (i === moduleId) {
                            btn.classList.remove('btn-outline');
                            btn.classList.add('btn-primary');
                            if (i === 5) btn.style.color = '#fff';
                        } else {
                            btn.classList.remove('btn-primary');
                            btn.classList.add('btn-outline');
                            if (i === 5) btn.style.color = '#1e3a8a';
                        }
                    }
                }
                
                // Inject content
                document.getElementById('visorContent').innerHTML = isoData[moduleId];
                lucide.createIcons();
            };

            // Global logic to handle checking quiz answers immediately
            if (!window.checkAnswer) {
                window.checkAnswer = (btnElement, isCorrect, isFinalExam = false) => {
                    const parent = btnElement.parentElement;
                    // Disable all buttons in this question
                    const buttons = parent.querySelectorAll('button');
                    buttons.forEach(b => {
                        b.disabled = true;
                        b.style.pointerEvents = 'none';
                    });
                    
                    if (isCorrect) {
                        btnElement.style.background = '#dcfce7'; // green-100
                        btnElement.style.borderColor = '#16a34a'; // green-600
                        btnElement.style.color = '#166534'; // green-800
                        btnElement.innerHTML += ' <span style="margin-left:auto; font-weight:bold;">✓ Correcto</span>';
                        
                        if (isFinalExam) {
                            // Check if all 3 questions in final exam are answered correctly
                            // A simple hack: count how many buttons have '✓ Correcto' in the page
                            setTimeout(() => {
                                const correctCount = document.querySelectorAll('#visorContent span').length;
                                // In the final exam, there are 3 questions.
                                if (document.body.innerHTML.includes('Examen Final') && correctCount >= 3) {
                                    alert('¡Felicidades! Has aprobado el curso Introducción a ISO 9001.');
                                    navigateTo('emp_cap_catalogo');
                                }
                            }, 500);
                        }
                    } else {
                        btnElement.style.background = '#fee2e2'; // red-100
                        btnElement.style.borderColor = '#dc2626'; // red-600
                        btnElement.style.color = '#991b1b'; // red-800
                        btnElement.innerHTML += ' <span style="margin-left:auto; font-weight:bold;">✗ Incorrecto</span>';
                    }
                };
            }

            setTimeout(() => {
                window.loadContentISO(1);
            }, 0);
            
            return;
        }
        else if (currentSidebarView === 'emp_curso_prevencion') {
            mainContent.innerHTML = `
                <div class="page-header" style="display:flex; align-items:center; gap:16px;">
                    <button class="btn btn-outline" style="padding:8px;" onclick="navigateTo('emp_cursos')"><i data-lucide="arrow-left"></i> Volver</button>
                    <div>
                        <h1 class="page-title" style="color:#0f766e;">Prevención de Riesgos Laborales</h1>
                        <p class="page-subtitle">Seguridad Laboral Básica</p>
                    </div>
                </div>
                <div class="card" style="margin-bottom:24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 class="card-title">Descripción del curso</h3>
                        <button class="btn" style="background:#0f766e; color:white; border:none;" onclick="navigateTo('emp_visor_prevencion')">Comenzar Curso</button>
                    </div>
                    <p class="text-muted">Este curso está diseñado para dotar a los empleados de los conocimientos fundamentales sobre seguridad en el entorno laboral. Aprenderás a identificar riesgos, usar equipos de protección y responder ante emergencias.</p>
                </div>
                <div class="card">
                    <h3 class="card-title" style="margin-bottom:16px;">Temario del curso</h3>
                    <div class="module-list">
                        <div class="module-item open" onclick="this.classList.toggle('open')">
                            <div class="module-header">Módulo 1: Introducción a la Seguridad y Salud en el Trabajo <i data-lucide="chevron-down"></i></div>
                            <div class="module-content">
                                <ul class="bullet-list">
                                    <li>Conceptos Básicos de Seguridad</li>
                                    <li>Marco Legal y Normativo</li>
                                    <li>Responsabilidades del Empleador y del Empleado</li>
                                </ul>
                            </div>
                        </div>
                        <div class="module-item" onclick="this.classList.toggle('open')">
                            <div class="module-header">Módulo 2: Identificación y Evaluación de Riesgos Laborales <i data-lucide="chevron-down"></i></div>
                            <div class="module-content">
                                <ul class="bullet-list">
                                    <li>Tipos de Riesgos</li>
                                    <li>Proceso de Evaluación de Riesgos</li>
                                    <li>Medidas Preventivas</li>
                                </ul>
                            </div>
                        </div>
                        <div class="module-item" onclick="this.classList.toggle('open')">
                            <div class="module-header">Módulo 3: Equipos de Protección y Seguridad en el Entorno Laboral <i data-lucide="chevron-down"></i></div>
                            <div class="module-content">
                                <ul class="bullet-list">
                                    <li>Equipos de Protección Personal (EPP)</li>
                                    <li>Seguridad en el Manejo de Herramientas y Maquinaria</li>
                                    <li>Prevención de Incendios</li>
                                </ul>
                            </div>
                        </div>
                        <div class="module-item" onclick="this.classList.toggle('open')">
                            <div class="module-header">Módulo 4: Primeros Auxilios y Actuación en Emergencias <i data-lucide="chevron-down"></i></div>
                            <div class="module-content">
                                <ul class="bullet-list">
                                    <li>Fundamentos de Primeros Auxilios</li>
                                    <li>Plan de Emergencia y Evacuación</li>
                                    <li>Simulacros y Preparación</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        else if (currentSidebarView === 'emp_visor_prevencion') {
            mainContent.innerHTML = `
                <div style="display:flex; height:calc(100vh - 70px); margin:-24px; font-family: 'Inter', sans-serif;">
                    <!-- Sidebar -->
                    <div style="width:280px; background:var(--color-bg); border-right:1px solid var(--border-color); overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:16px;">
                        <button class="btn btn-outline" style="width:100%;" onclick="navigateTo('emp_curso_prevencion')"><i data-lucide="arrow-left"></i> Salir del curso</button>
                        <h3 style="font-size:1.1rem; color:#0f766e; font-weight:700;">Prevención de Riesgos Laborales</h3>
                        
                        <div class="visor-nav" style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                            <button id="nav-prev-1" class="btn" style="text-align:left; justify-content:flex-start; font-weight:500; background:#0f766e; color:white; border:none;" onclick="loadContentPrevencion(1)">Módulo 1: Introducción</button>
                            <button id="nav-prev-2" class="btn btn-outline" style="text-align:left; justify-content:flex-start; border:none; font-weight:500;" onclick="loadContentPrevencion(2)">Módulo 2: Identificación</button>
                            <button id="nav-prev-3" class="btn btn-outline" style="text-align:left; justify-content:flex-start; border:none; font-weight:500;" onclick="loadContentPrevencion(3)">Módulo 3: Equipos de Protección</button>
                            <button id="nav-prev-4" class="btn btn-outline" style="text-align:left; justify-content:flex-start; border:none; font-weight:500;" onclick="loadContentPrevencion(4)">Módulo 4: Primeros Auxilios</button>
                            <button id="nav-prev-5" class="btn btn-outline" style="text-align:left; justify-content:flex-start; border:none; font-weight:600; color:#0f766e; margin-top:16px;" onclick="loadContentPrevencion(5)"><i data-lucide="award"></i> Examen Final</button>
                        </div>
                    </div>
                    
                    <!-- Content Area -->
                    <div style="flex:1; padding:40px 60px; overflow-y:auto; background:#fff;" id="visorContent">
                        <!-- Content injected via JS -->
                    </div>
                </div>
            `;

            const prevData = {
                1: `
                    <h2 style="font-size:1.8rem; color:#0f766e; margin-bottom:20px;">Módulo 1: Introducción a la Seguridad y Salud en el Trabajo</h2>
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Conceptos Básicos de Seguridad</h3>
                    <p style="margin-bottom:16px; line-height:1.6; color:var(--color-text);">La seguridad laboral no es un accidente, es el resultado de un esfuerzo consciente. Un entorno de trabajo seguro protege el activo más valioso de la empresa: sus empleados.</p>
                    
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Responsabilidades del Empleador y del Empleado</h3>
                    <ul class="bullet-list" style="margin-bottom:32px;">
                        <li><strong>Empleador:</strong> Proporcionar un lugar de trabajo seguro, capacitación, y el equipo de protección necesario.</li>
                        <li><strong>Empleado:</strong> Seguir las normas de seguridad, usar el equipo de protección de manera adecuada, e informar sobre cualquier peligro o accidente.</li>
                    </ul>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                        <h3 style="color:#0f172a; margin-bottom:16px;"><i data-lucide="help-circle" style="color:#0f766e;"></i> Quiz: Módulo 1</h3>
                        <p style="font-weight:600; margin-bottom:12px;">1. ¿Quién es responsable de la seguridad en el lugar de trabajo?</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Solo el empleador</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">b) Solo el comité de seguridad</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true)">c) El empleador y todos los empleados</button>
                        </div>
                    </div>
                `,
                2: `
                    <h2 style="font-size:1.8rem; color:#0f766e; margin-bottom:20px;">Módulo 2: Identificación y Evaluación de Riesgos Laborales</h2>
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Tipos de Riesgos</h3>
                    <ul class="bullet-list" style="margin-bottom:16px;">
                        <li><strong>Físicos:</strong> Ruido, vibraciones, iluminación inadecuada, temperaturas extremas.</li>
                        <li><strong>Químicos:</strong> Vapores, gases, líquidos tóxicos.</li>
                        <li><strong>Biológicos:</strong> Virus, bacterias, hongos.</li>
                        <li><strong>Ergonómicos:</strong> Posturas forzadas, movimientos repetitivos, levantamiento de cargas.</li>
                        <li><strong>Psicosociales:</strong> Estrés, fatiga, acoso laboral.</li>
                    </ul>
                    
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Medidas Preventivas</h3>
                    <p style="margin-bottom:32px; line-height:1.6; color:var(--color-text);">Una vez evaluados los riesgos, se deben aplicar medidas para eliminarlos o reducirlos. La jerarquía de controles es: 1. Eliminar, 2. Sustituir, 3. Controles de ingeniería, 4. Controles administrativos, 5. EPP.</p>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                        <h3 style="color:#0f172a; margin-bottom:16px;"><i data-lucide="help-circle" style="color:#0f766e;"></i> Quiz: Módulo 2</h3>
                        <p style="font-weight:600; margin-bottom:12px;">1. ¿Qué tipo de riesgo incluye la exposición a sustancias químicas tóxicas o gases?</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Riesgo ergonómico</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true)">b) Riesgo químico</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">c) Riesgo físico</button>
                        </div>
                    </div>
                `,
                3: `
                    <h2 style="font-size:1.8rem; color:#0f766e; margin-bottom:20px;">Módulo 3: Equipos de Protección y Seguridad</h2>
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Equipos de Protección Personal (EPP)</h3>
                    <p style="margin-bottom:16px; line-height:1.6; color:var(--color-text);">El EPP es la última línea de defensa. Incluye cascos, gafas protectoras, tapones para los oídos, guantes, calzado de seguridad, arneses, etc. Su propósito es reducir la exposición a peligros, no eliminarlos.</p>
                    
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Mantenimiento del EPP</h3>
                    <p style="margin-bottom:32px; line-height:1.6; color:var(--color-text);">Un EPP dañado no protege adecuadamente. Es vital inspeccionarlo antes de cada uso, limpiarlo según las instrucciones y reemplazarlo cuando esté defectuoso.</p>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                        <h3 style="color:#0f172a; margin-bottom:16px;"><i data-lucide="help-circle" style="color:#0f766e;"></i> Quiz: Módulo 3</h3>
                        <p style="font-weight:600; margin-bottom:12px;">1. ¿Cuál es el propósito principal del Equipo de Protección Personal (EPP)?</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Mejorar la apariencia del trabajador</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true)">b) Reducir la exposición a peligros</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">c) Aumentar la velocidad de trabajo</button>
                        </div>
                    </div>
                `,
                4: `
                    <h2 style="font-size:1.8rem; color:#0f766e; margin-bottom:20px;">Módulo 4: Primeros Auxilios y Actuación en Emergencias</h2>
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Fundamentos de Primeros Auxilios</h3>
                    <p style="margin-bottom:16px; line-height:1.6; color:var(--color-text);">La atención inmediata y temporal que se le da a una persona que ha sufrido un accidente o enfermedad repentina. Lo primero es proteger (asegurar la zona), luego avisar (llamar a emergencias) y finalmente socorrer.</p>
                    
                    <h3 style="font-size:1.2rem; margin-top:24px; margin-bottom:12px;">Plan de Emergencia y Evacuación</h3>
                    <p style="margin-bottom:32px; line-height:1.6; color:var(--color-text);">Es crucial conocer las rutas de evacuación, los puntos de encuentro y la ubicación de extintores y botiquines. Durante una evacuación, la prioridad es salir de forma segura, manteniendo la calma, sin correr y sin retroceder.</p>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                        <h3 style="color:#0f172a; margin-bottom:16px;"><i data-lucide="help-circle" style="color:#0f766e;"></i> Quiz: Módulo 4</h3>
                        <p style="font-weight:600; margin-bottom:12px;">1. Durante una evacuación de emergencia, lo más importante es:</p>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Recoger todas las pertenencias personales</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">b) Correr rápidamente hacia la salida más cercana</button>
                            <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true)">c) Mantener la calma y seguir las rutas de evacuación designadas</button>
                        </div>
                    </div>
                `,
                5: `
                    <h2 style="font-size:1.8rem; color:#0f766e; margin-bottom:20px;">Examen Final - Prevención de Riesgos</h2>
                    <p style="margin-bottom:32px; line-height:1.6; color:var(--color-text);">Responde las siguientes 3 preguntas para completar este curso.</p>
                    
                    <div style="display:flex; flex-direction:column; gap:32px;">
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                            <p style="font-weight:600; margin-bottom:12px;">1. El orden de prioridad en el control de riesgos es:</p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Usar EPP, luego eliminar el riesgo</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true, true, true)">b) Eliminar el riesgo, luego controles de ingeniería, luego EPP</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">c) Capacitación, luego EPP, luego eliminar el riesgo</button>
                            </div>
                        </div>

                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                            <p style="font-weight:600; margin-bottom:12px;">2. Un riesgo ergonómico puede ser causado por:</p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Ruido excesivo</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true, true, true)">b) Posturas forzadas y movimientos repetitivos</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">c) Manejo de productos químicos</button>
                            </div>
                        </div>

                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:24px;">
                            <p style="font-weight:600; margin-bottom:12px;">3. El plan de emergencia debe ser conocido por:</p>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">a) Solo los brigadistas</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, false)">b) Solo la gerencia</button>
                                <button class="btn btn-outline" style="justify-content:flex-start; text-align:left;" onclick="checkAnswer(this, true, true, true)">c) Todo el personal de la empresa</button>
                            </div>
                        </div>
                    </div>
                `
            };

            window.loadContentPrevencion = (moduleId) => {
                // Update active state in sidebar
                for(let i=1; i<=5; i++) {
                    const btn = document.getElementById('nav-prev-'+i);
                    if (btn) {
                        if (i === moduleId) {
                            btn.classList.remove('btn-outline');
                            btn.style.background = '#0f766e';
                            btn.style.color = 'white';
                        } else {
                            btn.style.background = 'transparent';
                            btn.classList.add('btn-outline');
                            if (i === 5) btn.style.color = '#0f766e';
                            else btn.style.color = '';
                        }
                    }
                }
                
                // Inject content
                document.getElementById('visorContent').innerHTML = prevData[moduleId];
                lucide.createIcons();
            };

            // Enhance global logic to handle Prevencion completion
            if (!window.checkAnswer) {
                // Should not happen as it's defined in iso9001 but re-defining safely
                window.checkAnswer = (btnElement, isCorrect, isFinalExam = false, isPrevencion = false) => {
                    const parent = btnElement.parentElement;
                    const buttons = parent.querySelectorAll('button');
                    buttons.forEach(b => { b.disabled = true; b.style.pointerEvents = 'none'; });
                    
                    if (isCorrect) {
                        btnElement.style.background = '#dcfce7'; btnElement.style.borderColor = '#16a34a'; btnElement.style.color = '#166534';
                        btnElement.innerHTML += ' <span style="margin-left:auto; font-weight:bold;">✓ Correcto</span>';
                        if (isFinalExam) {
                            setTimeout(() => {
                                const correctCount = document.querySelectorAll('#visorContent span').length;
                                if (document.body.innerHTML.includes('Examen Final') && correctCount >= 3) {
                                    alert(isPrevencion ? '¡Felicidades! Has aprobado el curso de Prevención de Riesgos.' : '¡Felicidades! Has aprobado el curso Introducción a ISO 9001.');
                                    navigateTo('emp_cap_catalogo');
                                }
                            }, 500);
                        }
                    } else {
                        btnElement.style.background = '#fee2e2'; btnElement.style.borderColor = '#dc2626'; btnElement.style.color = '#991b1b';
                        btnElement.innerHTML += ' <span style="margin-left:auto; font-weight:bold;">✗ Incorrecto</span>';
                    }
                };
            } else {
                // We need to override the checkAnswer to support isPrevencion parameter since we defined it simply in iso9001
                window.checkAnswer = (btnElement, isCorrect, isFinalExam = false, isPrevencion = false) => {
                    const parent = btnElement.parentElement;
                    const buttons = parent.querySelectorAll('button');
                    buttons.forEach(b => { b.disabled = true; b.style.pointerEvents = 'none'; });
                    
                    if (isCorrect) {
                        btnElement.style.background = '#dcfce7'; btnElement.style.borderColor = '#16a34a'; btnElement.style.color = '#166534';
                        btnElement.innerHTML += ' <span style="margin-left:auto; font-weight:bold;">✓ Correcto</span>';
                        if (isFinalExam) {
                            setTimeout(() => {
                                const correctCount = document.querySelectorAll('#visorContent span').length;
                                if (document.body.innerHTML.includes('Examen Final') && correctCount >= 3) {
                                    alert(isPrevencion ? '¡Felicidades! Has aprobado el curso Prevención de Riesgos Laborales.' : '¡Felicidades! Has aprobado el curso Introducción a ISO 9001.');
                                    navigateTo('emp_cap_catalogo');
                                }
                            }, 500);
                        }
                    } else {
                        btnElement.style.background = '#fee2e2'; btnElement.style.borderColor = '#dc2626'; btnElement.style.color = '#991b1b';
                        btnElement.innerHTML += ' <span style="margin-left:auto; font-weight:bold;">✗ Incorrecto</span>';
                    }
                };
            }

            setTimeout(() => {
                window.loadContentPrevencion(1);
            }, 0);
            
            return;
        }
        else if (currentSidebarView === 'emp_tramites_resumen') {
            mainContent.innerHTML = `
                <div class="page-header"><h1 class="page-title">Resumen de Trámites</h1></div>
                <div class="grid-2col">
                    <div class="card">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr><th>Trámite</th><th>Estado</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Identificación</td><td><span class="badge badge-yellow">PENDIENTE</span></td></tr>
                                    <tr><td>Datos bancarios</td><td><span class="badge badge-orange">EN REVISIÓN</span></td></tr>
                                    <tr><td>Contacto de Emergencia</td><td><span class="badge badge-green">COMPLETADO</span></td></tr>
                                    ${store.contractSigned ? '<tr><td>Contrato Firmado_vFinal.pdf</td><td><span class="badge badge-green">COMPLETADO</span></td></tr>' : '<tr><td>Contrato Firmado_vFinal.pdf</td><td><span class="badge badge-orange">EN REVISIÓN</span></td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card text-center">
                        <h3 class="card-title" style="justify-content:center;">Estado de Validación</h3>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:20px; padding-top:8px;">
                            <svg viewBox="0 0 36 36" style="width:130px; height:130px;">
                                ${(() => {
                                        const total = 4;
                                        let completado = store.contractSigned ? 2 : 1;
                                        let revision = store.contractSigned ? 1 : 2;
                                        let pendiente = 1;
                                        
                                        const pctC = (completado / total) * 100;
                                        const pctR = (revision / total) * 100;
                                        const pctP = (pendiente / total) * 100;
                                        
                                        return `
                                            <!-- Base (fondo gris) -->
                                            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#E2E2EE" stroke-width="4"/>
                                            <!-- Completado -->
                                            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#059669" stroke-width="4"
                                                stroke-dasharray="${pctC} 100" stroke-dashoffset="0" transform="rotate(-90 18 18)"/>
                                            <!-- En revisión -->
                                            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#EA580C" stroke-width="4"
                                                stroke-dasharray="${pctR} 100" stroke-dashoffset="-${pctC}" transform="rotate(-90 18 18)"/>
                                            <!-- Pendiente -->
                                            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#D97706" stroke-width="4"
                                                stroke-dasharray="${pctP} 100" stroke-dashoffset="-${pctC + pctR}" transform="rotate(-90 18 18)"/>
                                        `;
                                    })()}
                                </svg>
                                <div style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:1rem; color:var(--color-text); flex-direction:column; line-height:1.2;">
                                    <span style="font-size:1.3rem;">4</span>
                                    <span style="font-size:0.65rem; color:var(--color-muted);">trámites</span>
                                </div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:10px; text-align:left; width:100%;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="width:12px; height:12px; border-radius:50%; background:#059669;"></div>
                                    <span style="font-size:0.875rem; flex:1;">Completado</span>
                                    <span style="font-weight:600; font-size:0.875rem;">${store.contractSigned ? '2' : '1'}</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="width:12px; height:12px; border-radius:50%; background:#EA580C;"></div>
                                    <span style="font-size:0.875rem; flex:1;">En revisión</span>
                                    <span style="font-weight:600; font-size:0.875rem;">${store.contractSigned ? '1' : '2'}</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="width:12px; height:12px; border-radius:50%; background:#D97706;"></div>
                                    <span style="font-size:0.875rem; flex:1;">Pendiente</span>
                                    <span style="font-weight:600; font-size:0.875rem;">1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        else if (currentSidebarView === 'emp_tramites_firmas') {
            mainContent.innerHTML = `
                <div class="page-header"><h1 class="page-title">Firma de Documentos</h1></div>
                <div class="card">
                    <h3 class="card-title">Contrato de Servicios Generales vFinal</h3>
                    <div class="contract-text">
CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO INDETERMINADO

Que celebran por una parte ALL ABOARD S.A. DE C.V., a quien en lo sucesivo se le denominará "EL PATRÓN", y por la otra parte el C. ${store.name}, a quien en lo sucesivo se le denominará "EL TRABAJADOR".

CLÁUSULAS
PRIMERA.- El trabajador se obliga a prestar sus servicios personales subordinados bajo la dirección y dependencia del patrón.
SEGUNDA.- La jornada de trabajo será la establecida en el reglamento interno.
TERCERA.- El salario será pagado mediante transferencia electrónica.

Leído que fue el presente contrato, las partes lo firman de conformidad.
                    </div>
                    
                    ${store.contractSigned ? `
                        <div class="info-banner" style="background:#d1fae5; border-color:var(--success); color:#065f46;">
                            <i data-lucide="check-circle"></i> Contrato firmado exitosamente.
                        </div>
                    ` : `
                        <h4>Firma Digital</h4>
                        <div class="signature-box">
                            <canvas id="signaturePad"></canvas>
                            <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:12px;">
                                <button class="btn btn-outline" id="clearBtn">Limpiar</button>
                                <button class="btn btn-primary" id="confirmSignBtn">Confirmar Firma</button>
                            </div>
                        </div>
                    `}
                </div>
            `;
            
            if (!store.contractSigned) {
                setTimeout(() => {
                    const canvas = document.getElementById('signaturePad');
                    if(canvas) {
                        const ctx = canvas.getContext('2d');
                        let isDrawing = false;
                        
                        // Fix blur by setting actual size
                        canvas.width = canvas.offsetWidth;
                        canvas.height = canvas.offsetHeight;
                        
                        canvas.addEventListener('mousedown', (e) => {
                            isDrawing = true;
                            ctx.beginPath();
                            ctx.moveTo(e.offsetX, e.offsetY);
                        });
                        canvas.addEventListener('mousemove', (e) => {
                            if(isDrawing) {
                                ctx.lineTo(e.offsetX, e.offsetY);
                                ctx.stroke();
                            }
                        });
                        canvas.addEventListener('mouseup', () => isDrawing = false);
                        canvas.addEventListener('mouseout', () => isDrawing = false);
                        
                        document.getElementById('clearBtn').addEventListener('click', () => {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                        });
                        
                        document.getElementById('confirmSignBtn').addEventListener('click', () => {
                            store.contractSigned = true;
                            saveStore(store);
                            renderMainContent(); // Refresh
                        });
                    }
                }, 100);
            }
        }
        else if (currentSidebarView === 'emp_tramites_documentos') {
            mainContent.innerHTML = `
                <div class="page-header"><h1 class="page-title">Lista de Documentos Almacenados</h1></div>
                <div class="card">
                    <ul class="sidebar-menu" id="docList" style="padding:0">
                        ${store.documents.map(doc => `
                            <li style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border-color);">
                                <div style="display:flex; align-items:center; gap:8px;"><i data-lucide="file-text" style="color:var(--danger)"></i> ${doc.name}</div>
                                <span style="color:${doc.color}; font-weight:600;">[${doc.status}]</span>
                            </li>
                        `).join('')}
                        ${store.contractSigned ? `
                             <li style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border-color);">
                                <div style="display:flex; align-items:center; gap:8px;"><i data-lucide="file-text" style="color:var(--danger)"></i> Contrato_Firmado_vFinal.pdf</div>
                                <span style="color:green; font-weight:600;">[Cargado con éxito]</span>
                            </li>
                        ` : `
                            <li style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border-color);">
                                <div style="display:flex; align-items:center; gap:8px;"><i data-lucide="file-text" style="color:var(--danger)"></i> Contrato_Firmado_vFinal.pdf</div>
                                <span style="color:orange; font-weight:600;">[En revisión]</span>
                            </li>
                        `}
                    </ul>

                    <div class="upload-zone" id="uploadZone">
                        <i data-lucide="upload-cloud" style="width:48px;height:48px;"></i>
                        <h3>Seleccionar Documento para Cargar</h3>
                        <p class="text-muted">Formatos permitidos: PDF, PNG, JPG (Máx. 5 MB)</p>
                        <input type="file" id="fileInput" style="display:none;" accept=".pdf,.png,.jpg">
                    </div>
                </div>
            `;
            setTimeout(() => {
                const uploadZone = document.getElementById('uploadZone');
                const fileInput = document.getElementById('fileInput');
                uploadZone.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', (e) => {
                    if(e.target.files.length > 0) {
                        const newDoc = { name: e.target.files[0].name, status: 'En revisión', color: 'orange' };
                        store.documents.push(newDoc);
                        saveStore(store);
                        renderMainContent();
                    }
                });
            }, 100);
        }
        else if (currentSidebarView === 'emp_cap_catalogo') {
            mainContent.innerHTML = `
                <div class="page-header"><h1 class="page-title">Catálogo de Capacitaciones</h1></div>
                <div class="grid-2col-even mb-4">
                    <div class="card" style="background:#eff6ff; border:1px solid #93c5fd;">
                        <h3 class="card-title" style="color:#1e3a8a;"><i data-lucide="shield"></i> Obligatorio</h3>
                        <p style="font-size:1.2rem; font-weight:600;">Políticas y Éticas</p>
                        <p class="text-muted">(Inscripción aprobada)</p>
                    </div>
                    <div class="card" style="background:#f5f3ff; border:1px solid #c4b5fd;">
                        <h3 class="card-title" style="color:#4c1d95;"><i data-lucide="users"></i> Voluntario</h3>
                        <p style="font-size:1.2rem; font-weight:600;">Liderazgo y Gestión de equipos</p>
                        <p class="text-muted">(Inscripción en proceso)</p>
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">Estatus de capacitaciones</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr><th>Módulo</th><th>Fase</th><th>Estado</th><th>Acción</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>G. Financieros</td>
                                    <td>Aprobación</td>
                                    <td>⚡ En espera</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>H. Ofimáticas</td>
                                    <td>Evaluación</td>
                                    <td>${store.skillsRetried ? '⚡ En proceso' : '🔴 Reprobado'}</td>
                                    <td>${!store.skillsRetried ? '<button class="btn btn-primary" onclick="window.showRevision()">Revisar</button>' : ''}</td>
                                </tr>
                                <tr>
                                    <td>Liderazgo</td>
                                    <td>Historial</td>
                                    <td>🟢 Aprobada</td>
                                    <td><button class="btn btn-primary" onclick="window.openCertificate('Liderazgo')">Constancia</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            window.showRevision = () => {
                currentSidebarView = 'emp_cap_revision';
                renderSidebar();
                renderMainContent();
            };
            window.openCertificate = (course) => {
                openModal(`
                    <div class="certificate-card">
                        <div style="margin-bottom:24px; color:var(--primary-blue); font-size:1.5rem; font-weight:700;">
                            <i data-lucide="ship" style="width:40px;height:40px;"></i><br>
                            ALL ABOARD
                        </div>
                        <h2 style="letter-spacing:2px; font-weight:700;">CONSTANCIA DE ACREDITACIÓN</h2>
                        <p style="margin-top:24px;">Otorgada por All Aboard a:</p>
                        <div class="cert-name">${store.name}</div>
                        <p>Por haber cursado y aprobado con éxito la capacitación obligatoria de:<br><strong>${course}</strong></p>
                        
                        <div class="cert-signatures">
                            <div>
                                <div class="sig-line">Director de RRHH</div>
                            </div>
                            <div>
                                <div class="sig-line">Instructor</div>
                            </div>
                        </div>
                        <div class="mt-4" style="display:flex; justify-content:center; gap:16px;">
                            <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                            <button class="btn btn-primary" onclick="window.print()">Imprimir / Guardar PDF</button>
                        </div>
                    </div>
                `);
            };
        }
        else if (currentSidebarView === 'emp_cap_revision') {
             mainContent.innerHTML = `
                <div class="page-header flex-between">
                    <h1 class="page-title">Revisión: H. Ofimáticas</h1>
                    <button class="btn btn-outline" onclick="currentSidebarView='emp_cap_catalogo'; renderSidebar(); renderMainContent();">← Volver</button>
                </div>
                
                <div class="card" style="background:#f9fafb;">
                    <div class="flex-between">
                        <div><strong>MÓDULO:</strong> H. Ofimáticas</div>
                        <div><strong>FASE:</strong> Evaluación</div>
                        <div><strong>ESTADO:</strong> 🔴 REPROBADO</div>
                    </div>
                </div>

                <div class="error-banner">
                    <strong>Retroalimentación:</strong> Calificación insuficiente en hojas de cálculo. Se requiere repasar fórmulas lógicas y estructuras de datos antes de solicitar un segundo intento.
                </div>

                <div class="card">
                    <div class="table-container mb-4">
                        <table>
                            <thead><tr><th>TEMA</th><th>PUNTAJE</th><th>ESTATUS</th></tr></thead>
                            <tbody>
                                <tr><td>Procesadores de Texto</td><td>85 / 100</td><td>🟢 Aprobado</td></tr>
                                <tr><td>Hojas de Cálculo Avanzadas</td><td>50 / 100</td><td>🔴 Insuficiente</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <button class="btn btn-primary" onclick="requestRetry()">Solicitar Segundo Intento</button>
                </div>
             `;
             window.requestRetry = () => {
                 store.skillsRetried = true;
                 saveStore(store);
                 currentSidebarView = 'emp_cap_catalogo';
                 renderSidebar();
                 renderMainContent();
             };
        }
        
        // ADMINISTRADOR VIEWS
        else if (currentSidebarView === 'adm_empleados') {
             mainContent.innerHTML = `
                <div class="page-header"><h1 class="page-title">Lista de empleados</h1></div>
                <div class="card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr><th>ID</th><th>Foto</th><th>Nombre</th><th>Puesto</th><th>Acciones</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td><td><div class="avatar">AM</div></td><td>Ana Martinez</td><td>Gerente de Recursos Humanos</td>
                                    <td><a href="#" onclick="showEmpDetails('Ana Martinez', 'Gerente de Recursos Humanos', 'ana@allaboard.com')">Ver detalles de empleado</a></td>
                                </tr>
                                <tr>
                                    <td>2</td><td><div class="avatar">CL</div></td><td>Carlos López</td><td>Desarrollador de Software</td>
                                    <td><a href="#" onclick="showEmpDetails('Carlos López', 'Desarrollador de Software', 'carlos@allaboard.com')">Ver detalles de empleado</a></td>
                                </tr>
                                <tr>
                                    <td>3</td><td><div class="avatar">SR</div></td><td>Sofía Ramírez</td><td>Diseñadora Gráfica</td>
                                    <td><a href="#" onclick="showEmpDetails('Sofía Ramírez', 'Diseñadora Gráfica', 'sofia@allaboard.com')">Ver detalles de empleado</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
             `;
             window.showEmpDetails = (name, puesto, email) => {
                 openModal(`
                    <h2>Detalles del empleado</h2>
                    <table style="margin-top:24px; margin-bottom:24px;">
                        <tbody>
                            <tr><th>ID</th><td>${Math.floor(Math.random()*100)+1}</td></tr>
                            <tr><th>Nombre</th><td>${name}</td></tr>
                            <tr><th>Puesto</th><td>${puesto}</td></tr>
                            <tr><th>Correo</th><td>${email}</td></tr>
                            <tr><th>Teléfono</th><td>555-0192</td></tr>
                            <tr><th>Departamento</th><td>Tecnología</td></tr>
                        </tbody>
                    </table>
                    <button class="btn btn-outline" onclick="closeModal()">← Volver</button>
                 `);
             };
        }
        else if (currentSidebarView === 'adm_catalogo') {
            // ── Catalogue state ──────────────────────────────────────────
            if (!window._cursos) {
                window._cursos = [
                    { id:1, nombre:'Capacitación 1', area:'General', instructor:'L. Torres',   duracion:'2h' },
                    { id:2, nombre:'Capacitación 2', area:'TI',      instructor:'A. Sánchez',  duracion:'3h' },
                ];
                window._cursosNextId = 3;
            }

            const renderCursoItem = (c) => `
                <li id="curso-li-${c.id}" class="mb-4" style="animation:fadeIn 0.3s ease;">
                    <strong>${c.nombre}</strong>
                    <div style="font-size:0.75rem;color:var(--color-muted);margin:2px 0 6px;">${c.area} · ${c.instructor} · ${c.duracion}</div>
                    <div class="mt-4" style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;" onclick="verTemarioCurso(${c.id})">Ver Temario</button>
                        <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;" onclick="abrirCurso(${c.id})">Abrir</button>
                        <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;color:var(--color-primary);border-color:var(--color-primary);" onclick="editarCurso(${c.id})"><i data-lucide="pencil" style="width:12px;height:12px;"></i> Editar</button>
                    </div>
                </li>`;

            mainContent.innerHTML = `
                <!-- Catálogo toast -->
                <div id="catToast" style="position:fixed;top:24px;right:24px;z-index:9999;opacity:0;pointer-events:none;transition:opacity 0.4s;">
                    <div style="background:var(--color-primary);color:white;padding:12px 20px;border-radius:10px;display:flex;align-items:center;gap:10px;font-size:0.875rem;box-shadow:0 4px 16px rgba(0,0,0,0.18);">
                        <i data-lucide="check" style="width:16px;height:16px;"></i>
                        <span id="catToastMsg"></span>
                    </div>
                </div>

                <div class="page-header"><h1 class="page-title">Visión General del Catálogo de Capacitaciones</h1></div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;align-items:start;">

                    <!-- FORM: Añadir Nuevo Curso -->
                    <div class="card">
                        <h3 class="card-title" style="margin-bottom:16px;">➕ Añadir Nuevo Curso</h3>
                        <div class="form-grid">
                            <div>
                                <label style="font-weight:500;font-size:0.875rem;">Nombre del Curso</label>
                                <input id="cat_nombre" type="text" class="form-input" style="margin-top:6px;" placeholder="Ej. Introducción a ISO 9001">
                            </div>
                            <div>
                                <label style="font-weight:500;font-size:0.875rem;">Área</label>
                                <select id="cat_area" class="form-input" style="margin-top:6px;">
                                    <option value="">Seleccionar área</option>
                                    <option>General</option><option>TI</option><option>RRHH</option>
                                    <option>Finanzas</option><option>Legal</option><option>Diseño</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-weight:500;font-size:0.875rem;">Instructor</label>
                                <input id="cat_instructor" type="text" class="form-input" style="margin-top:6px;" placeholder="Nombre del instructor">
                            </div>
                            <div>
                                <label style="font-weight:500;font-size:0.875rem;">Duración estimada</label>
                                <input id="cat_duracion" type="text" class="form-input" style="margin-top:6px;" placeholder="Ej. 2h 30min">
                            </div>
                        </div>
                        <div class="upload-zone" style="padding:14px;margin-top:12px;">
                            <i data-lucide="upload"></i> Cargar Material
                        </div>
                        <button class="btn btn-primary" style="margin-top:14px;width:100%;" onclick="crearCurso()">
                            <i data-lucide="plus" style="width:15px;height:15px;"></i> Añadir Curso
                        </button>
                    </div>

                    <!-- Segunda columna (Ver Temario / Abrir actions) -->
                    <div class="card">
                        <h3 class="card-title">Añadir Nueva Capacitación</h3>
                        <div class="form-grid">
                            <input type="text" class="form-input" placeholder="Título">
                            <input type="text" class="form-input" placeholder="Medio">
                            <div class="upload-zone" style="padding:16px; margin-top:0;">
                                <i data-lucide="upload"></i> Cargar Material
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button class="btn btn-outline" style="flex:1;" onclick="abrirTemario('Nueva Capacitación')">Ver Temario</button>
                                <button class="btn btn-outline" style="flex:1;" onclick="abrirCapacitacion('Nueva Capacitación')">Abrir</button>
                            </div>
                            <button class="btn btn-primary" onclick="alert('Capacitación añadida')">Añadir y Cargar Material</button>
                        </div>
                    </div>

                    <!-- Lista de cursos -->
                    <div class="card">
                        <h3 class="card-title">Asignable capacitaciones
                            <span id="cat-total" style="font-size:0.78rem;color:var(--color-muted);font-weight:400;margin-left:6px;">(${window._cursos.length})</span>
                        </h3>
                        <ul id="cursosList" class="bullet-list">
                            ${window._cursos.map(renderCursoItem).join('')}
                        </ul>
                    </div>
                </div>
            `;
            lucide.createIcons();

            // ── Toast helper ───────────────────────────────────────────
            window._catToast = (msg) => {
                const t = document.getElementById('catToast');
                const m = document.getElementById('catToastMsg');
                if (!t || !m) return;
                m.textContent = msg; t.style.opacity = '1';
                setTimeout(() => t.style.opacity = '0', 3000);
            };

            // ── Crear curso ──────────────────────────────────────────────
            window.crearCurso = () => {
                const nombre   = document.getElementById('cat_nombre').value.trim();
                const area     = document.getElementById('cat_area').value;
                const instructor = document.getElementById('cat_instructor').value.trim();
                const duracion = document.getElementById('cat_duracion').value.trim();
                if (!nombre || !area || !instructor) {
                    alert('Completa al menos: nombre del curso, área e instructor.');
                    return;
                }
                const nuevo = { id: window._cursosNextId++, nombre, area, instructor, duracion: duracion || 'N/D' };
                window._cursos.push(nuevo);

                // Inject new item into list
                const lista = document.getElementById('cursosList');
                if (lista) {
                    const li = document.createElement('li');
                    li.id = `curso-li-${nuevo.id}`;
                    li.className = 'mb-4';
                    li.style.animation = 'fadeIn 0.35s ease';
                    li.innerHTML = `<strong>${nuevo.nombre}</strong>
                        <div style="font-size:0.75rem;color:var(--color-muted);margin:2px 0 6px;">${nuevo.area} · ${nuevo.instructor} · ${nuevo.duracion}</div>
                        <div class="mt-4" style="display:flex;gap:6px;flex-wrap:wrap;">
                            <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;" onclick="verTemarioCurso(${nuevo.id})">Ver Temario</button>
                            <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;" onclick="abrirCurso(${nuevo.id})">Abrir</button>
                            <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;color:var(--color-primary);border-color:var(--color-primary);" onclick="editarCurso(${nuevo.id})"><i data-lucide="pencil" style="width:12px;height:12px;"></i> Editar</button>
                        </div>`;
                    lista.appendChild(li);
                    li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }

                // Update counter
                const total = document.getElementById('cat-total');
                if (total) total.textContent = `(${window._cursos.length})`;

                // Clear form
                ['cat_nombre','cat_area','cat_instructor','cat_duracion'].forEach(id => {
                    const el = document.getElementById(id); if (el) el.value = '';
                });

                _catToast(`✓ Curso "${nuevo.nombre}" añadido al catálogo`);
                lucide.createIcons();
            };

            // ── Ver Temario (specific course data) ──────────────────────────
            window.verTemarioCurso = (id) => {
                const c = window._cursos.find(x => x.id === id);
                if (!c) return;
                openModal(`
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                        <i data-lucide="book-open" style="width:22px;height:22px;color:var(--color-primary);"></i>
                        <h2 style="font-size:1.05rem;">Temario: ${c.nombre}</h2>
                    </div>
                    <div style="background:var(--color-bg);border-radius:8px;padding:12px;margin-bottom:16px;display:flex;gap:24px;font-size:0.85rem;">
                        <span><strong>Área:</strong> ${c.area}</span>
                        <span><strong>Instructor:</strong> ${c.instructor}</span>
                        <span><strong>Duración:</strong> ${c.duracion}</span>
                    </div>
                    <div style="border:1px solid var(--color-border);border-radius:10px;overflow:hidden;margin-bottom:20px;">
                        <div style="padding:13px 18px;border-bottom:1px solid var(--color-border);font-weight:600;background:var(--color-bg);">Módulo 1: Introducción a ${c.nombre}</div>
                        <div style="padding:10px 18px;color:var(--color-muted);font-size:0.875rem;">Historia, conceptos clave y objetivos del curso. Contexto dentro de la organización.</div>
                        <div style="padding:13px 18px;border-top:1px solid var(--color-border);font-weight:600;background:var(--color-bg);">Módulo 2: Contenido principal</div>
                        <div style="padding:10px 18px;color:var(--color-muted);font-size:0.875rem;">Desarrollo de habilidades prácticas y aplicación en el entorno de trabajo.</div>
                        <div style="padding:13px 18px;border-top:1px solid var(--color-border);font-weight:600;background:var(--color-bg);">Módulo 3: Práctica y casos de estudio</div>
                        <div style="padding:10px 18px;color:var(--color-muted);font-size:0.875rem;">Ejercicios aplicados, análisis de casos reales y retroalimentación.</div>
                        <div style="padding:13px 18px;border-top:1px solid var(--color-border);font-weight:600;background:var(--color-bg);">Módulo 4: Evaluación final</div>
                        <div style="padding:10px 18px;color:var(--color-muted);font-size:0.875rem;">Examen final, criterios de aprobación y certificación.</div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:10px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                        <button class="btn btn-primary" onclick="abrirCurso(${id});closeModal();">Abrir curso</button>
                    </div>
                `);
                lucide.createIcons();
            };

            // ── Abrir curso (vista de detalle) ──────────────────────────────
            window.abrirCurso = (id) => {
                const c = window._cursos.find(x => x.id === id);
                if (!c) return;
                openModal(`
                    <div style="background:linear-gradient(135deg,var(--color-primary),var(--color-secondary2));color:white;border-radius:10px;padding:24px;margin-bottom:20px;">
                        <div style="font-size:0.75rem;opacity:0.85;margin-bottom:6px;">${c.area} · ${c.instructor}</div>
                        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:4px;">${c.nombre}</h2>
                        <div style="font-size:0.8rem;opacity:0.9;">Duración estimada: ${c.duracion} · Modalidad: En línea</div>
                    </div>
                    <p style="color:var(--color-muted);font-size:0.9rem;margin-bottom:20px;line-height:1.6;">
                        Esta capacitación cubre los fundamentos necesarios para el proceso de integración y desarrollo profesional del empleado en All Aboard.
                        Incluye evaluaciones, materiales descargables y un certificado al finalizar.
                    </p>
                    <div style="background:var(--color-bg);border-radius:8px;padding:16px;margin-bottom:20px;">
                        <div style="font-size:0.75rem;font-weight:600;color:var(--color-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em;">Módulos del curso</div>
                        <div style="display:flex;flex-direction:column;gap:8px;">
                            ${['Introducción y objetivos','Contenido principal','Práctica y aplicación','Evaluación final'].map((m,i)=>`
                                <div style="display:flex;align-items:center;gap:10px;font-size:0.875rem;">
                                    <span style="width:22px;height:22px;border-radius:50%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0;">${i+1}</span>
                                    ${m}
                                </div>`).join('')}
                        </div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:10px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                        <button class="btn btn-primary" onclick="alert('Iniciando capacitación: ${c.nombre}');closeModal();">Iniciar capacitación</button>
                    </div>
                `);
                lucide.createIcons();
            };

            // ── Editar / Eliminar curso ─────────────────────────────────────
            window.editarCurso = (id) => {
                const c = window._cursos.find(x => x.id === id);
                if (!c) return;
                openModal(`
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                        <i data-lucide="pencil" style="width:20px;height:20px;color:var(--color-primary);"></i>
                        <h2 style="font-size:1rem;">Editar curso</h2>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
                        <div>
                            <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Nombre del curso</label>
                            <input id="edit_curso_nombre" class="form-input" style="margin-top:4px;" value="${c.nombre}">
                        </div>
                        <div>
                            <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Área</label>
                            <select id="edit_curso_area" class="form-input" style="margin-top:4px;">
                                ${['General','TI','RRHH','Finanzas','Legal','Diseño'].map(op=>
                                    `<option ${op===c.area?'selected':''}>${op}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Instructor</label>
                            <input id="edit_curso_instructor" class="form-input" style="margin-top:4px;" value="${c.instructor}">
                        </div>
                        <div>
                            <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Duración</label>
                            <input id="edit_curso_duracion" class="form-input" style="margin-top:4px;" value="${c.duracion}">
                        </div>
                    </div>
                    <!-- Zona de eliminación -->
                    <div style="background:#FFF0F0;border:1px solid #FECACA;border-radius:8px;padding:14px;margin-bottom:20px;">
                        <div style="font-size:0.8rem;color:var(--color-error);font-weight:600;margin-bottom:6px;">Zona de peligro</div>
                        <div style="font-size:0.8rem;color:var(--color-muted);margin-bottom:10px;">Esta acción eliminará permanentemente el curso del catálogo.</div>
                        <button class="btn" style="background:#A60C14;color:white;border-color:#A60C14;padding:6px 14px;font-size:0.8rem;" onclick="eliminarCurso(${id})">
                            <i data-lucide="trash-2" style="width:13px;height:13px;"></i> Eliminar curso
                        </button>
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:10px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="guardarCurso(${id})">Guardar cambios</button>
                    </div>
                `);
                lucide.createIcons();
            };

            window.guardarCurso = (id) => {
                const c = window._cursos.find(x => x.id === id);
                if (!c) return;
                const nombre     = document.getElementById('edit_curso_nombre').value.trim();
                const area       = document.getElementById('edit_curso_area').value;
                const instructor = document.getElementById('edit_curso_instructor').value.trim();
                const duracion   = document.getElementById('edit_curso_duracion').value.trim();
                if (!nombre || !instructor) { alert('El nombre e instructor son obligatorios.'); return; }
                c.nombre = nombre; c.area = area; c.instructor = instructor; c.duracion = duracion || 'N/D';
                // Update DOM item
                const li = document.getElementById('curso-li-'+id);
                if (li) {
                    li.innerHTML = `
                        <strong>${c.nombre}</strong>
                        <div style="font-size:0.75rem;color:var(--color-muted);margin:2px 0 6px;">${c.area} · ${c.instructor} · ${c.duracion}</div>
                        <div class="mt-4" style="display:flex;gap:6px;flex-wrap:wrap;">
                            <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;" onclick="verTemarioCurso(${id})">Ver Temario</button>
                            <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;" onclick="abrirCurso(${id})">Abrir</button>
                            <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;color:var(--color-primary);border-color:var(--color-primary);" onclick="editarCurso(${id})"><i data-lucide="pencil" style="width:12px;height:12px;"></i> Editar</button>
                        </div>`;
                    li.style.animation = 'fadeIn 0.3s ease';
                    lucide.createIcons();
                }
                closeModal();
                _catToast(`✓ Curso "${c.nombre}" actualizado`);
            };

            window.eliminarCurso = (id) => {
                const idx = window._cursos.findIndex(x => x.id === id);
                if (idx === -1) return;
                const nombre = window._cursos[idx].nombre;
                window._cursos.splice(idx, 1);
                // Remove DOM element with animation
                const li = document.getElementById('curso-li-'+id);
                if (li) { li.style.opacity='0'; li.style.transition='opacity 0.3s'; setTimeout(()=>li.remove(),300); }
                // Update counter
                setTimeout(() => {
                    const total = document.getElementById('cat-total');
                    if (total) total.textContent = `(${window._cursos.length})`;
                }, 350);
                closeModal();
                _catToast(`✓ Curso "${nombre}" eliminado`);
            };
        }
        else if (currentSidebarView === 'adm_inicio') {
            mainContent.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title">Bienvenido, ${store.name}</h1>
                    <p class="page-subtitle">Panel de administración del sistema All Aboard.</p>
                </div>
                <div class="grid-2col-even">
                    <div class="card card-clickable" onclick="navigateTo('adm_empleados')">
                        <h3 class="card-title"><i data-lucide="users"></i> Empleados activos</h3>
                        <p style="font-size:2.5rem; font-weight:700; color:var(--color-primary); margin:16px 0;">3</p>
                        <p class="text-muted">Ver lista de empleados →</p>
                    </div>
                    <div class="card card-clickable" onclick="navigateTo('adm_catalogo')">
                        <h3 class="card-title"><i data-lucide="book-open"></i> Capacitaciones en catálogo</h3>
                        <p style="font-size:2.5rem; font-weight:700; color:var(--color-secondary2); margin:16px 0;">2</p>
                        <p class="text-muted">Ir al catálogo →</p>
                    </div>
                    <div class="card card-clickable" onclick="navigateTo('adm_areas')">
                        <h3 class="card-title"><i data-lucide="briefcase"></i> Áreas registradas</h3>
                        <p style="font-size:2.5rem; font-weight:700; color:var(--status-success); margin:16px 0;">4</p>
                        <p class="text-muted">Ver mis áreas →</p>
                    </div>
                    <div class="card">
                        <h3 class="card-title"><i data-lucide="activity"></i> Actividad reciente</h3>
                        <ul class="bullet-list">
                            <li>Ana Martínez completó trámites · Hoy</li>
                            <li>Nueva capacitación ISO 9001 añadida · Ayer</li>
                            <li>Carlos López inició onboarding · Hace 2 días</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        else if (currentSidebarView === 'adm_areas') {
            // ── Areas reactive state ─────────────────────────────────────────
            if (!window._areas) {
                window._areas = [
                    { id:1, nombre:'Tecnología',       responsable:'Carlos López',  empleados:8, estado:'Activa' },
                    { id:2, nombre:'Recursos Humanos', responsable:'Ana Martínez',  empleados:5, estado:'Activa' },
                    { id:3, nombre:'Diseño',           responsable:'Sofía Ramírez', empleados:3, estado:'En revisión' },
                    { id:4, nombre:'Operaciones',      responsable:'—',             empleados:0, estado:'Sin responsable' },
                ];
                window._areasNextId = 5;
            }

            // Colors that EXACTLY match the badge classes in styles.css
            const ESTADO_COLOR = {
                'Activa':           '#059669',   // badge-green  → var(--status-success)
                'En revisión':     '#EA580C',   // badge-orange → var(--status-orange)
                'Sin responsable':  '#D97706',   // badge-yellow → var(--status-warning)
            };
            const ESTADO_BADGE = {
                'Activa':           'badge-green',
                'En revisión':     'badge-orange',
                'Sin responsable':  'badge-yellow',
            };

            const recalcAreas = () => ({
                activa:          window._areas.filter(a => a.estado === 'Activa').length,
                enRevision:      window._areas.filter(a => a.estado === 'En revisión').length,
                sinResponsable:  window._areas.filter(a => a.estado === 'Sin responsable').length,
                total:           window._areas.length,
            });

            const renderFilasAreas = () => window._areas.map(a => `
                <tr id="area-row-${a.id}" style="transition:background 0.3s;">
                    <td><strong>${a.nombre}</strong></td>
                    <td>${a.responsable}</td>
                    <td>${a.empleados}</td>
                    <td><span class="badge ${ESTADO_BADGE[a.estado]}">${a.estado}</span></td>
                    <td><button class="btn btn-outline" style="padding:4px 10px;font-size:0.8rem;" onclick="editarArea(${a.id})">Editar</button></td>
                </tr>`).join('');

            // Donut geometry helper
            // Circumference of r=15.9155 circle ≈ 100 units (convenient for % math)
            const buildDonutSegments = () => {
                const st = recalcAreas();
                const total = st.total || 1;
                const pctA  = (st.activa         / total) * 100;
                const pctR  = (st.enRevision     / total) * 100;
                const pctS  = (st.sinResponsable / total) * 100;
                return `
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#E2E2EE" stroke-width="4"/>
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="${ESTADO_COLOR['Activa']}" stroke-width="4"
                        stroke-dasharray="${pctA} 100" stroke-dashoffset="0" style="transition:stroke-dasharray 0.5s ease;"/>
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="${ESTADO_COLOR['En revisión']}" stroke-width="4"
                        stroke-dasharray="${pctR} 100" stroke-dashoffset="-${pctA}" style="transition:all 0.5s ease;"/>
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="${ESTADO_COLOR['Sin responsable']}" stroke-width="4"
                        stroke-dasharray="${pctS} 100" stroke-dashoffset="-${pctA + pctR}" style="transition:all 0.5s ease;"/>
                `;
            };

            let st = recalcAreas();

            mainContent.innerHTML = `
                <!-- Areas toast -->
                <div id="areasToast" style="position:fixed;top:24px;right:24px;z-index:9999;opacity:0;pointer-events:none;transition:opacity 0.4s;">
                    <div style="background:#059669;color:white;padding:12px 20px;border-radius:10px;display:flex;align-items:center;gap:10px;font-size:0.875rem;box-shadow:0 4px 16px rgba(0,0,0,0.18);">
                        <i data-lucide="check" style="width:16px;height:16px;"></i>
                        <span id="areasToastMsg"></span>
                    </div>
                </div>

                <div class="page-header">
                    <h1 class="page-title">Mis Áreas</h1>
                </div>

                <div style="display:grid;grid-template-columns:1fr 280px;gap:24px;align-items:start;">

                    <!-- Tabla de áreas (izquierda) -->
                    <div class="card" style="margin-bottom:0;">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Área</th><th>Responsable</th><th>Empleados</th>
                                        <th>Estado</th><th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="areasTableBody">${renderFilasAreas()}</tbody>
                            </table>
                        </div>

                        <!-- Formulario inline Registrar Área -->
                        <div style="border-top:1px solid var(--color-border);margin-top:16px;padding-top:16px;">
                            <h3 class="card-title" style="margin-bottom:12px;">Registrar nueva área</h3>
                            <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
                                <div style="flex:1;min-width:140px;">
                                    <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Nombre del área *</label>
                                    <input id="area_nombre" type="text" class="form-input" style="margin-top:4px;" placeholder="Ej. Marketing">
                                </div>
                                <div style="flex:1;min-width:140px;">
                                    <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Responsable</label>
                                    <input id="area_resp" type="text" class="form-input" style="margin-top:4px;" placeholder="Nombre del responsable">
                                </div>
                                <div style="flex:0 0 auto;">
                                    <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Empleados</label>
                                    <input id="area_emp" type="number" class="form-input" style="margin-top:4px;width:80px;" placeholder="0" min="0">
                                </div>
                                <button class="btn btn-primary" style="flex:0 0 auto;" onclick="registrarArea()">
                                    <i data-lucide="plus" style="width:14px;height:14px;"></i> Registrar Área
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Panel Estado de Áreas (derecha) -->
                    <div style="border:2px solid var(--color-primary);border-radius:12px;padding:24px;background:var(--color-white);">
                        <!-- Donut chart -->
                        <div style="display:flex;justify-content:center;margin-bottom:20px;">
                            <div style="width:140px;height:140px;position:relative;">
                                <svg id="areasDonut" viewBox="0 0 36 36" style="width:100%;height:100%;transform:rotate(-90deg);">
                                    ${buildDonutSegments()}
                                </svg>
                                <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;flex-direction:column;">
                                    <span id="areasTotal" style="font-size:1.5rem;font-weight:700;color:var(--color-text);">${st.total}</span>
                                    <span style="font-size:0.65rem;color:var(--color-muted);">\u00e1reas</span>
                                </div>
                            </div>
                        </div>

                        <h3 style="font-size:1rem;font-weight:700;color:var(--color-text);margin-bottom:16px;text-align:center;">Estado de Áreas</h3>

                        <!-- Desglose numérico (colores = badges exactos) -->
                        <div style="display:flex;flex-direction:column;gap:10px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="width:10px;height:10px;border-radius:50%;background:${ESTADO_COLOR['Activa']};display:inline-block;"></span>
                                <span style="font-size:0.9rem;">Activa:</span>
                                <span id="statActiva" style="font-weight:700;color:${ESTADO_COLOR['Activa']};margin-left:auto;transition:transform 0.2s;">${st.activa}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="width:10px;height:10px;border-radius:50%;background:${ESTADO_COLOR['En revisión']};display:inline-block;"></span>
                                <span style="font-size:0.9rem;">En revisión:</span>
                                <span id="statRevision" style="font-weight:700;color:${ESTADO_COLOR['En revisión']};margin-left:auto;transition:transform 0.2s;">${st.enRevision}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="width:10px;height:10px;border-radius:50%;background:${ESTADO_COLOR['Sin responsable']};display:inline-block;"></span>
                                <span style="font-size:0.9rem;">Sin responsable:</span>
                                <span id="statSinResp" style="font-weight:700;color:${ESTADO_COLOR['Sin responsable']};margin-left:auto;transition:transform 0.2s;">${st.sinResponsable}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            lucide.createIcons();

            // ── Toast helper ───────────────────────────────────────────
            window._areasToast = (msg) => {
                const t = document.getElementById('areasToast');
                const m = document.getElementById('areasToastMsg');
                if (!t || !m) return;
                m.textContent = msg; t.style.opacity = '1';
                setTimeout(() => t.style.opacity = '0', 3200);
            };

            // ── Update stats panel ───────────────────────────────────────
            window._refreshAreaStats = () => {
                const s = recalcAreas();
                // Numbers with pop animation
                const animate = (id, val) => {
                    const el = document.getElementById(id);
                    if (!el) return;
                    el.style.transform = 'scale(1.3)'; el.textContent = val;
                    setTimeout(() => el.style.transform = '', 200);
                };
                animate('statActiva',    s.activa);
                animate('statRevision',  s.enRevision);
                animate('statSinResp',   s.sinResponsable);
                const tot = document.getElementById('areasTotal');
                if (tot) { tot.style.transform='scale(1.2)'; tot.textContent=s.total; setTimeout(()=>tot.style.transform='',200); }
                // Rebuild donut
                const donut = document.getElementById('areasDonut');
                if (donut) donut.innerHTML = buildDonutSegments();
            };

            // ── Register new area ───────────────────────────────────────
            window.registrarArea = () => {
                const nombre = document.getElementById('area_nombre').value.trim();
                const resp   = document.getElementById('area_resp').value.trim();
                const emp    = parseInt(document.getElementById('area_emp').value) || 0;
                if (!nombre) { alert('El nombre del área es obligatorio.'); return; }

                const estado = resp ? 'Activa' : 'Sin responsable';
                const nueva = { id: window._areasNextId++, nombre, responsable: resp || '—', empleados: emp, estado };
                window._areas.push(nueva);

                // Append row to table
                const tbody = document.getElementById('areasTableBody');
                if (tbody) {
                    const tr = document.createElement('tr');
                    tr.id = `area-row-${nueva.id}`;
                    tr.style.cssText = 'background:#F0FDF4;transition:background 1s;';
                    tr.innerHTML = `
                        <td><strong>${nueva.nombre}</strong></td>
                        <td>${nueva.responsable}</td>
                        <td>${nueva.empleados}</td>
                        <td><span class="badge ${ESTADO_BADGE[nueva.estado]}">${nueva.estado}</span></td>
                        <td><button class="btn btn-outline" style="padding:4px 10px;font-size:0.8rem;" onclick="editarArea(${nueva.id})">Editar</button></td>
                    `;
                    tbody.appendChild(tr);
                    tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    setTimeout(() => tr.style.background = '', 1200);
                }

                // Reset form fields
                ['area_nombre','area_resp','area_emp'].forEach(id => {
                    const el = document.getElementById(id); if (el) el.value = '';
                });

                // Refresh stats + donut
                _refreshAreaStats();
                _areasToast(`✓ Área "${nueva.nombre}" registrada exitosamente`);
                lucide.createIcons();
            };

            // ── Editar / Eliminar área ──────────────────────────────────
            window.editarArea = (id) => {
                const a = window._areas.find(x => x.id === id);
                if (!a) return;
                openModal(`
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                        <i data-lucide="pencil" style="width:20px;height:20px;color:var(--color-primary);"></i>
                        <h2 style="font-size:1rem;">Editar área</h2>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
                        <div>
                            <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Nombre del área *</label>
                            <input id="edit_area_nombre" class="form-input" style="margin-top:4px;" value="${a.nombre}">
                        </div>
                        <div>
                            <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Responsable</label>
                            <input id="edit_area_resp" class="form-input" style="margin-top:4px;" value="${a.responsable === '—' ? '' : a.responsable}" placeholder="Sin responsable">
                        </div>
                        <div>
                            <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Empleados</label>
                            <input id="edit_area_emp" type="number" class="form-input" style="margin-top:4px;" value="${a.empleados}" min="0">
                        </div>
                        <div>
                            <label style="font-size:0.8rem;font-weight:500;color:var(--color-muted);">Estado</label>
                            <select id="edit_area_estado" class="form-input" style="margin-top:4px;">
                                <option ${a.estado==='Activa'?'selected':''}>Activa</option>
                                <option ${a.estado==='En revisión'?'selected':''}>En revisión</option>
                                <option ${a.estado==='Sin responsable'?'selected':''}>Sin responsable</option>
                            </select>
                        </div>
                    </div>
                    <!-- Zona de eliminación -->
                    <div style="background:#FFF0F0;border:1px solid #FECACA;border-radius:8px;padding:14px;margin-bottom:20px;">
                        <div style="font-size:0.8rem;color:var(--color-error);font-weight:600;margin-bottom:6px;">Zona de peligro</div>
                        <div style="font-size:0.8rem;color:var(--color-muted);margin-bottom:10px;">Esta acción eliminará permanentemente esta área del sistema.</div>
                        <button class="btn" style="background:#A60C14;color:white;border-color:#A60C14;padding:6px 14px;font-size:0.8rem;" onclick="eliminarArea(${id})">
                            <i data-lucide="trash-2" style="width:13px;height:13px;"></i> Eliminar área
                        </button>
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:10px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="guardarArea(${id})">Guardar cambios</button>
                    </div>
                `);
                lucide.createIcons();
            };

            window.guardarArea = (id) => {
                const a = window._areas.find(x => x.id === id);
                if (!a) return;
                const nombre = document.getElementById('edit_area_nombre').value.trim();
                const resp   = document.getElementById('edit_area_resp').value.trim();
                const emp    = parseInt(document.getElementById('edit_area_emp').value) || 0;
                const estado = document.getElementById('edit_area_estado').value;
                if (!nombre) { alert('El nombre del área es obligatorio.'); return; }
                a.nombre = nombre; a.responsable = resp || '—'; a.empleados = emp; a.estado = estado;
                // Update row
                const tr = document.getElementById('area-row-'+id);
                if (tr) {
                    tr.style.background = '#EEF0FF';
                    tr.innerHTML = `
                        <td><strong>${a.nombre}</strong></td>
                        <td>${a.responsable}</td>
                        <td>${a.empleados}</td>
                        <td><span class="badge ${ESTADO_BADGE[a.estado]}">${a.estado}</span></td>
                        <td><button class="btn btn-outline" style="padding:4px 10px;font-size:0.8rem;" onclick="editarArea(${id})">Editar</button></td>
                    `;
                    lucide.createIcons();
                    setTimeout(() => tr.style.background = '', 900);
                }
                _refreshAreaStats();
                closeModal();
                _areasToast(`✓ Área "${a.nombre}" actualizada`);
            };

            window.eliminarArea = (id) => {
                const idx = window._areas.findIndex(x => x.id === id);
                if (idx === -1) return;
                const nombre = window._areas[idx].nombre;
                window._areas.splice(idx, 1);
                const tr = document.getElementById('area-row-'+id);
                if (tr) { tr.style.opacity='0'; tr.style.transition='opacity 0.3s'; setTimeout(()=>tr.remove(),300); }
                setTimeout(() => _refreshAreaStats(), 350);
                closeModal();
                _areasToast(`✓ Área "${nombre}" eliminada`);
            };
        }


        // JEFE VIEWS
        else if (currentSidebarView === 'jefe_inicio') {
            // ── State for interactive chart and courses ──
            if (!window._jefeState) {
                window._jefeState = {
                    selectedLine: null,
                    tramites: [
                        { id:'contratos', icon:'check-circle', color:'var(--status-success)', label:'Contratos firmados', done:true,
                          info:{ Estado:'Completado', Area:'Todos los departamentos', Responsable:'Ana Martínez', Fecha:'25 jul 2026', Nota:'100% de empleados firmaron el contrato' } },
                        { id:'identificaciones', icon:'check-circle', color:'var(--status-success)', label:'Identificaciones validadas', done:true,
                          info:{ Estado:'Completado', Area:'RRHH', Responsable:'Ana Martínez', Fecha:'26 jul 2026', Nota:'Identificaciones archivadas en sistema' } },
                        { id:'correos', icon:'check-circle', color:'var(--status-success)', label:'Cuentas de correo creadas', done:true,
                          info:{ Estado:'Completado', Area:'TI', Responsable:'Carlos López', Fecha:'27 jul 2026', Nota:'Correos corporativos activos' } },
                        { id:'equipos', icon:'clock', color:'var(--status-warning)', label:'Asignación de equipos', done:false,
                          info:{ Estado:'Pendiente', Empleado:'Jesús Ramírez', Area:'TI', 'Equipo asignado':'Laptop Dell XPS 13', Responsable:'Carlos López', Fecha:'12 ago 2026' } },
                    ],
                    cap3Confirmed: false,
                };
            }
            const s = window._jefeState;

            const tramiteItems = s.tramites.map(t => `
                <li style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:8px;border-radius:8px;transition:background 0.15s;"
                    onmouseenter="this.style.background='var(--color-bg)'"
                    onmouseleave="this.style.background=''"
                    onclick="abrirTramiteInfo('${t.id}')">
                    <i data-lucide="${t.icon}" style="color:${t.color};width:18px;height:18px;flex-shrink:0;"></i>
                    <span${!t.done ? ' style="color:var(--color-muted);"' : ''}>${t.label}</span>
                    <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--color-muted);margin-left:auto;"></i>
                </li>
            `).join('');

            const cap3Badge  = s.cap3Confirmed ? '<span class="badge badge-green">Inscrito</span>' : '<span class="badge badge-yellow">Por confirmar</span>';
            const cap3Button = s.cap3Confirmed
                ? `<button class="btn btn-outline" style="margin-top:10px;padding:4px 12px;font-size:0.8rem;" onclick="verParticipantes('gf')">Ver participantes</button>`
                : `<button class="btn btn-primary" style="margin-top:10px;padding:4px 12px;font-size:0.8rem;" id="btnConfirmarGF" onclick="confirmarInscripcionGF()">Confirmar inscripción</button>`;

            mainContent.innerHTML = `
                <div class="page-header"><h1 class="page-title">Resumen del Dashboard</h1></div>

                <!-- Toast notification container -->
                <div id="dashToast" style="position:fixed;top:24px;right:24px;z-index:9999;transition:opacity 0.4s;opacity:0;pointer-events:none;"
                    class="card" style2="background:var(--color-primary);color:white;padding:12px 20px;border-radius:10px;font-size:0.875rem;">
                    <div style="display:flex;align-items:center;gap:10px;background:var(--color-primary);color:white;padding:12px 20px;border-radius:10px;">
                        <i data-lucide="check" style="width:16px;height:16px;"></i>
                        <span id="dashToastMsg"></span>
                    </div>
                </div>

                <div class="grid-2col">
                    <!-- LEFT COLUMN -->
                    <div>
                        <!-- Interactive Line Chart -->
                        <div class="card">
                            <h3 class="card-title" style="margin-bottom:8px;">Capacitaciones en Progreso</h3>

                            <!-- Leyenda interactiva -->
                            <div id="chartLegend" style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
                                <button id="leg-iso" onclick="selectLine('iso')" style="display:flex;align-items:center;gap:6px;font-size:0.82rem;background:none;border:none;cursor:pointer;padding:4px 10px;border-radius:20px;border:1.5px solid #1800DF;color:#1800DF;font-family:inherit;transition:all 0.2s;">
                                    <span style="width:14px;height:3px;background:#1800DF;display:inline-block;border-radius:2px;"></span> ISO 9001
                                </button>
                                <button id="leg-lid" onclick="selectLine('lid')" style="display:flex;align-items:center;gap:6px;font-size:0.82rem;background:none;border:none;cursor:pointer;padding:4px 10px;border-radius:20px;border:1.5px solid #4B8DF1;color:#4B8DF1;font-family:inherit;transition:all 0.2s;">
                                    <span style="width:14px;height:3px;background:#4B8DF1;display:inline-block;border-radius:2px;"></span> Liderazgo
                                </button>
                                <button id="leg-ofi" onclick="selectLine('ofi')" style="display:flex;align-items:center;gap:6px;font-size:0.82rem;background:none;border:none;cursor:pointer;padding:4px 10px;border-radius:20px;border:1.5px solid #0099FF;color:#0099FF;font-family:inherit;transition:all 0.2s;">
                                    <span style="width:14px;height:3px;background:#0099FF;display:inline-block;border-radius:2px;"></span> H. Ofimáticas
                                </button>
                                <button id="leg-fin" onclick="selectLine('fin')" style="display:flex;align-items:center;gap:6px;font-size:0.82rem;background:none;border:none;cursor:pointer;padding:4px 10px;border-radius:20px;border:1.5px solid #6B4CF5;color:#6B4CF5;font-family:inherit;transition:all 0.2s;">
                                    <span style="width:14px;height:3px;background:#6B4CF5;display:inline-block;border-radius:2px;"></span> G. Financieros
                                </button>
                            </div>

                            <!-- SVG Chart -->
                            <div style="height:160px;width:100%;border-bottom:1.5px solid var(--color-border);border-left:1.5px solid var(--color-border);position:relative;margin-bottom:28px;">
                                <svg id="lineChart" viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;overflow:visible;">
                                    <polyline id="line-iso" fill="none" stroke="#1800DF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                                        points="0,90 20,70 40,80 60,40 80,50 100,20" style="cursor:pointer;transition:stroke-opacity 0.2s,stroke-width 0.2s;"
                                        onclick="selectLine('iso')" onmouseenter="hoverLine('iso',true)" onmouseleave="hoverLine('iso',false)"/>
                                    <polyline id="line-lid" fill="none" stroke="#4B8DF1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                                        points="0,80 20,60 40,65 60,30 80,20 100,10" style="cursor:pointer;transition:stroke-opacity 0.2s,stroke-width 0.2s;"
                                        onclick="selectLine('lid')" onmouseenter="hoverLine('lid',true)" onmouseleave="hoverLine('lid',false)"/>
                                    <polyline id="line-ofi" fill="none" stroke="#0099FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                                        points="0,95 20,85 40,85 60,60 80,70 100,40" style="cursor:pointer;transition:stroke-opacity 0.2s,stroke-width 0.2s;"
                                        onclick="selectLine('ofi')" onmouseenter="hoverLine('ofi',true)" onmouseleave="hoverLine('ofi',false)"/>
                                    <polyline id="line-fin" fill="none" stroke="#6B4CF5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                                        points="0,100 20,90 40,70 60,80 80,50 100,30" style="cursor:pointer;transition:stroke-opacity 0.2s,stroke-width 0.2s;"
                                        onclick="selectLine('fin')" onmouseenter="hoverLine('fin',true)" onmouseleave="hoverLine('fin',false)"/>
                                </svg>
                                <div style="position:absolute;bottom:-22px;left:0;right:0;display:flex;justify-content:space-between;font-size:0.72rem;color:var(--color-muted);">
                                    <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
                                </div>
                            </div>

                            <!-- Detail panel (shows when a line is selected) -->
                            <div id="lineDetail" style="display:none;border-top:1px solid var(--color-border);padding-top:14px;animation:fadeIn 0.2s ease;">
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div>
                        <!-- Checklist de trámites -->
                        <div class="card">
                            <h3 class="card-title" style="margin-bottom:4px;">Checklist de trámites</h3>
                            <p style="font-size:0.78rem;color:var(--color-muted);margin-bottom:12px;">Haz clic en un trámite para ver detalles</p>
                            <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:2px;">
                                ${tramiteItems}
                            </ul>
                        </div>

                        <!-- Próximas capacitaciones -->
                        <div class="card">
                            <h3 class="card-title" style="margin-bottom:12px;">Próximas capacitaciones</h3>
                            <div style="display:flex;flex-direction:column;gap:12px;">

                                <!-- ISO 9001 -->
                                <div style="border:1px solid var(--color-border);border-radius:8px;padding:12px;">
                                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                                        <div>
                                            <div style="font-weight:600;font-size:0.875rem;">ISO 9001 — Mód. 3</div>
                                            <div style="font-size:0.78rem;color:var(--color-muted);margin-top:4px;">Lun 7 ago · 10:00 — Instructor: L. Torres</div>
                                        </div>
                                        <span class="badge badge-blue">Pendiente</span>
                                    </div>
                                    <button id="btnRemISO" class="btn btn-outline" style="margin-top:10px;padding:4px 12px;font-size:0.8rem;"
                                        onclick="enviarRecordatorio('btnRemISO','ISO 9001 - Mód. 3')">Enviar recordatorio</button>
                                </div>

                                <!-- Liderazgo -->
                                <div style="border:1px solid var(--color-border);border-radius:8px;padding:12px;">
                                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                                        <div>
                                            <div style="font-weight:600;font-size:0.875rem;">Liderazgo de equipos</div>
                                            <div style="font-size:0.78rem;color:var(--color-muted);margin-top:4px;">Mié 9 ago · 14:00 — Instructor: M. Ruiz</div>
                                        </div>
                                        <span class="badge badge-green">Inscrito</span>
                                    </div>
                                    <button class="btn btn-outline" style="margin-top:10px;padding:4px 12px;font-size:0.8rem;"
                                        onclick="verParticipantes('lid')">Ver participantes</button>
                                </div>

                                <!-- G. Financieros -->
                                <div style="border:1px solid var(--color-border);border-radius:8px;padding:12px;">
                                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                                        <div>
                                            <div style="font-weight:600;font-size:0.875rem;">G. Financieros — Evaluación</div>
                                            <div style="font-size:0.78rem;color:var(--color-muted);margin-top:4px;">Vie 11 ago · 09:00 — Instructor: A. Sánchez</div>
                                        </div>
                                        <span id="badgeGF" class="badge ${s.cap3Confirmed ? 'badge-green' : 'badge-yellow'}">${s.cap3Confirmed ? 'Inscrito' : 'Por confirmar'}</span>
                                    </div>
                                    <div id="cap3BtnArea" style="margin-top:10px;">${cap3Button}</div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            `;

            lucide.createIcons();

            // ── Chart interactions ────────────────────────────────────────
            const lineData = {
                iso: { nombre:'ISO 9001', color:'#1800DF', progreso:'72%', participantes:18, area:'Calidad', estado:'En progreso', proxSesion:'Lun 7 ago 10:00' },
                lid: { nombre:'Liderazgo de equipos', color:'#4B8DF1', progreso:'85%', participantes:12, area:'RRHH', estado:'Avanzado', proxSesion:'Mié 9 ago 14:00' },
                ofi: { nombre:'H. Ofimáticas', color:'#0099FF', progreso:'43%', participantes:9, area:'TI', estado:'Reprobado', proxSesion:'Por definir' },
                fin: { nombre:'G. Financieros', color:'#6B4CF5', progreso:'55%', participantes:14, area:'Finanzas', estado:'En espera', proxSesion:'Vie 11 ago 09:00' },
            };
            const allIds = ['iso','lid','ofi','fin'];

            window.hoverLine = (id, entering) => {
                if (s.selectedLine) return; // if one is selected, hover doesn't change anything
                const el = document.getElementById('line-'+id);
                if (!el) return;
                el.setAttribute('stroke-width', entering ? '4.5' : '3');
            };

            window.selectLine = (id) => {
                s.selectedLine = s.selectedLine === id ? null : id;
                allIds.forEach(lid2 => {
                    const el = document.getElementById('line-'+lid2);
                    const btn = document.getElementById('leg-'+lid2);
                    if (!el) return;
                    if (s.selectedLine === null) {
                        el.style.strokeOpacity = '1'; el.setAttribute('stroke-width','3');
                        if (btn) { btn.style.opacity='1'; btn.style.fontWeight=''; }
                    } else if (lid2 === s.selectedLine) {
                        el.style.strokeOpacity = '1'; el.setAttribute('stroke-width','5');
                        if (btn) { btn.style.opacity='1'; btn.style.fontWeight='700'; btn.style.background=lineData[lid2].color+'22'; }
                    } else {
                        el.style.strokeOpacity = '0.18'; el.setAttribute('stroke-width','2');
                        if (btn) { btn.style.opacity='0.4'; btn.style.fontWeight=''; btn.style.background=''; }
                    }
                });
                const detail = document.getElementById('lineDetail');
                if (!detail) return;
                if (!s.selectedLine) { detail.style.display='none'; return; }
                const d = lineData[s.selectedLine];
                detail.style.display = 'block';
                detail.innerHTML = `
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                        <span style="width:12px;height:12px;background:${d.color};border-radius:50%;display:inline-block;"></span>
                        <strong style="font-size:0.95rem;">${d.nombre}</strong>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.825rem;">
                        <div style="background:var(--color-bg);border-radius:6px;padding:8px;">
                            <div style="color:var(--color-muted);font-size:0.72rem;">PROGRESO</div>
                            <div style="font-weight:700;color:${d.color};font-size:1.1rem;">${d.progreso}</div>
                        </div>
                        <div style="background:var(--color-bg);border-radius:6px;padding:8px;">
                            <div style="color:var(--color-muted);font-size:0.72rem;">PARTICIPANTES</div>
                            <div style="font-weight:700;font-size:1.1rem;">${d.participantes}</div>
                        </div>
                        <div style="background:var(--color-bg);border-radius:6px;padding:8px;">
                            <div style="color:var(--color-muted);font-size:0.72rem;">\u00c1REA</div>
                            <div style="font-weight:600;">${d.area}</div>
                        </div>
                        <div style="background:var(--color-bg);border-radius:6px;padding:8px;">
                            <div style="color:var(--color-muted);font-size:0.72rem;">ESTADO</div>
                            <div style="font-weight:600;">${d.estado}</div>
                        </div>
                        <div style="background:var(--color-bg);border-radius:6px;padding:8px;grid-column:1/-1;">
                            <div style="color:var(--color-muted);font-size:0.72rem;">PR\u00d3XIMA SESI\u00d3N</div>
                            <div style="font-weight:600;">${d.proxSesion}</div>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            };

            // ── Checklist modal ───────────────────────────────────────────
            window.abrirTramiteInfo = (id) => {
                const t = s.tramites.find(x => x.id === id);
                if (!t) return;
                const rows = Object.entries(t.info).map(([k,v]) =>
                    `<tr><td style="font-weight:500;color:var(--color-muted);padding:8px 12px;white-space:nowrap;">${k}</td><td style="padding:8px 12px;">${v}</td></tr>`
                ).join('');
                const icon = t.done ? '#059669' : '#D97706';
                openModal(`
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                        <i data-lucide="${t.icon}" style="color:${icon};width:24px;height:24px;"></i>
                        <h2 style="color:var(--color-text);font-size:1.1rem;">${t.label}</h2>
                    </div>
                    <div class="table-container" style="margin-bottom:20px;">
                        <table><tbody>${rows}</tbody></table>
                    </div>
                    ${!t.done ? '<div style="background:#FFF8E8;border:1px solid #D97706;border-radius:8px;padding:12px;font-size:0.85rem;color:#92400E;margin-bottom:16px;"><strong>Pendiente:</strong> Este trámite aún no ha sido completado. Se requiere acción del responsable.</div>' : ''}
                    <div style="display:flex;justify-content:flex-end;gap:12px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                        <button class="btn btn-primary" onclick="closeModal()">Ver trámite</button>
                    </div>
                `);
                lucide.createIcons();
            };

            // ── Toast helper ──────────────────────────────────────────────
            window.showDashToast = (msg) => {
                const t = document.getElementById('dashToast');
                const m = document.getElementById('dashToastMsg');
                if (!t || !m) return;
                m.textContent = msg;
                t.style.opacity = '1';
                setTimeout(() => { t.style.opacity = '0'; }, 3000);
            };

            // ── Enviar recordatorio ───────────────────────────────────────
            window.enviarRecordatorio = (btnId, capNombre) => {
                const btn = document.getElementById(btnId);
                if (!btn || btn.disabled) return;
                btn.disabled = true;
                btn.textContent = '\u2713 Recordatorio enviado';
                btn.style.background = '#F0FDF4'; btn.style.borderColor = '#059669'; btn.style.color = '#059669';
                showDashToast(`Recordatorio enviado: ${capNombre}`);
                setTimeout(() => {
                    btn.disabled = false; btn.textContent = 'Enviar recordatorio';
                    btn.style.background=''; btn.style.borderColor=''; btn.style.color='';
                }, 5000);
            };

            // ── Ver participantes ─────────────────────────────────────────
            const participantesData = {
                lid: { nombre:'Liderazgo de equipos', lista:[
                    { nombre:'Ana Martínez', estado:'Inscrito' },
                    { nombre:'Carlos López', estado:'Inscrito' },
                    { nombre:'Sofía Ramírez', estado:'Inscrito' },
                    { nombre:'Luis Gómez', estado:'Pendiente' },
                ] },
                gf: { nombre:'G. Financieros — Evaluación', lista:[
                    { nombre:'Jesús Ramírez', estado:'Confirmado' },
                    { nombre:'María Torres', estado:'Confirmado' },
                    { nombre:'Pedro Sánchez', estado:'Pendiente' },
                ] },
            };

            window.verParticipantes = (capId) => {
                const d = participantesData[capId];
                if (!d) return;
                const filas = d.lista.map(p => {
                    const badge = p.estado === 'Inscrito' || p.estado === 'Confirmado'
                        ? 'badge-green' : 'badge-yellow';
                    return `<tr><td style="padding:8px 12px;">${p.nombre}</td><td style="padding:8px 12px;"><span class="badge ${badge}">${p.estado}</span></td></tr>`;
                }).join('');
                openModal(`
                    <h2 style="margin-bottom:4px;color:var(--color-primary);">${d.nombre}</h2>
                    <p style="font-size:0.85rem;color:var(--color-muted);margin-bottom:16px;">Total de participantes: <strong>${d.lista.length}</strong></p>
                    <div class="table-container" style="margin-bottom:20px;">
                        <table>
                            <thead><tr><th>Participante</th><th>Estado de inscripción</th></tr></thead>
                            <tbody>${filas}</tbody>
                        </table>
                    </div>
                    <div style="display:flex;justify-content:flex-end;">
                        <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                    </div>
                `);
            };

            // ── Confirmar inscripción G. Financieros ────────────────────
            window.confirmarInscripcionGF = () => {
                if (!confirm('\u00bfConfirmas tu inscripción a G. Financieros — Evaluación?')) return;
                s.cap3Confirmed = true;
                // Update badge
                const badge = document.getElementById('badgeGF');
                if (badge) { badge.className='badge badge-green'; badge.textContent='Inscrito'; }
                // Replace button
                const area = document.getElementById('cap3BtnArea');
                if (area) area.innerHTML = `<button class="btn btn-outline" style="margin-top:10px;padding:4px 12px;font-size:0.8rem;" onclick="verParticipantes('gf')">Ver participantes</button>`;
                showDashToast('\u2713 Inscripción confirmada a G. Financieros');
            };
        }
        else if (currentSidebarView === 'jefe_perfiles') {
            // Initialize persisted user data
            if (!window._perfiles) {
                window._perfiles = [
                    { id:1, nombre:'Hannah Montenegro', usuario:'hmontenegro', correo:'hannah@empresa.com', area:'TI',      rol:'Jefe', estado:'Activo',   fecha:'Hoy 19:51' },
                    { id:2, nombre:'Ana Martínez',      usuario:'amartinez',   correo:'ana@empresa.com',    area:'RRHH',    rol:'RRHH',  estado:'Activo',   fecha:'Hoy 19:52' },
                    { id:3, nombre:'Carlos López',       usuario:'clopez',      correo:'carlos@empresa.com', area:'TI',      rol:'TI',    estado:'Inactivo', fecha:'Hoy 19:52' },
                ];
                window._perfilesNextId = 4;
            }

            const renderFilas = (lista) => lista.map(p => {
                const badge = p.estado === 'Activo' ? 'badge-green' : 'badge-red';
                return `
                <tr id="fila-${p.id}">
                    <td>${p.id}</td>
                    <td><strong>${p.nombre}</strong><div style="font-size:0.75rem;color:var(--color-muted);">@${p.usuario}</div></td>
                    <td>${p.rol}</td>
                    <td><span class="badge ${badge}">${p.estado}</span></td>
                    <td>${p.fecha}</td>
                    <td>
                        <button class="btn btn-outline" style="padding:4px 10px;font-size:0.8rem;" onclick="editarPerfil(${p.id})">
                            <i data-lucide="edit" style="width:13px;height:13px;"></i> Editar
                        </button>
                    </td>
                </tr>`;
            }).join('');

            mainContent.innerHTML = `
                <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;">
                    <h1 class="page-title">Gestión de Perfiles</h1>
                    <button class="btn btn-primary" onclick="abrirNuevoPerfil()" style="display:flex;align-items:center;gap:6px;">
                        <i data-lucide="user-plus" style="width:16px;height:16px;"></i> + Nuevo perfil
                    </button>
                </div>

                <div class="card">
                    <!-- Buscador -->
                    <div style="margin-bottom:14px;position:relative;">
                        <i data-lucide="search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--color-muted);"></i>
                        <input id="buscarUsuario" type="text" class="form-input" style="padding-left:36px;" placeholder="Buscar usuario por nombre..."
                            oninput="filtrarPerfiles()">
                    </div>

                    <div class="table-container">
                        <table>
                            <thead><tr>
                                <th>ID</th><th>Nombre del usuario</th><th>Rol</th>
                                <th>Estado</th><th>Última modificación</th><th>Acciones</th>
                            </tr></thead>
                            <tbody id="tablaPerfiles">${renderFilas(window._perfiles)}</tbody>
                        </table>
                    </div>
                </div>
            `;

            lucide.createIcons();

            // ── Filtrar en tiempo real ────────────────────────────────────
            window.filtrarPerfiles = () => {
                const q = document.getElementById('buscarUsuario').value.toLowerCase();
                const lista = q ? window._perfiles.filter(p => p.nombre.toLowerCase().includes(q)) : window._perfiles;
                const tbody = document.getElementById('tablaPerfiles');
                if (tbody) { tbody.innerHTML = renderFilas(lista); lucide.createIcons(); }
            };

            // ── Editar perfil ─────────────────────────────────────────────
            window.editarPerfil = (id) => {
                const p = window._perfiles.find(x => x.id === id);
                if (!p) return;
                openModal(`
                    <h2 style="margin-bottom:20px;color:var(--color-primary);">Editar perfil: ${p.nombre}</h2>
                    <div class="form-grid">
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Nombre completo</label>
                            <input id="ep_nombre" type="text" class="form-input" style="margin-top:6px;" value="${p.nombre}">
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Usuario</label>
                            <input id="ep_usuario" type="text" class="form-input" style="margin-top:6px;" value="${p.usuario}">
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Correo electrónico</label>
                            <input id="ep_correo" type="email" class="form-input" style="margin-top:6px;" value="${p.correo}">
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Área</label>
                            <select id="ep_area" class="form-input" style="margin-top:6px;">
                                <option value="TI" ${p.area==='TI'?'selected':''}>TI</option>
                                <option value="RRHH" ${p.area==='RRHH'?'selected':''}>RRHH</option>
                                <option value="Finanzas" ${p.area==='Finanzas'?'selected':''}>Finanzas</option>
                                <option value="Legal" ${p.area==='Legal'?'selected':''}>Legal</option>
                                <option value="Diseño" ${p.area==='Diseño'?'selected':''}>Diseño</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Rol</label>
                            <select id="ep_rol" class="form-input" style="margin-top:6px;">
                                <option value="Jefe" ${p.rol==='Jefe'?'selected':''}>Jefe</option>
                                <option value="RRHH" ${p.rol==='RRHH'?'selected':''}>RRHH</option>
                                <option value="TI" ${p.rol==='TI'?'selected':''}>TI</option>
                                <option value="Empleado" ${p.rol==='Empleado'?'selected':''}>Empleado</option>
                                <option value="Admin" ${p.rol==='Admin'?'selected':''}>Admin</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Estado</label>
                            <select id="ep_estado" class="form-input" style="margin-top:6px;">
                                <option value="Activo" ${p.estado==='Activo'?'selected':''}>\ud83d\udfe2 Activo</option>
                                <option value="Inactivo" ${p.estado==='Inactivo'?'selected':''}>\ud83d\udd34 Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="guardarPerfil(${id})">Guardar cambios</button>
                    </div>
                `);
            };

            window.guardarPerfil = (id) => {
                const p = window._perfiles.find(x => x.id === id);
                if (!p) return;
                p.nombre  = document.getElementById('ep_nombre').value  || p.nombre;
                p.usuario = document.getElementById('ep_usuario').value || p.usuario;
                p.correo  = document.getElementById('ep_correo').value  || p.correo;
                p.area    = document.getElementById('ep_area').value;
                p.rol     = document.getElementById('ep_rol').value;
                p.estado  = document.getElementById('ep_estado').value;
                const hoy = new Date();
                p.fecha = `Hoy ${hoy.getHours()}:${String(hoy.getMinutes()).padStart(2,'0')}`;
                closeModal();
                navigateTo('jefe_perfiles');
            };

            // ── Nuevo perfil ──────────────────────────────────────────────
            window.abrirNuevoPerfil = () => {
                openModal(`
                    <h2 style="margin-bottom:20px;color:var(--color-primary);">Crear nuevo perfil</h2>
                    <div class="form-grid">
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Nombre completo</label>
                            <input id="np_nombre" type="text" class="form-input" style="margin-top:6px;" placeholder="Hannah Montenegro">
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Nombre de usuario</label>
                            <input id="np_usuario" type="text" class="form-input" style="margin-top:6px;" placeholder="hmontenegro">
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Correo electrónico</label>
                            <input id="np_correo" type="email" class="form-input" style="margin-top:6px;" placeholder="hannah@empresa.com">
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Área</label>
                            <select id="np_area" class="form-input" style="margin-top:6px;">
                                <option value="">Seleccionar área</option>
                                <option>TI</option><option>RRHH</option><option>Finanzas</option>
                                <option>Legal</option><option>Diseño</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Rol</label>
                            <select id="np_rol" class="form-input" style="margin-top:6px;">
                                <option value="">Seleccionar rol</option>
                                <option>Jefe</option><option>RRHH</option><option>TI</option>
                                <option>Empleado</option><option>Admin</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-weight:500;font-size:0.875rem;">Estado</label>
                            <select id="np_estado" class="form-input" style="margin-top:6px;">
                                <option value="Activo" selected>\ud83d\udfe2 Activo</option>
                                <option value="Inactivo">\ud83d\udd34 Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="crearPerfil()">Crear perfil</button>
                    </div>
                `);
            };

            window.crearPerfil = () => {
                const nombre  = document.getElementById('np_nombre').value.trim();
                const usuario = document.getElementById('np_usuario').value.trim();
                const correo  = document.getElementById('np_correo').value.trim();
                const area    = document.getElementById('np_area').value;
                const rol     = document.getElementById('np_rol').value;
                const estado  = document.getElementById('np_estado').value;
                if (!nombre || !usuario || !correo || !area || !rol) {
                    alert('Por favor completa todos los campos.');
                    return;
                }
                const hoy = new Date();
                window._perfiles.push({
                    id: window._perfilesNextId++,
                    nombre, usuario, correo, area, rol, estado,
                    fecha: `Hoy ${hoy.getHours()}:${String(hoy.getMinutes()).padStart(2,'0')}`
                });
                closeModal();
                navigateTo('jefe_perfiles');
            };
        }
        else if (currentSidebarView === 'jefe_reportes') {
            mainContent.innerHTML = `
                <div class="page-header"><h1 class="page-title">Gestión de Reportes</h1></div>
                <div class="card">
                    <div class="table-container">
                        <table>
                            <thead><tr><th>#</th><th>Nombre del reporte</th><th>Descripción</th><th>Última generación</th><th>Acciones</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td>1</td><td><strong>Usuarios por rol</strong></td>
                                    <td>Resumen de usuarios categorizados por rol</td><td>6 ago · 10:00</td>
                                    <td style="display:flex;gap:8px;">
                                        <button class="icon-btn" title="Descargar" onclick="downloadReport(1)"><i data-lucide="download"></i></button>
                                        <button class="icon-btn" title="Visualizar" onclick="openReport(1)"><i data-lucide="eye"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>2</td><td><strong>Capacitaciones por área</strong></td>
                                    <td>Lista de capacitaciones asignadas por área</td><td>7 ago · 21:00</td>
                                    <td style="display:flex;gap:8px;">
                                        <button class="icon-btn" title="Descargar" onclick="downloadReport(2)"><i data-lucide="download"></i></button>
                                        <button class="icon-btn" title="Visualizar" onclick="openReport(2)"><i data-lucide="eye"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>3</td><td><strong>Estado de procesos</strong></td>
                                    <td>Reporte general del estado de los procesos del sistema</td><td>4 ago · 10:00</td>
                                    <td style="display:flex;gap:8px;">
                                        <button class="icon-btn" title="Descargar" onclick="downloadReport(3)"><i data-lucide="download"></i></button>
                                        <button class="icon-btn" title="Visualizar" onclick="openReport(3)"><i data-lucide="eye"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>4</td><td><strong>Permisos asignados</strong></td>
                                    <td>Detalle de los permisos asignados por usuario</td><td>5 ago · 14:00</td>
                                    <td style="display:flex;gap:8px;">
                                        <button class="icon-btn" title="Descargar" onclick="downloadReport(4)"><i data-lucide="download"></i></button>
                                        <button class="icon-btn" title="Visualizar" onclick="openReport(4)"><i data-lucide="eye"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            lucide.createIcons();

            // ── Report data by ID ──────────────────────────────────────────
            const reportData = {
                1: {
                    titulo: 'Reporte: Usuarios por rol',
                    fecha: '6 ago 2026, 10:00',
                    html: `
                        <table>
                            <thead><tr><th>Nombre completo</th><th>Usuario</th><th>Rol</th><th>Último acceso</th><th>Estado</th></tr></thead>
                            <tbody>
                                <tr><td>Hannah Montenegro</td><td>hmontenegro</td><td>Jefe</td><td>Hoy 19:51</td><td><span class="badge badge-green">Activo</span></td></tr>
                                <tr><td>Ana Martínez</td><td>amartinez</td><td>RRHH</td><td>Hoy 19:52</td><td><span class="badge badge-green">Activo</span></td></tr>
                                <tr><td>Carlos López</td><td>clopez</td><td>TI</td><td>Hoy 19:52</td><td><span class="badge badge-red">Inactivo</span></td></tr>
                                <tr><td>Sofía Ramírez</td><td>sramirez</td><td>Diseño</td><td>Ayer 14:30</td><td><span class="badge badge-green">Activo</span></td></tr>
                            </tbody>
                        </table>`,
                    resumen: null,
                },
                2: {
                    titulo: 'Reporte: Capacitaciones por área',
                    fecha: '7 ago 2026, 21:00',
                    html: `
                        <table>
                            <thead><tr><th>Capacitación</th><th>Área</th><th>Responsable</th><th>Fecha</th><th>Participantes</th><th>Estado</th></tr></thead>
                            <tbody>
                                <tr><td>ISO 9001</td><td>Calidad</td><td>L. Torres</td><td>7 ago 2026</td><td>18</td><td><span class="badge badge-blue">En progreso</span></td></tr>
                                <tr><td>Liderazgo de equipos</td><td>RRHH</td><td>M. Ruiz</td><td>9 ago 2026</td><td>12</td><td><span class="badge badge-green">Avanzado</span></td></tr>
                                <tr><td>H. Ofimáticas</td><td>TI</td><td>A. Sánchez</td><td>11 ago 2026</td><td>9</td><td><span class="badge badge-red">Reprobado</span></td></tr>
                                <tr><td>G. Financieros</td><td>Finanzas</td><td>A. Sánchez</td><td>11 ago 2026</td><td>14</td><td><span class="badge badge-yellow">En espera</span></td></tr>
                            </tbody>
                        </table>`,
                    resumen: null,
                },
                3: {
                    titulo: 'Reporte: Estado de procesos',
                    fecha: '4 ago 2026, 10:00',
                    html: `
                        <table>
                            <thead><tr><th>Proceso</th><th>Área</th><th>Responsable</th><th>Fecha de inicio</th><th>Estado</th><th>Actualizado</th><th>Observaciones</th></tr></thead>
                            <tbody>
                                <tr><td>Alta de empleado nuevo</td><td>RRHH</td><td>Ana Martínez</td><td>01 ago 2026</td><td><span class="badge badge-green">✓ Aprobado</span></td><td>01 ago</td><td>Proceso completado sin incidencias</td></tr>
                                <tr><td>Asignación de permisos TI</td><td>TI</td><td>Carlos López</td><td>02 ago 2026</td><td><span class="badge badge-yellow">⏳ Pendiente</span></td><td>02 ago</td><td>Esperando firma del jefe</td></tr>
                                <tr><td>Revisión de contrato</td><td>Legal</td><td>Sofía Ramírez</td><td>03 ago 2026</td><td><span class="badge badge-yellow">⏳ Pendiente</span></td><td>03 ago</td><td>Revisado por Legal, pendiente de jefe</td></tr>
                                <tr><td>Acceso a sistema ERP</td><td>Finanzas</td><td>Luis Gómez</td><td>04 ago 2026</td><td><span class="badge badge-red">✗ Rechazado</span></td><td>04 ago</td><td>Permisos insuficientes detectados</td></tr>
                                <tr><td>Creación de perfil RRHH</td><td>RRHH</td><td>Ana Martínez</td><td>04 ago 2026</td><td><span class="badge badge-yellow">⏳ Pendiente</span></td><td>04 ago</td><td>En revisión de área</td></tr>
                            </tbody>
                        </table>`,
                    resumen: { activos: 7, pendientes: 3, aprobados: 12, rechazados: 1 },
                },
                4: {
                    titulo: 'Reporte: Permisos asignados',
                    fecha: '5 ago 2026, 14:00',
                    html: `
                        <table>
                            <thead><tr><th>Usuario</th><th>Rol</th><th>Área</th><th>Permiso asignado</th><th>Nivel de acceso</th><th>Estado</th><th>Fecha de asignación</th></tr></thead>
                            <tbody>
                                <tr><td>Hannah Montenegro</td><td>Jefe</td><td>TI</td><td>Acceso total</td><td>Administrador</td><td><span class="badge badge-green">Activo</span></td><td>01 ago 2026</td></tr>
                                <tr><td>Ana Martínez</td><td>RRHH</td><td>RRHH</td><td>Gestión de personal</td><td>Editor</td><td><span class="badge badge-green">Activo</span></td><td>01 ago 2026</td></tr>
                                <tr><td>Carlos López</td><td>TI</td><td>TI</td><td>Acceso a sistemas</td><td>Técnico</td><td><span class="badge badge-red">Inactivo</span></td><td>02 ago 2026</td></tr>
                                <tr><td>Luis Gómez</td><td>Empleado</td><td>Finanzas</td><td>Acceso a ERP</td><td>Solo lectura</td><td><span class="badge badge-yellow">Pendiente</span></td><td>04 ago 2026</td></tr>
                            </tbody>
                        </table>`,
                    resumen: null,
                },
            };

            window.openReport = (id) => {
                const r = reportData[id];
                if (!r) return;
                const resumenHtml = r.resumen ? `
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
                        <div style="background:#EEF0FF;border-radius:8px;padding:12px;text-align:center;">
                            <div style="font-size:1.5rem;font-weight:700;color:var(--color-primary);">${r.resumen.activos}</div>
                            <div style="font-size:0.75rem;color:var(--color-muted);">Activos</div>
                        </div>
                        <div style="background:#FFF8E8;border-radius:8px;padding:12px;text-align:center;">
                            <div style="font-size:1.5rem;font-weight:700;color:#D97706;">${r.resumen.pendientes}</div>
                            <div style="font-size:0.75rem;color:var(--color-muted);">Pendientes</div>
                        </div>
                        <div style="background:#F0FDF4;border-radius:8px;padding:12px;text-align:center;">
                            <div style="font-size:1.5rem;font-weight:700;color:#059669;">${r.resumen.aprobados}</div>
                            <div style="font-size:0.75rem;color:var(--color-muted);">Aprobados</div>
                        </div>
                        <div style="background:#FFF0F0;border-radius:8px;padding:12px;text-align:center;">
                            <div style="font-size:1.5rem;font-weight:700;color:var(--color-error);">${r.resumen.rechazados}</div>
                            <div style="font-size:0.75rem;color:var(--color-muted);">Rechazados</div>
                        </div>
                    </div>` : '';
                openModal(`
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
                        <h2 style="color:var(--color-primary);">${r.titulo}</h2>
                        <span style="font-size:0.78rem;color:var(--color-muted);white-space:nowrap;margin-left:16px;">${r.fecha}</span>
                    </div>
                    <hr style="border:none;border-top:1px solid var(--color-border);margin:12px 0 16px;">
                    ${resumenHtml}
                    <div class="table-container" style="margin-bottom:20px;">${r.html}</div>
                    <div style="display:flex;justify-content:flex-end;gap:12px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                        <button class="btn btn-primary" onclick="downloadReport(${id});">
                            <i data-lucide="download" style="width:14px;height:14px;"></i> Descargar reporte
                        </button>
                    </div>
                `);
                lucide.createIcons();
            };

            window.downloadReport = (id) => {
                const r = reportData[id];
                if (!r) return;
                // Generate plain-text CSV-like content for download
                const blob = new Blob(
                    [`${r.titulo}\nGenerado: ${r.fecha}\n\n[Ver reporte en el sistema All Aboard]`],
                    { type: 'text/plain;charset=utf-8' }
                );
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${r.titulo.replace(/[^a-zA-Z0-9]/g,'_')}.txt`;
                a.click();
                URL.revokeObjectURL(a.href);
            };
        }
        else if (currentSidebarView === 'jefe_permisos') {
            // ── Reactive process data store ───────────────────────────────
            if (!window._procesos) {
                window._procesos = [
                    { id:1, nombre:'Alta de empleado nuevo',     area:'RRHH',     responsable:'Ana Martínez',  fecha:'01 ago 2026', estado:'Aprobado',
                      descripcion:'Alta formal de nuevo empleado en el sistema. Incluye configuración de accesos, correo y perfil.',
                      permisos:'Acceso a portal de RRHH, creación de credenciales corporativas.',
                      historial:[
                          { fecha:'28 jul 2026', accion:'Proceso iniciado por RRHH' },
                          { fecha:'30 jul 2026', accion:'Documentación verificada' },
                          { fecha:'01 ago 2026', accion:'Aprobado por Jefe' },
                      ], motivoRechazo: null },
                    { id:2, nombre:'Asignación de permisos TI', area:'TI',       responsable:'Carlos López',  fecha:'02 ago 2026', estado:'Pendiente',
                      descripcion:'Solicitud de acceso elevado a sistemas de infraestructura y red corporativa.',
                      permisos:'Acceso a servidores, VPN y herramientas de monitoreo.',
                      historial:[
                          { fecha:'02 ago 2026', accion:'Solicitud creada por TI' },
                          { fecha:'02 ago 2026', accion:'En revisión de Jefe' },
                      ], motivoRechazo: null },
                    { id:3, nombre:'Revisión de contrato',       area:'Legal',    responsable:'Sofía Ramírez', fecha:'03 ago 2026', estado:'Pendiente',
                      descripcion:'Revisión y actualización de contrato de servicios con proveedor externo.',
                      permisos:'Acceso a repositorio de documentos legales y sistema de firma digital.',
                      historial:[
                          { fecha:'03 ago 2026', accion:'Enviado a revisión por Legal' },
                          { fecha:'03 ago 2026', accion:'Documentos adjuntados' },
                      ], motivoRechazo: null },
                    { id:4, nombre:'Acceso a sistema ERP',        area:'Finanzas', responsable:'Luis Gómez',    fecha:'04 ago 2026', estado:'Rechazado',
                      descripcion:'Solicitud de acceso al módulo financiero del ERP corporativo para generación de reportes.',
                      permisos:'Lectura de módulos de contabilidad, nómina y presupuesto.',
                      historial:[
                          { fecha:'04 ago 2026', accion:'Solicitud creada por Finanzas' },
                          { fecha:'04 ago 2026', accion:'Rechazado: permisos insuficientes detectados' },
                      ], motivoRechazo: 'Permisos insuficientes detectados en la solicitud. Se requiere validación adicional del área de seguridad.' },
                    { id:5, nombre:'Creación de perfil RRHH',    area:'RRHH',     responsable:'Ana Martínez',  fecha:'04 ago 2026', estado:'Pendiente',
                      descripcion:'Creación de nuevo perfil de acceso para personal de Recursos Humanos.',
                      permisos:'Acceso a nómina, control de asistencia y portal de capacitaciones.',
                      historial:[
                          { fecha:'04 ago 2026', accion:'Proceso iniciado' },
                          { fecha:'04 ago 2026', accion:'En revisión de área' },
                      ], motivoRechazo: null },
                ];
            }

            // ── Helpers ──────────────────────────────────────────────────
            const estadoBadge = (e) => {
                if (e === 'Aprobado') return `<span class="badge badge-green">✓ Aprobado</span>`;
                if (e === 'Pendiente') return `<span class="badge badge-yellow">⏳ Pendiente</span>`;
                if (e === 'Rechazado') return `<span class="badge badge-red">✗ Rechazado</span>`;
                return `<span class="badge">${e}</span>`;
            };
            const estadoAccion = (p) => {
                if (p.estado === 'Aprobado')  return `<button class="btn btn-outline" style="padding:4px 10px;font-size:0.8rem;" onclick="verDetalleProceso(${p.id})">Ver detalle</button>`;
                if (p.estado === 'Pendiente') return `<button class="btn btn-primary" style="padding:4px 10px;font-size:0.8rem;transition:transform 0.15s;" onmouseenter="this.style.transform='scale(1.04)'" onmouseleave="this.style.transform=''" onclick="aprobarProceso(${p.id})">Aprobar</button>`;
                if (p.estado === 'Rechazado') return `<button class="btn btn-outline" style="padding:4px 10px;font-size:0.8rem;" onclick="reabrirProceso(${p.id})">Reabrir</button>`;
                return '';
            };

            const recalcStats = () => ({
                activos:    window._procesos.length,
                pendientes: window._procesos.filter(p => p.estado === 'Pendiente').length,
                aprobados:  window._procesos.filter(p => p.estado === 'Aprobado').length,
                rechazados: window._procesos.filter(p => p.estado === 'Rechazado').length,
            });

            const renderTabla = (lista) => lista.map(p => `
                <tr id="proc-row-${p.id}" style="transition:background 0.3s;">
                    <td>${p.id}</td>
                    <td><strong>${p.nombre}</strong><div style="font-size:0.75rem;color:var(--color-muted);">${p.area}</div></td>
                    <td>${p.responsable}</td>
                    <td>${p.fecha}</td>
                    <td>${estadoBadge(p.estado)}</td>
                    <td>${estadoAccion(p)}</td>
                </tr>`).join('');

            let filtroActivo = null;
            const listaVisible = () => filtroActivo
                ? window._procesos.filter(p => p.estado === filtroActivo)
                : window._procesos;

            const stats = recalcStats();
            const cardStyle = `style="cursor:pointer;transition:transform 0.18s,box-shadow 0.18s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'" onmouseleave="this.style.transform='';this.style.boxShadow=''" `;

            mainContent.innerHTML = `
                <!-- Toast -->
                <div id="procToast" style="position:fixed;top:24px;right:24px;z-index:9999;opacity:0;pointer-events:none;transition:opacity 0.4s;">
                    <div style="background:var(--color-primary);color:white;padding:12px 20px;border-radius:10px;display:flex;align-items:center;gap:10px;font-size:0.875rem;box-shadow:0 4px 16px rgba(0,0,0,0.18);">
                        <i data-lucide="check" style="width:16px;height:16px;"></i>
                        <span id="procToastMsg"></span>
                    </div>
                </div>

                <div class="page-header">
                    <h1 class="page-title">Estado de Procesos</h1>
                    <p class="page-subtitle">Revisa el estado actual de los procesos y permisos del sistema.</p>
                </div>

                <!-- KPI Cards -->
                <div class="grid-2col-even" style="margin-bottom:24px;">
                    <div class="card" id="kpiActivos" ${cardStyle} style="border-left:4px solid var(--color-primary);cursor:pointer;transition:transform 0.18s,box-shadow 0.18s;" onclick="filtrarProcesos(null)">
                        <h3 class="card-title"><i data-lucide="activity"></i> Procesos activos</h3>
                        <p id="numActivos" style="font-size:2.2rem;font-weight:700;color:var(--color-primary);margin:8px 0;transition:all 0.3s;">${stats.activos}</p>
                        <p class="text-muted">Haz clic para ver todos</p>
                    </div>
                    <div class="card" id="kpiPendientes" ${cardStyle} style="border-left:4px solid var(--status-warning);cursor:pointer;transition:transform 0.18s,box-shadow 0.18s;" onclick="filtrarProcesos('Pendiente')">
                        <h3 class="card-title"><i data-lucide="clock"></i> Pendientes de aprobación</h3>
                        <p id="numPendientes" style="font-size:2.2rem;font-weight:700;color:var(--status-warning);margin:8px 0;transition:all 0.3s;">${stats.pendientes}</p>
                        <p class="text-muted">Requieren revisión del jefe</p>
                    </div>
                    <div class="card" id="kpiAprobados" ${cardStyle} style="border-left:4px solid var(--status-success);cursor:pointer;transition:transform 0.18s,box-shadow 0.18s;" onclick="filtrarProcesos('Aprobado')">
                        <h3 class="card-title"><i data-lucide="check-circle"></i> Aprobados este mes</h3>
                        <p id="numAprobados" style="font-size:2.2rem;font-weight:700;color:var(--status-success);margin:8px 0;transition:all 0.3s;">${stats.aprobados}</p>
                        <p class="text-muted">Desde el 1 de agosto</p>
                    </div>
                    <div class="card" id="kpiRechazados" ${cardStyle} style="border-left:4px solid var(--color-error);cursor:pointer;transition:transform 0.18s,box-shadow 0.18s;" onclick="filtrarProcesos('Rechazado')">
                        <h3 class="card-title"><i data-lucide="x-circle"></i> Rechazados</h3>
                        <p id="numRechazados" style="font-size:2.2rem;font-weight:700;color:var(--color-error);margin:8px 0;transition:all 0.3s;">${stats.rechazados}</p>
                        <p class="text-muted">Requiere registro nuevo</p>
                    </div>
                </div>

                <!-- Process table -->
                <div class="card">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                        <h3 class="card-title" style="margin:0;">Detalle de Procesos</h3>
                        <span id="filtroLabel" style="font-size:0.8rem;color:var(--color-muted);"></span>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead><tr><th>#</th><th>Proceso</th><th>Responsable</th><th>Fecha de inicio</th><th>Estado</th><th>Acción</th></tr></thead>
                            <tbody id="tablaProc">${renderTabla(listaVisible())}</tbody>
                        </table>
                    </div>
                </div>
            `;

            lucide.createIcons();

            // ── Toast helper ────────────────────────────────────────────
            window.procToast = (msg) => {
                const t = document.getElementById('procToast');
                const m = document.getElementById('procToastMsg');
                if (!t || !m) return;
                m.textContent = msg; t.style.opacity='1';
                setTimeout(() => t.style.opacity='0', 3000);
            };

            // ── Update KPI numbers ──────────────────────────────────────
            window.refreshStats = () => {
                const st = recalcStats();
                ['Activos','Pendientes','Aprobados','Rechazados'].forEach(k => {
                    const el = document.getElementById('num'+k);
                    if (el) { el.style.transform='scale(1.2)'; el.textContent=st[k.toLowerCase()]; setTimeout(()=>el.style.transform='',200); }
                });
            };

            // ── Filter table by estado ──────────────────────────────────
            window.filtrarProcesos = (estado) => {
                filtroActivo = estado;
                const tbody = document.getElementById('tablaProc');
                const lbl   = document.getElementById('filtroLabel');
                const lista = estado ? window._procesos.filter(p => p.estado === estado) : window._procesos;
                if (tbody) { tbody.innerHTML = renderTabla(lista); lucide.createIcons(); }
                if (lbl)   lbl.textContent = estado ? `Mostrando: ${estado}` : '';
                // Highlight active card
                const map = { null:'kpiActivos', Pendiente:'kpiPendientes', Aprobado:'kpiAprobados', Rechazado:'kpiRechazados' };
                Object.values(map).forEach(cid => {
                    const c = document.getElementById(cid);
                    if (c) c.style.outline = '';
                });
                const active = document.getElementById(map[estado]);
                if (active) active.style.outline = '2.5px solid var(--color-primary)';
            };

            // ── Ver detalle modal ─────────────────────────────────────────
            window.verDetalleProceso = (id) => {
                const p = window._procesos.find(x => x.id === id);
                if (!p) return;
                const hist = p.historial.map(h =>
                    `<tr><td style="padding:8px 12px;color:var(--color-muted);white-space:nowrap;">${h.fecha}</td><td style="padding:8px 12px;">${h.accion}</td></tr>`
                ).join('');
                openModal(`
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                        <i data-lucide="file-text" style="width:24px;height:24px;color:var(--color-primary);"></i>
                        <h2 style="color:var(--color-text);font-size:1.1rem;">${p.nombre}</h2>
                        <span style="margin-left:auto;">${estadoBadge(p.estado)}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
                        <div style="background:var(--color-bg);border-radius:8px;padding:12px;">
                            <div style="font-size:0.72rem;color:var(--color-muted);margin-bottom:4px;">ÁREA</div>
                            <div style="font-weight:600;">${p.area}</div>
                        </div>
                        <div style="background:var(--color-bg);border-radius:8px;padding:12px;">
                            <div style="font-size:0.72rem;color:var(--color-muted);margin-bottom:4px;">RESPONSABLE</div>
                            <div style="font-weight:600;">${p.responsable}</div>
                        </div>
                        <div style="background:var(--color-bg);border-radius:8px;padding:12px;">
                            <div style="font-size:0.72rem;color:var(--color-muted);margin-bottom:4px;">FECHA DE INICIO</div>
                            <div style="font-weight:600;">${p.fecha}</div>
                        </div>
                        <div style="background:var(--color-bg);border-radius:8px;padding:12px;">
                            <div style="font-size:0.72rem;color:var(--color-muted);margin-bottom:4px;">ESTADO ACTUAL</div>
                            <div>${estadoBadge(p.estado)}</div>
                        </div>
                        <div style="background:var(--color-bg);border-radius:8px;padding:12px;grid-column:1/-1;">
                            <div style="font-size:0.72rem;color:var(--color-muted);margin-bottom:4px;">DESCRIPCIÓN</div>
                            <div style="font-size:0.875rem;">${p.descripcion}</div>
                        </div>
                        <div style="background:var(--color-bg);border-radius:8px;padding:12px;grid-column:1/-1;">
                            <div style="font-size:0.72rem;color:var(--color-muted);margin-bottom:4px;">PERMISOS RELACIONADOS</div>
                            <div style="font-size:0.875rem;">${p.permisos}</div>
                        </div>
                    </div>
                    <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:10px;">Historial del proceso</h3>
                    <div class="table-container" style="margin-bottom:20px;">
                        <table><tbody>${hist}</tbody></table>
                    </div>
                    <div style="display:flex;justify-content:flex-end;">
                        <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                    </div>
                `);
                lucide.createIcons();
            };

            // ── Aprobar proceso ───────────────────────────────────────────
            window.aprobarProceso = (id) => {
                const p = window._procesos.find(x => x.id === id);
                if (!p) return;
                openModal(`
                    <div style="text-align:center;padding:8px 0;">
                        <i data-lucide="shield-check" style="width:48px;height:48px;color:var(--status-success);margin-bottom:12px;"></i>
                        <h2 style="margin-bottom:8px;">¿Aprobar este proceso?</h2>
                        <p style="color:var(--color-muted);margin-bottom:20px;font-size:0.9rem;">Esta acción cambiará el estado del proceso a <strong>Aprobado</strong>.</p>
                    </div>
                    <div style="background:var(--color-bg);border-radius:10px;padding:16px;margin-bottom:24px;">
                        <div style="display:flex;flex-direction:column;gap:8px;font-size:0.875rem;">
                            <div><span style="color:var(--color-muted);">Proceso:</span> <strong>${p.nombre}</strong></div>
                            <div><span style="color:var(--color-muted);">Responsable:</span> ${p.responsable}</div>
                            <div><span style="color:var(--color-muted);">Área:</span> ${p.area}</div>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:12px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button class="btn btn-primary" style="background:var(--status-success);border-color:var(--status-success);" onclick="confirmarAprobacion(${id})"><i data-lucide="check" style="width:14px;height:14px;"></i> Confirmar aprobación</button>
                    </div>
                `);
                lucide.createIcons();
            };

            window.confirmarAprobacion = (id) => {
                const p = window._procesos.find(x => x.id === id);
                if (!p) return;
                const hoy = new Date();
                const fechaStr = `${hoy.getDate()} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][hoy.getMonth()]} ${hoy.getFullYear()}`;
                p.estado = 'Aprobado';
                p.historial.push({ fecha: fechaStr, accion: 'Aprobado por Jefe' });
                closeModal();
                // Animate row then refresh
                const row = document.getElementById('proc-row-'+id);
                if (row) { row.style.background='#F0FDF4'; setTimeout(()=>row.style.background='',800); }
                const tbody = document.getElementById('tablaProc');
                if (tbody) { tbody.innerHTML = renderTabla(listaVisible()); lucide.createIcons(); }
                refreshStats();
                procToast('✓ Proceso aprobado exitosamente');
            };

            // ── Reabrir proceso ────────────────────────────────────────────
            window.reabrirProceso = (id) => {
                const p = window._procesos.find(x => x.id === id);
                if (!p) return;
                openModal(`
                    <div style="text-align:center;padding:8px 0;">
                        <i data-lucide="refresh-cw" style="width:48px;height:48px;color:var(--color-primary);margin-bottom:12px;"></i>
                        <h2 style="margin-bottom:8px;">¿Reabrir este proceso?</h2>
                        <p style="color:var(--color-muted);margin-bottom:20px;font-size:0.9rem;">¡El proceso volverá a estado <strong>Pendiente</strong> para nueva revisión.</p>
                    </div>
                    <div style="background:#FFF0F0;border:1px solid var(--color-error);border-radius:10px;padding:16px;margin-bottom:16px;">
                        <div style="font-size:0.8rem;color:var(--color-error);margin-bottom:8px;"><strong>Motivo del rechazo anterior:</strong></div>
                        <div style="font-size:0.875rem;">${p.motivoRechazo || 'No especificado'}</div>
                    </div>
                    <div style="background:var(--color-bg);border-radius:10px;padding:16px;margin-bottom:24px;">
                        <div style="display:flex;flex-direction:column;gap:8px;font-size:0.875rem;">
                            <div><span style="color:var(--color-muted);">Proceso:</span> <strong>${p.nombre}</strong></div>
                            <div><span style="color:var(--color-muted);">Responsable:</span> ${p.responsable}</div>
                            <div><span style="color:var(--color-muted);">Área:</span> ${p.area}</div>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:12px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="confirmarReabrir(${id})"><i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Reabrir proceso</button>
                    </div>
                `);
                lucide.createIcons();
            };

            window.confirmarReabrir = (id) => {
                const p = window._procesos.find(x => x.id === id);
                if (!p) return;
                const hoy = new Date();
                const fechaStr = `${hoy.getDate()} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][hoy.getMonth()]} ${hoy.getFullYear()}`;
                p.estado = 'Pendiente';
                p.historial.push({ fecha: fechaStr, accion: 'Proceso reabierto para nueva revisión' });
                closeModal();
                // Animate row
                const row = document.getElementById('proc-row-'+id);
                if (row) { row.style.background='#EEF0FF'; setTimeout(()=>row.style.background='',800); }
                const tbody = document.getElementById('tablaProc');
                if (tbody) { tbody.innerHTML = renderTabla(listaVisible()); lucide.createIcons(); }
                refreshStats();
                procToast('↺ Proceso reabierto y en revisión');
            };
        }

        lucide.createIcons();
    }

    // ── FUNCIONES GLOBALES DE CATÁLOGO ─────────────────────────
    window.abrirCapacitacion = (nombre) => {
        openModal(`
            <div style="padding:8px;">
                <h2 style="margin-bottom:16px; color:var(--color-primary);">${nombre}</h2>
                <div style="background:linear-gradient(135deg,var(--color-primary),var(--color-secondary2)); color:white; border-radius:10px; padding:24px; margin-bottom:20px;">
                    <p style="font-size:1.1rem; font-weight:600;">${nombre}</p>
                    <p style="opacity:0.85; margin-top:8px;">Sistema de Gestión de Calidad · Modalidad: En línea</p>
                </div>
                <p style="margin-bottom:16px; color:var(--color-muted); font-size:0.9rem;">Esta capacitación cubre los fundamentos necesarios para el proceso de integración del empleado en All Aboard. Incluye evaluaciones y materiales descargables.</p>
                <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px;">
                    <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                    <button class="btn btn-primary" onclick="alert('Iniciando capacitaci\u00f3n: ${nombre}')">Iniciar capacitaci\u00f3n</button>
                </div>
            </div>
        `);
    };

    window.abrirTemario = (nombre) => {
        openModal(`
            <div style="padding:8px;">
                <h2 style="margin-bottom:20px; color:var(--color-primary);">Temario: ${nombre}</h2>
                <div style="border:1px solid var(--color-border); border-radius:10px; overflow:hidden; margin-bottom:20px;">
                    <div style="padding:14px 18px; border-bottom:1px solid var(--color-border); font-weight:600; background:var(--color-bg);">M\u00f3dulo 1: Introducci\u00f3n</div>
                    <div style="padding:12px 18px; color:var(--color-muted); font-size:0.875rem;">Historia, conceptos clave y objetivos del curso.</div>
                    <div style="padding:14px 18px; border-top:1px solid var(--color-border); font-weight:600; background:var(--color-bg);">M\u00f3dulo 2: Contenido principal</div>
                    <div style="padding:12px 18px; color:var(--color-muted); font-size:0.875rem;">Desarrollo de habilidades pr\u00e1cticas y aplicaci\u00f3n en el trabajo.</div>
                    <div style="padding:14px 18px; border-top:1px solid var(--color-border); font-weight:600; background:var(--color-bg);">M\u00f3dulo 3: Evaluaci\u00f3n</div>
                    <div style="padding:12px 18px; color:var(--color-muted); font-size:0.875rem;">Examen final y criterios de aprobaci\u00f3n.</div>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:12px;">
                    <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                </div>
            </div>
        `);
    };

    // Initial render
    renderSidebar();
}
