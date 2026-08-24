import { useEffect, useState } from "react";
import axios from "axios";

import {
    FaSearch,
    FaTrash,
    FaUsers,
    FaPhone,
    FaEnvelope,
    FaUserShield,
    FaPlus,
    FaEdit,
    FaTimes
} from "react-icons/fa";


function ManageUsers(){


const API = "http://localhost:8080/api/users";



// ================= STATES =================


const [users,setUsers] = useState([]);

const [search,setSearch] = useState("");

const [loading,setLoading] = useState(false);

const [buttonLoading,setButtonLoading] = useState(false);



const [showModal,setShowModal] = useState(false);

const [editMode,setEditMode] = useState(false);

const [selectedUser,setSelectedUser] = useState(null);



const initialForm = {

    fullName:"",
    username:"",
    email:"",
    phone:"",
    password:"",
    role:"STAFF"

};



const [form,setForm] = useState(initialForm);





// ================= TOKEN =================


const getToken = ()=>{

    return localStorage.getItem("token");

};






// ================= AXIOS HEADER =================


const authHeader = ()=>{


    const token = getToken();


    if(!token){

        alert(
            "Session expired. Please login again"
        );

        return {};

    }


    return {

        headers:{

            Authorization:
            `Bearer ${token}`

        }

    };


};








// ================= FETCH USERS =================


const fetchUsers = async()=>{


try{


setLoading(true);



const response = await axios.get(

    API,

    authHeader()

);



setUsers(

    response.data.sort(

        (a,b)=>
        a.id-b.id

    )

);



}


catch(error){


console.log(error.response);



if(error.response?.status === 403){


    alert(
        "Access denied. Login with ADMIN account"
    );


}

else{


    alert(

        error.response?.data
        ||
        "Failed to load users"

    );


}



}



finally{


setLoading(false);


}



};








useEffect(()=>{


fetchUsers();


},[]);









// ================= INPUT CHANGE =================


const handleChange = (e)=>{


setForm({

    ...form,

    [e.target.name]:

    e.target.value


});


};









// ================= ADD USER =================


const addUser = async(e)=>{


e.preventDefault();



try{


setButtonLoading(true);



await axios.post(

    API,

    form,

    authHeader()

);



alert(
    "User created successfully"
);



setShowModal(false);


setForm({...initialForm});



fetchUsers();



}


catch(error){


console.log(error.response);



alert(

    error.response?.data
    ||
    "Unable to create user"

);



}



finally{


setButtonLoading(false);


}



};











// ================= UPDATE USER =================


const updateUser = async(e)=>{


e.preventDefault();



try{


setButtonLoading(true);



const updateData = {


    fullName:
    form.fullName,


    username:
    form.username,


    email:
    form.email,


    phone:
    form.phone,


    role:
    form.role



};




// Send password only when entered

if(

    form.password &&
    form.password.trim() !== ""

){


    updateData.password =
    form.password;


}




await axios.put(

    `${API}/${selectedUser.id}`,

    updateData,

    authHeader()

);




alert(
    "User updated successfully"
);




setShowModal(false);


setEditMode(false);


setSelectedUser(null);


setForm({...initialForm});



fetchUsers();



}


catch(error){


console.log(error.response);



alert(

    error.response?.data
    ||
    "Update failed"

);



}


finally{


setButtonLoading(false);


}



};












// ================= DELETE USER =================


const deleteUser = async(id)=>{


const confirmDelete =
window.confirm(
    "Delete this user?"
);



if(!confirmDelete)

return;





try{


await axios.delete(

    `${API}/${id}`,

    authHeader()

);




alert(
    "User deleted successfully"
);



fetchUsers();



}



catch(error){


console.log(error.response);



alert(

    error.response?.data
    ||
    "Delete failed"

);



}



};









// ================= OPEN ADD MODAL =================


const openAddModal = ()=>{


setEditMode(false);


setSelectedUser(null);


setForm({...initialForm});


setShowModal(true);



};











// ================= OPEN EDIT MODAL =================


const openEditModal = (user)=>{


setEditMode(true);


setSelectedUser(user);



setForm({


fullName:
user.fullName || "",


username:
user.username || "",


email:
user.email || "",


phone:
user.phone || "",


password:"",


role:
user.role?.roleName || "STAFF"



});



setShowModal(true);



};
// ================= SEARCH FILTER =================


const filteredUsers = users.filter((user)=>{


const value = search.toLowerCase();



return (

user.fullName
?.toLowerCase()
.includes(value)


||

user.username
?.toLowerCase()
.includes(value)


||

user.email
?.toLowerCase()
.includes(value)


||

user.phone
?.includes(value)


);



});









// ================= ROLE COLOR =================


const roleStyle = (role)=>{


if(role==="ADMIN")

return "bg-red-100 text-red-700";



if(role==="PHARMACIST")

return "bg-green-100 text-green-700";



return "bg-blue-100 text-blue-700";


};





return(


<div className="max-w-7xl mx-auto">






{/* ================= HEADER ================= */}


<div
className="
bg-gradient-to-r
from-blue-700
via-blue-600
to-cyan-500
rounded-3xl
p-8
text-white
shadow-xl
mb-8
"
>


<div
className="
flex
justify-between
items-center
"
>



<div
className="
flex
items-center
gap-5
"
>


<div
className="
bg-white/20
p-5
rounded-2xl
"
>

<FaUsers size={38}/>

</div>




<div>


<h1
className="
text-4xl
font-bold
"
>

User Management

</h1>



<p
className="
text-blue-100
mt-2
"
>

Manage users, roles and permissions

</p>



</div>


</div>






<button

onClick={openAddModal}

className="
hidden
md:flex
items-center
gap-3
bg-white
text-blue-700
px-6
py-3
rounded-2xl
font-bold
shadow-lg
hover:scale-105
transition
"

>


<FaPlus/>

Add User


</button>



</div>


</div>









{/* MOBILE BUTTON */}



<button

onClick={openAddModal}

className="
md:hidden
w-full
mb-5
bg-blue-600
text-white
py-3
rounded-xl
font-bold
flex
justify-center
items-center
gap-2
"

>

<FaPlus/>

Add User

</button>









{/* ================= SEARCH ================= */}



<div
className="
bg-white
rounded-2xl
shadow-md
p-5
mb-6
"
>



<div
className="
flex
items-center
gap-3
bg-gray-100
rounded-xl
px-5
"
>



<FaSearch className="text-gray-400"/>



<input


type="text"


placeholder="
Search users by name,email,username...
"


value={search}



onChange={(e)=>
setSearch(e.target.value)
}



className="
w-full
py-3
bg-transparent
outline-none
"



/>



</div>


</div>









{/* ================= TABLE ================= */}



<div
className="
bg-white
rounded-3xl
shadow-xl
overflow-hidden
border
"
>



{

loading ?


<div
className="
p-10
text-center
text-blue-600
font-bold
text-xl
"
>

Loading users...

</div>



:



<div className="overflow-x-auto">


<table
className="
w-full
min-w-[1100px]
"
>



<thead
className="
bg-blue-600
text-white
"
>


<tr>


<th className="p-4 text-left">
ID
</th>



<th className="p-4 text-left">
User
</th>



<th className="p-4 text-left">
Username
</th>



<th className="p-4 text-left">
Email
</th>



<th className="p-4 text-left">
Phone
</th>



<th className="p-4 text-center">
Role
</th>



<th className="p-4 text-center">
Action
</th>


</tr>


</thead>







<tbody>



{

filteredUsers.length===0 ?



<tr>


<td

colSpan="7"

className="
text-center
p-10
text-gray-500
font-semibold
"

>


No Users Found


</td>


</tr>



:



filteredUsers.map((user)=>(



<tr

key={user.id}

className="
border-b
hover:bg-blue-50
transition
"

>







{/* ID */}


<td
className="
p-4
font-bold
"
>

{user.id}

</td>









{/* USER */}


<td className="p-4">


<div
className="
flex
items-center
gap-3
"
>


<div
className="
bg-blue-100
text-blue-600
p-3
rounded-xl
"
>

<FaUsers/>

</div>




<div>


<p
className="
font-bold
"
>

{user.fullName || "N/A"}

</p>



<p
className="
text-sm
text-gray-500
"
>

{user.username}

</p>



</div>


</div>


</td>









{/* USERNAME */}


<td className="p-4">

{user.username}

</td>









{/* EMAIL */}


<td className="p-4">


<div
className="
flex
items-center
gap-2
"
>


<FaEnvelope
className="text-red-500"
/>


{user.email || "N/A"}


</div>


</td>









{/* PHONE */}


<td className="p-4">


<div
className="
flex
items-center
gap-2
"
>


<FaPhone
className="text-green-600"
/>



{user.phone || "N/A"}


</div>


</td>









{/* ROLE */}


<td
className="
p-4
text-center
"
>


<span

className={`
inline-flex
items-center
gap-2
px-4
py-2
rounded-full
font-bold
text-sm
${roleStyle(user.role?.roleName)}
`}

>


<FaUserShield/>


{user.role?.roleName || "STAFF"}


</span>



</td>









{/* ACTION */}


<td
className="
p-4
text-center
"
>


<div
className="
flex
justify-center
gap-3
"
>


<button

onClick={()=>
openEditModal(user)
}


className="
bg-blue-500
hover:bg-blue-600
text-white
px-4
py-2
rounded-xl
flex
items-center
gap-2
"

>


<FaEdit/>

Edit


</button>







<button

onClick={()=>
deleteUser(user.id)
}


className="
bg-red-500
hover:bg-red-600
text-white
px-4
py-2
rounded-xl
flex
items-center
gap-2
"

>


<FaTrash/>

Delete


</button>



</div>


</td>







</tr>


))


}



</tbody>



</table>


</div>



}



</div>{/* ================= ADD / EDIT MODAL ================= */}


{

showModal &&


<div
className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
z-50
"
>


<div
className="
bg-white
rounded-3xl
w-full
max-w-lg
p-8
shadow-xl
"
>





<div
className="
flex
justify-between
items-center
mb-6
"
>


<h2
className="
text-2xl
font-bold
text-blue-700
"
>


{

editMode

?

"Edit User"

:

"Add User"


}


</h2>




<button


onClick={()=>setShowModal(false)}


className="
text-red-500
text-xl
"

>


<FaTimes/>


</button>



</div>









<form

onSubmit={

editMode

?

updateUser

:

addUser

}


className="
space-y-4
"

>








<input


name="fullName"


value={form.fullName}


onChange={handleChange}


placeholder="Full Name"


className="
w-full
border
p-3
rounded-xl
"


required


/>









<input


name="username"


value={form.username}


onChange={handleChange}


placeholder="Username"


className="
w-full
border
p-3
rounded-xl
"


required


/>











<input


name="email"


type="email"


value={form.email}


onChange={handleChange}


placeholder="Email"


className="
w-full
border
p-3
rounded-xl
"


required


/>









<input


name="phone"


value={form.phone}


onChange={handleChange}


placeholder="Phone Number"


className="
w-full
border
p-3
rounded-xl
"


required


/>









<input


name="password"


type="password"


value={form.password}


onChange={handleChange}



placeholder={

editMode

?

"New Password (optional)"

:

"Password"

}



className="
w-full
border
p-3
rounded-xl
"



required={!editMode}


/>









<select


name="role"


value={form.role}


onChange={handleChange}


className="
w-full
border
p-3
rounded-xl
"



>



<option value="STAFF">

STAFF

</option>



<option value="PHARMACIST">

PHARMACIST

</option>



<option value="ADMIN">

ADMIN

</option>



</select>









<button


type="submit"



disabled={buttonLoading}



className="
w-full
bg-blue-600
text-white
py-3
rounded-xl
font-bold
hover:bg-blue-700
disabled:bg-gray-400
"



>



{

buttonLoading

?

"Saving..."

:


editMode

?

"Update User"

:

"Create User"


}



</button>









</form>







</div>


</div>


}



</div>


);


}



export default ManageUsers;