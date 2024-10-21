document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = 'http://localhost:5001/todos';
    const taskList = document.getElementById("todoList");
    const newTaskInput = document.getElementById("todoInput");
    const addButton = document.getElementById("add-task");

    if (!taskList || !newTaskInput || !addButton) {
        console.error("Elementen kunde inte hittas. Kontrollera att HTML-elementen har rätt ID.");
        return;
    }

    // Funktion för att rendera en enskild uppgift
    function renderTodo(todo) {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}" onchange="toggleTodoStatus(${todo.id})">
            <span>${todo.task}</span>
            <button onclick="deleteTodoHandler(${todo.id})">Ta bort</button>
        `;
        taskList.appendChild(listItem);
    }

    // Hämta alla uppgifter
    function getTodos() {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(todos => {
                taskList.innerHTML = '';  // Töm listan först
                todos.forEach(todo => renderTodo(todo));
            })
            .catch(error => console.error('Fel vid hämtning av uppgifter:', error));
    }

    // Lägg till en ny uppgift
    function addTodo() {
        const newTask = {
            id: Date.now(),  // Skapa ett unikt ID baserat på tidsstämpel
            task: newTaskInput.value,
            completed: false
        };

        // Skicka den nya uppgiften till servern
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask)
        })
        .then(response => response.json())
        .then(todo => {
            renderTodo(todo);  // Rendera den nya uppgiften direkt i listan
            newTaskInput.value = '';  // Töm inputfältet efter att uppgiften lagts till
        })
        .catch(error => console.error('Fel vid tillägg av uppgift:', error));
    }

    // Uppdatera status för en uppgift
    window.toggleTodoStatus = function(todoId) {
        const checkbox = document.querySelector(`input[data-id="${todoId}"]`);
        const updatedStatus = checkbox.checked;

        fetch(`${apiUrl}/${todoId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: updatedStatus })
        })
        .then(response => response.json())
        .then(updatedTodo => {
            checkbox.checked = updatedTodo.completed;
        })
        .catch(error => console.error('Fel vid uppdatering av uppgiftens status:', error));
    }

    // Radera en uppgift
    window.deleteTodoHandler = function(todoId) {
        fetch(`${apiUrl}/${todoId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fel vid radering av uppgift');
            }
            // Ta bort uppgiften från DOM
            const listItem = taskList.querySelector(`input[data-id="${todoId}"]`).parentElement;
            taskList.removeChild(listItem);
        })
        .catch(error => console.error('Fel vid radering av uppgift:', error));
    }

    // Lägg till event listener för att lägga till uppgift
    addButton.addEventListener("click", addTodo);

    // Hämta alla uppgifter när sidan laddas
    getTodos();
});






