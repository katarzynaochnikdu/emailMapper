// -------------------------------------------------------------------------
// DATA DICTIONARY
// Mappings for Inspector Mode
// -------------------------------------------------------------------------
const INSPECTOR_DATA = {
  // --- IMAGES ---
  'banner-img': {
    desc: 'Obrazek Bannera',
    variable: '{{30.data.event_mail_link_top_banner}}',
    value: 'URL do obrazka (src)',
    category: 'images'
  },
  
  // --- GRADIENT 1 (Primary) ---
  'g1-btn': {
    desc: 'Tło Przycisku CTA',
    variable: '{{30.data.color_gradient_1}}',
    value: 'Kolor wiodący #1 (Gradient 1)',
    category: 'colors_g1'
  },
  'g1-text': {
    desc: 'Kolor Tekstu (Nagłówki)',
    variable: '{{30.data.color_gradient_1}}',
    value: 'Kolor wiodący #1',
    category: 'colors_g1'
  },
  'g1-bg': {
    desc: 'Tło Elementu (Stopka)',
    variable: '{{30.data.color_gradient_1}}',
    value: 'Kolor wiodący #1',
    category: 'colors_g1'
  },
  
  // --- GRADIENT 2 (Secondary) ---
  'g2-border': {
    desc: 'Linia Oddzielająca',
    variable: '{{30.data.color_gradient_2}}',
    value: 'Kolor wiodący #2 (Gradient 2)',
    category: 'colors_g2'
  },
  'g2-bg': {
    desc: 'Tło Podsumowania',
    variable: '{{30.data.color_gradient_2}}',
    value: 'Kolor wiodący #2',
    category: 'colors_g2'
  },
  'g2-text': {
    desc: 'Tekst Wyróżniony',
    variable: '{{30.data.color_gradient_2}}',
    value: 'Kolor wiodący #2',
    category: 'colors_g2'
  },

  // --- LINKS ---
  'link-payment': {
    desc: 'Link do Płatności / Rejestracji',
    variable: '{{2.body.url}} lub {{30.data.url_event}}',
    value: 'Przekierowanie użytkownika',
    category: 'links'
  },
  'contact-email': {
    desc: 'Email Kontaktowy',
    variable: '{{30.data.md_email_kontakt}}',
    value: 'Adres email organizatora',
    category: 'links'
  },
  
  // --- CONTENT ---
  'tech-email': {
    desc: 'Kontakt Techniczny',
    variable: '{{30.data.md_email_techniczny}}',
    value: 'Email + telefon wsparcia',
    category: 'content'
  },
  
  // --- GUS DATA ---
  'gus-nip': {
    desc: 'NIP Firmy',
    variable: '{{114.data.gus_data.nip}}',
    value: 'Pobrane z GUS',
    category: 'gus'
  },
  'gus-name': {
    desc: 'Nazwa/Dane Firmy',
    variable: '{{114.data.gus_data.*}}',
    value: 'Wszystkie dane z GUS',
    category: 'gus'
  },
  
  // --- CONFIRMATION SPECIFIC ---
  'conf-banner-img': {
    desc: 'Banner (Potwierdzenie)',
    variable: '{{11.data.event_mail_link_top_banner}}',
    value: 'Uwaga: ID 11 (nie 30!)',
    category: 'images'
  },
  'conf-g1': {
    desc: 'Kolor Wiodący (Potw.)',
    variable: '{{11.data.color_gradient_1}}',
    value: 'Uwaga: ID 11 (nie 30!)',
    category: 'colors_g1'
  },
  'conf-tickets': {
    desc: 'Tabela Biletów',
    variable: '{{9.data.html_order_table}}',
    value: 'Wygenerowany HTML',
    category: 'content'
  }
};

// -------------------------------------------------------------------------
// APP LOGIC
// -------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSubtabs();
  initInspector();
  
  // Default state
  selectTab('payment-link');
  selectSubtab('personal');
});

// --- TABS (Main Navigation) ---
function initTabs() {
  const tabs = document.querySelectorAll('.nav-pill');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      selectTab(target);
    });
  });
}

function selectTab(tabId) {
  // Update tab buttons
  document.querySelectorAll('.nav-pill').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  
  // Show/Hide tab content
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('hidden', c.id !== `content-${tabId}`);
  });
  
  // Show/Hide Subtabs container (only for payment-link)
  const subtabsContainer = document.getElementById('subtabs-payment-link');
  if (subtabsContainer) {
    subtabsContainer.classList.toggle('hidden', tabId !== 'payment-link');
  }
  
  // Rebuild Inspector Sidebar based on visible content
  rebuildSidebar();
}

// --- SUBTABS (Osoba fizyczna / NIP OK / NIP Bad) ---
function initSubtabs() {
  const subtabs = document.querySelectorAll('.subtab');
  subtabs.forEach(subtab => {
    subtab.addEventListener('click', () => {
      const target = subtab.dataset.subtab;
      selectSubtab(target);
    });
  });
}

function selectSubtab(subtabId) {
  // Update subtab buttons
  document.querySelectorAll('.subtab').forEach(s => {
    s.classList.toggle('active', s.dataset.subtab === subtabId);
  });
  
  // Show/Hide subcontent
  document.querySelectorAll('.subcontent').forEach(sc => {
    sc.classList.toggle('active', sc.dataset.subcontent === subtabId);
  });
  
  // Rebuild sidebar after subtab change
  rebuildSidebar();
}

// --- INSPECTOR ENGINE ---
function initInspector() {
  const container = document.querySelector('.app-container');
  
  // Hover over Email Elements
  container.addEventListener('mouseover', (e) => {
    if (e.target.closest('.inspector-panel')) return;
    const target = e.target.closest('[data-inspect]');
    if (target) {
      highlightSidebar(target.dataset.inspect);
    }
  });
  
  container.addEventListener('mouseout', (e) => {
    if (e.target.closest('.inspector-panel')) return;
    const target = e.target.closest('[data-inspect]');
    if (target) {
      clearSidebarHighlight();
    }
  });
}

// --- SMART SIDEBAR: Only shows variables that exist in visible content ---
function rebuildSidebar() {
  const list = document.getElementById('inspector-list');
  list.innerHTML = '';
  
  // Find all data-inspect keys in VISIBLE elements
  const visibleKeys = new Set();
  document.querySelectorAll('[data-inspect]').forEach(el => {
    // Check if element is visible:
    // 1. Not inside .hidden parent (main tabs)
    // 2. Not inside .subcontent that is NOT .active
    const inHidden = el.closest('.hidden');
    const subcontent = el.closest('.subcontent');
    const inInactiveSubcontent = subcontent && !subcontent.classList.contains('active');
    
    if (!inHidden && !inInactiveSubcontent) {
      visibleKeys.add(el.dataset.inspect);
    }
  });
  
  // If no visible keys, show message
  if (visibleKeys.size === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem; padding: 1rem;">Brak zmiennych w tym widoku.</p>';
    return;
  }
  
  const groups = {
    'colors_g1': '🎨 Gradient 1 (Kolor wiodący)',
    'colors_g2': '🎨 Gradient 2 (Kolor pomocniczy)',
    'images': '🖼️ Obrazy',
    'links': '🔗 Linki',
    'content': '📝 Treść',
    'gus': '🏢 Dane GUS'
  };
  
  // Filter INSPECTOR_DATA to only include visible keys
  const relevantKeys = Object.keys(INSPECTOR_DATA).filter(key => visibleKeys.has(key));
  
  // Sort by category
  const sortedKeys = relevantKeys.sort((a, b) => {
    return INSPECTOR_DATA[a].category.localeCompare(INSPECTOR_DATA[b].category);
  });

  let currentCategory = '';
  
  sortedKeys.forEach(key => {
    const data = INSPECTOR_DATA[key];
    
    // Header for new category
    if (data.category !== currentCategory) {
      currentCategory = data.category;
      const thisHeaderCategory = data.category;

      const header = document.createElement('div');
      header.className = 'inspector-title';
      header.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" class="group-toggle" data-group="${thisHeaderCategory}" checked title="Przełącz całą grupę">
          <span>${groups[thisHeaderCategory] || thisHeaderCategory}</span>
        </div>
      `;
      
      if (list.children.length > 0) header.style.marginTop = '1.5rem';
      
      const masterCheckbox = header.querySelector('.group-toggle');
      masterCheckbox.addEventListener('change', (e) => {
        toggleGroup(thisHeaderCategory, e.target.checked);
      });

      list.appendChild(header);
    }
    
    const item = document.createElement('div');
    item.className = 'var-item';
    item.dataset.key = key;
    item.dataset.category = data.category;
    item.innerHTML = `
      <div class="var-header">
        <input type="checkbox" class="var-toggle" checked title="Symuluj brak zmiennej">
        <span class="var-desc">${data.desc}</span>
      </div>
      <code class="var-key">${data.variable}</code>
      <div class="var-value">${data.value}</div>
    `;
    
    item.addEventListener('mouseenter', () => highlightEmailElement(key));
    item.addEventListener('mouseleave', () => clearEmailHighlight());
    
    const checkbox = item.querySelector('.var-toggle');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleVariable(key, e.target.checked);
    });

    list.appendChild(item);
  });
}

// --- GROUP TOGGLE ---
function toggleGroup(category, isActive) {
  const items = document.querySelectorAll(`.var-item[data-category="${category}"]`);
  items.forEach(item => {
    const checkbox = item.querySelector('.var-toggle');
    const key = item.dataset.key;
    if (checkbox.checked !== isActive) {
      checkbox.checked = isActive;
      toggleVariable(key, isActive);
    }
  });
}

function toggleVariable(key, isActive) {
  const elements = document.querySelectorAll(`[data-inspect="${key}"]`);
  elements.forEach(el => {
    // Skip hidden elements
    if (el.closest('.hidden')) return;
    
    // Skip inactive subcontent
    const subcontent = el.closest('.subcontent');
    if (subcontent && !subcontent.classList.contains('active')) return;
    
    // 1. Image logic (hide completely)
    if (key.includes('banner') || key.includes('img')) {
      el.classList.toggle('hidden', !isActive);
    }
    // 2. Color logic (Gradient 1/2) - add/remove inactive class
    else if (key.includes('g1') || key.includes('g2')) {
      const gType = key.includes('g2') ? 'g2' : 'g1';
      if (isActive) {
        el.classList.remove(`${gType}-inactive`);
      } else {
        el.classList.add(`${gType}-inactive`);
      }
    }
    // 3. Links / Content - grey out
    else {
      el.style.opacity = isActive ? '1' : '0.4';
      el.style.textDecoration = isActive ? 'none' : 'line-through';
      el.style.pointerEvents = isActive ? 'auto' : 'none';
    }
  });
}

function highlightSidebar(key) {
  document.querySelectorAll('.var-item').forEach(i => i.classList.remove('active'));
  const item = document.querySelector(`.var-item[data-key="${key}"]`);
  if (item) {
    item.classList.add('active');
    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function clearSidebarHighlight() {
  document.querySelectorAll('.var-item').forEach(i => i.classList.remove('active'));
}

function highlightEmailElement(key) {
  document.querySelectorAll(`[data-inspect="${key}"]`).forEach(el => {
    // Only highlight visible elements
    const inHidden = el.closest('.hidden');
    const subcontent = el.closest('.subcontent');
    const inInactiveSubcontent = subcontent && !subcontent.classList.contains('active');
    
    if (!inHidden && !inInactiveSubcontent) {
      el.classList.add('hovered-from-panel');
    }
  });
}

function clearEmailHighlight() {
  document.querySelectorAll('.hovered-from-panel').forEach(el => el.classList.remove('hovered-from-panel'));
}
