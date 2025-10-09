import NavigationBar from '../components/navigation_bar.jsx'
import Footer from '../components/footer.jsx'
import Loans from '../components/loans.jsx';

function LoanManage(){
    return (
    <>
    <div className='wholePage'>
        <div>
            <NavigationBar companyName="GREENDOME TRAVEL & TOURS" active="gdtt-loanManage"/>
        </div>
        <div className='statsSide'>
            <div className='generalStats'>
                <Loans />
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