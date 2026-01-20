import {useState} from "react";
import axios from "axios";

type LoginProps = {
  setToken: (token: string) => void;
};

async function loginUser(credentials: { username: string, password: string }) {
  try {
    const response = await axios.post('api/login',
        {},
        {
          auth: {
            username: credentials.username,
            password: credentials.password
          }
        })
    return {success: true, token: response.data};
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          success: false,
          status: error.response?.status,
          message: "Invalid username or password"
        };
      }
      if (error.request) {
        return {
          success: false,
          status: error.request?.status,
          message: "Cannot reach server"
        }
      }
      return {
        success: false,
        message: "Unexpected error"
      };
    }
    return {
      success: false,
      message: "Unexpected error"
    };
  }
}

function Login({setToken}: Readonly<LoginProps>) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginUser({
      username: username,
      password: password
    });
    if (result.success) {
      setToken(result.token);
    } else {
      alert(result.message || "Login failed");
    }
  }
  return (
      <div className="login-wrapper">
        <h1>Please Log In</h1>
        <form onSubmit={handleSubmit}>
          <label>
            <p>Username</p>
            <input type="text" onChange={e => setUsername(e.target.value)}/>
          </label>
          <label>
            <p>Password</p>
            <input type="password" onChange={e => setPassword(e.target.value)}/>
          </label>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
  )
}


export default Login;