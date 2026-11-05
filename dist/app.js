const menu = document.querySelector('#menu');
const navigation = document.querySelector('#nav');
const toggles = [...document.querySelectorAll('.nav-toggle')];
function closeGroups(except) {
  for (const toggle of toggles) {
    if (toggle === except) continue;
    toggle.setAttribute('aria-expanded', 'false');
    document.getElementById(toggle.getAttribute('aria-controls')).hidden = true;
  }
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
  if (!open) closeGroups();
});
for (const toggle of toggles) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    closeGroups(toggle);
    toggle.setAttribute('aria-expanded', String(open));
    document.getElementById(toggle.getAttribute('aria-controls')).hidden = !open;
  });
}
document.addEventListener('click', event => {
  if (!event.target.closest('header')) {
    closeGroups();
    navigation.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('focusin', event => {
  for (const toggle of toggles) {
    if (!toggle.parentElement.contains(event.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      document.getElementById(toggle.getAttribute('aria-controls')).hidden = true;
    }
  }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const active = toggles.find(toggle => toggle.getAttribute('aria-expanded') === 'true');
  if (active) { closeGroups(); active.focus(); }
  else if (navigation.classList.contains('open')) {
    navigation.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.focus();
  }
});

const slug = new URLSearchParams(location.search).get('page');
if (slug) {
  document.querySelector('#home').hidden = true;
  document.querySelector('#detail').hidden = false;
  fetch('content.json', { cache: 'no-cache' })
    .then(response => response.json())
    .then(pages => {
      const page = pages[slug];
      if (!page) {
        document.querySelector('#page-title').textContent = 'Page not found';
        document.querySelector('#article').innerHTML =
          '<p>Explore the program using the links on this page.</p>';
        return;
      }

      document.title = page.title + ' | Millennium Scholars';
      document.querySelector('#page-title').textContent = page.title;
      document.querySelector('#crumb').textContent = page.title;
      const article = document.querySelector('#article');
      article.innerHTML = page.html;

      const clock = article.querySelector('#application-clock');
      if (clock) {
        const deadline = Number(clock.dataset.deadline);
        const status = article.querySelector('#application-clock-status');
        const updateClock = () => {
          const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
          const values = {
            days: Math.floor(remaining / 86400),
            hours: Math.floor(remaining / 3600) % 24,
            minutes: Math.floor(remaining / 60) % 60,
            seconds: remaining % 60,
          };
          for (const [unit, value] of Object.entries(values)) {
            clock.querySelector(`[data-unit="${unit}"]`).textContent = String(value).padStart(2, '0');
          }
          if (!remaining) {
            status.textContent = 'The published countdown has ended. Check with MSP for the next application cycle.';
          }
          return remaining;
        };
        if (updateClock() > 0) {
          const timer = setInterval(() => {
            if (updateClock() === 0) clearInterval(timer);
          }, 1000);
          window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
        }
      }


      if (slug === 'current-scholars') {
        const years = ['First', 'Second', 'Third', 'Fourth'];
        for (const list of article.querySelectorAll('ul')) {
          const firstItem = list.querySelector('li')?.textContent.trim();
          const year = years.find(name =>
            firstItem?.startsWith(`Meet regularly with the ${name}-Year Assistant Program Director`),
          );
          if (!year) continue;

          const heading = document.createElement('h2');
          heading.textContent = `${year} year`;
          list.before(heading);

        }
        for (const note of article.querySelectorAll('p')) {
          if (note.textContent.trim() === '*These are general expectations.') note.remove();
        }
      }

      const directory = document.querySelector('#directory');
      const entries = Object.entries(pages).sort((a, b) =>
        a[1].title.localeCompare(b[1].title),
      );
      const render = query => {
        directory.replaceChildren();
        for (const [key, entry] of entries) {
          if (!entry.title.toLowerCase().includes(query.toLowerCase())) continue;
          const link = document.createElement('a');
          link.href = '?page=' + key;
          link.textContent = entry.title;
          if (key === slug) link.setAttribute('aria-current', 'page');
          directory.append(link);
        }
        if (!directory.children.length) directory.textContent = 'No matching pages.';
      };

      const search = document.querySelector('#search');
      const setSuggestions = open => {
        directory.hidden = !open;
        search.setAttribute('aria-expanded', String(open));
      };
      const showSuggestions = () => {
        render(search.value);
        setSuggestions(true);
      };
      search.addEventListener('click', showSuggestions);
      search.addEventListener('focus', showSuggestions);
      search.addEventListener('input', showSuggestions);
      document.addEventListener('click', event => {
        if (!search.contains(event.target) && !directory.contains(event.target)) {
          setSuggestions(false);
        }
      });
      document.addEventListener('focusin', event => {
        if (event.target !== search && !directory.contains(event.target)) {
          setSuggestions(false);
        }
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setSuggestions(false);
        if (event.target === search && event.key === 'ArrowDown') {
          event.preventDefault();
          showSuggestions();
          directory.querySelector('a')?.focus();
        }
      });

      if (slug === 'faq') {
        for (const heading of [...article.querySelectorAll('h5')]) {
          const details = document.createElement('details');
          const summary = document.createElement('summary');
          summary.textContent = heading.textContent;
          heading.replaceWith(details);
          details.append(summary);
          while (details.nextSibling && !/^H[1-6]$/.test(details.nextSibling.nodeName)) {
            details.append(details.nextSibling);
          }
        }
      }
    })
    .catch(() => {
      document.querySelector('#page-title').textContent = 'Unable to load this page';
      document.querySelector('#article').innerHTML =
        '<p>Please refresh or <a href="https://www.millennium.psu.edu/">visit the original website</a>.</p>';
    });
}
