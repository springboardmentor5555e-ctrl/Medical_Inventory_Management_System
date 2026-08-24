function LowStockCard({ medicines }) {


return (


<div

className="
bg-white
rounded-2xl
border
shadow-sm
p-6
h-full
"

>


{/* HEADER */}

<div className="
flex
items-center
justify-between
mb-5
">


<h2

className="
text-xl
font-bold
text-gray-800
flex
items-center
gap-2
"

>

<span className="
bg-red-100
text-red-600
p-2
rounded-lg
">

⚠️

</span>


Low Stock Alerts


</h2>



<span

className="
bg-red-50
text-red-600
px-3
py-1
rounded-full
text-sm
font-semibold
"

>

{medicines.length} Items

</span>



</div>









{

medicines.length === 0 ?


<div

className="
text-center
py-8
text-gray-500
"

>


<div className="text-4xl mb-3">

✅

</div>


<p>

No Low Stock Medicines

</p>


</div>






:



<div className="space-y-3">



{

medicines.map(item=>(


<div

key={item.id}

className="
flex
items-center
justify-between
bg-red-50
rounded-xl
p-4
hover:shadow-md
transition
"

>


<div>


<h3 className="
font-semibold
text-gray-800
">

{item.name}

</h3>


<p className="
text-sm
text-gray-500
"

>

Stock Level

</p>


</div>






<div

className="
text-right
"

>


<p

className="
text-red-600
font-bold
text-lg
"

>

{item.quantity}

</p>


<p

className="
text-xs
text-gray-500
"

>

Min: {item.minStockLevel}

</p>



</div>





</div>



))


}



</div>



}





</div>


);


}


export default LowStockCard;