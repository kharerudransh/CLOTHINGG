import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Loading from './Loading'

const Protected = ({children,role="buyer"}) => {
    const user =useSelector((state)=>state.auth.user)
    const loading=useSelector((state)=>state.auth.loading)
    if(loading){
        return <div className='flex justify-center items-center h-screen'>
            <Loading />
        </div>
    }
    if(!user){
        return <Navigate to="/login" replace />
    }
    if(role !==user.role){
        return <Navigate to={"/"} replace />
    }

  return <>{children}</>
}

export default Protected