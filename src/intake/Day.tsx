import axios from "axios";
import UseToken from "../UseToken.tsx";
import {useEffect, useState} from "react";
import {LastDaysCalendar} from "./Calendar.tsx";

type DayData = {
  date: string;
  meals: Record<string, MealData[]>;
}
type MealData = {
  name: string;
  weight: number;
  calories: number;
  fat: number;
  protein: number;
  carbs: number;

}

async function getDays(token: string) {
  try {
    const response = await axios.get('api/calories/days', {
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
  const {success, data, message, status} = await getDays(token)
  const result: DayData[] = []
  if (!success) {
    console.error(`Error fetching intake history: ${message} (status: ${status})`)
    alert(message || "Request failed")
    return result;
  }
  const entries = data;
  if (!entries || !Array.isArray(entries)) {
    console.error("Data is not an array", data);
    return result;
  }
  type MealToGroup = {
    name: string;
    weight: number;
    calories: number;
    fat: number;
    protein: number;
    carbs: number;
    type: string;
  }

  for (const entry of entries) {
    const mealsToGroup: MealToGroup[] = [];
    for (const dayMeal of entry.dayMeals) {
      mealsToGroup.push({
        name: dayMeal.meal.name,
        weight: dayMeal.weight,
        calories: dayMeal.weight * dayMeal.meal.calories / 100,
        fat: dayMeal.weight * dayMeal.meal.fats / 100,
        protein: dayMeal.weight * dayMeal.meal.proteins / 100,
        carbs: dayMeal.weight * dayMeal.meal.carbs / 100,
        type: dayMeal.mealType,
      })
    }
    const temp: Partial<Record<string, MealData[]>> = Object.groupBy(mealsToGroup, meal => meal.type);

    result.push({
      date: entry.date,
      meals: {
        "breakfast": temp["BREAKFAST"] || [],
        "secondBreakfast": temp["SECOND_BREAKFAST"] || [],
        "lunch": temp["LUNCH"] || [],
        "dinner": temp["DINNER"] || [],
        "snack": temp["SNACK"] || [],
        "other": temp["OTHER"] || []
      }
    })
  }
  return result;
}

function Day() {
  const {token} = UseToken()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [meals, setMeals] = useState<DayData[]>([])

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        return;
      }
      const data = await prepareData(token);
      setMeals(data);
    }

    fetchData();
  }, [token]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);

    console.log("Wybrano datę w Intake:", date);
  };

  const dateKey = selectedDate.toISOString().split('T')[0];

  const currentDay: DayData = meals.find(day => day.date === dateKey) || {
    date: dateKey,
    meals: {
      breakfast: [],
      secondBreakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
      other: []
    }
  };

  return (
      <>
        <div className="intakeCalendarWrapper">
          <LastDaysCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateChange}/>
        </div>
        <div className="intakeContent">
          <ul>
            <li key={currentDay.date}>
              <strong>{currentDay.date}</strong>
              <ul>
                {Object.entries(currentDay.meals).map(([mealType, meals]) => (
                    <li key={mealType}>
                      <em>{mealType}</em>
                      <ul>
                        {meals.map((meal, index) => (
                            <li key={meal.name + index}>
                              {meal.name} — {meal.calories} kcal, {meal.protein}g protein,{" "}
                              {meal.fat}g fat, {meal.carbs}g carbs, {meal.weight}g
                            </li>
                        ))}
                      </ul>
                    </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </>
  )
}

export default Day;