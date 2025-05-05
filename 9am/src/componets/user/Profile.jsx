import React, { useState } from 'react';
import { getFromStore, saveToStore } from '../cookies/cookies';
import toast from 'react-hot-toast';
import axios from 'axios';
import { URL } from '../../App';
import Loading from '../auth/Loading';
import '../css/Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const data = getFromStore("user");
    const { email, name, initialAmount, startMonth } = data;
    const [bool, setBool] = useState(false);
    const [cats, setCats] = useState('');
    const [catetories, setCatetories] = useState(data.catetories || []);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(startMonth || 8);
    const navigate = useNavigate();


    const changeAnnualYear = async (e)=>{
      setLoading(true);
      let val = e.target.value;
      setMonth(val);
      try {
        const res = await axios.put(`${URL}/api/user/startmonth`, { startMonth:val}, { headers: { Authorization: getFromStore("information") } });
        toast.success(res.data.msg);
        saveToStore("user", { ...getFromStore("user"), startMonth: val });
    }
    catch (error) {
      if(error.response.status === 403 && error.response.data.exp)
        navigate("/logout");
        toast.error(error.response.data.msg);
    }
    setLoading(false);
    }

    const cathandler = async (e, add = true, gh="") => {
        setLoading(true);
        e.preventDefault();
        let categ = cats.trim();
        if (add) {
            if (!categ) {
                toast.error("Please enter a category name");
                setLoading(false);
                return;
            }
            if (catetories.includes(categ)) {
                toast.error("Category already exists");
                setLoading(false);
                return;
            }
        }
        else if (!window.confirm(`Do you want to delete the "${gh}" category?`)) {
            setLoading(false);
            return;
        }
        try {
            let sdata = add ? [...catetories, categ] : catetories.filter(item => item !== gh);
            console.log(sdata);
            
            const res = await axios.put(`${URL}/api/user/profile`, { catetories: sdata }, { headers: { Authorization: getFromStore("information") } });
            toast.success(res.data.msg);
            setCatetories(res.data.catetories);
            saveToStore("user", { ...getFromStore("user"), catetories: res.data.catetories });
        }
        catch (error) {
          if(error.response.status === 403 && error.response.data.exp)
            navigate("/logout");
            toast.error(error.response.data.msg);
        }
        setCats('');
        setBool(false);
        setLoading(false);
    }

    return (
        <div className="profile-container">
            {loading && <Loading />}
            <h2 className="categories-title">Information:</h2>
            <div className="profile-header">
                <h1>Email: {email}</h1>
                <h1>Name: {name}</h1>
                <h1>Initial Amount: {initialAmount}</h1>
            </div>

            <div>
                <h2 className="categories-title">Categories:</h2>
                <ul className="categories-list">
                    {catetories.map((item, index) => (
                        <li key={index} className="category-item">
                            <span className="category-name">{item}</span>
                            <button
                                className="delete-btn"
                                onClick={(e) => cathandler(e, false, item)}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>

                {bool ? (
                    <div className="add-category-container">
                        <input
                            type="text"
                            className="category-input"
                            placeholder="Add Category"
                            value={cats}
                            onChange={(e) => setCats(e.target.value)}
                        />
                        <span>
                        <button
                            onClick={(e) => cathandler(e)}
                            className="add-btn"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => setBool(false)}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        </span>
                        
                    </div>
                ) : (
                    <button
                        className="add-btn"
                        onClick={() => setBool(true)}
                    >
                        Add Category
                    </button>
                )}
            </div>
        <form className='profile-form'>
            <label className='prolabel'>Annual Start Month:</label>
            <select value={month} onChange={changeAnnualYear}>
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
        </form>

            <button className="logout-btn">
                <a href="/logout" style={{ color: 'inherit', textDecoration: 'none' }}>LogOut</a>
            </button>
        </div>
    );
}

export default Profile;
