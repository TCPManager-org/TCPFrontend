import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import SettingsBar from "./SettingsBar.tsx";
import SideBar from "./SideBar.tsx";
import Dashboard from "./workspaces/Dashboard.tsx";
import Intake from "./workspaces/Intake.tsx";
import Stats from "./workspaces/Stats.tsx";
import Login from "./Login.tsx";
import useToken from "./UseToken.tsx";

function App() {
  const {token, setToken} = useToken()

  if (!token) {
    return <Login setToken={setToken}/>
  }

  return (
      <Router>
        <div className="app">
          <SettingsBar/>
          <div className={"bottomRow"}>
            <SideBar/>
            <div className={"workspace"}>
              <Routes>
                <Route path="/" element={<Dashboard/>}/>
                <Route path="/intake" element={<Intake/>}/>
                <Route path="/stats" element={<Stats/>}/>
              </Routes>
            </div>
          </div>
        </div>
      </Router>)
}

export default App
