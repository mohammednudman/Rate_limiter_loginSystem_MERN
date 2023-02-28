import "./homepage.css"
const HomePage = ({setLoginUser, user}) => {
    return (
        <div className="homepage">
            <h1>{user.email}</h1>
            <div className="button" onClick={() => setLoginUser({})}>Logout</div>
        </div>
    )
}
export default HomePage;