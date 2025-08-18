// Path :- jeevansetu-frontend/src/components/AuthGuard.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";

import {getAccessToken} from "../lib/auth";


export default function AuthGuard(){
      
      const token = getAccessToken();
      
      const location = useLocation();

      if(!token){

        return <Navigate to="/login" replace state={{from : location}}/>
      }

      return <Outlet/>;
}