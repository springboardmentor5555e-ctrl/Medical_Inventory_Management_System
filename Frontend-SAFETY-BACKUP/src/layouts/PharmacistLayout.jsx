import { Outlet } from "react-router-dom";

import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/Navbar";

function PharmacistLayout() {
    return (
        <div className="
            h-screen
            overflow-hidden
            bg-gradient-to-br
            from-blue-100
            via-cyan-50
            to-white
        ">

            {/* =========================================
                FIXED SIDEBAR
            ========================================= */}

            <div className="
                fixed
                left-0
                top-0
                bottom-0
                w-72
                z-50
            ">
                <Sidebar />
            </div>

            {/* =========================================
                FIXED NAVBAR
            ========================================= */}

            <div className="
                fixed
                top-0
                left-72
                right-0
                h-20
                z-40
            ">
                <Navbar />
            </div>

            {/* =========================================
                CONTENT AREA
            ========================================= */}

            <main className="
                absolute
                left-72
                right-0
                top-20
                bottom-0
                overflow-y-auto
                p-6
            ">
                <Outlet />
            </main>

        </div>
    );
}

export default PharmacistLayout;