import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global-styles.css'
import 'antd/dist/reset.css'
import "./utils/i18n/i18n.js";
import { Provider } from 'react-redux'
import { store } from './redux/store'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
        <App />
        </Provider>
    </StrictMode>,
)