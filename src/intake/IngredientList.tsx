import axios from "axios";
import UseToken from "../UseToken.tsx";
import {type Dispatch, type SetStateAction, useEffect, useState} from "react";

type IngredientData = {
  id?: number,
  name: string,
  calories: number,
  fats: number,
  carbs: number,
  proteins: number,
  ean?: string
};

async function getMeals(token: string) {
  try {
    const response = await axios.get('api/calories/ingredients',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
    return {success: true, data: response.data}
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          success: false,
          status: error.response?.status,
          message: "Request failed"
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
        message: "Unexpected Axios error"
      };
    }
    return {
      success: false,
      message: "Unexpected error"
    };
  }
}

async function prepareData(token: string) {
  const {success, data, message, status} = await getMeals(token)

  const result: IngredientData[] = []
  if (!success) {
    console.error(`Error fetching intake history: ${message} (status: ${status})`)
    alert(message || "Request failed")
  }
  const entries = data;
  if (!entries || !Array.isArray(data)) {
    console.error("Data is not an array", data);
    return result;
  }
  for (const entry of entries) {


    result.push({
      id: entry.id,
      name: entry.name,
      calories: entry.calories,
      fats: entry.fats,
      carbs: entry.carbs,
      proteins: entry.proteins,
      ean: entry.ean
    });
  }

  return result;
}
type IngredientProps = {
  addingMeal: boolean
  setIngredientListForMeal: Dispatch<SetStateAction<number[]>>;

};

function IngredientList({addingMeal, setIngredientListForMeal}: Readonly<IngredientProps>) {
  const {token} = UseToken();
  const [ingredients, setIngredients] = useState<IngredientData[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [newIngredient, setNewIngredient] = useState<IngredientData>({
    name: "",
    calories: 0,
    fats: 0,
    carbs: 0,
    proteins: 0,
    ean: "",
  });
  const handleChange = (field: keyof IngredientData, value: string | number) => {
    setNewIngredient({ ...newIngredient, [field]: value });
  };

  const handleAddClick = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/calories/ingredients", newIngredient,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
      setIngredients([...ingredients, response.data]);
      setNewIngredient({
        name: "",
        calories: 0,
        fats: 0,
        carbs: 0,
        proteins: 0,
        ean: "",
      });
      setIsAdding(false); // go back to list view
    } catch (error) {
      console.error("Failed to add ingredient:", error);
      alert("Failed to add ingredient.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    async function fetchData() {
      if (!token) {
        return;
      }
      const data = await prepareData(token);
      setIngredients(data);
    }

    fetchData();
  }, [token]);

  return (
      <div>
        <h2 style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
          Ingredients
          {!isAdding && !addingMeal && (
              <img
                  className="addElementIcon"
                  src="src/assets/addElement.svg"
                  alt="Add"
                  onClick={() => setIsAdding(true)}
                  style={{cursor: "pointer"}}
              />
          )}
        </h2>

        {isAdding ? (
            <div style={{display: "grid", gap: "0.5rem", maxWidth: "400px"}}>
              <input
                  type="text"
                  placeholder="Name"
                  value={newIngredient.name}
                  onChange={(e) => handleChange("name", e.target.value)}
              />
              <input
                  type="number"
                  placeholder="Calories"
                  value={newIngredient.calories}
                  onChange={(e) => handleChange("calories", Number(e.target.value))}
              />
              <input
                  type="number"
                  placeholder="Fats"
                  value={newIngredient.fats}
                  onChange={(e) => handleChange("fats", Number(e.target.value))}
              />
              <input
                  type="number"
                  placeholder="Carbs"
                  value={newIngredient.carbs}
                  onChange={(e) => handleChange("carbs", Number(e.target.value))}
              />
              <input
                  type="number"
                  placeholder="Proteins"
                  value={newIngredient.proteins}
                  onChange={(e) => handleChange("proteins", Number(e.target.value))}
              />
              <input
                  type="text"
                  placeholder="EAN"
                  value={newIngredient.ean}
                  onChange={(e) => handleChange("ean", e.target.value)}
              />

              <div style={{display: "flex", gap: "0.5rem"}}>
                <button onClick={handleAddClick} disabled={loading}>
                  {loading ? "Adding..." : "Add"}
                </button>
                <button onClick={() => setIsAdding(false)} disabled={loading}>
                  Cancel
                </button>
              </div>
            </div>
        ) : (
            <div className="ingredient-list">
              <table>
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Calories</th>
                  <th>Protein (g)</th>
                  <th>Carbs (g)</th>
                  <th>Fats (g)</th>
                  <th>{addingMeal ? "Weight" : "EAN"}</th>
                </tr>
                </thead>
                <tbody>
                {ingredients.map((ingredient) => (
                    <tr key={ingredient.id}>
                      <td>{ingredient.name}</td>
                      <td>{ingredient.calories}</td>
                      <td>{ingredient.proteins}</td>
                      <td>{ingredient.carbs}</td>
                      <td>{ingredient.fats}</td>
                      <td>{addingMeal ? <input type={"text"} onChange={(e) => {
                        const value = Number(e.target.value);
                        setIngredientListForMeal((prev: number[]) => {
                          const newList = [...prev];
                          newList[ingredient.id!] = value;
                          return newList;
                        });
                      }}></input> : ingredient.ean}</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
}


export default IngredientList;