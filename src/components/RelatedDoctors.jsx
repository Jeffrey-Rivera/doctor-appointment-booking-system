import React, { useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'

const RelatedDoctors = () => {

    const { doctors } = useContext(AppContext)

    const [relDoc, setRelDocs] = useState([])

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._Id !== docId)
            setRelDocs(doctorsData)
        }
    }, [doctors, speciality, docId])

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-600 md:mx-10'>
            <h1 className='text-3xl font-medium'>Top Doctors</h1>
            <p className='sm:w-1/3 text-center text-sm'>Here are the lists of our experienced and well-trained doctors</p>
            <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {relDoc.slice(0, 10).map((item, index) => (
                    <div onClick={() => navigate('/appointment/${item._id}')} className='border border-pink-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>
                        <img className='bg-pink-50' src={item.image} alt="" />
                        <div className='p-4'>
                            <div className='flex items-center gap-2 text-sm text-center text-green-400'>
                                <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                            </div>
                            <p className='text-gray-700 text-lg font-medium'>{item.name}</p>
                            <p className='text-gray-500 text-sm'>{item.speciality}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => { navigate('/doctors'); scrollTo(0, 0) }} className='bg-pink-50 text-gray-600 px-12 py-3 rounded-full mt-10'>more</button>
        </div>
    )
}

export default RelatedDoctors