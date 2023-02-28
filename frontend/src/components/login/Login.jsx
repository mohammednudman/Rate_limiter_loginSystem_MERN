import "./login.css"
import {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Login = ({setLoginUser}) => {
    const [user, setUser] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();
    const handleChange = (e) => {
        const {name, value} = e.target
        setUser({
            ...user, [name]: value
        })
    }

    const loginUser = () => {
        axios.post("http://localhost:3500/login", user)
            .then(res => {
                setLoginUser(res.data.user);
                navigate("/",{replace:true});
            });
    }
    return (
        <div className="login">
            <h1>Login</h1>
            <input type="text" name="email" value={user.email} placeholder="Enter your Email" onChange={handleChange}/>
            <input type="password" name="password" value={user.password} placeholder="Enter your password"
                   onChange={handleChange}/>
            <div className="button" onClick={loginUser}>Login</div>
            <div>or</div>
            <div className="button" onClick={() => navigate("/register", {replace: true})}>Register</div>
        </div>
    )
}
export default Login;