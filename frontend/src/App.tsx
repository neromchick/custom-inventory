import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import { Button } from '@/components/ui/button'

const HomePage = () => <div className='p-4'>Главная: List of inventories</div>
const DashBoard = () => <div className='p-4'>Личный кабинет: My inventories</div>
const AdminPanel = () => <div className='p-4'>Админка: Moderating users</div>

function App() {
console.log("React version:", React.version);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme==='light'?'dark':'light');

  return (
    <Router>
      <div className='app-container'>

        <header className='main-header'>
          <div className='logo'>InventoryApp</div>

          <div className='search-bar'>
            <input
              type='text'
              placeholder='Search from all application'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='header-actions'>
            <button onClick={toggleTheme}>
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button>Login</button>
          </div>
        </header>

        <main className='content-area'>
          <Routes>
            <Route path='/' element={<HomePage />}/>
            <Route path='/dashboard' element={<DashBoard />}/>
            <Route path='/admin' element={<AdminPanel />}/>
          </Routes>
        </main>

        <footer className='global-toolbar'>
          <span>Select elements: 0</span>
          <div className='actions'>
            <button disabled>Edit</button>
            <button disabled>Delete</button>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;