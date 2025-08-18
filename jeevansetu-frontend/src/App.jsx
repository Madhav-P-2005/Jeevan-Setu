// Path :- jeevansetu-frontend/src/App.jsx

import {FaUser} from "react-icons/fa";   // User icon -> Font Awesome Set
import {CiLogout} from "react-icons/ci";  // Logout icon -> Circum Icon Set
import AppRoutes from "./routes";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css';

function App() {

  return (
       <div className="p-6">
         <h1 className="text-xl font-semibold flex items-center gap-2">
            <FaUser className="text-blue-600"/>
            🩸 JeevanSetu
         </h1>

         <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 transition-colors"> 
         <CiLogout/>
             Logout
          </button>

          <AppRoutes/>

       </div>
  )
}

export default App;