import React, { useState } from 'react'
import '../css/signup.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../../App';
import Loading from './Loading';
import toast from 'react-hot-toast';
import Nav from './Nav';
import { saveToStore } from '../cookies/cookies';

const Signup = () => {
  const [data, setData] = useState({});
  const [loading , setLoading] = useState(false);
  const navigate = useNavigate();

  const set = e => setData({...data, [e.target.name]:e.target.value});

  const validate = (data) => {

    data.name = data.name.trim();
    data.password = data.password.trim();
    data.cpassword = data.cpassword.trim();
    
    if(data.name.length < 3 ){
      toast.error("Username should be atleast 3 characters long");
      return false;
    }
    if(data.password.length < 6){
      toast.error("Password should be atleast 6 characters long");
      return false;
    }
    if(data.password !== data.cpassword){
      toast.error("passwords doesn't match");
      setLoading(false);
      return false;
    }
    if(isNaN(data.initialAmount)){
      toast.error("Initial amount should be a number");
      return false;
    }

    return true;
  }

  const SubmitHandler = async (e)=>{
    e.preventDefault();
    if(!validate(data)) return;
    setLoading(true);
    try{
      const res = await axios.post(`${URL}/api/auth/register`,data);
      if(res?.data){
        const {name, email, initialAmount, token, years, startMonth , catetories} = res.data;
        saveToStore("user", {name, email, initialAmount, years, startMonth , catetories} );
        saveToStore("information", token);
      }
      setLoading(false);
      navigate('/user/home');
   }
   catch(error){
    toast.error(error.response.data.msg || "An error occured");
   }
   setLoading(false);
  }

  return (
    <div>
      <Nav/>
      {loading && <Loading/>}
       <div className='contianer'>
        <div className='inner-container' style={{display:'grid' , placeItems:'center'}}>
          <p>SIGNUP</p>
          <form onSubmit={SubmitHandler}>
            <label>Email:</label><br></br>
            <input type="email" name="email" required onChange={set} /><br />
            <label>Username:</label><br></br>
            <input type="text" name="name" required onChange={set} /><br />
            <label>Initial Amount:</label><br></br>
            <input type="number" name="initialAmount" required onChange={set} /><br />
              <label>password:</label><br></br>
            <input type="password" name="password" onChange={set} required /><br />
              <label>Confirm password:</label><br></br>
            <input type="password" name="cpassword" onChange={set} required /><br />
            <button className='btn-submit' type='submit'>Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup
