import './App.css';
import Register from "./components/register/Register";
import Login from "./components/login/Login";
import HomePage from "./components/homePage/HomePage";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {useState} from "react";

function App() {
    const [user, setLoginUser] = useState({});
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route exact path="/" element={ (user && user._id) ?<HomePage setLoginUser={setLoginUser} user={user}/>: <Login setLoginUser = {setLoginUser}/> }/>
                    <Route path="/login" element={<Login setLoginUser={setLoginUser}/>} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
