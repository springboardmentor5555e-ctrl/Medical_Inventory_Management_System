import React, { useState } from "react";

function MedicineForm() {

const [medicine, setMedicine] = useState({
name:"",
batchNumber:"",
category:"",
supplier:"",
quantity:"",
manufacturingDate:"",
expiryDate:"",
price:"",
lowStockLimit:""
});


const handleChange=(e)=>{
setMedicine({
...medicine,
[e.target.name]:e.target.value
});
};


const submitMedicine=async(e)=>{
e.preventDefault();

await fetch("http://localhost:8080/api/medicines",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(medicine)
});

alert("Medicine Added Successfully!");

};


return(
<div className="form-box">

<h2>Add Medicine</h2>

<form onSubmit={submitMedicine}>

<input name="name" placeholder="Medicine Name" onChange={handleChange}/>

<input name="batchNumber" placeholder="Batch Number" onChange={handleChange}/>

<input name="category" placeholder="Category" onChange={handleChange}/>

<input name="supplier" placeholder="Supplier" onChange={handleChange}/>

<input name="quantity" placeholder="Quantity" onChange={handleChange}/>

<input type="date" name="manufacturingDate" onChange={handleChange}/>

<input type="date" name="expiryDate" onChange={handleChange}/>

<input name="price" placeholder="Price" onChange={handleChange}/>

<input name="lowStockLimit" placeholder="Low Stock Limit" onChange={handleChange}/>


<button>Add Medicine</button>

</form>

</div>
)

}

export default MedicineForm;