import { Outlet } from "react-router-dom";

import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/Navbar";

import staffBg from "../assets/staff-bg.jpg";


function StaffLayout() {

    return (

        <div className="
            flex
            h-screen
            overflow-hidden
            bg-gradient-to-br
            from-blue-100
            via-cyan-50
            to-white
        ">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside className="
                w-72
                flex-shrink-0
                h-screen
                overflow-hidden
            ">

                <Sidebar />

            </aside>



            {/* ==================================================
                RIGHT SIDE
            ================================================== */}

            <div className="
                flex
                flex-col
                flex-1
                min-w-0
                h-screen
                overflow-hidden
            ">


                {/* ==================================================
                    CONSTANT NAVBAR
                ================================================== */}

                <header className="
                    flex-shrink-0
                    z-30
                ">

                    <Navbar />

                </header>



                {/* ==================================================
                    STAFF PAGE CONTENT
                ================================================== */}

                <main

                    className="
                        flex-1
                        overflow-y-auto
                        overflow-x-hidden
                        p-6
                        md:p-8
                    "

                    style={{

                        backgroundImage: `

                            linear-gradient(
                                rgba(225,245,255,0.88),
                                rgba(255,255,255,0.94)
                            ),

                            url(${staffBg})

                        `,

                        backgroundSize: "cover",

                        backgroundPosition: "center",

                        backgroundAttachment: "fixed"

                    }}

                >

                    <Outlet />

                </main>

            </div>

        </div>

    );

}


export default StaffLayout;