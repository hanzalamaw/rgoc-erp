import './loans.css';

function Loans(){

    const addNewLoan = () => {
        document.querySelector('.newLoanModal').classList.add('show');
        document.querySelector('.newLoanModal').style.display = "flex";
    }

    const close = () => {
        document.querySelector('.newLoanModal').style.display = "none";
        document.querySelector('.newLoanModal').classList.remove('show');
        document.getElementById("name").value = "";
        document.getElementById("contact").value = "";
        document.getElementById("customer_id").value = "";
        document.getElementById("booking_id").value = "";
    }

    const submitLoan = (e) => {
        e.preventDefault();
        close();
    }

    return (
    <> 
    <div className='loanHeader'>
        <h1>LOAN MANAGEMENT</h1>
        <button className="addNewLoanBtn" onClick={addNewLoan}>Add New Loan</button>
    </div>

    <section className='newLoanModal'>
        <div className='content'>
            <div>
                <h2>New Loan</h2>
            </div>

            <div className='loanInputs'>
                <label htmlFor="name">Search by Name</label>
                <input type="text" id="name" name="name" placeholder='Search by Name' autoComplete='off' readOnly required/>
            </div>

            <div className='loanBtns'> 
                <button onClick={e => close(e)}>Close</button>
                <button className='submitBtn' onClick={e => submitLoan(e)}>Submit</button>
            </div>
        </div>
    </section>
    </>
    )
}

export default Loans;