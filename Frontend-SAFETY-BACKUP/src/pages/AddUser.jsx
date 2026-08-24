import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/AddUser.css";

function AddUser() {

    const navigate = useNavigate();
    const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: ""
});
    const handleChange = (e) => {

        setUser({

            ...user,

            [e.target.name]: e.target.value

        });

    };
    const saveUser = async (e) => {

    e.preventDefault();

    try {

        await api.post("/users", user);

        alert("User Added Successfully!");

        navigate("/users");

    } catch (error) {

        console.log(error);

        alert("Failed to save user!");

    }

};

    return (

        <div className="add-user-container">

            <div className="add-user-box">

                <h2>➕ Add User</h2>

                <form onSubmit={saveUser}>

                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={user.fullName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={user.phone}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={user.password}
                        onChange={handleChange}
                        required
                    />
                    <input
    type="text"
    name="role"
    placeholder="Enter Role"
    value={user.role}
    onChange={handleChange}
    required
/>

                    <button type="submit">
                        Save User
                    </button>

                </form>

            </div>

        </div>

    );

}

export default AddUser;