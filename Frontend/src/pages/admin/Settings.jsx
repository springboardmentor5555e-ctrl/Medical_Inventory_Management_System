import { useEffect, useState } from "react";
import axios from "axios";


function Settings(){


const API="http://localhost:8080/api/users";



const [profile,setProfile]=useState({

    fullName:"",
    email:"",
    phone:""

});



const [password,setPassword]=useState({

    oldPassword:"",
    newPassword:""

});



const [loading,setLoading]=useState(false);



const token=localStorage.getItem("token");



const config={

headers:{

Authorization:`Bearer ${token}`

}

};








// ================= LOAD PROFILE =================


const loadProfile=async()=>{


if(!token){

alert("Please login again");

return;

}



try{


setLoading(true);



const response=await axios.get(

`${API}/profile`,

config

);



setProfile({

fullName:response.data.fullName || "",

email:response.data.email || "",

phone:response.data.phone || ""

});



}


catch(error){


console.log(error.response);



if(error.response?.status===401 ||
   error.response?.status===403){


alert(
"Session expired. Please login again"
);


localStorage.clear();


}



else{


alert(
"Failed to load profile"
);


}



}


finally{


setLoading(false);


}



};









useEffect(()=>{


loadProfile();


},[]);









// ================= PROFILE INPUT =================


const handleProfileChange=(e)=>{


setProfile({

...profile,

[e.target.name]:e.target.value

});


};









// ================= PASSWORD INPUT =================


const handlePasswordChange=(e)=>{


setPassword({

...password,

[e.target.name]:e.target.value

});


};









// ================= UPDATE PROFILE =================


const updateProfile=async(e)=>{


e.preventDefault();



try{


await axios.put(

`${API}/update-profile`,

{

fullName:profile.fullName,

phone:profile.phone

},

config

);



alert(

"Profile updated successfully"

);



loadProfile();



}


catch(error){


console.log(error.response);



alert(

error.response?.data ||

"Profile update failed"

);


}



};









// ================= CHANGE PASSWORD =================


const changePassword=async(e)=>{


e.preventDefault();



if(
!password.oldPassword ||
!password.newPassword
){


alert(
"Please enter both passwords"
);


return;

}




try{


const response=await axios.put(

`${API}/change-password`,

password,

config

);



alert(response.data);



setPassword({

oldPassword:"",

newPassword:""

});



}


catch(error){


console.log(error.response);



alert(

error.response?.data ||

"Password change failed"

);



}



};









return(



<div className="min-h-screen">





<h1 className="
text-3xl
font-bold
text-blue-700
mb-6
">

Account Settings

</h1>






{

loading ?



<div className="
text-center
text-blue-600
font-bold
text-xl
">

Loading profile...

</div>



:



<div className="
grid
grid-cols-1
lg:grid-cols-2
gap-6
">







{/* ================= PROFILE CARD ================= */}



<div className="
bg-white/80
backdrop-blur-lg
shadow-xl
rounded-2xl
p-6
">



<h2 className="
text-xl
font-bold
text-gray-700
mb-5
">

Profile Information

</h2>






<form onSubmit={updateProfile}>


<label className="
block
mb-2
font-semibold
">

Full Name

</label>



<input

type="text"

name="fullName"

value={profile.fullName}

onChange={handleProfileChange}

className="
w-full
border
rounded-lg
p-3
mb-4
"

/>








<label className="
block
mb-2
font-semibold
">

Email

</label>



<input

type="email"

name="email"

value={profile.email}

readOnly

className="
w-full
border
rounded-lg
p-3
mb-4
bg-gray-100
"

/>









<label className="
block
mb-2
font-semibold
">

Phone

</label>




<input

type="text"

name="phone"

value={profile.phone}

onChange={handleProfileChange}

className="
w-full
border
rounded-lg
p-3
mb-5
"

/>








<button

type="submit"

className="
bg-blue-600
hover:bg-blue-700
text-white
px-6
py-3
rounded-lg
font-bold
"

>

Update Profile

</button>





</form>





</div>









{/* ================= PASSWORD CARD ================= */}




<div className="
bg-white/80
backdrop-blur-lg
shadow-xl
rounded-2xl
p-6
">



<h2 className="
text-xl
font-bold
text-gray-700
mb-5
">

Change Password

</h2>






<form onSubmit={changePassword}>




<label className="
block
mb-2
font-semibold
">

Current Password

</label>



<input

type="password"

name="oldPassword"

value={password.oldPassword}

onChange={handlePasswordChange}

className="
w-full
border
rounded-lg
p-3
mb-4
"

/>







<label className="
block
mb-2
font-semibold
">

New Password

</label>




<input

type="password"

name="newPassword"

value={password.newPassword}

onChange={handlePasswordChange}

className="
w-full
border
rounded-lg
p-3
mb-5
"

/>








<button

type="submit"

className="
bg-green-600
hover:bg-green-700
text-white
px-6
py-3
rounded-lg
font-bold
"

>

Change Password

</button>





</form>





</div>






</div>


}



</div>



);


}



export default Settings;