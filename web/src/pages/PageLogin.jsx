/* global chrome */
import React, { useContext, useEffect, useState } from 'react'
import * as API from "../utils/api";
import * as Google from "../utils/google";
import swal from 'sweetalert';
import { Link, useNavigate } from 'react-router-dom';
import { ContextSetUser } from '../App';
import logo from '../images/logo192.png';
import { FcGoogle, } from 'react-icons/fc';

function PageLogin() {

  const [loading, setLoading] = useState(false);
  const navigation = useNavigate();
  const setUser = useContext(ContextSetUser);



  useEffect(() => {
    API.getAccessToken().then((accessToken) => {
      if (accessToken) navigation('/dashboard')
    });
  }, [navigation]);


  const onSubmit = async (e) => {

    e.preventDefault();

    try {
      setLoading(true);
      const email = e.target['email'].value;
      const password = e.target['password'].value;
      const response = await API.PostAPI('/api/email/oauth', { email, password });
      if (response.result) {
        swal('Login', response.message, 'success');
        chrome.storage.local.set({ user: response.access_token });

        const user = await API.GetAPI(`/api/user`);
        setUser(user);

        navigation('/dashboard');
      } else {
        swal('Login', response.message, 'warning');
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }

  const onForgetPassword = async (e) => {
    const email = await swal({
      title: "Forgot Password",
      text: `Please enter your email`,
      info: `info`,
      content: 'input',
      buttons: ['NO', 'RESET PASSWORD']
    });

    if (email) {
      try {
        setLoading(true);
        const res = await API.PostAPI('/api/email/password/forgot', { email });
        swal('Reset Password', res.message, res.result ? 'success' : 'warning');
      } catch (e) {
        console.log(e.message);
        swal('Forgot Password', 'Something went wrong', 'error')
      } finally {
        setLoading(false);
      }

    }
  }

  const onGoogle = async () => {
    const response = await Google.login();
    if (response.result) swal('Login Successful')
    const user = await API.GetAPI(`/api/user`);
    setUser(user);
    navigation('/dashboard');
  }

  return (
    <form onSubmit={onSubmit} className='flex flex-col justify-center items-center h-[100vh] gap-4'>
      <img src={logo} width={120} alt="CRM" />
      <p onClick={() => chrome.tabs.create({ url: "https://crmsidekick.com" })} className='text-xl text-white hover:text-amber-600 duration-200 cursor-pointer hover:font-bold'><span><b>CRM</b></span> <span><i>Side Kick</i></span></p>
      <input disabled={loading} className='min-w-72  px-4 py-2 text-sm rounded-3xl' placeholder='Email' type="email" name="email" required />
      <input disabled={loading} className='min-w-72  px-4 py-2 text-sm rounded-3xl' placeholder='Password' type="password" name="password" required />
      <button disabled={loading} type='submit' className='text-amber-900 min-w-72 px-4 py-2 text-sm rounded-3xl bg-gradient-to-tr from-red-300 to-amber-400 shadow-md shadow-amber-100 hover:to-amber-600 hover:bg-gray-400 hover:shadow-lg hover:shadow-amber-800 duration-500 font-bold '>
        {loading ? "Loading..." : "Login"}
      </button>
      <div className='flex gap-6 my-3 text-white'>
        <Link to="/signup">Sign Up</Link>
        <span onClick={onForgetPassword} className='hover:text-red-300 cursor-pointer duration-200'>Forgot Password?</span>
      </div>
      <div className='flex gap-5'>

        <button onClick={onGoogle} disabled={loading} className='p-2 text-xl rounded-full bg-white shadow-md shadow-white hover:bg-gray-400 hover:shadow-lg hover:shadow-white duration-500 flex gap-3 justify-center items-center'>
          <span className='flex gap-5'><FcGoogle size={25} /><span>Continue with Google</span></span>
        </button>


      </div>

    </form>
  )
}

export default PageLogin