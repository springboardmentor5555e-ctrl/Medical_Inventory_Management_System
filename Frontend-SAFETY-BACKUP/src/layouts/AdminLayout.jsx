import { Outlet } from "react-router-dom";

import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/Navbar";


function AdminLayout() {


    return (


        <div className="
        flex
        h-screen
        bg-slate-100
        overflow-hidden
        ">


            {/* ================= SIDEBAR ================= */}

            <Sidebar />






            {/* ================= RIGHT CONTENT ================= */}


            <div className="
            flex-1
            ml-64
            flex
            flex-col
            h-screen
            ">





                {/* ================= NAVBAR ================= */}


                <header className="
                h-20
                bg-white
                shadow-sm
                z-30
                sticky
                top-0
                ">


                    <Navbar />


                </header>







                {/* ================= PAGE CONTENT ================= */}


                <main className="
                flex-1
                overflow-y-auto
                p-6
                bg-slate-100
                ">


                    <Outlet />


                </main>



            </div>



        </div>


    );


}


export default AdminLayout;