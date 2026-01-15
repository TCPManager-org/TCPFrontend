function SettingsBar() {
  return (
      <div className="settingsBar">
        <a>
          <img className={"settingsBarIcon"} src={"src/assets/account.svg"}
               alt={"Account"}/>
        </a>
        <a>
          <img className={"settingsBarIcon"} src={"src/assets/settings.svg"}
               alt={"Settings"}/>
        </a>
      </div>)
}

export default SettingsBar;