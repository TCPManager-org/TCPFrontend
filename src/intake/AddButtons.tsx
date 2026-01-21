type AddButtonsProps = {
  adding: boolean
  confirmAdd: () => void
  cancelAdd: () => void
  setIsAdding: (value: boolean) => void
}

function AddButtons({adding, confirmAdd, cancelAdd, setIsAdding}: Readonly<AddButtonsProps>) {
  return (
      <div className="addButtons">
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
                    onClick={() => setIsAdding(true)}
                    style={{cursor: "pointer"}}
                />
            )}
      </div>
  )
}
export default AddButtons;