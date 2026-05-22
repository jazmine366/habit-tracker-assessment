import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "habit-tracker-data";
const THEME_KEY = "habit-tracker-theme-color";
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const RECOMMENDED_HABITS = [
  "Exercise",
  "Duolingo",
  "Meditate",
  "LeetCode",
  "Read 30 min",
  "Drink water",
  "Sleep before 12",
];

const WEEK_STAGES = [
  { emoji: "🌱", label: "Stage 0" },
  { emoji: "🦭", label: "Stage 1" },
  { emoji: "🏃‍♀️‍➡️", label: "Stage 2" },
  { emoji: "👩‍💻", label: "Stage 3" },
  { emoji: "💪", label: "Stage 4" },
  { emoji: "🌠", label: "Stage 5" },
  { emoji: "🌌", label: "Stage 6" },
  { emoji: "🚀", label: "Stage 7" },
];

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getStartOfWeek(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);

  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copy.setDate(copy.getDate() + diff);
  return copy;
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function formatWeekRange(startDate) {
  const endDate = addDays(startDate, 6);

  const startText = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const endText = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${startText} to ${endText}`;
}

function calculateWeekCount(habit, weekDays) {
  return weekDays.filter((day) => habit.checks[day.dateKey]).length;
}

function calculateBestWeekStreak(habit, weekDays) {
  let bestStreak = 0;
  let currentStreak = 0;

  weekDays.forEach((day) => {
    if (habit.checks[day.dateKey]) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return bestStreak;
}

function getWeekBadge(weekCount) {
  if (weekCount >= 7) {
    return WEEK_STAGES[7];
  }

  return WEEK_STAGES[weekCount];
}

function getMobileDayLabel(dayName) {
  if (dayName === "Mon") return "M";
  if (dayName === "Tue") return "T";
  if (dayName === "Wed") return "W";
  if (dayName === "Thu") return "Th";
  if (dayName === "Fri") return "F";
  if (dayName === "Sat") return "Sa";
  return "Su";
}

function App() {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const todayKey = getDateKey(today);
  const thisWeekStart = useMemo(() => getStartOfWeek(today), [today]);

  const [habitName, setHabitName] = useState("");

  const [habits, setHabits] = useState(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      return JSON.parse(savedData);
    }

    return [];
  });

  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "#4f6f3a";
  });

  const [visibleWeekStartKey, setVisibleWeekStartKey] = useState(
    getDateKey(thisWeekStart)
  );

  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [lastToggledCell, setLastToggledCell] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeColor);
    document.documentElement.style.setProperty("--theme-color", themeColor);
  }, [themeColor]);

  const visibleWeekStart = useMemo(() => {
    return new Date(visibleWeekStartKey + "T00:00:00");
  }, [visibleWeekStartKey]);

  const weekDays = DAY_NAMES.map((dayName, index) => {
    const date = addDays(visibleWeekStart, index);
    const dateKey = getDateKey(date);

    return {
      name: dayName,
      mobileName: getMobileDayLabel(dayName),
      date,
      dateKey,
      dayNumber: date.getDate(),
      isToday: dateKey === todayKey,
      isFuture: date > today,
    };
  });

  const isThisWeek = visibleWeekStartKey === getDateKey(thisWeekStart);

  function createHabit(name) {
    return {
      id: crypto.randomUUID(),
      name,
      checks: {},
    };
  }

  function addHabitByName(name) {
    const trimmedName = name.trim();

    if (trimmedName === "") {
      return;
    }

    const alreadyExists = habits.some(
      (habit) => habit.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      return;
    }

    setHabits([...habits, createHabit(trimmedName)]);
    setHabitName("");
  }

  function addHabit(event) {
    event.preventDefault();
    addHabitByName(habitName);
  }

  function toggleCheck(habitId, dateKey, isFuture) {
    if (isFuture) {
      return;
    }

    const updatedHabits = habits.map((habit) => {
      if (habit.id !== habitId) {
        return habit;
      }

      const updatedChecks = {
        ...habit.checks,
      };

      if (updatedChecks[dateKey]) {
        delete updatedChecks[dateKey];
      } else {
        updatedChecks[dateKey] = true;
      }

      return {
        ...habit,
        checks: updatedChecks,
      };
    });

    setHabits(updatedHabits);

    const cellKey = `${habitId}-${dateKey}`;
    setLastToggledCell(cellKey);

    setTimeout(() => {
      setLastToggledCell("");
    }, 450);
  }

  function deleteHabit(habitId) {
    const updatedHabits = habits.filter((habit) => habit.id !== habitId);
    setHabits(updatedHabits);
  }

  function startEditing(habit) {
    setEditingHabitId(habit.id);
    setEditingName(habit.name);
  }

  function saveRename(event, habitId) {
    event.preventDefault();

    const trimmedName = editingName.trim();

    if (trimmedName === "") {
      return;
    }

    const updatedHabits = habits.map((habit) => {
      if (habit.id !== habitId) {
        return habit;
      }

      return {
        ...habit,
        name: trimmedName,
      };
    });

    setHabits(updatedHabits);
    setEditingHabitId(null);
    setEditingName("");
  }

  function cancelRename() {
    setEditingHabitId(null);
    setEditingName("");
  }

  function goToPreviousWeek() {
    const previousWeek = addDays(visibleWeekStart, -7);
    setVisibleWeekStartKey(getDateKey(previousWeek));
  }

  function goToNextWeek() {
    const nextWeek = addDays(visibleWeekStart, 7);
    setVisibleWeekStartKey(getDateKey(nextWeek));
  }

  function goToThisWeek() {
    setVisibleWeekStartKey(getDateKey(thisWeekStart));
  }

  function jumpToWeek(event) {
    const selectedDate = new Date(event.target.value + "T00:00:00");

    if (Number.isNaN(selectedDate.getTime())) {
      return;
    }

    const selectedWeekStart = getStartOfWeek(selectedDate);
    setVisibleWeekStartKey(getDateKey(selectedWeekStart));
  }

  return (
    <main className="app" style={{ "--accent": themeColor }}>
      <section className="header">
        <div>
          <p className="eyebrow">Weekly Habit Tracker</p>
          <h1>Each step counts</h1>
          <p className="intro">
            Add a habit, check your days, and grow the week.
          </p>
        </div>

        <form className="add-form" onSubmit={addHabit}>
          <label htmlFor="habit-name">New habit</label>

          <div className="add-row">
            <input
              id="habit-name"
              type="text"
              value={habitName}
              onChange={(event) => setHabitName(event.target.value)}
              placeholder="Sleep before 12"
            />

            <button type="submit">Add</button>
          </div>

          <div className="suggestions">
            <p>Quick add</p>

            <div className="suggestion-list">
              {RECOMMENDED_HABITS.map((habit) => {
                const alreadyAdded = habits.some(
                  (currentHabit) =>
                    currentHabit.name.toLowerCase() === habit.toLowerCase()
                );

                return (
                  <button
                    key={habit}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => addHabitByName(habit)}
                    disabled={alreadyAdded}
                  >
                    {habit}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <div>
            <p className="week-label">Week view</p>
            <h2>{formatWeekRange(visibleWeekStart)}</h2>
          </div>

          <div className="week-controls">
            <label className="color-control">
              <span>Theme color</span>
              <input
                type="color"
                value={themeColor}
                onChange={(event) => setThemeColor(event.target.value)}
                aria-label="Choose theme color"
              />
            </label>

            <label className="jump-control">
              <span>Jump to week</span>
              <input
                type="date"
                value={visibleWeekStartKey}
                onChange={jumpToWeek}
                aria-label="Jump to week"
              />
            </label>

            <div className="week-buttons">
              <button type="button" onClick={goToPreviousWeek}>
                Previous
              </button>

              <button
                type="button"
                onClick={goToThisWeek}
                disabled={isThisWeek}
              >
                This week
              </button>

              <button type="button" onClick={goToNextWeek}>
                Next
              </button>
            </div>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h2>No habits yet</h2>
            <p>
              Add one habit to start. Try a quick-add chip above if you are not
              sure where to begin.
            </p>
          </div>
        ) : (
          <div className="grid-wrapper">
            <div className="habit-grid">
              <div className="grid-header habit-column">Habit</div>
              <div className="grid-header week-column">Growth</div>

              {weekDays.map((day) => (
                <div
                  className={
                    day.isToday
                      ? "grid-header day-column today-header"
                      : "grid-header day-column"
                  }
                  key={day.dateKey}
                >
                  <span>{day.name}</span>
                  <strong>{day.dayNumber}</strong>
                </div>
              ))}

              {habits.map((habit) => {
                const weekCount = calculateWeekCount(habit, weekDays);
                const bestWeekStreak = calculateBestWeekStreak(
                  habit,
                  weekDays
                );
                const badge = getWeekBadge(weekCount);

                return (
                  <div className="habit-row" key={habit.id}>
                    <div className="habit-name">
                      {editingHabitId === habit.id ? (
                        <form
                          className="rename-form"
                          onSubmit={(event) => saveRename(event, habit.id)}
                        >
                          <input
                            type="text"
                            value={editingName}
                            onChange={(event) =>
                              setEditingName(event.target.value)
                            }
                            autoFocus
                          />

                          <button type="submit" className="small-button">
                            Save
                          </button>

                          <button
                            type="button"
                            className="small-button secondary-button"
                            onClick={cancelRename}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <>
                          <span className="habit-title">{habit.name}</span>

                          <div className="habit-actions">
                            <button
                              type="button"
                              className="small-button secondary-button"
                              onClick={() => startEditing(habit)}
                            >
                              Rename
                            </button>

                            <button
                              type="button"
                              className="small-button delete-button"
                              onClick={() => deleteHabit(habit.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="week-progress">
                      <div
                        className="week-badge"
                        aria-label={`${badge.label}, best weekly streak is ${bestWeekStreak} days`}
                        title={`${badge.label}, best weekly streak is ${bestWeekStreak} days`}
                      >
                        <span>{badge.emoji}</span>
                        <em>{badge.label}</em>
                        <strong className="streak-line">
                          {bestWeekStreak}{" "}
                          {bestWeekStreak === 1 ? "day" : "days"} streak
                        </strong>
                      </div>
                    </div>

                    {weekDays.map((day) => {
                      const isChecked = Boolean(habit.checks[day.dateKey]);
                      const cellKey = `${habit.id}-${day.dateKey}`;

                      return (
                        <button
                          className={[
                            "check-cell",
                            isChecked ? "checked" : "",
                            day.isToday ? "today-cell" : "",
                            lastToggledCell === cellKey ? "just-toggled" : "",
                          ].join(" ")}
                          key={day.dateKey}
                          type="button"
                          data-day={day.mobileName}
                          data-date={day.dayNumber}
                          onClick={() =>
                            toggleCheck(habit.id, day.dateKey, day.isFuture)
                          }
                          disabled={day.isFuture}
                          aria-pressed={isChecked}
                          aria-label={`${habit.name} on ${day.name}, ${
                            isChecked ? "completed" : "not completed"
                          }`}
                        >
                          {isChecked ? "✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;