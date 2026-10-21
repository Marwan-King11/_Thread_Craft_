const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  color: '#365b48',
  colorName: 'Forest green',
  garment: 'T-shirt',
  size: 'M',
  imageData: '',
  imageName: '',
  role: 'client',
  email: '',
  designs: []
};

const colorNameEl = $('#color-name');
const garmentBody = $('#garment-body');
const garmentShape = $('#garment-shape');
const garmentSvg = $('#garment-svg');
const previewTitle = $('#preview-title');
const designName = $('#design-name');
const toast = $('#toast');
let toastTimer;

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function updatePreview() {
  previewTitle.textContent = designName.value.trim() || 'Untitled design';
  const material = $('#material').value;
  const fit = $('#fit').value;
  $('#spec-material').textContent = material;
  $('#spec-fit').textContent = fit;
  $('#spec-size').textContent = state.size;
  garmentBody.setAttribute('fill', state.color);
  garmentBody.setAttribute('stroke', shadeColor(state.color, -18));
  $('#color-name').textContent = state.colorName;
  garmentSvg.setAttribute('aria-label', `${state.colorName} ${state.garment} preview`);
  applyGarmentShape();
}

function shadeColor(hex, percent) {
  const n = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function applyGarmentShape() {
  const paths = {
    'T-shirt': 'M145 94 L179 77 Q210 94 241 77 L275 94 L329 143 L290 190 L263 168 L267 352 Q210 369 153 352 L157 168 L130 190 L91 143 Z',
    'Hoodie': 'M143 112 L177 96 Q210 112 243 96 L277 112 L329 155 L290 201 L264 179 L269 356 Q210 372 151 356 L156 179 L130 201 L91 155 Z',
    'Shirt': 'M145 94 L179 77 L193 92 L210 111 L227 92 L241 77 L275 94 L310 133 L284 163 L261 143 L264 352 L156 352 L159 143 L136 163 L110 133 Z',
    'Jacket': 'M145 94 L179 77 L210 96 L241 77 L275 94 L315 142 L286 183 L263 160 L267 352 L153 352 L157 160 L134 183 L105 142 Z',
    'Trousers': 'M153 82 L267 82 L278 350 L222 350 L210 197 L198 350 L142 350 Z',
    'Dress': 'M155 88 L185 75 Q210 92 235 75 L265 88 L284 164 L260 183 L286 358 Q210 378 134 358 L160 183 L136 164 Z'
  };
  const path = $('#garment-body');
  path.setAttribute('d', paths[state.garment] || paths['T-shirt']);
  const isBottom = state.garment === 'Trousers';
  const neck = garmentShape.querySelector('path:not(#garment-body)');
  if (neck) neck.setAttribute('d', isBottom ? 'M210 95 L210 192' : 'M179 78 Q210 112 241 78');
  const seam = garmentShape.querySelectorAll('path')[1];
  if (seam) seam.setAttribute('d', isBottom ? 'M210 197 L210 350' : 'M158 339 Q210 351 262 339');
  const label = garmentShape.querySelector('text');
  if (label) {
    label.setAttribute('y', isBottom ? '170' : state.garment === 'Dress' ? '245' : '229');
    label.textContent = state.garment === 'Trousers' ? 'YOUR LABEL' : 'YOUR LABEL';
  }
}

$$('.swatch').forEach(button => {
  button.addEventListener('click', () => {
    $$('.swatch').forEach(b => b.classList.remove('selected'));
    button.classList.add('selected');
    state.color = button.dataset.color;
    state.colorName = button.dataset.name;
    $('#custom-color').value = state.color;
    updatePreview();
  });
});
$('#custom-color-button').addEventListener('click', () => $('#custom-color').click());
$('#custom-color').addEventListener('input', event => {
  state.color = event.target.value;
  state.colorName = 'Custom color';
  $$('.swatch').forEach(b => b.classList.remove('selected'));
  $('#custom-color-button').classList.add('selected');
  updatePreview();
});
$$('[data-garment]').forEach(button => button.addEventListener('click', () => {
  $$('[data-garment]').forEach(b => b.classList.remove('selected'));
  button.classList.add('selected');
  state.garment = button.dataset.garment;
  updatePreview();
}));
$$('#size-options button').forEach(button => button.addEventListener('click', () => {
  $$('#size-options button').forEach(b => b.classList.remove('selected'));
  button.classList.add('selected');
  state.size = button.textContent.trim();
  updatePreview();
}));
['design-name', 'material', 'fit'].forEach(id => $('#' + id).addEventListener('input', updatePreview));

$('#image-upload').addEventListener('change', event => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) {
    notify('Please choose an image smaller than 8 MB.');
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.imageData = reader.result;
    state.imageName = file.name;
    $('#uploaded-image').src = state.imageData;
    $('#uploaded-preview').hidden = false;
    $('#upload-status').textContent = '✓ ' + file.name;
    notify('Inspiration image added to your design.');
  };
  reader.readAsDataURL(file);
});

function getDesign() {
  return {
    id: 'TC-' + String(Date.now()).slice(-6),
    name: designName.value.trim() || 'Untitled design',
    color: state.color,
    colorName: state.colorName,
    material: $('#material').value,
    garment: state.garment,
    fit: $('#fit').value,
    size: state.size,
    details: $('#details').value.trim(),
    imageData: state.imageData,
    imageName: state.imageName,
    submittedBy: state.email || 'Guest designer',
    status: 'Submitted for review',
    createdAt: new Date().toLocaleDateString()
  };
}

$('#send-design').addEventListener('click', () => {
  const design = getDesign();
  state.designs.unshift(design);
  try { localStorage.setItem('threadcraft-designs', JSON.stringify(state.designs)); } catch (e) {}
  notify('Design submitted to the makers dashboard.');
  renderDashboard();
  if (state.role === 'employer') openDashboard();
});

$('#open-login').addEventListener('click', () => { $('#login-modal').hidden = false; });
$('#close-login').addEventListener('click', () => { $('#login-modal').hidden = true; });
$('#login-modal').addEventListener('click', event => {
  if (event.target === $('#login-modal')) $('#login-modal').hidden = true;
});
$$('.role-option').forEach(button => button.addEventListener('click', () => {
  $$('.role-option').forEach(b => b.classList.remove('selected'));
  button.classList.add('selected');
  state.role = button.dataset.role;
}));
$('#login-form').addEventListener('submit', event => {
  event.preventDefault();
  state.email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  if (password.length < 6) return notify('Use a password with at least 6 characters.');
  $('#login-modal').hidden = true;
  openDashboard();
});

function loadDesigns() {
  try {
    const saved = JSON.parse(localStorage.getItem('threadcraft-designs') || '[]');
    if (Array.isArray(saved)) state.designs = saved;
  } catch (e) { state.designs = []; }
}
function openDashboard() {
  loadDesigns();
  const names = {
    client: ['Client', 'Your designs, all in one place.', 'Your designs', 'Create and track your clothing ideas.'],
    merchant: ['Merchant', 'Manage the design requests and products in your workspace.', 'Incoming design requests', 'Review client briefs and keep track of requests.'],
    employer: ['Employer / Maker', 'Review submitted designs and turn creative ideas into production briefs.', 'Submitted designs', 'Open each design brief to review its materials, fit, and special requests.']
  };
  const data = names[state.role] || names.client;
  $('#dashboard-title').innerHTML = `${data[0]} <em>${state.role === 'employer' ? 'dashboard.' : 'studio.'}</em>`;
  $('#dashboard-intro').textContent = data[3];
  $('#dashboard-list-title').textContent = data[2];
  $('#dashboard-stats').innerHTML = state.role === 'employer'
    ? `<div class="stat-card"><span>SUBMITTED DESIGNS</span><strong>${state.designs.length}</strong></div><div class="stat-card"><span>NEEDS REVIEW</span><strong>${state.designs.filter(d=>d.status==='Submitted for review').length}</strong></div><div class="stat-card"><span>ACCOUNT ROLE</span><strong>Maker</strong></div>`
    : `<div class="stat-card"><span>YOUR DESIGNS</span><strong>${state.designs.filter(d=>d.submittedBy===state.email || !state.email).length}</strong></div><div class="stat-card"><span>ACCOUNT TYPE</span><strong>${state.role==='merchant'?'Shop':'Client'}</strong></div><div class="stat-card"><span>WORKSPACE</span><strong>Active</strong></div>`;
  renderDashboard();
  $('#dashboard').hidden = false;
}
function renderDashboard() {
  const list = $('#dashboard-list');
  if (!list) return;
  loadDesigns();
  if (!state.designs.length) {
    list.innerHTML = `<div class="empty-state">Nothing here just yet.<br>Head to the design studio and submit your first clothing idea.</div>`;
    return;
  }
  list.innerHTML = state.designs.map((d, i) => `
    <article class="design-item">
      <div><strong>${escapeHTML(d.name)}</strong><p>${escapeHTML(d.garment)} · ${escapeHTML(d.material)} · ${escapeHTML(d.size)} · ${escapeHTML(d.colorName)}<br>By ${escapeHTML(d.submittedBy || 'Guest designer')} · ${escapeHTML(d.createdAt || '')}</p>
      ${d.details ? `<p>Details: ${escapeHTML(d.details)}</p>` : ''}</div>
      <span class="status-pill">${escapeHTML(d.status || 'Submitted')}</span>
    </article>`).join('');
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
$('#sign-out').addEventListener('click', () => {
  $('#dashboard').hidden = true;
  state.email = '';
  notify('You have left the demo workspace.');
});
$('#back-to-studio').addEventListener('click', () => {
  $('#dashboard').hidden = true;
  $('#studio').scrollIntoView({behavior:'smooth'});
});
$('#dashboard').addEventListener('click', event => {
  if (event.target === $('#dashboard')) $('#dashboard').hidden = true;
});

loadDesigns();
updatePreview();
