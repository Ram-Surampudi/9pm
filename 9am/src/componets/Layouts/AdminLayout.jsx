import React from 'react'
import Nav from '../admin/AdminNav'
import { Navigate, Outlet } from 'react-router-dom'
import { getFromStore } from '../cookies/cookies'

const AdminLayout = () => {
  return (
    <div>
        <Nav/>
        {getFromStore("information") ? <Outlet/> : <Navigate to="/login"/>}
    </div>
  )
}

export default AdminLayout
