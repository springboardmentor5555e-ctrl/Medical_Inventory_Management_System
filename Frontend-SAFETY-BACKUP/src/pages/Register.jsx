import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import {
    FaEye,
    FaEyeSlash,
    FaUserShield,
    FaUserNurse,
    FaUserTie,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock
} from "react-icons/fa";

import registerBg from "../assets/register-bg.jpg";



function Register(){


const [showPassword,setShowPassword]=useState(false);


const [loading,setLoading]=useState(false);




const [data,setData]=useState({

    fullName:"",
    username:"",
    email:"",
    phone:"",
    password:"",
    role:"STAFF"

});







const handleSubmit=async(e)=>{


e.preventDefault();



try{


setLoading(true);



const response=await axios.post(

"http://localhost:8080/api/auth/register",

data

);



console.log(response.data);



alert(
"Registration Successful!"
);



}


catch(error){


console.log(error);



alert(

error.response?.data ||

"Registration Failed"

);



}


finally{


setLoading(false);


}



};









return(



<div


className="auth-container"



style={{


backgroundImage:

`

linear-gradient(

135deg,

rgba(0,70,120,.85),

rgba(0,180,220,.65)

),

url(${registerBg})

`

}}



>



<div className="auth-left">


<div className="brand">


<h1>

🏥 MediStock

</h1>


<p>

Create your medical inventory account

</p>


</div>





<div className="feature-list">


<div>

💊 Medicine Management

</div>


<div>

🚚 Supplier Management

</div>


<div>

⚠ Expiry Monitoring

</div>


<div>

📊 Inventory Analytics

</div>



</div>



</div>









<div className="auth-card register-card">



<div className="medical-icon">

💊

</div>




<h1 className="title">

Create Account

</h1>







<form onSubmit={handleSubmit}>







<div className="input-group">


<FaUser/>


<input

type="text"

placeholder="Full Name"

value={data.fullName}

onChange={(e)=>

setData({

...data,

fullName:e.target.value

})

}

/>


</div>










<div className="input-group">


<FaUser/>


<input

type="text"

placeholder="Username"

value={data.username}

onChange={(e)=>

setData({

...data,

username:e.target.value

})

}

/>


</div>











<div className="input-group">


<FaEnvelope/>


<input

type="email"

placeholder="Email Address"

value={data.email}

onChange={(e)=>

setData({

...data,

email:e.target.value

})

}

/>


</div>









<div className="input-group">


<FaPhone/>


<input

type="text"

placeholder="Mobile Number"

maxLength="10"

value={data.phone}

onChange={(e)=>

setData({

...data,

phone:e.target.value

})

}

/>


</div>









<div className="input-group password-wrapper">


<FaLock/>


<input


type={

showPassword

?

"text"

:

"password"

}


placeholder="Password"

value={data.password}

onChange={(e)=>

setData({

...data,

password:e.target.value

})

}

/>





<button

type="button"

className="eye-btn"

onClick={()=>setShowPassword(!showPassword)}

>



{

showPassword

?

<FaEyeSlash/>

:

<FaEye/>

}



</button>




</div>









<h3 className="role-title">

Choose Account Type

</h3>








<div className="role-box">





<button

type="button"

className={

data.role==="ADMIN"

?

"role active"

:

"role"

}


onClick={()=>setData({

...data,

role:"ADMIN"

})}


>

<FaUserShield/>

<span>

Admin

</span>


</button>









<button

type="button"

className={

data.role==="PHARMACIST"

?

"role active"

:

"role"

}


onClick={()=>setData({

...data,

role:"PHARMACIST"

})}


>

<FaUserNurse/>

<span>

Pharmacist

</span>


</button>









<button

type="button"

className={

data.role==="STAFF"

?

"role active"

:

"role"

}


onClick={()=>setData({

...data,

role:"STAFF"

})}


>

<FaUserTie/>

<span>

Staff

</span>


</button>





</div>









<button

className="primary-btn"

type="submit"

>



{

loading

?

"Creating Account..."

:

"✅ Create Account"

}



</button>








</form>









<div className="link">


<Link to="/">

Already have an account? Login

</Link>


</div>







</div>






</div>



);



}



export default Register;