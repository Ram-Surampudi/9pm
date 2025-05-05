import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import UserNav from '../user/UserNav'
import { getFromStore } from '../cookies/cookies'

const UserLayout = () => {
  return (
    <div>
        <UserNav/>
        {getFromStore("information") ? <Outlet/> : <Navigate to="/login"/>}
    </div>
  )
}

export default UserLayout
