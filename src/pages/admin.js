import '../styles.css';
import './admin.css';

const root = document.querySelector('#admin-app');
const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const services = ['Project Execution', 'Project design', 'Design and execution'];
const historicalServices = ['Mechanical services', 'Electrical services', 'Plumbing services'];
const state = { csrfToken: '', page: 1, limit: 10, q: '', service: '', status: '', from: '', to: '', total: 0, totalPages: 1, leads: [] };
let searchTimer;

document.body.classList.add('admin-page-body');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

async function api(path, options = {}) {
  const method = options.method || 'GET';
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' ? { 'X-CSRF-Token': state.csrfToken } : {}), ...options.headers };
  const response = await fetch(path, { ...options, method, headers, credentials: 'same-origin' });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/api/admin/login') renderLogin('Your session ended. Please sign in again.');
    throw new Error(result.message || 'The request could not be completed.');
  }
  return result;
}

function brandMarkup() {
  return `<a class="admin-brand" href="/admin" aria-label="Ultra dashboard home"><span class="admin-brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>ULTRA<small>MEP ENGINEERING</small></span></a>`;
}

function renderLogin(message = '') {
  root.innerHTML = `<main class="admin-login-page"><header class="admin-login-top">${brandMarkup()}<span>PRIVATE LEAD PORTAL</span></header><section class="admin-login-card" aria-labelledby="login-title"><p class="admin-eyebrow"><span></span>ULTRA · ADMINISTRATION</p><h1 id="login-title">Welcome<br><em>back.</em></h1><p class="admin-login-copy">Sign in to review and manage incoming project enquiries.</p><form id="admin-login-form"><label>Email address<input name="email" type="email" autocomplete="username" maxlength="254" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><p class="admin-alert" role="alert">${escapeHtml(message)}</p><button class="admin-primary-button" type="submit">Sign in <span aria-hidden="true">↗</span></button></form><a class="admin-back-link" href="/">← Back to Ultra website</a></section><footer class="admin-login-footer">PRIVATE ACCESS · ULTRA MEP ENGINEERING</footer></main>`;
}

function selectedOptions(items, selected, firstLabel) {
  return `<option value="">${firstLabel}</option>${items.map(item => `<option value="${escapeHtml(item)}"${item === selected ? ' selected' : ''}>${escapeHtml(item)}</option>`).join('')}`;
}

function renderDashboardShell() {
  root.innerHTML = `<div class="admin-shell"><header class="admin-topbar">${brandMarkup()}<div class="admin-topbar-right"><span><i></i> LEAD MANAGEMENT</span><button class="admin-logout" type="button" data-logout>Sign out <span aria-hidden="true">↗</span></button></div></header><main class="admin-main"><div class="admin-page-heading"><div><p class="admin-eyebrow"><span></span>OVERVIEW · LEAD PIPELINE</p><h1>Good work starts<br><em>with a conversation.</em></h1></div><p class="admin-heading-note">Every enquiry, in one place.<br>Stay close to what comes next.</p></div><p class="admin-notice" data-notice role="status"></p><section class="admin-stats" data-stats aria-label="Lead summary"></section><section class="admin-leads-panel" aria-labelledby="leads-heading"><div class="admin-panel-heading"><div><p class="admin-eyebrow"><span></span>YOUR PIPELINE</p><h2 id="leads-heading">All leads <small data-lead-total>—</small></h2></div><a class="admin-home-link" href="/">View website ↗</a></div><form class="admin-filters" data-filter-form><label class="admin-search"><span aria-hidden="true">⌕</span><input name="q" type="search" placeholder="Search name, phone or email" value="${escapeHtml(state.q)}" maxlength="120"></label><label class="admin-filter-label">Service<select name="service">${selectedOptions(services, state.service, 'All services')}</select></label><label class="admin-filter-label">Status<select name="status">${selectedOptions(statuses, state.status, 'All statuses')}</select></label><label class="admin-filter-label">From<input name="from" type="date" value="${escapeHtml(state.from)}"></label><label class="admin-filter-label">To<input name="to" type="date" value="${escapeHtml(state.to)}"></label><label class="admin-filter-label admin-page-size">Rows<select name="limit">${[10, 25, 50].map(size => `<option value="${size}"${size === state.limit ? ' selected' : ''}>${size}</option>`).join('')}</select></label></form><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>LEAD</th><th>PHONE</th><th>SERVICE</th><th>SUBMITTED</th><th>STATUS</th><th><span class="sr-only">Details</span></th></tr></thead><tbody data-leads><tr><td colspan="6" class="admin-table-message">Loading leads…</td></tr></tbody></table></div><div class="admin-pagination"><span data-page-label>—</span><div><button type="button" data-page="prev" aria-label="Previous page">←</button><button type="button" data-page="next" aria-label="Next page">→</button></div></div></section></main><footer class="admin-footer"><span>© ${new Date().getFullYear()} ULTRA · INTERNAL USE</span><a href="/">BACK TO WEBSITE ↑</a></footer><dialog class="admin-detail-dialog" data-detail-dialog><form method="dialog"><button class="admin-dialog-close" aria-label="Close details">×</button></form><div data-detail-content></div></dialog></div>`;
}

function renderOverview(overview) {
  const cards = [
    ['TOTAL LEADS', overview.total, 'All enquiries'],
    ['NEW', overview.new, 'Awaiting follow-up'],
    ['CONTACTED', overview.contacted, 'In conversation'],
    ['CONVERTED', overview.converted, 'Won projects'],
  ];
  const groupedServices = overview.byService || [];
  const serviceTotals = new Map(groupedServices.map(item => [item.service, item.total]));
  const historicalWithLeads = groupedServices.map(item => item.service).filter(service => !services.includes(service));
  const serviceRows = [...services, ...historicalWithLeads];
  const filterServiceNames = [...services, ...historicalServices.filter(service => historicalWithLeads.includes(service))];
  const filter = root.querySelector('[data-filter-form] [name="service"]');
  const selectedService = state.service;
  filter.innerHTML = selectedOptions(filterServiceNames, selectedService, 'All services');
  root.querySelector('[data-stats]').innerHTML = `<div class="admin-stat-grid">${cards.map(([label, value, note], index) => `<article class="admin-stat-card${index === 0 ? ' is-primary' : ''}"><span>${label}</span><strong>${Number(value || 0).toLocaleString()}</strong><small>${note}</small></article>`).join('')}</div><aside class="admin-service-summary"><p>LEADS BY SERVICE</p>${serviceRows.map(service => `<div><span>${escapeHtml(service)}</span><strong>${Number(serviceTotals.get(service) || 0).toLocaleString()}</strong></div>`).join('')}</aside>`;
}

function statusOptions(current) {
  return statuses.map(status => `<option value="${status}"${status === current ? ' selected' : ''}>${status}</option>`).join('');
}

function renderLeads(data) {
  state.total = data.total;
  state.totalPages = data.totalPages;
  state.leads = data.leads;
  root.querySelector('[data-lead-total]').textContent = `(${Number(data.total).toLocaleString()})`;
  root.querySelector('[data-page-label]').textContent = data.total ? `Page ${data.page} of ${data.totalPages} · ${data.total} leads` : 'No leads found';
  root.querySelector('[data-page="prev"]').disabled = data.page <= 1;
  root.querySelector('[data-page="next"]').disabled = data.page >= data.totalPages;
  const tbody = root.querySelector('[data-leads]');
  if (!data.leads.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="admin-table-message">No leads match these filters.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.leads.map(lead => `<tr><td><button class="admin-lead-name" type="button" data-open-lead="${lead.id}">${escapeHtml(lead.full_name)}</button><small>${escapeHtml(lead.email)}</small></td><td><a href="tel:${escapeHtml(lead.phone_number.replace(/[^+\d]/g, ''))}">${escapeHtml(lead.phone_number)}</a></td><td>${escapeHtml(lead.service_required.replace(' services', ''))}</td><td>${escapeHtml(formatDate(lead.created_at))}</td><td><label class="sr-only" for="lead-status-${lead.id}">Status for ${escapeHtml(lead.full_name)}</label><select id="lead-status-${lead.id}" class="admin-status-select status-${lead.status.toLowerCase()}" data-status-id="${lead.id}">${statusOptions(lead.status)}</select></td><td><button class="admin-open-button" type="button" data-open-lead="${lead.id}" aria-label="Open ${escapeHtml(lead.full_name)} details">↗</button></td></tr>`).join('');
}

function filterParams() {
  const params = new URLSearchParams({ page: String(state.page), limit: String(state.limit) });
  for (const key of ['q', 'service', 'status', 'from', 'to']) if (state[key]) params.set(key, state[key]);
  return params;
}

async function loadDashboardData() {
  const [overview, leads] = await Promise.all([
    api('/api/admin/overview'),
    api(`/api/admin/leads?${filterParams()}`),
  ]);
  if (!root.querySelector('.admin-shell')) return;
  renderOverview(overview);
  renderLeads(leads);
}

function showNotice(message, isError = false) {
  const notice = root.querySelector('[data-notice]');
  if (!notice) return;
  notice.textContent = message;
  notice.classList.toggle('is-error', isError);
}

function applyFilters() {
  const form = root.querySelector('[data-filter-form]');
  if (!form) return;
  const values = new FormData(form);
  state.q = String(values.get('q') || '').trim();
  state.service = String(values.get('service') || '');
  state.status = String(values.get('status') || '');
  state.from = String(values.get('from') || '');
  state.to = String(values.get('to') || '');
  state.limit = Number(values.get('limit')) || 10;
  state.page = 1;
  loadDashboardData().catch(error => showNotice(error.message, true));
}

function renderLeadDetails(lead) {
  const phone = lead.phone_number.replace(/[^+\d]/g, '');
  const whatsappPhone = lead.phone_number.replace(/\D/g, '');
  const dialog = root.querySelector('[data-detail-dialog]');
  root.querySelector('[data-detail-content]').innerHTML = `<p class="admin-eyebrow"><span></span>LEAD DETAILS · #${lead.id}</p><h2>${escapeHtml(lead.full_name)}</h2><span class="admin-detail-status status-${lead.status.toLowerCase()}">${escapeHtml(lead.status)}</span><dl><div><dt>EMAIL</dt><dd><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></dd></div><div><dt>PHONE</dt><dd><a href="tel:${escapeHtml(phone)}">${escapeHtml(lead.phone_number)}</a></dd></div><div><dt>SERVICE REQUIRED</dt><dd>${escapeHtml(lead.service_required)}</dd></div><div><dt>SUBMITTED</dt><dd>${escapeHtml(formatDate(lead.created_at))}</dd></div></dl><div class="admin-detail-actions"><a href="tel:${escapeHtml(phone)}">Call lead</a><a href="https://wa.me/${escapeHtml(whatsappPhone)}" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a><button class="admin-delete-button" type="button" data-delete-lead="${lead.id}" data-delete-name="${escapeHtml(lead.full_name)}">Delete lead</button></div>`;
  dialog.showModal();
}

root.addEventListener('submit', async event => {
  if (event.target.id === 'admin-login-form') {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const alert = form.querySelector('[role="alert"]');
    button.disabled = true;
    button.textContent = 'Signing in…';
    alert.textContent = '';
    try {
      const values = new FormData(form);
      const result = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ email: values.get('email'), password: values.get('password') }) });
      state.csrfToken = result.csrfToken;
      renderDashboardShell();
      await loadDashboardData();
    } catch (error) {
      if (form.isConnected) {
        alert.textContent = error.message;
        button.disabled = false;
        button.innerHTML = 'Sign in <span aria-hidden="true">↗</span>';
      }
    }
  }
});

root.addEventListener('input', event => {
  if (event.target.matches('[name="q"]')) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 300);
  }
});

root.addEventListener('change', event => {
  if (event.target.closest('[data-filter-form]') && !event.target.matches('[name="q"]')) applyFilters();
  if (event.target.matches('[data-status-id]')) {
    const select = event.target;
    api(`/api/admin/leads/${select.dataset.statusId}/status`, { method: 'PATCH', body: JSON.stringify({ status: select.value }) })
      .then(() => { showNotice('Lead status updated.'); loadDashboardData().catch(error => showNotice(error.message, true)); })
      .catch(error => { showNotice(error.message, true); loadDashboardData().catch(() => {}); });
  }
});

root.addEventListener('click', async event => {
  const deleteButton = event.target.closest('[data-delete-lead]');
  if (deleteButton) {
    const leadId = deleteButton.dataset.deleteLead;
    const leadName = deleteButton.dataset.deleteName;
    if (!window.confirm(`Permanently delete the lead for ${leadName}? This cannot be undone.`)) return;
    deleteButton.disabled = true;
    deleteButton.textContent = 'Deleting…';
    try {
      await api(`/api/admin/leads/${leadId}`, { method: 'DELETE' });
      root.querySelector('[data-detail-dialog]').close();
      state.page = Math.max(1, Math.min(state.page, Math.ceil((state.total - 1) / state.limit) || 1));
      showNotice('Lead deleted.');
      await loadDashboardData();
    } catch (error) {
      showNotice(error.message, true);
      deleteButton.disabled = false;
      deleteButton.textContent = 'Delete lead';
    }
    return;
  }

  const logout = event.target.closest('[data-logout]');
  if (logout) {
    logout.disabled = true;
    try {
      await api('/api/admin/logout', { method: 'POST' });
      state.csrfToken = '';
      renderLogin('You have signed out.');
      await initialize();
    } catch (error) { showNotice(error.message, true); logout.disabled = false; }
    return;
  }

  const pageButton = event.target.closest('[data-page]');
  if (pageButton && !pageButton.disabled) {
    state.page += pageButton.dataset.page === 'next' ? 1 : -1;
    loadDashboardData().catch(error => showNotice(error.message, true));
    return;
  }

  const detailsButton = event.target.closest('[data-open-lead]');
  if (detailsButton) {
    try {
      const { lead } = await api(`/api/admin/leads/${detailsButton.dataset.openLead}`);
      renderLeadDetails(lead);
    } catch (error) { showNotice(error.message, true); }
  }
});

async function initialize() {
  try {
    const session = await api('/api/admin/session');
    state.csrfToken = session.csrfToken;
    if (session.authenticated) {
      renderDashboardShell();
      await loadDashboardData();
    } else renderLogin();
  } catch (error) { renderLogin(error.message); }
}

initialize();
