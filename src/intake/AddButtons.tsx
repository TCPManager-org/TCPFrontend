type AddButtonsProps = {
  adding: boolean
  confirmAdd: () => void
  cancelAdd: () => void
  onStart: () => void
  srcOfMainIcon: string
}

function AddButtons({adding, confirmAdd, cancelAdd, onStart, srcOfMainIcon}: Readonly<AddButtonsProps>) {
  return (
      <span className="addButtons">
        {adding ? (
                <>
                  <img
                      className="guiIcon"
                      src={"src/assets/confirm.svg"}
                      alt="Confirm"
                      onClick={() => confirmAdd()}
                      style={{cursor: "pointer"}}
                  />
                  <img
                      className="guiIcon"
                      src="src/assets/cancel.svg"
                      alt="Cancel"
                      onClick={() => cancelAdd()}

                      style={{cursor: "pointer"}}
                  />
                </>
            )
            : (
                <img
                    className="guiIcon"
                    src={srcOfMainIcon}
                    alt="Add"
                    onClick={onStart}
                    style={{cursor: "pointer"}}
                />
            )}
      </span>
  )
}
export default AddButtons;