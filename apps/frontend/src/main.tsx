import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { loadRuntimeConfig } from './runtime-config';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

async function bootstrap() {
  await loadRuntimeConfig();

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
