function Login() {  
    return (
        <form className="login-form">
            <h1>Login</h1>
            <div className="form-group">
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <button type="submit">Login</button>
            </div>
            
        </form>    
    )
}

export default Login;