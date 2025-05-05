import React, { useState } from 'react'
import '../css/signup.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../../App';
import Loading from './Loading';
import toast from 'react-hot-toast';
import Nav from './Nav';
import { saveToStore } from '../cookies/cookies';

const Login = () => {
  const [data, setData] = useState({});
  const [loading , setLoading] = useState(false);
  const navigate = useNavigate();

  const set = e => setData({...data, [e.target.name]:e.target.value});

  const SubmitHandler = async (e)=>{
    data.name = data.name.trim();
    data.password = data.password.trim();
    if(data.name.length < 3 ){
      toast.error("Username should be atleast 3 characters long");
      return;
    }
    if(data.password.length < 6){
      toast.error("Password should be atleast 6 characters long");
      return;
    }
    e.preventDefault();
    setLoading(true);
    try{
      const res = await axios.post(`${URL}/api/auth/login`,data);
      if(res?.data){
        const {name, email, initialAmount, token, years, startMonth , catetories} = res.data;
        saveToStore("user", {name, email, initialAmount, years, startMonth , catetories} );
        saveToStore("information", token);
      }
      navigate('/user/home');
   }
   catch(error){
    toast.error(error?.response?.data || "An error occured");
   }
   setLoading(false);
  }

  return (
    <div>
      <Nav/>
      {loading && <Loading/>}
       <div className='contianer'>
        <div className='inner-container' style={{display:'grid' , placeItems:'center'}}>
          <p>LOGIN</p>
          <form onSubmit={SubmitHandler}>
            <label>Username:</label><br></br>
            <input type="text" name="name" required onChange={set} /><br />
              <label>password:</label><br></br>
            <input type="password" name="password" onChange={set} required /><br />
            <button className='btn-submit' type='submit'>Login</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
