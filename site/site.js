(function () {
  'use strict';

  var THEME_KEY = 'encyclopedia-theme';

  function readTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
    } catch (error) {
      return 'light';
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      // The choice then lasts for this page only.
    }
  }

  document.documentElement.dataset.theme = readTheme();

  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      saveTheme(next);
    });
  }

  var list = document.querySelector('[data-entries]');
  if (!list) {
    return;
  }

  var search = document.querySelector('[data-filter-search]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-type-chip]'));
  var all = document.querySelector('[data-type-all]');
  var sort = document.querySelector('[data-sort]');
  var count = document.querySelector('[data-count]');
  var cards = Array.prototype.slice.call(list.children);

  function isOn(chip) {
    return chip.getAttribute('aria-pressed') === 'true';
  }

  function selectedTypes() {
    return chips.filter(isOn).map(function (chip) {
      return chip.dataset.type;
    });
  }

  function apply() {
    var query = search.value.trim().toLocaleLowerCase('fr');
    var types = selectedTypes();
    all.setAttribute('aria-pressed', String(types.length === chips.length));
    var shown = 0;
    cards.forEach(function (card) {
      var matches = types.indexOf(card.dataset.type) !== -1 && card.dataset.search.indexOf(query) !== -1;
      card.hidden = !matches;
      shown += matches ? 1 : 0;
    });
    count.textContent = String(shown);
  }

  function order() {
    var byType = sort.value === 'type';
    cards
      .slice()
      .sort(function (a, b) {
        var first = byType ? a.dataset.type.localeCompare(b.dataset.type) : 0;
        return first !== 0 ? first : a.dataset.title.localeCompare(b.dataset.title, 'fr');
      })
      .forEach(function (card) {
        list.appendChild(card);
      });
  }

  search.addEventListener('input', apply);
  // Each chip switches one type; "all" selects every type, or none when all are selected.
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chip.setAttribute('aria-pressed', String(!isOn(chip)));
      apply();
    });
  });
  all.addEventListener('click', function () {
    var next = String(!chips.every(isOn));
    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', next);
    });
    apply();
  });
  sort.addEventListener('change', order);
})();
