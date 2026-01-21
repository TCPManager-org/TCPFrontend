import axios from "axios";
import UseToken from "../UseToken.tsx";
import {useEffect, useMemo, useState} from "react";
import {LastDaysCalendar} from "./Calendar.tsx";
import deleteForeverIcon from "../assets/deleteForever.svg";
import "../day.css";

type DayData = {
    date: string;
    meals: Record<string, MealData[]>;
};

type MealData = {
    id: number;
    name: string;
    weight: number;
    calories: number;
    fat: number;
    protein: number;
    carbs: number;
};

async function getDays(token: string) {
    try {
        const response = await axios.get("api/calories/days", {
            headers: {Authorization: `Bearer ${token}`},
        });
        return {success: true, data: response.data};
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response) return {success: false, status: error.response.status, message: "Request failed"};
            if (error.request) return {success: false, status: error.request.status, message: "Cannot reach server"};
            return {success: false, message: "Unexpected Axios error"};
        }
        return {success: false, message: "Unexpected error"};
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
            mealsToGroup.push({
                id: dayMeal.id,
                name: dayMeal.meal.name,
                weight: dayMeal.weight,
                calories: (dayMeal.weight * dayMeal.meal.calories) / 100,
                fat: (dayMeal.weight * dayMeal.meal.fats) / 100,
                protein: (dayMeal.weight * dayMeal.meal.proteins) / 100,
                carbs: (dayMeal.weight * dayMeal.meal.carbs) / 100,
                type: dayMeal.mealType,
            });
        }

        const temp: Partial<Record<string, MealData[]>> = Object.groupBy(mealsToGroup, (meal) => meal.type);

        result.push({
            date: entry.date,
            meals: {
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

function Day() {
    const {token} = UseToken();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [days, setDays] = useState<DayData[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            const data = await prepareData(token);
            setDays(data);
        }

        fetchData();
    }, [token]);

    const handleDateChange = (date: Date) => setSelectedDate(date);

    const dateKey = useMemo(() => selectedDate.toISOString().split("T")[0], [selectedDate]);

    const currentDay: DayData =
        days.find((day) => day.date === dateKey) || {
            date: dateKey,
            meals: {breakfast: [], secondBreakfast: [], lunch: [], dinner: [], snack: [], other: []},
        };

    const onDelete = async (dayMealId: number) => {
        if (!token) return;

        try {
            await deleteMealFromDay(token, dateKey, dayMealId);

            setDays((prev) =>
                prev.map((d) => {
                    if (d.date !== dateKey) return d;
                    const nextMeals: DayData["meals"] = Object.fromEntries(
                        Object.entries(d.meals).map(([mealType, mealList]) => [
                            mealType,
                            mealList.filter((m) => m.id !== dayMealId),
                        ])
                    ) as DayData["meals"];
                    return {...d, meals: nextMeals};
                })
            );
        } catch (e) {
            console.error(e);
            alert("Failed to delete meal");
        }
    };

    return (
        <>
            <div className="intakeCalendarWrapper">
                <LastDaysCalendar selectedDate={selectedDate} onDateSelect={handleDateChange}/>
            </div>

            <div className="intakeContent">
                <ul>
                    <li key={currentDay.date}>
                        <strong>{currentDay.date}</strong>
                        <ul>
                            {Object.entries(currentDay.meals).map(([mealType, mealList]) => (
                                <li key={mealType}>
                                    <em>{mealType}</em>
                                    <ul>
                                        {mealList.map((meal) => (
                                            <li key={meal.id}>
                                                {meal.name} — {meal.calories} kcal, {meal.protein}g protein, {meal.fat}g
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
                                                    <img src={deleteForeverIcon} alt="" className="deleteIconImg"/>
                                                </button>
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
    );
}

export default Day;
