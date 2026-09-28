import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './app/App.jsx'
import './index.css'   // ← Tailwind + global styles


import { store } from './app/app.store.js'  // tumhara configureStore wala file

createRoot(document.getElementById('root')).render(

    <Provider store={store}>
      <App />
    </Provider>
 
)