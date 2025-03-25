const url = `http://localhost:3000/tasks`;

const taskNameInput = document.querySelector("#task-name");
const form = document.querySelector("#form-input");
const listItems = document.querySelector("#list-items");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const taskValue = taskNameInput.value.trim();
  if (taskValue.length < 1) return alert("Provide a valid task name");

  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: taskValue, completed: false }),
    };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Status: ${response.status}`);

    form.reset();
    getData();
  } catch (error) {
    console.log(error);
  }
});

async function getData() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    displayData(data);
    completePercentage(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function displayData(data) {
  listItems.innerHTML = "";
  data.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.taskId = task.id;
    li.textContent = task.task;
    li.classList.add(task.completed ? "complete" : "incomplete");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const editedText = document.createElement("input");
      editedText.setAttribute("type", "text");
      editedText.value = task.task;

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";

      editedText.addEventListener("click", (e) => e.stopPropagation());

      li.innerHTML = "";
      li.append(editedText, saveBtn);

      saveBtn.addEventListener("click", async () => {
        const newValue = editedText.value.trim();
        if (newValue) {
          await editTask(task.id, newValue, task.completed);
          getData();
        }
      });

      editedText.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
          saveBtn.click();
        }
      });

      editedText.focus();
    });

    li.addEventListener("click", (e) => {
      if (!e.target.closest("button") && e.target.tagName !== "INPUT") {
        toggleTaskCompletion(task);
      }
    });

    li.prepend(deleteBtn);
    li.appendChild(editBtn);
    listItems.appendChild(li);
  });
}

async function toggleTaskCompletion(task) {
  const updatedCompleted = !task.completed;
  try {
    const options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: task.task, completed: updatedCompleted }),
    };

    const response = await fetch(`${url}/${task.id}`, options);
    if (!response.ok) throw new Error(`Status: ${response.status}`);

    getData();
  } catch (error) {
    console.log(error);
  }
}

async function editTask(taskId, newTask, completed) {
  try {
    const options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: newTask, completed: completed }),
    };

    const response = await fetch(`${url}/${taskId}`, options);
    if (!response.ok) throw new Error(`Status: ${response.status}`);

    getData();
  } catch (error) {
    console.log(error);
  }
}

async function deleteTask(taskId) {
  try {
    const response = await fetch(`${url}/${taskId}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Status: ${response.status}`);

    getData();
  } catch (error) {
    console.log(error);
  }
}

function completePercentage(data) {
  const displayPercentage = document.querySelector("#completed-percentage");
  const compareTasks = document.querySelector("#compare-tasks");

  const completedTasks = data.filter((task) => task.completed);
  const percentageNumber =
    data.length > 0 ? (completedTasks.length / data.length) * 100 : 0;

  displayPercentage.textContent =
    percentageNumber === 100
      ? "All tasks completed!"
      : `Completed: ${percentageNumber.toFixed()}%`;
  compareTasks.textContent = `${completedTasks.length} / ${data.length}`;
}

getData();
