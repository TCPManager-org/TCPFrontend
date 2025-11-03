import SettingsBar from "./SettingsBar.tsx";
import SideBar from "./SideBar.tsx";
import Workspace from "./Workspace.tsx";

function App() {
  return (<>
        <div className="app">
          <SettingsBar/>
          <div className={"bottomRow"}>
            <SideBar/>
            <Workspace/>
          </div>
        </div>
      </>)
}

export default App
