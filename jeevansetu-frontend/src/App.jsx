// Path :- jeevansetu-frontend/src/App.jsx

import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick={false}
        draggable={false}
        hideProgressBar
        toastClassName={() => "bg-transparent shadow-none p-0"}
        bodyClassName={() => "p-0 m-0"}
      />
    </>
  );
}

export default App;
