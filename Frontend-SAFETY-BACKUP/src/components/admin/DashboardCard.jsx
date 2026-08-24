import {
    FaPills,
    FaTruck,
    FaExclamationTriangle,
    FaMoneyBill,
    FaBoxes,
    FaUsers,
    FaChartLine
} from "react-icons/fa";



function DashboardCard({

    icon,

    title,

    value,

    color,

    subtitle

}) {





const icons = {


    medicine:

        <FaPills size={28}/>,



    supplier:

        <FaTruck size={28}/>,



    warning:

        <FaExclamationTriangle size={28}/>,



    sales:

        <FaMoneyBill size={28}/>,



    stock:

        <FaBoxes size={28}/>,



    users:

        <FaUsers size={28}/>,



    analytics:

        <FaChartLine size={28}/>


};







const status = {


    warning:"Attention",

    medicine:"Active",

    supplier:"Active",

    stock:"Available",

    sales:"Today",

    users:"Registered",

    analytics:"Updated"


};








return (



<div

className="
bg-white
rounded-2xl
border
border-gray-100
p-6
shadow-sm
hover:shadow-xl
transition-all
duration-300
hover:-translate-y-2
relative
overflow-hidden
"

>






{/* TOP DESIGN LINE */}



<div

className={`
absolute
top-0
left-0
h-1
w-full
${color}
`}

></div>









{/* HEADER */}



<div

className="
flex
justify-between
items-start
"

>





{/* ICON */}



<div

className={`
${color}
w-16
h-16
rounded-2xl
flex
items-center
justify-center
text-white
shadow-lg
`}
>


{

icons[icon]

||


<FaChartLine size={28}/>


}


</div>









{/* STATUS */}



<span

className="
text-xs
font-semibold
text-green-700
bg-green-50
px-3
py-1
rounded-full
"

>


{

status[icon]

||


"Active"


}


</span>





</div>












{/* TITLE */}



<p

className="
mt-6
text-gray-500
text-sm
font-semibold
uppercase
tracking-wide
"

>


{title}


</p>









{/* VALUE */}



<h1

className="
text-4xl
font-extrabold
text-gray-800
mt-2
"

>


{value}


</h1>









{/* SUBTITLE */}



{

subtitle &&


<p

className="
mt-3
text-sm
text-gray-400
"

>


{subtitle}


</p>


}







</div>


);


}



export default DashboardCard;