import { useEffect, useState } from "react";
import axios from "axios";

import {
    FaDownload,
    FaBoxes,
    FaChartLine,
    FaExclamationTriangle,
    FaCalendarTimes
} from "react-icons/fa";


import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";


import {
    Doughnut,
    Bar
} from "react-chartjs-2";


ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);



function Reports(){



const [report,setReport]=useState({

    totalMedicines:0,

    totalStock:0,

    lowStock:[],

    expiredMedicines:[]

});



const [loading,setLoading]=useState(true);





const token = localStorage.getItem("token");


const config={

headers:{

Authorization:`Bearer ${token}`

}

};







// ================= FETCH REPORT =================


const fetchReport=async()=>{


try{


const response = await axios.get(

"http://localhost:8080/api/reports/inventory",

config

);



setReport({

totalMedicines:
response.data.totalMedicines || 0,


totalStock:
response.data.totalStock || 0,


lowStock:
response.data.lowStock || [],


expiredMedicines:
response.data.expiredMedicines || []

});


}

catch(error){


console.log(error);


alert(
"Failed to load reports"
);


}


finally{


setLoading(false);


}


};







useEffect(()=>{


fetchReport();


},[]);








// ================= DOWNLOAD PDF =================


const downloadPDF=async()=>{


try{


const response = await axios.get(

"http://localhost:8080/api/reports/pdf",

{

...config,

responseType:"blob"

}

);



const blob = new Blob(

[response.data],

{

type:"application/pdf"

}

);



const url =
window.URL.createObjectURL(blob);



const link=document.createElement("a");


link.href=url;


link.download="MediStock_Report.pdf";


link.click();



}

catch(error){


console.log(error);


alert(
"PDF download failed"
);


}


};








// ================= CHART DATA =================



const stockData={


labels:[

"Available Stock",

"Low Stock"

],


datasets:[{

data:[

report.totalStock,

report.lowStock.length

],


backgroundColor:[

"#22c55e",

"#ef4444"

],


borderWidth:0


}]


};








const expiryData={


labels:[

"Expired",

"Safe"

],


datasets:[{


data:[


report.expiredMedicines.length,


report.totalMedicines -
report.expiredMedicines.length


],


backgroundColor:[

"#dc2626",

"#3b82f6"

],


borderWidth:0


}]


};








const lowStockData={


labels:

report.lowStock.map(

item=>item.name

),



datasets:[{


label:"Quantity",


data:

report.lowStock.map(

item=>item.quantity

),



backgroundColor:"#2563eb",


borderRadius:8


}]


};







const doughnutOptions={


responsive:true,


plugins:{


legend:{


position:"bottom"


}


},


cutout:"65%"


};







if(loading)


return(


<div className="
flex
justify-center
items-center
h-96
">


<h2 className="
text-2xl
font-bold
text-blue-600
">

Loading Reports...

</h2>


</div>


);






return(



<div className="space-y-8">







{/* HEADER */}



<div className="
bg-white
rounded-3xl
shadow-sm
border
p-6
flex
justify-between
items-center
">



<div>


<h1 className="
text-3xl
font-bold
text-gray-800
">

Inventory Analytics

</h1>



<p className="
text-gray-500
mt-2
">

MediStock performance and inventory insights

</p>


</div>





<button

onClick={downloadPDF}

className="
flex
items-center
gap-3
bg-blue-600
text-white
px-5
py-3
rounded-xl
hover:bg-blue-700
transition
"

>


<FaDownload/>

Export Report


</button>



</div>







{/* KPI CARDS */}


<div className="
grid
grid-cols-1
md:grid-cols-4
gap-6
">



<Card

title="Total Medicines"

value={report.totalMedicines}

icon={<FaBoxes/>}

/>




<Card

title="Total Stock"

value={report.totalStock}

icon={<FaChartLine/>}

/>




<Card

title="Low Stock"

value={report.lowStock.length}

icon={<FaExclamationTriangle/>}

/>




<Card

title="Expired"

value={report.expiredMedicines.length}

icon={<FaCalendarTimes/>}

/>










<div className="
bg-white
rounded-3xl
shadow-sm
border
p-6
">


<h2 className="
font-bold
text-lg
mb-5
text-gray-800
">

Stock Distribution

</h2>



<div className="
h-64
flex
justify-center
">


<Doughnut

data={stockData}

options={doughnutOptions}

/>


</div>



</div>







<div className="
bg-white
rounded-3xl
shadow-sm
border
p-6
">


<h2 className="
font-bold
text-lg
mb-5
text-gray-800
">

Expiry Status

</h2>



<div className="
h-64
flex
justify-center
">


<Doughnut

data={expiryData}

options={doughnutOptions}

/>


</div>



</div>




</div>









{/* LOW STOCK GRAPH */}



<div className="
bg-white
rounded-3xl
shadow-sm
border
p-6
">


<h2 className="
font-bold
text-lg
mb-5
text-gray-800
">

Low Stock Analysis

</h2>





{

report.lowStock.length > 0 ?


<Bar

data={lowStockData}

options={{

responsive:true,

plugins:{

legend:{

display:false

}

}

}}


/>



:


<p className="
text-gray-500
">

No low stock medicines

</p>


}



</div>













{/* LOW STOCK TABLE */}



<div className="
bg-white
rounded-3xl
shadow-sm
border
overflow-hidden
">



<div className="
p-6
">


<h2 className="
font-bold
text-lg
text-gray-800
">

Low Stock Medicines

</h2>


<p className="
text-sm
text-gray-500
">

Medicines requiring restock

</p>


</div>






<table className="w-full">



<thead className="
bg-gray-100
">


<tr>


<th className="p-4 text-left">
Medicine
</th>


<th className="p-4">
Batch
</th>


<th className="p-4">
Quantity
</th>


<th className="p-4">
Status
</th>


</tr>


</thead>






<tbody>


{

report.lowStock.length > 0 ?


report.lowStock.map((item)=>(


<tr

key={item.id}

className="
border-t
hover:bg-blue-50
transition
"


>


<td className="
p-4
font-semibold
">


{item.name}


</td>




<td className="text-center">


{item.batchNumber}


</td>





<td className="text-center">


{item.quantity}


</td>






<td className="text-center">


<span className="
bg-orange-100
text-orange-700
px-4
py-1
rounded-full
text-sm
font-semibold
">


Low Stock


</span>


</td>



</tr>



))


:


<tr>

<td

colSpan="4"

className="
p-8
text-center
text-gray-500
"

>

No Low Stock Medicines

</td>

</tr>


}



</tbody>



</table>



</div>













{/* EXPIRY REPORT TABLE */}



<div className="
bg-white
rounded-3xl
shadow-sm
border
overflow-hidden
">





<div className="
p-6
flex
justify-between
items-center
">


<div>


<h2 className="
font-bold
text-lg
text-gray-800
">

Expiry Report

</h2>


<p className="
text-sm
text-gray-500
">

Expired medicine tracking

</p>


</div>




<span className="
bg-red-100
text-red-700
px-4
py-2
rounded-xl
font-semibold
">


{

report.expiredMedicines.length

}

Expired


</span>



</div>







<table className="w-full">



<thead className="
bg-gray-100
">


<tr>


<th className="p-4 text-left">

Medicine

</th>



<th className="p-4">

Batch

</th>



<th className="p-4">

Expiry Date

</th>



<th className="p-4">

Status

</th>


</tr>


</thead>








<tbody>


{

report.expiredMedicines.length > 0 ?


report.expiredMedicines.map((item)=>(


<tr

key={item.id}

className="
border-t
hover:bg-red-50
transition
"

>


<td className="
p-4
font-semibold
">


{item.name}


</td>






<td className="text-center">


{item.batchNumber}


</td>







<td className="text-center">


{item.expiryDate}


</td>







<td className="text-center">


<span className="
bg-red-100
text-red-700
px-4
py-1
rounded-full
text-sm
font-semibold
">

Expired

</span>


</td>



</tr>


))


:


<tr>


<td

colSpan="4"

className="
p-8
text-center
text-gray-500
"

>


No Expired Medicines


</td>


</tr>



}



</tbody>




</table>



</div>









</div>


);


}









// ================= CARD COMPONENT =================


function Card({title,value,icon}){


return(


<div className="
bg-white
rounded-3xl
shadow-sm
border
p-6
hover:shadow-lg
transition
">


<div className="
w-14
h-14
rounded-2xl
bg-blue-600
text-white
flex
items-center
justify-center
text-2xl
">


{icon}


</div>




<p className="
text-gray-500
mt-5
font-semibold
">


{title}


</p>




<h1 className="
text-4xl
font-bold
mt-2
text-gray-800
">


{value}


</h1>



</div>


);


}







export default Reports;