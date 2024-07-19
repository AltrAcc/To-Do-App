'use strict';

// Fetch dom elements
const addNewList = document.querySelector(".add-list-btn");
const mainTodoContainer = document.querySelector(".main-wrapper");

const filters = document.getElementById("filter");
const sorting = document.getElementById("sorting");
const searchInput = document.getElementById('search');

// Get User name
if (!localStorage.getItem("userName")) {
    const userName = prompt("Your Good Name");
    localStorage.setItem("userName", userName);
}
const user = localStorage.getItem("userName");
document.getElementById("userName").textContent = user;

let originalTaskOrder = new Map();
let totalTodo = 1;
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Fri', 'Sat'];
const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// date setting function
function setDate() {
    var formattedDate = daysOfWeek[today.getDay()] 
    + ', ' + monthsOfYear[today.getMonth()] 
    + ' ' + today.getDate();
    document.getElementById('date').textContent = formattedDate;
}
setDate();

// Deside the date 
function decideDay(date) {
    const today = new Date();
    const dateObj = new Date(date);
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    const dayDiff = (dateObj - today) / (1000 * 60 * 60 * 24);
    if(dayDiff === 0) {
        return 'Today';
    } else if(dayDiff === 1) {
        return `Tomorrow, ${date.toLocaleString().slice(4)}`;
    } else {
        return date;
    }
}

// Set up new task list 
function addNewList(event, listData = undefined, id = Date.now().toString(), heading = "Title", date = new Date().toDateString(), contenteditable = true) {
    let bg_index = totalTodo % 5;
    totalTodo++;
    const newTodoContainer = document.createElement('li');
    newTodoContainer.classList.add('todo-wrapper');
    newTodoContainer.setAttribute('list-id', id);
    newTodoContainer.innerHTML = 
        `<div class='class bg-color-${bg_index}'>
            <div class='todo-header flex'>
                <h2 class='fs-todo-heading editable-title' contenteditable=${contenteditable}>${heading}</h2>
                <button> visible='false' class='delete-list'>
                    <img src='images/delete_icon.svg' alt='' />
                </button>
            </div>
            <div class='todo-date'>
                <button class="cal-btn" visible="false"><img src="assets/calendar.svg" alt="Calendar Icon" class="calendar-icon"></button>
                <input type="text" class="due-date">
                <p>${date.startsWith("Today") || date.startsWith("Tomorrow") ?date : decideDay(date)}</p>
            </div>

              <ul class="todo-list" role="list">
            </ul>
                <div class="task-input-container">
                  <input type="text" name="" id="" placeholder="Add a Task" class="add-new-task" />
                </div>
            </div>
    `;

    if(listData) {
        const listId = id;
        const ul = newTodoContainer.querySelector('ul');
        originalTaskOrder.set(listId, []);
        listData.forEach((taskData) => {
            const task = document.createElement('li');
            task.setAttribute('data-created', taskData.created);
            task.classList.add('todo-item');
            task.innerHTML = `<input type="checkbox" ${taskData.completed ? "checked" : "" } class="task-check"> 
                <span class="task-text">${taskData.text}</span> 
                <img src="assets/close_icon.svg" alt="" class="icon delete-task | delete-icon" />`;

            ul.appendChild(task);
            originalTaskOrder.get(listId).push(task);
            setupTaskDeleteButton(task.querySelector('.delete-task'));
            setupTaskCheckbox(task.querySelector('.task-check'));
        });
    }
    mainTodoContainer.prepend(newTodoContainer);
    setupTitle(newTodoContainer.querySelector('.editable-title'));
    setupTaskInput(newTodoContainer.querySelector('.add-new-task'), newTodoContainer);
    setupDeleteButton(newTodoContainer.querySelector(".delete-list"),newTodoContainer);
}
addNewList.addEventListener("click", addNewList);


// Title setup
function setupTitle(title) {
    title.addEventListener('keypress', (e) => {
        if(e.key === 'enter') {
            e.preventDefault();
            title.setAttribute('contenteditable', 'false');
        }
    });

    title.addEventListener('blur', function() {
        title.setAttribute('contenteditable', 'false');
    });

    title.addEventListener('dblclick', function() {
        title.setAttribute('contenteditable', 'true');
        title.focus();
    });
}

// input field of task
function setupTaskInput(input, listContainer) {
    input.addEventListener('keypress', (e) => {
        if(e.key === 'enter' && input.value.trim() !== '') {
            const newTask = document.createElement('li');
            newTask.classList.add('todo-item');
            newTask.setAttribute('data-created', new date().toISOString());
            newTask.innerHTML = `<input type="checkbox" class="task-check"> 
                <span class="task-text">${input.value}</span> 
                <img src="assets/close_icon.svg" alt="" class="icon delete-task | delete-icon" />`;
            input.parentnode.parentNode.querySelector('ul').appendchild(newTask);
            
            const listId = listContainer.getAttribute('list-id');
            if(!originalTaskOrder.has(listId)) {
                originalTaskOrder.set(listId, []);
            }

            originalTaskOrder.get(listId).push(newTask);
            input.value = "";
            setupTaskDeleteButton(newTask.querySelector(".delete-task"));
            setupTaskCheckbox(newTask.querySelector(".task-check"));
        }
    });
}

function setupTaskCheckbox(checkbox) {
    checkbox.addEventListener('click', function () {
        filterTasks();
    });
}

// Delete the list button
function setupDeleteButton(button, listContainer) {
    button.addEventListener('click', () => {
        const listId = listContainer.getattribute('list-id');
        originalTaskOrder.delete(listId);
        listContainer.remove();
    });
}

// Delete the task button
function setupTaskDeleteButton(button) {
    button.addEventListener("click", function () {
        const task = button.parentNode;
        const listId = task.closest(".todo-wrapper").getAttribute('list-id');
        const taskList = originalTaskOrder.get(listId);
        taskList.splice(taskList.indexOf(task), 1);
        task.remove();
    });
}

// setting up the date of task 
function setUpTaskDate(dueDate, dateContainer) {
    $(dueDate).datepicker({
        dateFormat: "D M d yy",
        onSelect: function(dateText) {
            dateContainer.textContent = decideDay(dateText);
        }
    });
}

// Date selection of task
mainTodoContainer.addEventListener("click", function(event) {
    const target = event.target;
    if (target && target.closest(".cal-btn")) {
        const todoContainer = target.closest(".todo-wrapper");
        if (todoContainer) {
            const dueDate = todoContainer.querySelector(".due-date");
            const dateDisplay = todoContainer.querySelector('p');
            setUpTaskDate(dueDate, dateDisplay);
            $(dueDate).datepicker("show");
        }
    }
});

/* 
mainTodoContainer.addEventListener('click', (e) => {
    const target = evemt.target;
    if(target && target.closet('.cal-btn')) {
        const todoContainer = target.closet('todo');
        if(todoContainer) {
            const duedatte = todoContainer.querySelector('.duedate');
            const dateDisplay = todoContainer.querySelector(p);
            setupDeleteButton(duedate, dateDisplay);
        }
    }
}) */