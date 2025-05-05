import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { URL } from '../../App';
import Loading from '../auth/Loading';
import toast from 'react-hot-toast';
import { downloadExcel } from './ExcelFile';
import { getFromStore } from '../cookies/cookies';
import { MONTHS } from './ExcelFile';
import { useNavigate } from 'react-router-dom';

const Register = () => {

  const [data, setData] = useState(null);
  const [loading , setLoading] = useState(false);
  const [toatalMoneyCredited , setToatalMoneyCredited] = useState('0');
  const [totalUsage , setTotalUsage] = useState(0);
  const months = MONTHS;
  const navigate = useNavigate();

  const {catetories} = getFromStore("user");

  const fetchRecords = async ()=>{
    setLoading(true);
    try{
      const token = getFromStore("information");
       const res = await axios.get(`${URL}/api/mr/getregister`,{headers: {authorization:token,}});
      setData(res.data);
      let tmc =0, tu=0;
      res.data.forEach(item=>{
        tmc += item.money_credited;
        tu += item.usage;
      });
      setToatalMoneyCredited(tmc);
      setTotalUsage(tu);
    }
    catch(error){
      if(error?.response){
        if(error.response.status === 403 && error.response.data.exp)
          navigate("/logout");
        setData(null);
        toast.error("No Records Found");
      }
    }
    setLoading(false);
  }

   useEffect(()=>{
    fetchRecords();
  },[]);

const excelFile = async () =>{
  setLoading(true);
  await downloadExcel();
  setLoading(false);
  toast.success("Downloading");
}

  return (
    <div>
      {loading && <Loading/>}
      <h1  className="transcationstableh2" >Money Register</h1>
      <div className='exceld'>
      <div>
      <p>Total Money Credited : <strong>{toatalMoneyCredited?.toLocaleString('en-US')}</strong></p>
      <p>Total Usage : <strong>{totalUsage?.toLocaleString('en-US')}</strong></p>
      </div>
        <button onClick={excelFile}> download Register</button>
        </div>
        <div className="outterdivtable">
      <table>
        <thead>
            <tr key="head">
                <th>year</th>
                <th>month</th>
                <th>money credited</th>
                {catetories?.map((item, index)=>(<th key={index}>{item}</th>))}
                <th>usage</th>
                <th>Balance</th>
            </tr>
        </thead>
        <tbody>
        {data?.map(e=>(
            <tr key={e._id}>
                <td>{e.year}</td>
                <td>{months[e.month-1]}</td>
                <td>{e.money_credited?.toLocaleString('en-US')}</td>
                {catetories?.map((item, index)=>(<td key={index}>{e.catetories ? (e.catetories[item]?.toLocaleString('en-US') || 0) : 0}</td>))}
                <td>{e.usage?.toLocaleString('en-US')}</td>
                <td>{e.balance?.toLocaleString('en-US')}</td>
            </tr>
      ))}
        </tbody>
    </table>
    </div>
    </div>
  )
}

export default Register
