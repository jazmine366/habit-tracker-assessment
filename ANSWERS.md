# ANSWERS

## 1. How to run

Make sure Node.js is installed.

From the project folder, run:

```bash
npm install
npm run dev
```

Then open the local URL printed in the terminal, usually:

```bash
http://localhost:5173
```

To check the production build, run:

```bash
npm run build
```

Deployed URL:

https://habit-tracker-assessment.vercel.app/

## 2. Stack and design choices

This is my first project using Vite and React. Before this, I mostly used HTML, CSS, and JavaScript. I chose Vite with React after learning that React is helpful for reusable components and changing state. This project has many pieces of state, such as habits, checkmarks, editing mode, week navigation, theme color, and saved localStorage data. React made it easier to update the UI from state instead of manually changing many DOM elements.

I chose a Monday to Sunday week because this app is focused on weekly routines. As a student, Monday feels like the start of academic responsibilities, while the weekend is more flexible for catching up the process before the week ends.

Visual decision 1: I used a weekly grid so users can focus on one week at a time and quickly compare progress across habits. On desktop, habits stay on the left and the seven days go across the top. I also added a date picker so users can jump to a specific week instead of clicking Previous many times.

Visual decision 2: I added a Growth column with emoji stages as a reward system. The checkmarks show exact daily progress, while the emoji gives a quick summary of how the week is going. Even if a user misses a day, the week can still show growth based on completed days. I also added theme color customization so the app can feel more personal. I added quick add chips to help users start faster and see different types of habits they could track, such as Exercise, LeetCode, Duolingo, or Sleep before 12.

For the streak line, I chose to show the best consecutive run inside the visible week because the goal is to encourage users to have longest consecutive streaks, building everyday. 

## 3. Responsive and accessibility

On a 1440px laptop, the app uses a wide weekly grid. The habit name, Growth column, and seven days are all visible at once, so the user can scan progress quickly without extra clicks. I tried to keep the tracker simple so the user can understand it just by opening the page.

On a 360px phone, the layout stacks vertically. I changed the habit grid into individual habit cards because the desktop row layout was too cramped on a small screen. Each habit card shows the habit name, growth stage, and seven day checkboxes together. I also shortened the weekday labels from Monday/Tuesday... to M/T/W/Th/F/Sa/Su to keep the phone view clean and readable.

For accessibility, each checkmark is a real button with `aria-pressed` and an `aria-label`, so screen reader users can tell which habit and day they are toggling. I also added visible focus states for keyboard navigation.

One thing I knowingly skipped is a live screen-reader announcement after each toggle. With more time, I would add an `aria-live` message like “Exercise completed for Monday” so screen reader users get immediate feedback after clicking a day.

## 4. AI usage

I used ChatGPT while building this project.

I used it to:
- Break the project into smaller steps.
- Learn the Vite React setup since this was my first Vite React project.
- Build the first version of the habit tracker with add habit, checkmarks.
- Debug the localStorage issue when habits disappeared after refreshing the page.
- Improve the UI with quick add chips, theme color, a jump to week date picker, and stage emojis.
- Fix the mobile layout after the first phone version was too cramped.

One specific thing I changed from the AI output was the progress design. The first version focused on a plain streak number. I changed it to a Growth column with emoji stages because I wanted the app to feel more encouraging, like a small reward system. Even if the user misses one day, they can still see weekly growth from the days they completed.

Another specific change was the mobile layout. The first responsive version used a wide grid that required scrolling left and right. I changed it into stacked habit cards on mobile so each habit shows its growth stage and seven day checkboxes together.

## 5. Honest gap

With another day, I would add a monthly progress chart. For example, if the user completed 9 habit check ins out of 30 possible days, the app could show a small circle or progress ring with “30%”. That allows user to compare progress each month, see in a larger scope instead of just how they check off in a weekly scale. 

The delete action is also not fully polished. Right now, deleting a habit happens immediately. With more time, I would add an undo or confirm option after deletion in case of accidental clicks.