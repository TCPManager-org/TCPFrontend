import axios from "axios";
import UseToken from "../UseToken.tsx";
import {useEffect, useMemo, useState} from "react";
import {LastDaysCalendar} from "./Calendar.tsx";
import deleteForeverIcon from "../assets/deleteForever.svg";
import "../day.css";
import AddButtons from "./AddButtons.tsx";

type DayData = {
  date: string; meals: Record<string, MealData[]>;
};

type MealData = {
  id: number;
  name: string;
  weight: number;
  calories: number;
  fats: number;
  proteins: number;
  carbs: number;
};

async function getHistory(token: string) {
  try {

    const response = await axios.get('api/statistics/intake-history', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return {success: true, data: response.data}
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          success: false, status: error.response?.status, message: "Request failed"
        };
      }
      if (error.request) {
        return {
          success: false, status: error.request?.status, message: "Cannot reach server"
        }
      }
      return {
        success: false, message: "Unexpected Axios error"
      };
    }
    return {
      success: false, message: "Unexpected error"
    };
  }
}

async function getDays(token: string) {
  try {
    const response = await axios.get("api/calories/days", {
      headers: {Authorization: `Bearer ${token}`},
    });
    return {success: true, data: response.data};
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) return {
        success: false, status: error.response.status, message: "Request failed"
      };
      if (error.request) return {
        success: false, status: error.request.status, message: "Cannot reach server"
      };
      return {success: false, message: "Unexpected Axios error"};
    }
    return {success: false, message: "Unexpected error"};
  }
}

async function prepareGoals(token: string, currentDate: string) {
  const {success, data, message, status} = await getHistory(token)

  if (!success) {
    console.error(`Error fetching intake history: ${message} (status: ${status})`)
    alert(message || "Request failed")
    return {
      caloriesGoal: 0, proteinsGoal: 0, carbsGoal: 0, fatsGoal: 0
    }
  }
  const entries = data;
  if (!entries || !Array.isArray(entries)) {
    console.error("Data is not an array", data);
    return {
      caloriesGoal: 0, proteinsGoal: 0, carbsGoal: 0, fatsGoal: 0
    }
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = data[i]
    if (entry.date !== currentDate) continue;
    return {
      caloriesGoal: entry.caloriesGoal,
      proteinsGoal: entry.proteinGoal,
      carbsGoal: entry.carbsGoal,
      fatsGoal: entry.fatGoal
    }

  }
  return {
    caloriesGoal: 0, proteinsGoal: 0, carbsGoal: 0, fatsGoal: 0
  }
}

async function deleteMealFromDay(token: string, date: string, dayMealId: number) {
  await axios.delete(`api/calories/days/${date}/${dayMealId}`, {
    headers: {Authorization: `Bearer ${token}`},
  });
}

async function prepareData(token: string) {
  const {success, data, message, status} = await getDays(token);
  const result: DayData[] = [];

  if (!success) {
    console.error(`Error fetching intake history: ${message} (status: ${status})`);
    alert(message || "Request failed");
    return result;
  }

  if (!data || !Array.isArray(data)) {
    console.error("Data is not an array", data);
    return result;
  }

  type MealToGroup = MealData & { type: string };

  for (const entry of data) {
    const mealsToGroup: MealToGroup[] = [];

    for (const dayMeal of entry.dayMeals) {
      const ratio = (dayMeal.weight / dayMeal.meal.weight)
      mealsToGroup.push({
        id: dayMeal.id,
        name: dayMeal.meal.name,
        weight: dayMeal.weight,
        calories: dayMeal.meal.calories * ratio,
        fats: dayMeal.meal.fats * ratio,
        proteins: dayMeal.meal.proteins * ratio,
        carbs: dayMeal.meal.carbs * ratio,
        type: dayMeal.mealType,
      });
    }

    const temp: Partial<Record<string, MealData[]>> = Object.groupBy(mealsToGroup, (meal) => meal.type);

    result.push({
      date: entry.date, meals: {
        breakfast: temp["BREAKFAST"] || [],
        secondBreakfast: temp["SECOND_BREAKFAST"] || [],
        lunch: temp["LUNCH"] || [],
        dinner: temp["DINNER"] || [],
        snack: temp["SNACK"] || [],
        other: temp["OTHER"] || [],
      },
    });
  }

  return result;
}

type DayProps = {
  isAdding: boolean; setIsAdding: (adding: boolean) => void; addedMeal: {
    id: number
    weight: number
  }
};

function Day({isAdding, setIsAdding, addedMeal}: Readonly<DayProps>) {
  const {token} = UseToken();
  const [editingGoals, setEditingGoals] = useState<boolean>(false);
  const [newCaloriesGoal, setNewCaloriesGoal] = useState<number>(0);
  const [newProteinsGoal, setNewProteinsGoal] = useState<number>(0);
  const [newCarbsGoal, setNewCarbsGoal] = useState<number>(0);
  const [newFatsGoal, setNewFatsGoal] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [days, setDays] = useState<DayData[]>([]);
  const [addingMealType, setAddingMealType] = useState<string>("");
  const [goals, setGoals] = useState<{
    caloriesGoal: number; proteinsGoal: number; carbsGoal: number; fatsGoal: number;
  }>({
    caloriesGoal: 0, proteinsGoal: 0, carbsGoal: 0, fatsGoal: 0
  });

  async function fetchData() {
    if (!token) return;
    const data = await prepareData(token);
    const goals = await prepareGoals(token, selectedDate.toISOString().split("T")[0]);
    setGoals(goals);
    setDays(data);
  }

  useEffect(() => {
    fetchData();
  }, [fetchData, token]);

  const handleDateChange = (date: Date) => setSelectedDate(date);

  const dateKey = useMemo(() => selectedDate.toISOString().split("T")[0], [selectedDate]);

  const currentDay: DayData = days.find((day) => day.date === dateKey) || {
    date: dateKey,
    meals: {breakfast: [], secondBreakfast: [], lunch: [], dinner: [], snack: [], other: []},
  };
  const totals = useMemo(() => {
    const t = {calories: 0, proteins: 0, carbs: 0, fats: 0}
    for (const meals of Object.values(currentDay.meals)) {
      for (const m of meals) {
        t.calories += m.calories ?? 0;
        t.proteins += m.proteins ?? 0;
        t.carbs += m.carbs ?? 0;
        t.fats += m.fats ?? 0;
      }
    }
    return t;
  }, [currentDay.date, days])
  const onDelete = async (dayMealId: number) => {
    if (!token) return;

    try {
      await deleteMealFromDay(token, dateKey, dayMealId);

      setDays((prev) => prev.map((d) => {
        if (d.date !== dateKey) return d;
        const nextMeals: DayData["meals"] = Object.fromEntries(Object.entries(d.meals).map(([mealType, mealList]) => [mealType, mealList.filter((m) => m.id !== dayMealId),])) as DayData["meals"];
        return {...d, meals: nextMeals};
      }));
    } catch (e) {
      console.error(e);
      alert("Failed to delete meal");
    }
  };
  const setAdding = (adding: boolean, mealType: string) => {
    setAddingMealType(mealType);
    setIsAdding(adding);
  }
  const cancelAdd = () => {
    setIsAdding(false);
    setAddingMealType("");
  }
  const confirmAdd = async (currentDate: string) => {
    const normalizedMealType = addingMealType
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toUpperCase();
    const newMeal = {
      date: currentDate,
      mealId: addedMeal.id,
      mealType: normalizedMealType,
      weight: addedMeal.weight
    }
    try {
      await axios.post("/api/calories/days", newMeal, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchData()
    } catch (error) {
      console.error("Failed to add ingredient:", error);
      alert("Failed to add ingredient.");
    }
    cancelAdd()
  }
  const cancelEditGoals = () => {
    setEditingGoals(false);
  }
  const confirmEditGoals = async () => {
    cancelEditGoals()
    const patchData: Record<string, number> = {
    };
    if(newCaloriesGoal > 0) patchData["caloriesGoal"] = newCaloriesGoal;
    if(newProteinsGoal > 0) patchData["proteinGoal"] = newProteinsGoal;
    if(newCarbsGoal > 0) patchData["carbsGoal"] = newCarbsGoal;
    if(newFatsGoal > 0) patchData["fatGoal"] = newFatsGoal;

    console.log(patchData)
    await axios.patch("/api/statistics/intake-history?date=" + `${dateKey}`, patchData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    await fetchData()
  }
  return (<>
    <div className="intakeCalendarWrapper">
      <LastDaysCalendar selectedDate={selectedDate} onDateSelect={handleDateChange}/>
    </div>

    <div className="intakeContent">
      <ul>
        <li key={currentDay.date}>
          <strong>{currentDay.date}</strong>
          <ul>
            {Object.entries(currentDay.meals).map(([mealType, mealList]) => (<li key={mealType}>
              <em>{mealType}</em>
              {(addingMealType === mealType || !isAdding) && <AddButtons adding={isAdding}
                                                                         confirmAdd={() => confirmAdd(currentDay.date)}
                                                                         cancelAdd={cancelAdd}
                                                                         onStart={() => setAdding(true, mealType)}
                                                                         srcOfMainIcon={"src/assets/addElement.svg"}/>}
              <ul>
                {mealList.map((meal) => (<li key={meal.id}>
                  {meal.name} — {meal.calories} kcal, {meal.proteins}
                  protein, {meal.fats}g
                  fat,{" "}
                  {meal.carbs}g carbs, {meal.weight}g
                  {" "}

                  <button
                      type="button"
                      onClick={() => onDelete(meal.id)}
                      aria-label="Delete meal"
                      title="Delete"
                      className="deleteIconButton"
                  >
                    <img src={deleteForeverIcon} alt="Delete"
                         className="deleteIconImg"/>
                  </button>
                </li>))}
              </ul>
            </li>))}
          </ul>
        </li>
      </ul>
    </div>
    <div className={"Goals"}>
      <h2>Goals</h2>
      <AddButtons adding={editingGoals} confirmAdd={confirmEditGoals} cancelAdd={cancelEditGoals}
                  onStart={() => setEditingGoals(true)} srcOfMainIcon={"src/assets/edit.svg"}/>
      <ul>
        <li>Calories: {editingGoals ? <input
            type="number"
            placeholder="Calories Goal"
            value={newCaloriesGoal}
            onChange={(e) => setNewCaloriesGoal(Number(e.target.value))}
            style={{marginLeft: "1rem"}}
        /> : totals.calories + "/" + goals.caloriesGoal}</li>
        <li>Protein: {editingGoals ? <input
            type="number"
            placeholder="Protein Goal"
            value={newProteinsGoal}
            onChange={(e) => setNewProteinsGoal(Number(e.target.value))}
            style={{marginLeft: "1rem"}}
        /> : totals.proteins + "/" + goals.proteinsGoal}</li>
        <li>Carbohydrates: {editingGoals ? <input
            type="number"
            placeholder="Carbs Goal"
            value={newCarbsGoal}
            onChange={(e) => setNewCarbsGoal(Number(e.target.value))}
            style={{marginLeft: "1rem"}}
        /> : totals.carbs + "/" + goals.carbsGoal}</li>
        <li>Fats: {editingGoals ? <input
            type="number"
            placeholder="Fats Goal"
            value={newFatsGoal}
            onChange={(e) => setNewFatsGoal(Number(e.target.value))}
            style={{marginLeft: "1rem"}}
        /> : totals.fats + "/" + goals.fatsGoal}</li>
      </ul>
    </div>
  </>);
}

export default Day;
