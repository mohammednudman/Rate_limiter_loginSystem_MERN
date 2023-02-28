import "./register.css"
import {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Register = () => {

    const [user,setUser] = useState({
        name:"",
        email:"",
        password:"",
        confirmPassword:""
    });

    const navigate = useNavigate();
    const handleChange = (e) => {
        const {name,value} = e.target
        setUser({
            ...user,[name]:value
        })
    }

    const registerUser = () => {
        const {name , email, password, confirmPassword} = user;
        if(name && email && password && (password === confirmPassword)){
            axios.post("http://localhost:3500/register", user)
                .then(res => {
                    navigate("/login",{replace:true})
                })
        }
    }

    return (
        <div className="register">
            <h1>Register</h1>
            <input type="text" name="name" value={user.name} placeholder="Your Name" onChange={handleChange}/>
            <input type="text" name="email" value={user.email} placeholder="Your Email" onChange={handleChange}/>
            <input type="password" name="password" value={user.password} placeholder="Your password" onChange={handleChange}/>
            <input type="password" name="confirmPassword" value={user.confirmPassword} placeholder="Your confirm password" onChange={handleChange}/>
            <div className="button" onClick={registerUser}>Register</div>
            <div>or</div>
            <div className="button" onClick={() => navigate("/login",{replace:true})}>Login</div>
        </div>
    )
}

export default Register;