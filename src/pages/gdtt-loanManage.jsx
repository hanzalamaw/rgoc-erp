import NavigationBar from '../components/navigation_bar.jsx'
import Footer from '../components/footer.jsx'
import Loans from '../components/loans.jsx';
import LoansTable from '../components/loans_table.jsx';
import { useState } from 'react';

function LoanManage(){
    const [refreshKey, setRefreshKey] = useState(0);
    
    // this will be passed to loans.jsx
    const handleLoanAdded = () => {
        setRefreshKey(oldKey => oldKey + 1); 
    };

    return ( 
    <>
    <div className='wholePage'>
        <div>
            <NavigationBar companyName="GREENDOME TRAVEL & TOURS" active="gdtt-loanManage"/>
        </div>
        <div className='statsSide'>
            <div className='generalStats'>
                <Loans onLoanAdded={handleLoanAdded} />
            </div>

            ({})
            <div className='generalStats'>
                <LoansTable status="active" refreshKey={refreshKey} />
            </div>

            <div className='generalStats'>
                <Footer name="GreenDome Travel & Tours"/>
            </div>
        </div>
    </div>
    </>
    )
} 

export default LoanManage;