import {Routes,Route} from 'react-router-dom'
import { LoginForm } from './features/auth/components/loginForm'
import { SignUpForm } from './features/auth/components/signUpForm'
import { GoogleCallback } from './features/auth/components/GoogleCallback'
import VerifyEmail from './features/auth/components/VerifyEmail'
import Home from './pages/home/Home'
import Notifications from './pages/notifications/Notifications'
import Chat from './pages/chat/Chat'
import ProtectedRoutes from './features/auth/components/ProtectedRoutes'


function App() {
  

  return (
    <Routes>
      <Route element={<ProtectedRoutes/>}>
        <Route path='/' element={<Home/>}/>
        <Route path='/notifications' element={<Notifications/>}/>
        <Route path='/chat' element={<Chat/>}/>
      </Route>
      <Route path='/login' element={<LoginForm/>}/>
      <Route path='/signup' element={<SignUpForm/>}/>
      <Route path='/verify-email' element={<VerifyEmail/>}/>
      <Route path='/auth/google/callback' element={<GoogleCallback/>}/>
    </Routes>
  )
}

export default App
