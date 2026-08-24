import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    FaUserCircle,
    FaSignOutAlt,
    FaBell,
    FaCheck
} from "react-icons/fa";



function Navbar() {


    const navigate = useNavigate();


    const role =
        localStorage.getItem("role") || "ADMIN";


    const username =
        localStorage.getItem("username") || "Admin";


    const token =
        localStorage.getItem("token");



    const API =
        "http://localhost:8080/api/notifications";



    const [
        notifications,
        setNotifications
    ] = useState([]);



    const [
        showNotifications,
        setShowNotifications
    ] = useState(false);






    // ===============================
    // LOAD NOTIFICATIONS
    // ===============================


    useEffect(()=>{

        loadNotifications();


    },[]);






    const loadNotifications = async()=>{


        try{


            const res =
            await axios.get(

                API,

                {

                    headers:{

                        Authorization:
                        `Bearer ${token}`

                    }

                }

            );



            setNotifications(
                res.data
            );



        }

        catch(error){

            console.log(error);

        }


    };









    // ===============================
    // MARK AS READ
    // ===============================


    const markAsRead = async(id)=>{


        try{


            await axios.put(

                `${API}/${id}/read`,

                {},

                {

                    headers:{

                        Authorization:
                        `Bearer ${token}`

                    }

                }

            );



            loadNotifications();



        }

        catch(error){

            console.log(error);

        }


    };








    // ===============================
    // MARK ALL READ
    // ===============================


    const markAllRead = async()=>{


        try{


            await axios.put(

                `${API}/read-all`,

                {},

                {

                    headers:{

                        Authorization:
                        `Bearer ${token}`

                    }

                }

            );



            loadNotifications();


        }

        catch(error){

            console.log(error);

        }


    };









    // ===============================
    // LOGOUT
    // ===============================


    const logout =()=>{


        localStorage.clear();

        navigate("/");


    };







    const unreadCount =

        notifications.filter(
            item=>!item.isRead
        ).length;







    return (


<nav

className="
h-20
flex
items-center
justify-between
px-8
bg-white
shadow-sm
"

>



<div>


<h1

className="
text-2xl
font-bold
text-slate-800
"

>

MediStock

</h1>



<p

className="
text-sm
text-gray-500
"

>

Medical Inventory Management Platform

</p>


</div>








<div

className="
flex
items-center
gap-6
"

>






{/* ===============================
        NOTIFICATION
================================ */}



<div

className="
relative
"

>


<button


onClick={()=>


setShowNotifications(
!showNotifications
)


}


className="
relative
text-gray-500
hover:text-blue-600
transition
"

>


<FaBell size={22}/>



{

unreadCount > 0 &&



<span

className="
absolute
-top-2
-right-2
bg-red-500
text-white
text-xs
w-5
h-5
rounded-full
flex
items-center
justify-center
"

>

{unreadCount}


</span>


}



</button>







{

showNotifications &&



<div

className="
absolute
right-0
mt-4
w-96
bg-white
rounded-xl
shadow-xl
border
z-50
overflow-hidden
"

>



<div

className="
p-4
border-b
flex
justify-between
items-center
"

>


<h3

className="
font-bold
"

>

Notifications

</h3>



{

unreadCount > 0 &&



<button


onClick={markAllRead}


className="
text-xs
bg-green-600
text-white
px-3
py-1
rounded-lg
"

>

Mark All Read

</button>


}



</div>








{

notifications.length===0 ?



<p

className="
p-5
text-center
text-gray-500
"

>

No Notifications

</p>





:



<div

className="
max-h-96
overflow-y-auto
"

>



{

notifications.map((item)=>(



<div

key={item.id}


className={`

p-4
border-b

${

item.isRead

?

"bg-gray-50"

:

"bg-blue-50"

}

`

}


>


<p

className="
font-semibold
text-gray-800
"

>

{item.title}

</p>




<p

className="
text-sm
text-gray-600
mt-1
"

>

{item.message}

</p>




<p

className="
text-xs
text-gray-400
mt-2
"

>

{

new Date(
item.createdAt
).toLocaleString()

}

</p>







{

item.isRead ?



<p

className="
text-green-600
text-xs
font-semibold
mt-2
"

>

✓ Seen

</p>





:



<button


onClick={()=>

markAsRead(item.id)

}


className="
mt-2
bg-blue-600
text-white
px-3
py-1
rounded-lg
text-xs
flex
items-center
gap-2
"

>

<FaCheck/>

Mark as Read

</button>


}




</div>


))


}



</div>



}



</div>


}



</div>









{/* USER */}


<div

className="
flex
items-center
gap-3
border-l
pl-5
"

>


<FaUserCircle

className="
text-blue-600
text-4xl
"

/>



<div>


<p

className="
font-semibold
text-gray-700
"

>

{username}

</p>



<p

className="
text-xs
text-gray-500
"

>

{role}

</p>



</div>



</div>








{/* LOGOUT */}



<button


onClick={logout}


className="
flex
items-center
gap-2
bg-red-500
hover:bg-red-600
text-white
px-4
py-2
rounded-xl
transition
"

>


<FaSignOutAlt/>

Logout


</button>





</div>






</nav>


    );


}



export default Navbar;