import React from 'react'
import { Navigate } from 'react-router-dom';
import { removeFromStore } from '../cookies/cookies';

const Logout = () => {
  removeFromStore();
  return <Navigate to={"/login"}/>
}

export default Logout;
