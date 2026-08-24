import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
    FaPills,
    FaCalendarAlt,
    FaSave,
    FaArrowLeft
} from "react-icons/fa";


function EditMedicine() {


    const { id } = useParams();

    const navigate = useNavigate();


    const initialState = {

        name: "",
        batchNumber: "",
        category: "",
        supplier: "",
        manufacturer: "",
        quantity: "",
        price: "",
        sellingPrice: "",
        minStockLevel: 10,
        manufactureDate: "",
        expiryDate: ""

    };



    const [medicine,setMedicine] = useState(initialState);

    const [loading,setLoading] = useState(true);







    // ============================
    // LOAD MEDICINE
    // ============================


    useEffect(()=>{

        loadMedicine();

    },[]);






    const loadMedicine = async()=>{


        try{


            const token =
            localStorage.getItem("token");



            const response = await axios.get(

                `http://localhost:8080/api/medicines/${id}`,

                {

                    headers:{

                        Authorization:
                        `Bearer ${token}`

                    }

                }

            );



            const data = response.data;



            console.log(
                "Medicine:",
                data
            );



            setMedicine({

                name:data.name || "",

                batchNumber:
                data.batchNumber || "",

                category:
                data.category || "",


                supplier:

                typeof data.supplier === "object"

                ?

                data.supplier?.name || ""

                :

                data.supplier || "",



                manufacturer:
                data.manufacturer || "",



                quantity:
                data.quantity || "",



                price:
                data.price || "",



                sellingPrice:
                data.sellingPrice || "",



                minStockLevel:
                data.minStockLevel || 10,



                manufactureDate:
                data.manufactureDate || "",



                expiryDate:
                data.expiryDate || ""

            });



        }


        catch(error){


            console.log(error);



            if(error.response){


                const data =
                error.response.data;



                if(typeof data==="string"){

                    alert(data);

                }

                else if(data.message){

                    alert(data.message);

                }

                else{

                    alert(
                        JSON.stringify(data)
                    );

                }


            }

            else{


                alert(
                    "Server not reachable"
                );


            }


        }


        finally{


            setLoading(false);


        }


    };











    // ============================
    // HANDLE INPUT
    // ============================


    const handleChange=(e)=>{


        setMedicine({

            ...medicine,

            [e.target.name]:
            e.target.value

        });


    };









    // ============================
    // UPDATE MEDICINE
    // ============================


    const handleSubmit=async(e)=>{


        e.preventDefault();




        if(

            medicine.manufactureDate &&

            medicine.expiryDate &&

            medicine.manufactureDate >
            medicine.expiryDate

        ){


            alert(
                "Manufacture date cannot be after expiry date"
            );


            return;


        }






        try{


            const token =
            localStorage.getItem("token");



            const payload={


                ...medicine,


                quantity:Number(
                    medicine.quantity
                ),


                price:Number(
                    medicine.price
                ),


                sellingPrice:Number(
                    medicine.sellingPrice || 0
                ),


                minStockLevel:Number(
                    medicine.minStockLevel
                )


            };






            await axios.put(

                `http://localhost:8080/api/medicines/${id}`,

                payload,

                {

                    headers:{

                        Authorization:
                        `Bearer ${token}`

                    }

                }

            );




            alert(
                "Medicine Updated Successfully!"
            );



            navigate(
                "/admin/view-medicines"
            );


        }



        catch(error){


            console.log(error);



            if(error.response){


                const data =
                error.response.data;



                if(typeof data==="string"){

                    alert(data);

                }

                else if(data.message){

                    alert(data.message);

                }

                else{

                    alert(
                        JSON.stringify(data)
                    );

                }


            }


            else{


                alert(
                    "Server not reachable"
                );


            }


        }



    };










    if(loading){


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

                    Loading Medicine...

                </h2>


            </div>

        );


    }










    return(


<div className="max-w-6xl mx-auto">





{/* HEADER */}


<div className="
bg-white
rounded-3xl
border
shadow-sm
p-6
mb-6
flex
justify-between
items-center
">


<div className="
flex
items-center
gap-4
">


<div className="
bg-amber-100
p-4
rounded-2xl
">


<FaPills

className="text-amber-600"

size={28}

/>


</div>



<div>


<h1 className="
text-3xl
font-bold
text-gray-800
">

Edit Medicine

</h1>



<p className="
text-gray-500
mt-1
">

Update medicine information

</p>


</div>


</div>





<button

onClick={()=>
navigate("/admin/view-medicines")
}

className="
flex
items-center
gap-2
bg-gray-100
hover:bg-gray-200
px-5
py-3
rounded-xl
"

>


<FaArrowLeft/>

Back


</button>


</div>









{/* FORM */}


<form

onSubmit={handleSubmit}

className="
bg-white
rounded-3xl
border
shadow-sm
p-8
grid
grid-cols-1
md:grid-cols-2
gap-5
"

>


{


[

["name","Medicine Name"],

["batchNumber","Batch Number"],

["category","Category"],

["supplier","Supplier"],

["manufacturer","Manufacturer"],

["quantity","Quantity"],

["price","Purchase Price"],

["sellingPrice","Selling Price"],

["minStockLevel","Minimum Stock Level"]

]


.map(([name,placeholder])=>(


<input

key={name}

name={name}

value={medicine[name] || ""}

onChange={handleChange}

placeholder={placeholder}

type={

[
"quantity",
"price",
"sellingPrice",
"minStockLevel"

].includes(name)

?

"number"

:

"text"

}


required


className="
border
rounded-xl
px-4
py-3
outline-none
focus:ring-2
focus:ring-blue-500
"

/>


))


}







{/* DATES */}


<div>


<label className="
flex
items-center
gap-2
font-semibold
text-gray-600
mb-2
">


<FaCalendarAlt/>

Manufacture Date


</label>


<input

type="date"

name="manufactureDate"

value={medicine.manufactureDate || ""}

onChange={handleChange}

required

className="
w-full
border
rounded-xl
px-4
py-3
"

/>


</div>






<div>


<label className="
flex
items-center
gap-2
font-semibold
text-gray-600
mb-2
">

<FaCalendarAlt/>

Expiry Date


</label>



<input

type="date"

name="expiryDate"

value={medicine.expiryDate || ""}

onChange={handleChange}

required

className="
w-full
border
rounded-xl
px-4
py-3
"

/>


</div>







<div className="
md:col-span-2
flex
justify-end
">


<button

type="submit"

className="
flex
items-center
gap-3
bg-blue-600
hover:bg-blue-700
text-white
px-8
py-3
rounded-xl
font-semibold
"


>


<FaSave/>

Save Changes


</button>


</div>





</form>



</div>


);


}



export default EditMedicine;