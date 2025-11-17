// Path :- jeevansetu-frontend/src/routes/index.jsx


import { Routes , Route , Navigate } from "react-router-dom";

import { getAccessToken } from "../lib/auth";

import AuthGuard  from "../components/AuthGuard";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";

import Dashboard from "../pages/Dashboard";

import Home from "../pages/Home";



export default function AppRoutes(){
         
    const token = getAccessToken();

    return (
            <Routes>
                 <Route path = "/" element = {<Navigate to = {token ? '/profile'  : '/home'} replace />} />
                 <Route path = "/home" element = {<Home/>}/>
                 <Route path = "/login" element = {<Login/>}/>
                 <Route path = "/register" element = {<Register/>}/>
                 <Route path = "/verify-email" element = {<VerifyEmail/>}/>
                 <Route path = "/forgot-password" element = {<ForgotPassword/>}/>
                 <Route path = "/reset-password" element = {<ResetPassword/>}/>

                 <Route element = {<AuthGuard/>} >
                   <Route path = "/profile" element = {<Dashboard/>}/>
                 </Route>

                 <Route path="*" element = {<Navigate to = "/home" replace />} />
            </Routes>
    )
}