import {NavLink} from "react-router-dom";

function SideBar() {
  return (
      <div className="sideBar">
        <div className="categories">
          <ul>

            <li>
              <NavLink to="/" 
                       className={({isActive}) => isActive ? "currentPage" : ""}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/intake" 
                       className={({isActive}) => isActive ? "currentPage" : ""}>
                Intake
              </NavLink>
            </li>
            <li>Workout</li>
            <li>
              <NavLink to="/stats" 
                       className={({isActive}) => isActive ? "currentPage" : ""}>
                Stats
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
  );
}

export default SideBar;
