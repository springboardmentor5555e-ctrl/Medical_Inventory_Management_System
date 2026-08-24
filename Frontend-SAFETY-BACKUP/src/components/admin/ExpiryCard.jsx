import { FaCalendarTimes, FaPills } from "react-icons/fa";


function ExpiryCard({ medicines }) {


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


            <div

            className="
            flex
            justify-between
            items-center
            mb-5
            "

            >



                <div

                className="
                flex
                items-center
                gap-3
                "

                >


                    <div

                    className="
                    bg-orange-100
                    p-3
                    rounded-xl
                    "

                    >


                        <FaCalendarTimes

                        className="
                        text-orange-600
                        "

                        size={24}

                        />


                    </div>





                    <h2

                    className="
                    text-xl
                    font-bold
                    text-gray-800
                    "

                    >

                    Expiry Alerts

                    </h2>



                </div>






                <span

                className="
                bg-orange-50
                text-orange-600
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



            (

                <div

                className="
                text-center
                py-10
                text-gray-500
                "

                >


                    <div className="text-4xl mb-3">

                    ✅

                    </div>


                    <p>

                    No Expiry Alerts

                    </p>



                </div>

            )




            :



            (


                <div

                className="
                space-y-3
                "

                >





                {


                medicines.map((medicine)=>(



                    <div

                    key={medicine.id}

                    className="
                    flex
                    justify-between
                    items-center
                    bg-orange-50
                    border
                    border-orange-200
                    rounded-xl
                    p-4
                    hover:shadow-md
                    transition
                    "

                    >






                        {/* MEDICINE DETAILS */}


                        <div

                        className="
                        flex
                        items-center
                        gap-3
                        "

                        >



                            <div

                            className="
                            bg-white
                            p-2
                            rounded-lg
                            "

                            >


                                <FaPills

                                className="
                                text-orange-600
                                "

                                />


                            </div>





                            <div>


                                <h3

                                className="
                                font-semibold
                                text-gray-800
                                "

                                >

                                {medicine.name}

                                </h3>




                                <p

                                className="
                                text-sm
                                text-gray-500
                                "

                                >

                                Batch:
                                {medicine.batchNumber}

                                </p>



                            </div>



                        </div>









                        {/* EXPIRY DATE */}



                        <div

                        className="
                        text-right
                        "

                        >



                            <p

                            className="
                            text-xs
                            text-gray-500
                            "

                            >

                            Expiry Date

                            </p>




                            <p

                            className="
                            font-bold
                            text-orange-600
                            "

                            >

                            {medicine.expiryDate}

                            </p>




                        </div>





                    </div>



                ))



                }




                </div>



            )



            }





        </div>


    );


}


export default ExpiryCard;