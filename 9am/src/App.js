import React from 'react'
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from './componets/auth/Login.jsx';
import Signup from './componets/auth/Signup.jsx';
import Logout from './componets/auth/logout.jsx';
import Pnf from './componets/auth/Pnf.jsx';

import UserLayout from './componets/Layouts/UserLayout.jsx';
// import AdminLayout from './componets/Layouts/AdminLayout.js';

import Home from './componets/user/Records.jsx'
import Register from './componets/user/Register.jsx';
import Test from './componets/user/Test.jsx';
import Profile from './componets/user/Profile.jsx';

export const URL = "http://localhost:5000";
// export const URL = "https://9pm-one.vercel.app";

const App = () => {
    
  return (
    <BrowserRouter>
    <Toaster toastOptions={{className: 'customtoast',}}/>
      <Routes>
        
        <Route path='/' element={<Navigate to={'/user/home'}/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/logout' element={<Logout/>} />
        <Route path='/user' element={<Navigate to={'/user/home'}/>} />
        <Route path='/admin' element={<Navigate to={'/admin/home'}/>} />
      
        <Route path='/user' Component={UserLayout}>
            <Route path='home' element={<Home/>} />
            <Route path='register' element={<Register/>} />
            <Route path='update' element={<Test/>} />
            <Route path='profile' element={<Profile/>} />
            <Route path='*' element={<Pnf/>} />
        </Route>

        {/* <Route path='/admin' element={<AdminLayout/>}>
            <Route path='*' element={<Pnf/>} />
        </Route> */}

        <Route path='*' element={<Pnf/>} />
            
      </Routes>
    </BrowserRouter>
  )
}

export default App;

