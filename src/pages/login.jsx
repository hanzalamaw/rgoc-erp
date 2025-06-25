import './login.css'
import rgocLogo from '../assets/rgoc-logo.png'
import Form from '../components/loginForm'

function login() {

  return (
    <>
    <div className='loginSection'>
      <img src={rgocLogo} alt="RGOC LOGO" />
      <Form />
    </div>
    </>
  )

}

export default login