type AddButtonsProps = {
  adding: boolean
  confirmAdd: () => void
  cancelAdd: () => void
  onStart: () => void
}

function AddButtons({adding, confirmAdd, cancelAdd, onStart}: Readonly<AddButtonsProps>) {
  return (
      <span className="addButtons">
        {adding ? (
                <>
                  <img
                      className="guiIcon"
                      src="src/assets/confirm.svg"
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
                    src="src/assets/addElement.svg"
                    alt="Add"
                    onClick={onStart}
                    style={{cursor: "pointer"}}
                />
            )}
      </span>
  )
}
export default AddButtons;