import {Routes,Route} from 'react-router-dom'
import { LoginForm } from './features/auth/components/loginForm'
import { SignUpForm } from './features/auth/components/signUpForm'
import Home from './pages/home/Home'
import ProtectedRoutes from './features/auth/components/ProtectedRoutes'


function App() {
  

  return (
    <Routes>
      <Route element={<ProtectedRoutes/>}>
        <Route path='/' element={<Home/>}/>
      </Route>
      <Route path='/login' element={<LoginForm/>}/>
      <Route path='/signup' element={<SignUpForm/>}/>
    </Routes>
  )
}

export default App
