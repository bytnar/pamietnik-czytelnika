/* ===================================
   PAMIĘTNIK CZYTELNIKA — APP LOGIC
   =================================== */

(function () {
    'use strict';

    // ── Storage key ──
    const STORAGE_KEY = 'pamietnik-czytelnika-books';
    const THEME_KEY = 'pamietnik-czytelnika-theme';

    // ── Sample data ──
    const SAMPLE_BOOKS = [
        {
            id: '1',
            title: 'Lalka',
            author: 'Bolesław Prus',
            date: '2025-12-15',
            genre: 'Powieść',
            rating: 10,
            pages: 780,
            cover: '',
            notes: 'Arcydzieło polskiego realizmu. Fascynujący obraz Warszawy i portret idealista Wokulskiego, który stara się pogodzić wielką miłość z pragmatyzmem.'
        },
        {
            id: '2',
            title: 'Solaris',
            author: 'Stanisław Lem',
            date: '2026-01-08',
            genre: 'Sci-Fi',
            rating: 10,
            pages: 204,
            cover: '',
            notes: 'Niezwykła podróż w głąb ludzkiej świadomości. Lem stawia pytania o granice poznania i naturę kontaktu z obcą inteligencją. Lektura, do której warto wracać.'
        },
        {
            id: '3',
            title: 'Wiedźmin: Ostatnie życzenie',
            author: 'Andrzej Sapkowski',
            date: '2026-01-22',
            genre: 'Fantasy',
            rating: 8,
            pages: 332,
            cover: '',
            notes: 'Zbiór opowiadań o Geralcie z Rivii. Sapkowski mistrzowsko przetwarza klasyczne baśnie w mroczne, dojrzałe historie. Świetna proza.'
        },
        {
            id: '4',
            title: 'Zdążyć przed Panem Bogiem',
            author: 'Hanna Krall',
            date: '2026-02-10',
            genre: 'Reportaż',
            rating: 8,
            pages: 82,
            cover: '',
            notes: 'Wstrząsająca rozmowa z Markiem Edlemanem o powstaniu w getcie warszawskim. Krótka, ale niezwykle poruszająca lektura.'
        }
    ];

    // ── State ──
    let books = [];
    let editingId = null;

    // ── DOM refs ──
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const grid = $('#books-grid');
    const emptyState = $('#empty-state');
    const modalOverlay = $('#modal-overlay');
    const detailOverlay = $('#detail-overlay');
    const confirmOverlay = $('#confirm-overlay');
    const btnConfirmCancel = $('#btn-confirm-cancel');
    const btnConfirmDelete = $('#btn-confirm-delete');
    const form = $('#book-form');
    const starRating = $('#star-rating');
    const ratingInput = $('#book-rating');
    const toastContainer = $('#toast-container');
    const genreChart = $('#genre-chart');

    // Stats
    const statTotal = $('#stat-total');
    const statAvg = $('#stat-avg-rating');
    const statYear = $('#stat-this-year');
    const statPages = $('#stat-pages');

    // ── Init ──
    function init() {
        loadTheme();
        loadBooks();
        render();
        bindEvents();
    }

    // ── Theme ──
    function loadTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    }

    function toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem(THEME_KEY, 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem(THEME_KEY, 'dark');
        }
    }

    // ── Data ──
    function loadBooks() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                books = JSON.parse(raw);
            } catch {
                books = [];
            }
        }
        if (books.length === 0) {
            books = SAMPLE_BOOKS.map(b => ({ ...b }));
            saveBooks();
        }
    }

    function saveBooks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }

    function genId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    // ── Render ──
    function render() {
        const filtered = getFilteredBooks();
        renderGrid(filtered);
        renderStats();
        renderGenreChart();
    }

    function getFilteredBooks() {
        return [...books];
    }

    function renderGrid(list) {
        if (list.length === 0) {
            grid.innerHTML = '';
            grid.hidden = true;
            emptyState.hidden = false;
            return;
        }

        grid.hidden = false;
        emptyState.hidden = true;

        grid.innerHTML = list.map((book, i) => `
      <article class="book-card" data-id="${book.id}" style="animation-delay: ${i * 0.06}s">
        ${book.cover
                ? `<img class="book-card-cover" src="${escHtml(book.cover)}" alt="Okładka: ${escHtml(book.title)}" loading="lazy">`
                : `<div class="book-card-placeholder">📕</div>`
            }
        <div class="book-card-body">
          <h3 class="book-card-title">${escHtml(book.title)}</h3>
          <p class="book-card-author">${escHtml(book.author)}</p>
          <div class="book-card-meta">
            <span class="book-card-stars">${starsHtml(book.rating)}</span>
            ${book.genre ? `<span class="book-card-genre">${escHtml(book.genre)}</span>` : ''}
          </div>
          ${book.date ? `<p class="book-card-date">${formatDate(book.date)}</p>` : ''}
        </div>
        <div class="book-card-actions">
          <button class="btn-edit" title="Edytuj" data-action="edit" data-id="${book.id}">✏️</button>
          <button class="btn-delete" title="Usuń" data-action="delete" data-id="${book.id}">🗑️</button>
        </div>
      </article>
    `).join('');
    }

    function starsHtml(rating) {
        let s = '';
        for (let i = 1; i <= 10; i++) {
            s += i <= rating ? '★' : '<span class="empty">★</span>';
        }
        return s;
    }

    function renderStats() {
        const total = books.length;
        const avg = total > 0
            ? (books.reduce((sum, b) => sum + (b.rating || 0), 0) / total).toFixed(1)
            : '0.0';
        const currentYear = new Date().getFullYear().toString();
        const thisYear = books.filter(b => b.date && b.date.startsWith(currentYear)).length;
        const pages = books.reduce((sum, b) => sum + (b.pages || 0), 0);

        animateNumber(statTotal, total);
        statAvg.textContent = avg;
        animateNumber(statYear, thisYear);
        animateNumber(statPages, pages);
    }

    function animateNumber(el, target) {
        const current = parseInt(el.textContent) || 0;
        if (current === target) { el.textContent = target; return; }
        const diff = target - current;
        const steps = Math.min(Math.abs(diff), 20);
        const increment = diff / steps;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            if (step >= steps) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.round(current + increment * step);
            }
        }, 30);
    }

    function renderGenreChart() {
        const counts = {};
        books.forEach(b => {
            if (b.genre) counts[b.genre] = (counts[b.genre] || 0) + 1;
        });

        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const max = entries.length > 0 ? entries[0][1] : 1;

        if (entries.length === 0) {
            genreChart.innerHTML = '<p style="color:var(--clr-text-muted);font-size:0.85rem;">Brak danych</p>';
            return;
        }

        genreChart.innerHTML = entries.map(([genre, count]) => {
            const width = Math.max(20, (count / max) * 80);
            return `
        <div class="genre-bar">
          <span class="genre-bar-label">${escHtml(genre)}</span>
          <div class="genre-bar-fill" style="width:${width}px"></div>
          <span class="genre-bar-count">${count}</span>
        </div>
      `;
        }).join('');
    }

    // ── Modal: Add / Edit ──
    function openModal(book) {
        editingId = book ? book.id : null;
        $('#modal-title').textContent = book ? 'Edytuj książkę' : 'Dodaj książkę';

        $('#book-id').value = book ? book.id : '';
        $('#book-title').value = book ? book.title : '';
        $('#book-author').value = book ? book.author : '';
        $('#book-date').value = book ? book.date || '' : new Date().toISOString().slice(0, 10);
        $('#book-genre').value = book ? book.genre || 'Powieść' : 'Powieść';
        $('#book-pages').value = book ? book.pages || '' : '';
        $('#book-cover').value = book ? book.cover || '' : '';
        $('#book-notes').value = book ? book.notes || '' : '';

        const rating = book ? book.rating || 0 : 0;
        ratingInput.value = rating;
        updateStarUI(rating);

        modalOverlay.hidden = false;
        setTimeout(() => $('#book-title').focus(), 100);
    }

    function closeModal() {
        modalOverlay.hidden = true;
        form.reset();
        editingId = null;
        ratingInput.value = 0;
        updateStarUI(0);
    }

    function saveBook(e) {
        e.preventDefault();

        const data = {
            id: editingId || genId(),
            title: $('#book-title').value.trim(),
            author: $('#book-author').value.trim(),
            date: $('#book-date').value,
            genre: $('#book-genre').value,
            rating: parseInt(ratingInput.value) || 0,
            pages: parseInt($('#book-pages').value) || 0,
            cover: $('#book-cover').value.trim(),
            notes: $('#book-notes').value.trim()
        };

        if (!data.title || !data.author) {
            showToast('Podaj tytuł i autora', 'error');
            return;
        }

        if (editingId) {
            const idx = books.findIndex(b => b.id === editingId);
            if (idx !== -1) books[idx] = data;
            showToast('Książka zaktualizowana', 'success');
        } else {
            books.unshift(data);
            showToast('Książka dodana!', 'success');
        }

        saveBooks();
        closeModal();
        render();
    }

    // ── Modal: Detail ──
    function openDetail(id) {
        const book = books.find(b => b.id === id);
        if (!book) return;

        const content = $('#detail-content');
        content.innerHTML = `
      ${book.cover
                ? `<img class="detail-cover" src="${escHtml(book.cover)}" alt="${escHtml(book.title)}">`
                : `<div class="detail-cover-placeholder">📖</div>`
            }
      <div class="detail-body">
        <h2>${escHtml(book.title)}</h2>
        <p class="detail-author">${escHtml(book.author)}</p>
        <div class="detail-meta">
          ${book.genre ? `<span class="detail-tag">${escHtml(book.genre)}</span>` : ''}
          ${book.date ? `<span class="detail-tag">📅 ${formatDate(book.date)}</span>` : ''}
          ${book.pages ? `<span class="detail-tag">📄 ${book.pages} stron</span>` : ''}
        </div>
        ${book.rating ? `<div class="detail-stars">${starsHtml(book.rating)}</div>` : ''}
        ${book.notes ? `
          <p class="detail-notes-label">Notatki</p>
          <div class="detail-notes">${escHtml(book.notes)}</div>
        ` : ''}
      </div>
    `;

        detailOverlay.hidden = false;
    }

    function closeDetail() {
        detailOverlay.hidden = true;
    }

    // ── Delete ──
    let bookToDelete = null;

    function deleteBook(id) {
        bookToDelete = id;
        confirmOverlay.hidden = false;
    }

    function confirmDelete() {
        if (!bookToDelete) return;
        books = books.filter(b => b.id !== bookToDelete);
        saveBooks();
        render();
        showToast('Książka usunięta', 'info');
        closeConfirm();
    }

    function closeConfirm() {
        confirmOverlay.hidden = true;
        bookToDelete = null;
    }

    // ── Star rating interaction ──
    function updateStarUI(value) {
        $$('#star-rating .star').forEach(star => {
            const v = parseInt(star.dataset.value);
            star.classList.toggle('active', v <= value);
        });
    }


    // ── Toast ──
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ── Helpers ──
    function escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // ── Event Binding ──
    function bindEvents() {
        // Theme toggle
        $('#theme-toggle').addEventListener('click', toggleTheme);

        // Add book button
        $('#btn-add-book').addEventListener('click', () => openModal(null));

        // Close modals
        $('#btn-modal-close').addEventListener('click', closeModal);
        $('#btn-cancel').addEventListener('click', closeModal);
        $('#btn-detail-close').addEventListener('click', closeDetail);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        detailOverlay.addEventListener('click', (e) => {
            if (e.target === detailOverlay) closeDetail();
        });

        // Confirm modal
        btnConfirmCancel.addEventListener('click', closeConfirm);
        btnConfirmDelete.addEventListener('click', confirmDelete);

        confirmOverlay.addEventListener('click', (e) => {
            if (e.target === confirmOverlay) closeConfirm();
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!modalOverlay.hidden) closeModal();
                if (!detailOverlay.hidden) closeDetail();
                if (!confirmOverlay.hidden) closeConfirm();
            }
        });

        // Form submit
        form.addEventListener('submit', saveBook);

        // Star rating
        starRating.addEventListener('click', (e) => {
            const star = e.target.closest('.star');
            if (star) {
                const value = parseInt(star.dataset.value);
                ratingInput.value = value;
                updateStarUI(value);
            }
        });

        starRating.addEventListener('mouseover', (e) => {
            const star = e.target.closest('.star');
            if (star) {
                const value = parseInt(star.dataset.value);
                $$('#star-rating .star').forEach(s => {
                    s.classList.toggle('hovered', parseInt(s.dataset.value) <= value);
                });
            }
        });

        starRating.addEventListener('mouseleave', () => {
            $$('#star-rating .star').forEach(s => s.classList.remove('hovered'));
        });

        // Grid click delegation
        grid.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                e.stopPropagation();
                const id = actionBtn.dataset.id;
                const action = actionBtn.dataset.action;
                if (action === 'edit') {
                    const book = books.find(b => b.id === id);
                    if (book) openModal(book);
                } else if (action === 'delete') {
                    deleteBook(id);
                }
                return;
            }

            const card = e.target.closest('.book-card');
            if (card) {
                openDetail(card.dataset.id);
            }
        });
    }

    // ── Go! ──
    document.addEventListener('DOMContentLoaded', init);
})();
