import {useState} from "react";

function UseToken() {
  
  const getToken = (): string | null => {
    const tokenString = sessionStorage.getItem('token');
    if (!tokenString) {
      return null
    }
    return JSON.parse(tokenString)
  }
  
  const [token, setToken] = useState<string | null>(getToken())
  
  const saveToken = (userToken: string) => {
    sessionStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken);
  }
  return {
    setToken: saveToken,
    token
  }
}
export default UseToken;