import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'antd/dist/reset.css'
import "./utils/i18n/i18n.js";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)