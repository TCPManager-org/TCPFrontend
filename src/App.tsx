import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import SettingsBar from "./SettingsBar.tsx";
import SideBar from "./SideBar.tsx";
import Dashboard from "./workspaces/Dashboard.tsx";
import Intake from "./workspaces/Intake.tsx";
import Stats from "./workspaces/Stats.tsx";

function App() {
  return (
      <Router>
        <div className="app">
          <SettingsBar/>
          <div className={"bottomRow"}>
            <SideBar/>
            <Dashboard/>
            <div className={"workspace"}>
              <Dashboard/>
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
