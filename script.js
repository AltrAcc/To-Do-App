const APIKey = "d255117f9c8684d8449d8a062fc42ad2";
const API = `https://api.openweathermap.org/data/2.5/weather?lat=22.3039&lon=70.8022&appid=${APIKey}`; 

// Take username
const userName = prompt("Your Good Name");
document.getElementById("userName").textContent = userName;

// Username prompt
// function submitUsername() {
//     const userName = document.getElementById("username").value;
//     document.getElementById("userName").textContent = userName;

//     // Hide the custom prompt box
//     document.getElementById("customPrompt").style.display = "none";
// }

// document.querySelector('#submit').addEventListener('click', (e) => {
//     e.preventDefault();
// })

// window.onload = function() {
//     document.getElementById("customPrompt").style.display = "block";
// };

// Fetch DOM elements
const addListNew = document.querySelector(".add-list-btn");
const mainTodoContainer = document.querySelector(".main-wrapper");
const filters = document.getElementById("filter");
const sorting = document.getElementById("sorting");
const searchInput = document.getElementById('search')

const WeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",];
let totalTodo = 1;
let originalTaskOrder = new Map();


function finalDay(date) {
    const today = new Date();
    const dateObj = new Date(date);
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    const dayDiff = (dateObj - today) / (1000 * 60 * 60 * 24);
    if (dayDiff === 0) {
        return "Today";
    } else if (dayDiff === 1) {
        return `Tomorrow, ${date.toLocaleString().slice(4)}`;
    } else {
        return date; 
    }
}

// date setting function
function setDate() {
    var today = new Date();
    var formattedDate =
        WeekDays[today.getDay()] + ", " +
        months[today.getMonth()] + " " +
        today.getDate();
    document.getElementById("date").textContent = formattedDate;
}
setDate();

function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
}

async function fetchTemperature() {
    const response = await fetch(API);
    const data = await response.json();
    document.getElementById("temperature").textContent = `${Math.trunc(
        kelvinToCelsius(data.main.temp)
    )}C`;
    document.getElementById(
        "temperature-icon"
    ).src = `images/weather/${data.weather[0].icon}.svg`;
}
fetchTemperature(); 

// filer the tasks
function filterTasks() {
    const filterValue = filters.value;
    document.querySelectorAll(".todo-wrapper").forEach((list) => {
        list.querySelectorAll(".todo-item").forEach((task) => {
            const isCompleted = task.querySelector("input[type='checkbox']").checked;
            if (
                filterValue === "all" ||
                (filterValue === "completed" && isCompleted) ||
                (filterValue === "pending" && !isCompleted)
            ) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        });
    });
}
filters.addEventListener("change", filterTasks);

// sorting the tasks
function sortTasks() {
    const sortingValue = sorting.value;
    document.querySelectorAll(".todo-wrapper").forEach((list) => {
        const key = list.querySelector('h2').textContent;
        const tasksArray = Array.from(list.querySelectorAll(".todo-item"));
        tasksArray.sort((a, b) => {
            const aText = a.querySelector(".task-text").innerText.toLowerCase();
            const bText = b.querySelector(".task-text").innerText.toLowerCase();
            
            if (sortingValue === "asc") {
                return aText.localeCompare(bText);
            } else if (sortingValue === "desc") {
                return bText.localeCompare(aText);  
            } else if (sortingValue === "oldest") {
                const aDate = new Date(a.getAttribute("data-created"));
                const bDate = new Date(b.getAttribute("data-created"));
                return aDate - bDate;
            } else if (sortingValue === "newest") {
                const aDate = new Date(a.getAttribute("data-created"));
                const bDate = new Date(b.getAttribute("data-created"));
                return bDate - aDate;
            }
        }).forEach((task) => list.querySelector("ul").appendChild(task));
    });
}
sorting.addEventListener("change", sortTasks);

// searching the task
function searchTasks() {
    const searchValue = searchInput.value.toLowerCase();

    document.querySelectorAll(".todo-wrapper").forEach((list) => {
        const title = list.querySelector(".editable-title").textContent.toLowerCase();
        const tasks = list.querySelectorAll(".todo-item");
        let listMatches = false;
        if (title.includes(searchValue)) {
            listMatches = true;
            list.style.display = "block";
            tasks.forEach((task) => {
                task.style.display = "flex"; 
            });
        } else {
            tasks.forEach((task) => {
                const taskText = task.querySelector(".task-text").textContent.toLowerCase();
                if (taskText.includes(searchValue)) {
                    task.style.display = "flex";
                    listMatches = true;
                } else {
                    task.style.display = "none";
                }
            });
            if (!listMatches) {
                list.style.display = "none";
            }
        }
    });
}
searchInput.addEventListener('input', searchTasks);

// title setting
function setTitle(title) {
    title.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            title.setAttribute("contenteditable", "false");
        }
    });

    title.addEventListener("blur", function () {
        title.setAttribute("contenteditable", "false");
    });

    title.addEventListener("dblclick", function () {
        title.setAttribute("contenteditable", "true");
        title.focus();
    });
}

// Add new task list
function addingListNew(event, listData = undefined, id = Date.now().toString(), heading = "Add title", date = new Date().toDateString(), contenteditable = true) {
    let bg_index = totalTodo % 5 + 1;
    totalTodo++;
    const newTodoContainer = document.createElement("li");
    newTodoContainer.classList.add("todo-wrapper");
    newTodoContainer.setAttribute("list-id", id);
    newTodoContainer.innerHTML = `
        <div class="card bg-color-${bg_index}">
              <div class="todo-header flex">
                <input type="text" class="fs-todo-heading editable-title bg-color-${bg_index}" placeholder="${heading}" value="${heading !== 'Add title' ? heading : ''}" />
                <button visible="false" class="delete-list">
                  <img src="images/delete_icon.svg" alt="" />
                </button>
              </div>

              <div class="todo-date">
                <button class="cal-btn" visible="false"><img src="images/calendar.svg" alt="Calendar Icon" class="calendar-icon"></button>
                <input type="text" class="due-date">
                <p>${date.startsWith("Today") || date.startsWith("Tomorrow") ? date : finalDay(date)}</p>
            </div>

              <ul class="todo-list" role="list">
            </ul>
                <div class="task-input-container">
                  <input type="text" name="" id="" placeholder="Add a Task" class="add-new-task" />
                </div>
            </div>
    `;

    if (listData) {
        const listId = id;
        const ul = newTodoContainer.querySelector("ul");
        originalTaskOrder.set(listId, []);
        listData.forEach((taskData) => {
            const task = document.createElement("li");
            task.setAttribute("data-created", taskData.created);
            task.classList.add("todo-item");
            task.innerHTML = `
            <input type="checkbox" ${taskData.completed ? "checked" : ""} class="task-check"> 
            <span class="task-text">${taskData.text}</span> 
            <img src="images/close_icon.svg" alt="" class="icon delete-task | delete-icon" />`;
            ul.appendChild(task);
            originalTaskOrder.get(listId).push(task);
            setTaskDeleteButton(task.querySelector(".delete-task"));
            setupTaskCheckbox(task.querySelector(".task-check"));
        });
    }
    mainTodoContainer.prepend(newTodoContainer);
    setTitle(newTodoContainer.querySelector(".editable-title"));
    setTaskInput(newTodoContainer.querySelector(".add-new-task"), newTodoContainer);
    setDeleteButton(newTodoContainer.querySelector(".delete-list"), newTodoContainer);
}
addListNew.addEventListener("click", addingListNew);


// input feild to add new task
function setTaskInput(input, listContainer) {
    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && input.value.trim() !== "") {
            const newTask = document.createElement("li");
            newTask.classList.add("todo-item");
            newTask.setAttribute("data-created", new Date().toISOString());
            newTask.innerHTML = `
            <input type="checkbox" class="task-check"> 
            <span class="task-text">${input.value}</span> 
            <img src="images/close_icon.svg" alt="" class="icon delete-task | delete-icon" />`;
            input.parentNode.parentNode.querySelector("ul").appendChild(newTask);

            const listId = listContainer.getAttribute("list-id");
            if (!originalTaskOrder.has(listId)) {
                originalTaskOrder.set(listId, []);
            }
            originalTaskOrder.get(listId).push(newTask);
            input.value = "";
            setTaskDeleteButton(newTask.querySelector(".delete-task"));
            setupTaskCheckbox(newTask.querySelector(".task-check")); // Set up checkbox
        }
    });
}

function setupTaskCheckbox(checkbox) {
    checkbox.addEventListener("click", function () {
        filterTasks();
    });
}


// date selection for task 
mainTodoContainer.addEventListener("click", function(event) {
    const target = event.target;
    if (target && target.closest(".cal-btn")) {
        const todoContainer = target.closest(".todo-wrapper");
        if (todoContainer) {
            const dueDate = todoContainer.querySelector(".due-date");
            const dateDisplay = todoContainer.querySelector('p');
            setTaskDate(dueDate, dateDisplay);
            $(dueDate).datepicker("show");
        }
    }
});

document.querySelectorAll(".delete-list").forEach((list) => {
    setDeleteButton(list, list.closest(".todo-wrapper"));
});

document.querySelectorAll(".add-new-task").forEach((input) => {
    setTaskInput(input, input.closest(".todo-wrapper"));
});

document.querySelectorAll(".editable-title").forEach((title) => {
    setTitle(title);
});

// Delete button for a task deletion
function setTaskDeleteButton(button) {
    button.addEventListener("click", function () {
        const task = button.parentNode;
        const listId = task.closest(".todo-wrapper").getAttribute('list-id');
        const taskList = originalTaskOrder.get(listId);
        taskList.splice(taskList.indexOf(task), 1);
        task.remove();
    });
}

// Delete button for list of task
function setDeleteButton(button, listContainer) {
    button.addEventListener("click", function () {
        const listId = listContainer.getAttribute('list-id');
        originalTaskOrder.delete(listId);
        listContainer.remove();
    });
}

// set the date of task
function setTaskDate(dueDate, dateContainer) {
    $(dueDate).datepicker({
        dateFormat: "D M d yy",
        onSelect: function(dateText) {
            dateContainer.textContent = finalDay(dateText);
        }
    });
}
