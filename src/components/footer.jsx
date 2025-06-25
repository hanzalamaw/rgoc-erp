import './footer.css'

function footer(props){
    return(
        <>
        <p className='footer-text'>© 2025 {props.name}. All rights reserved. Powered by <a href="https://webhouseinc.co/">WebHouse Inc.</a></p>
        </>
    )
}

export default footer