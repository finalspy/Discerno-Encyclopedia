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
  var type = document.querySelector('[data-filter-type]');
  var sort = document.querySelector('[data-sort]');
  var count = document.querySelector('[data-count]');
  var cards = Array.prototype.slice.call(list.children);

  function apply() {
    var query = search.value.trim().toLocaleLowerCase('fr');
    var shown = 0;
    cards.forEach(function (card) {
      var matches = (type.value === '' || card.dataset.type === type.value) && card.dataset.search.indexOf(query) !== -1;
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
  type.addEventListener('change', apply);
  sort.addEventListener('change', order);
})();
