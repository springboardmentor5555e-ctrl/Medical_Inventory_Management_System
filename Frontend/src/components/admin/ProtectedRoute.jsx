import { Navigate } from "react-router-dom";


function ProtectedRoute({ children, allowedRoles }) {


    const token = localStorage.getItem("token");

    const role = localStorage.getItem("role");



    // User not logged in
    if (!token) {

        return <Navigate to="/" />;

    }



    // Role checking
    if (
        allowedRoles &&
        !allowedRoles.includes(role)
    ) {

        return <Navigate to="/unauthorized" />;

    }



    return children;

}


export default ProtectedRoute;