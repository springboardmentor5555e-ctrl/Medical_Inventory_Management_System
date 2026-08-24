import React, {useEffect, useState} from "react";
import axios from "axios";


function PharmacistMedicines(){


const [medicines,setMedicines] = useState([]);



useEffect(()=>{


axios.get("http://localhost:8080/api/medicines")

.then(res=>{

setMedicines(res.data);

})

.catch(err=>{

console.log(err);

});


},[]);




return(


<div className="page-container">


<h1>
💊 Available Medicines
</h1>



<table>


<thead>

<tr>

<th>Name</th>
<th>Batch</th>
<th>Quantity</th>
<th>Expiry</th>

</tr>

</thead>



<tbody>


{
medicines.map((medicine)=>(


<tr key={medicine.id}>


<td>
{medicine.name}
</td>


<td>
{medicine.batchNumber}
</td>


<td>
{medicine.quantity}
</td>


<td>
{medicine.expiryDate}
</td>


</tr>


))

}



</tbody>


</table>


</div>


);


}


export default PharmacistMedicines;