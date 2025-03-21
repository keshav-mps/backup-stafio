# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## API Configuration

This project uses Axios for all API calls with a centralized configuration for easier deployment. The API base URLs are configured in the `.env` file.

### Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:

- `VITE_API_BASE_URL`: The base URL for the API
- `VITE_AUTH_BASE_URL`: The base URL for authentication
- `VITE_LIVEKIT_API_KEY`: LiveKit API key
- `VITE_LIVEKIT_API_SECRET`: LiveKit API secret
- `VITE_LIVEKIT_URL`: LiveKit URL

### API Services

All API calls are organized in the `src/services` directory:

- `getServices.tsx`: Contains Axios instances with interceptors
- `apiService.ts`: Contains all API endpoints organized by feature
- `tokenManager.tsx`: Handles token storage and retrieval

## Deployment

To deploy the application:

1. Set the environment variables in your deployment environment
2. Build the application:

```bash
npm run build
```

3. Deploy the `dist` directory to your hosting provider

## Development

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
