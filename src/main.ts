import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient } from '@angular/common/http';
import { SearchBar } from './app/search-bar/search-bar';

(async () => {
  // Crear aplicación Angular standalone
  const app = await createApplication({
    providers: [
      provideHttpClient()
    ]
  });

  // Crear el custom element
  const searchBarElement = createCustomElement(SearchBar, {
    injector: app.injector
  });

  // Registrar como Web Component
  if (!customElements.get('semantic-search-bar')) {
    customElements.define('semantic-search-bar', searchBarElement);
  }
})();
