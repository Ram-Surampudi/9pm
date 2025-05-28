import React, { useEffect, useState } from 'react'
import '../css/records.css'
import axios from 'axios';
import { URL } from '../../App';
import Loading from '../auth/Loading';
import toast from 'react-hot-toast';
import {MONTHS} from './ExcelFile';
import { getFromStore } from '../cookies/cookies';
import { useNavigate } from 'react-router-dom';

const Records = () => {

    const [year , setYear] = useState(new Date().getFullYear());
    const [month , setMonth] = useState(new Date().getMonth()+1);
    const [tempYear , setTempYear] = useState(year);
    const [tempMonth , setTempMonth] = useState(month);

    const [data, setData] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading , setLoading] = useState(false);
    const navigate = useNavigate();
    const yearList = getFromStore("user").years || [new Date().getFullYear()];
    yearList?.sort();
    
    const formateDate = date => {
      let d = new Date(date);
      return String(d.getDate()).padStart(2, '0')+ '-' + (d.getMonth()+1) + '-'+ d.getFullYear();
    }

    const getValue = value => value < 1 ? '-' : value?.toLocaleString('en-US') || '-';

    useEffect(()=>{
      fetchRecords();
    },[]);

    const fetchRecords = async ()=>{
      setTempYear(year);
      setTempMonth(month);
      setLoading(true);
        const token = getFromStore("information");
      try{
        const res = await axios.post(`${URL}/api/records/query`,{month,year}, {headers: {authorization:token,}});
        setData(res.data.transactions);
        setTotal(res.data.transactions.reduce((tot, current)=>tot+current.debit, 0)); 
     }
     catch(error){
        if(error.response && (error.response.status === 403 && error.response.data.exp))
          navigate("/logout");
        setData(null);
        toast.error("No Records Found");
     }
     setLoading(false);
    }
    
  return (
    <div>
      {loading && <Loading/>}
    <div className='recordcontianermain'>
        <div className='recordcontianersub'>
          <p>Money Resigter</p>
      <div>
        <label>Year:</label>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {yearList.map((item, index)=>(<option key={index} value={item}>{item}</option>))}
          </select>
      </div>
      <div>
        <label>Month:</label>
        <select value={month} onChange={(e) =>setMonth(parseInt(e.target.value))}>
          <option className='options' value="1">January</option>
          <option className='options' value="2">February</option>
          <option className='options'  value="3">March</option>
          <option className='options' value="4">April</option>
          <option className='options' value="5">May</option>
          <option className='options' value="6">June</option>
          <option className='options' value="7">July</option>
          <option className='options' value="8">August</option>
          <option className='options' value="9">September</option>
          <option className='options' value="10">October</option>
          <option className='options' value="11">November</option>
          <option className='options' value="12">December</option>
        </select>
      </div>
      <button onClick={fetchRecords}>search</button>
    </div>
    </div>
    {data ?
    <div>
      <h2 className="transcationstableh2" >{MONTHS[tempMonth-1]} {tempYear} Records</h2>
      <p className="totalvaluesclass" >TOTAL USAGE : <strong>{total.toLocaleString('en-US')}</strong></p>
      <div className="outterdivtable">
    <table>
        <thead>
            <tr key="head">
                <th>Date</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>credit</th>
                <th>debit</th>
                <th>Balance</th>
            </tr>
        </thead>
        <tbody>
      {data.map(e=>(
            <tr key={e._id}>
                <td>{formateDate(e.date)}</td>
                <td>{e.description}</td>
                <td>{getValue(e.quantity)}</td>
                <td>{getValue(e.credit)}</td>
                <td>{getValue(e.debit)}</td>
                <td>{getValue(e.balance)}</td>
            </tr>
      ))}
        </tbody>
    </table>
    </div>
    </div>
  : !loading && <p style={{textAlign:"center", marginTop:"10px", fontSize:"1.5rem"}}>{MONTHS[tempMonth-1]} {tempYear} No Records Found</p>}
    </div>
  )
}

export default Records
