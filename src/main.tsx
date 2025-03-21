// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter  as Router } from 'react-router-dom'
// import { registerSW } from 'virtual:pwa-register'

import './index.css'
// import { ApolloProvider } from '@apollo/client';
import App from './App.tsx'
// import client from './ApolloClient';

createRoot(document.getElementById('root')!).render(
  // <ApolloProvider client={client}>
  // <StrictMode>
  <Router>
  <App />
  </Router>
  //  </StrictMode>
  // </ApolloProvider>
)
if (import.meta.env.MODE === 'production') {
  // Register service worker in production
  registerSW()
}