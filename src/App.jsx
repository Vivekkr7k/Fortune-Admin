import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import AddCategory from './pages/category/AddCategory';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Contact from './pages/Contact/Contact';
import { url } from './util/Globalapi';

const App = () => {

  return (
    <div>
      <ToastContainer/>
      <Navbar/>
      <hr/>
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path='/' element={<Dashboard url={url} />} />
          <Route path='/dashboard' element={<Dashboard url={url} />} />
          <Route path='/add' element={<Add url={url} />} />
          <Route path='/list' element={<List url={url}/>} />
          <Route path='/orders' element={<Orders url={url}/>} />
          <Route path='/addCategory' element={<AddCategory url={url}/>} />
          <Route path='/Contact' element={<Contact url={url}/>} />
        </Routes>
      </div>
    </div>
  )
}

export default App