import React, { useEffect, useState } from "react";
import '../css/crud.css'
import "../css/records.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import Loading from '../auth/Loading';
import toast from "react-hot-toast";
import { MONTHS } from "./ExcelFile";
import { getFromStore, saveToStore } from "../cookies/cookies";

const EditableTable = () => {

  const presentyear = new Date().getFullYear();
  const presentmonth = new Date().getMonth()+1;
  
  const [year , setYear] = useState(presentyear);
  const [month , setMonth] = useState(presentmonth);
  const [tempYear , setTempYear] = useState(presentyear);
  const [tempMonth , setTempMonth] = useState(presentmonth);

  const calDate = ()=>{
   if(year === presentyear && month === presentmonth){
    return `${tempYear}-${String(tempMonth).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
   }
   return `${tempYear}-${String(tempMonth).padStart(2,'0')}-01`;
  }

  const temp = {
    _id: "",
    date: calDate(),
    description: "",
    quantity: "",
    credit: "",
    debit:"",
    balance:"",
    category:"usage",
  };

  let localuser = getFromStore("user");

  let {catetories, years} = localuser;
  

  const [yearList , setYearList] = useState(years);  

  let [data, setData] = useState(null);
  const [toggle , setToggle] = useState(false);
  const [ibr, setIbr] = useState(false);
  const [newRow, setNewRow] = useState(temp);
  const [insertRow, setInsertRow] = useState(temp);
  const [editRowId, setEditRowId] = useState(null);
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading , setLoading] = useState(false);
  const navigate = useNavigate();

  const set = e => setInsertRow({...insertRow, [e.target.name]:e.target.value});
  const handleDelete = async (id, index) =>{
    data = data.filter((row) => row._id !== id);
    for(var i =index===0 ? index : index-1 ; i<data.length; i++){
        calculateBalance(data[i], i);
      }
    setData(data);
    if(toggle) await handleUpdatedb();
  } 
  const handleInputChange = e => setNewRow({...newRow, [e.target.name] : e.target.value});

  const calculateBalance = (row , index) =>{
      row.balance = (index ===0 ? balance : data[index-1].balance) - (parseInt(row?.debit) || 0) + (parseInt(row?.credit) || 0);
  };

  const formateDate = date => {
    let d = new Date(date);
    return String(d.getDate()).padStart(2, '0')+ '-' + (d.getMonth()+1) + '-'+ d.getFullYear();
  }
  
  const handleInsert = async (e) => {
    if(!insertRow.description || !(insertRow.credit || insertRow.debit)){
      toast.error("Please fill all the fields");
      return;
    } 
    if(insertRow.credit && insertRow.debit){
      toast.error("fill only one (credit, debit)");
      return;
    }
    setLoading(true);
    try{
    insertRow._id = new Date();
    calculateBalance(insertRow,data ? data?.length : 0);
    if(data !== null){
      data.push(insertRow);
      setData([...data]);
    }
    else{
      data = [insertRow]
      setData(data);
    } 
    setInsertRow({...temp, date:calDate()});
    setTotal(data?.reduce((tot, current)=>tot+parseInt(current.debit || 0), 0) || 0);
    if(toggle) await handleUpdatedb();
  }
  catch(error){
    console.log(error);
  }
  setLoading(false);
  };

  const handleInsertAbove = (index) => {
    if(editRowId !== null){
      toast.error("Please save the current row before inserting a new one");
      return;
    }
    setLoading(true);
    const _id = new Date();
    setData((prevData) => {
      const updatedData = [...prevData];
      updatedData.splice(index, 0, {...temp, _id}); 
      return updatedData;
    });
    setIbr(true);
    setNewRow({...temp, _id})
    setEditRowId(_id);
    setLoading(false);
  };

  const handleEdit = (_id, row) => {
    setEditRowId(_id);
    setNewRow({...row, date:row.date.split("T")[0]});
  };

  const handleSave = async (index) => {
      setEditRowId(null);
      data[index] = newRow;
      if(ibr) setIbr(false);
      setTotal(data.reduce((tot, current)=>tot+parseInt(current.debit || 0), 0));
      for(var i =index ; i<data.length; i++){
        calculateBalance(data[i], i);
      }
      setData(data);
      setNewRow(temp);
      
      if(toggle) await handleUpdatedb();
  };
  
  const handleUpdatedb = async () =>{
    if(isNaN(year) || year < 2000 || year > 2100){
      toast.error("Please select a valid year");
      return;
    }
    setLoading(true);
    try{
      data?.forEach(item => {
        delete item._id;
        item.credit = parseInt(item.credit);
        item.debit = parseInt(item.debit);
      });
      if(!yearList.includes(year)){
        years = [...yearList, year];
        setYearList(years);
        saveToStore("user", {...localuser, years});
      }
      const token = getFromStore("information");
      
       const res = await axios.post(`${URL}/api/records/crud`,{month:tempMonth, year:tempYear, balance, transactions :data}, {headers: {Authorization:token,},});
       toast.success("Updated Sucessfully");
       setData(res?.data.transactions);
    }
    catch(error){
      if(error.response.status === 403 && error.response.data.exp)
        navigate("/logout");
       toast.error("Something Went Wrong");
    }
    setLoading(false);
  };

  const getRecords = async () =>{
    if(isNaN(year) || year < 2000 || year > 2200){
      toast.error("Please select a valid year");
      return;
    }
    setTempYear(year);
    setTempMonth(month);
    setInsertRow({...temp, date:calDate()});
    setLoading(true);
    const token = getFromStore("information");
    try{
      const res = await axios.post(`${URL}/api/records/query`,{month,year}, {headers: {authorization:token,}});
      setData(res?.data?.transactions); 
      setTotal(res?.data?.transactions?.reduce((tot, current)=>tot+current.debit, 0));
      setBalance(res?.data?.balance);
   }
   catch(error){
    setBalance(0);
    setTotal(0);
    setData(null);
    if(error.response.status === 403 && error.response.data.exp)
      navigate("/logout");
    }
    setLoading(false);
  };
  

  useEffect(()=>{
    getRecords();
    yearList.sort();

  },[]);

  return (
    <div>
      {loading && <Loading/>}
       <div className='recordcontianermain'>
        <div className='recordcontianersub'>
          <p>Money Resigter</p>
      <div>
      <label>Year(optional):</label>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {Array.from(yearList).map((item, index)=>(<option key={index} value={item}>{item}</option>))}
          </select>
          <label>Year:</label>
          <input className="yearinputele" type="number" min="2000" value={year} onChange={(e)=>setYear(parseInt(e.target.value))} max="2200"></input>
      </div>
      <div>
        <label>Month:</label>
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
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
      <button onClick={getRecords} >search</button>
    </div>
    </div>
          <h2 className="transcationstableh2" >{MONTHS[tempMonth-1]} {tempYear} Records</h2>      
          <div className="selfOrAuto">
          <div className="toggle-container">
            <span id="toggle-status">Auto Save </span>
            <div className={"toggle " + (toggle ? "active" : "")} id="toggle" onClick={(e)=>setToggle(!toggle)}></div>
          </div>
          <div>
            <button className="tablebutton save" onClick={handleUpdatedb}>SAVE</button>
          </div>
      </div>
      <div className="totalvaluesclass">
        <p>total Usage : {total?.toLocaleString('en-US')}</p>
      </div>

      <div className="outterdivtable">
        <table className="actionstableelements">
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>credit</th>
              <th>debit</th>
              <th>balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            
            {data?.map((row, index) => (
              editRowId !== row._id ?
              <tr key={row._id}>
                <td>{formateDate(row.date)}</td>
                <td>{row.description}</td>
                <td>{row?.category || "usage"}</td>
                <td>{row.quantity}</td>
                <td>{row.credit?.toLocaleString('en-US')}</td>
                <td>{row.debit?.toLocaleString('en-US')}</td>
                <td>{row.balance?.toLocaleString('en-US')}</td>
                <td className="actionbuttons">
                  <button className="tablebutton edit" onClick={() => handleEdit(row._id, row)}></button>
                  <button className="tablebutton insertabove" onClick={() => handleInsertAbove(index)}>&#8624;</button>
                  <button className="tablebutton" onClick={() => handleDelete(row._id, index)}>&#10060;</button>
                </td>
              </tr> 
              : <tr key={row._id} >
                  <td> <input className="tableinput" type="date" name="date" value={newRow.date} onChange={handleInputChange}/> </td>
                  <td> <input className="tableinput" type="text" name="description" value={newRow.description} onChange={handleInputChange }/> </td>
                  <td>
                    <select style={{border:"none", outline:"none"}} className='catops' value={newRow.category} name="category" onChange={handleInputChange} >
                      <option style={{border:"none", outline:"none"}} className='catops' value="usage">None</option>
                    {catetories?.map((item, index)=>(<option style={{border:"none", outline:"none"}} className='catops' key={index} value={item}>{item}</option>))}
                    </select></td>
                  <td> <input className="tableinput" type="text" name="quantity" value={newRow.quantity} onChange={handleInputChange}/> </td>
                  <td> <input className="tableinput" type="number" name="credit" value={newRow.credit} onChange={handleInputChange}/> </td>
                  <td> <input className="tableinput" type="number" name="debit" value={newRow.debit} onChange={handleInputChange}/> </td>
                  <td> <input className="tableinput" type="number" name="balance" value={newRow.balance} onChange={handleInputChange}/> </td>
                  {ibr ?
                    <td>
                      <button className="tablebutton insert" onClick={e=>handleSave(index)}>insert</button>
                    </td> : 
                    <td className="actionbuttons" >
                      <button className="tablebutton save" onClick={e=>handleSave(index)}>✓</button>
                      <button className="tablebutton insertabove" onClick={() => handleInsertAbove(index)}>&#8624;</button>
                      <button className="tablebutton delete" onClick={() => handleDelete(row.id, index)}>&#10060;</button>
                    </td>
                  }
              </tr>
            ))}
            <tr key={"edit"} >

                  <td> <input className="tableinput" type="date" name="date" value={insertRow.date} onChange={set}/> </td>
                  <td> <input className="tableinput" type="text" name="description" value={insertRow.description} onChange={set}/> </td>
                  <td>
                    <select value={insertRow.category} name="category" onChange={set} >
                      <option className='catops' value="usage">None</option>
                    {catetories?.map((item, index)=>(<option className='options' key={index} value={item}>{item}</option>))}
                    </select></td>
                  <td> <input className="tableinput" type="text" name="quantity" value={insertRow.quantity} onChange={set}/> </td>
                  <td> <input className="tableinput" type="number" name="credit" value={insertRow.credit} onChange={set} /></td>
                  <td> <input className="tableinput" type="number" name="debit" value={insertRow.debit} onChange={set}/> </td>
                  <td></td>
                  <td><button className="tablebutton insert" onClick={handleInsert}>insert</button></td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditableTable;
