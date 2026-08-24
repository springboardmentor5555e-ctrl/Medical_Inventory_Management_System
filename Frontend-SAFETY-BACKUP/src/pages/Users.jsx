import { useEffect, useState } from "react";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Users.css";


function Users() {

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    const [editId, setEditId] = useState(null);

    const [editUser, setEditUser] = useState({});


    useEffect(() => {

        loadUsers();

    }, []);



    const loadUsers = async () => {

        try {

            const response = await api.get("/users");

            setUsers(response.data);

        } catch(error) {

            console.log(error);

        }

    };



    const startEdit = (user) => {

        setEditId(user.id);

        setEditUser({
            ...user
        });

    };



    const handleChange = (e) => {

        setEditUser({

            ...editUser,

            [e.target.name]: e.target.value

        });

    };



    const saveEdit = async () => {

        try {

            await api.put(`/users/${editId}`, editUser);

            alert("User Updated Successfully");

            setEditId(null);

            loadUsers();


        } catch(error) {

            console.log(error);

        }

    };



    const cancelEdit = () => {

        setEditId(null);

        setEditUser({});

    };



    const deleteUser = async (id) => {

        if(window.confirm("Delete this user?")) {

            try {

                await api.delete(`/users/${id}`);

                loadUsers();

            } catch(error) {

                console.log(error);

            }

        }

    };



    return (

        <div className="users-container">


            <FaArrowLeft

                className="back-btn"

                onClick={() => navigate("/admin-dashboard")}

            />


            <h2>👥 Users</h2>



            <button

                className="add-user-btn"

                onClick={() => navigate("/add-user")}

            >

                + Add User

            </button>



            <table>


                <thead>

                    <tr>

                        <th>Name</th>

                        <th>Email</th>

                        <th>Role</th>

                        <th>Action</th>

                    </tr>

                </thead>


                <tbody>


                {users.map((user)=>(


                    <tr key={user.id}>


                        <td>

                        {editId === user.id ? (

                            <input

                                name="fullName"

                                value={editUser.fullName || ""}

                                onChange={handleChange}

                            />

                        ) : (

                            user.fullName

                        )}

                        </td>



                        <td>

                        {editId === user.id ? (

                            <input

                                name="email"

                                value={editUser.email || ""}

                                onChange={handleChange}

                            />

                        ) : (

                            user.email

                        )}

                        </td>



                        <td>

                        {editId === user.id ? (

                            <input

                                name="role"

                                value={editUser.role || ""}

                                onChange={handleChange}

                            />

                        ) : (

                            user.role

                        )}

                        </td>



                        <td>


                        {editId === user.id ? (


                            <>


                            <button

                            className="save-btn"

                            onClick={saveEdit}

                            >

                                <FaSave />

                            </button>



                            <button

                            className="cancel-btn"

                            onClick={cancelEdit}

                            >

                                <FaTimes />

                            </button>


                            </>


                        ) : (


                            <button

                            className="edit-btn"

                            onClick={() => startEdit(user)}

                            >

                                <FaEdit />

                            </button>


                        )}



                        <button

                        className="delete-btn"

                        onClick={() => deleteUser(user.id)}

                        >

                            <FaTrash />

                        </button>


                        </td>


                    </tr>


                ))}


                </tbody>


            </table>


        </div>

    );

}


export default Users;