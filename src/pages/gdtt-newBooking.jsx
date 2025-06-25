import { useEffect, useState } from 'react'
import { getToken, getUser } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import './gdtt-home.css'
import NavigationBar from '../components/navigation_bar.jsx'
import InputForm from '../components/inputForm.jsx'
import Footer from '../components/footer.jsx'

function newBooking(){

    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();

        if (!token) {
            navigate('/');
            return;
        }
    })

    return(
        <>
        <div className='wholePage'>
            <div>
                <NavigationBar companyName="GREENDOME TRAVEL & TOURS" active="gdtt-newBooking"/>
            </div>
            <div className='statsSide'>
                <div className='generalStats'>
                    <InputForm />
                </div>

                <div className='generalStats'>
                    <Footer name="GreeenDome Travel & Tours"/>
                </div>
            </div>
        </div>      
        </>
    )
}

export default newBooking