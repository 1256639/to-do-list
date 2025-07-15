const UI = (() => {
    const projectList = document.querySelector(".project-list");
    const currentProjectName = document.querySelector(".current-project-name");
    const todosList = document.querySelector(".todos-list");
    
    // Utility to remove modals from DOM
    const closeModal = (modal) => {
        document.body.removeChild(modal);
    };
    
    const initializeProjects = () => {
        return [];
    };
 
    // Render project list with active project highlighted
    const renderProjects = (projects, activeProjectId) => {
        
        projectList.textContent = "";
    
        if (projects.length === 0) {          
            currentProjectName.textContent = "Create a project!";
            return;
        }
    
        projects.forEach(project => {
            const projectElement = document.createElement("div");
            projectElement.classList.add("project");
            projectElement.dataset.projectId = project.id;
        
            if (project.id === activeProjectId) {
                projectElement.classList.add("active");
                currentProjectName.textContent = project.name;
            }
                 
            const projectContainer = document.createElement("div");
            projectContainer.classList.add("project-container");
              
            const projectName = document.createElement("span");
            projectName.classList.add("project-name");
            projectName.textContent = project.name;
                    
            projectContainer.appendChild(projectName);
        
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-project-btn");
            deleteBtn.textContent = "X";
            deleteBtn.setAttribute("title", "Delete Project");
            deleteBtn.setAttribute("aria-label", "Delete Project " + project.name);
            projectContainer.appendChild(deleteBtn);
        
            projectElement.appendChild(projectContainer);
            projectList.appendChild(projectElement);
        });
    };
    
    // Render todos with sorting by priority and completion status
    const renderTodos = (todos) => {
        todosList.textContent = "";
         
        if (todos === null) {
            const noProjectMessage = document.createElement("p");
            noProjectMessage.classList.add("empty-todos-message");
            noProjectMessage.textContent = "Empty! You have no project started";
            todosList.appendChild(noProjectMessage);
            return;
        }

        if (todos.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.classList.add("empty-todos-message");
            emptyMessage.textContent = "No tasks for this project. Add one!";
            todosList.appendChild(emptyMessage);
            return;
        }
    
        // Split todos into active and completed
        const activeTodos = todos.filter(todo => !todo.completed);
        const completedTodos = todos.filter(todo => todo.completed);
    
        const activeTodosSection = document.createElement("div");
        activeTodosSection.classList.add("todos-section", "active-todos");
    
        if (activeTodos.length > 0) {
            const activeHeader = document.createElement("h2");
            activeHeader.classList.add("section-header");
            activeHeader.textContent = "Active Tasks";
            activeTodosSection.appendChild(activeHeader);
        
            // Sort active todos by priority then due date
            const sortedActiveTodos = [...activeTodos].sort((a, b) => {
                const priorityValues = { high: 3, medium: 2, low: 1 };
                if (priorityValues[a.priority] !== priorityValues[b.priority]) {
                    return priorityValues[b.priority] - priorityValues[a.priority];
                }
            
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
            
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;
            
                return a.id - b.id;
            });
        
            renderTodoElements(sortedActiveTodos, activeTodosSection);
        } else {
            const noActiveTodos = document.createElement("p");
            noActiveTodos.classList.add("empty-section-message");
            noActiveTodos.textContent = "No active tasks. Great job!";
            activeTodosSection.appendChild(noActiveTodos);
        }
    
        const completedTodosSection = document.createElement("div");
        completedTodosSection.classList.add("todos-section", "completed-todos");
    
        if (completedTodos.length > 0) {
            const completedHeader = document.createElement("h2");
            completedHeader.classList.add("section-header");
            completedHeader.textContent = "Completed Tasks";
            completedTodosSection.appendChild(completedHeader);
        
            // Sort completed todos by newest first
            const sortedCompletedTodos = [...completedTodos].sort((a, b) => {
                return b.id - a.id;
            });
        
            renderTodoElements(sortedCompletedTodos, completedTodosSection);
        }
    
        todosList.appendChild(activeTodosSection);
        todosList.appendChild(completedTodosSection);
    };

    // Helper to render individual todo elements
    const renderTodoElements = (todosList, container) => {
        todosList.forEach(todo => {
            const todoElement = document.createElement("div");
            todoElement.classList.add("todo");
            todoElement.dataset.todoId = todo.id;
    
            if (todo.completed) {
                todoElement.classList.add("completed");
            } else {
                todoElement.classList.add("editable");
            }
    
            const todoHeader = document.createElement("div");
            todoHeader.classList.add("todo-header");
    
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("todo-checkbox");
            checkbox.checked = todo.completed;
            checkbox.setAttribute("aria-label", "Mark task as " + (todo.completed ? "incomplete" : "complete"));
    
            if (todo.completed) {
                checkbox.disabled = true;
            }
    
            const title = document.createElement("h3");
            title.classList.add("todo-title");
            title.textContent = todo.title;
    
            const priorityBadge = document.createElement("span");
            priorityBadge.classList.add("priority-badge", "priority-" + todo.priority);
            priorityBadge.textContent = todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);
    
            let dateElement = null;

            // Show completion date or due date with overdue indicator  
            if (todo.completed && todo.completedDate) {
                dateElement = document.createElement("span");
                dateElement.classList.add("completed-date");
        
                const date = new Date(todo.completedDate);
                const formattedDate = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });
        
                dateElement.textContent = "Completed: " + formattedDate;
            } else if (todo.dueDate) {
                dateElement = document.createElement("span");
                dateElement.classList.add("due-date");
        
                let displayDate;
            
                // Handle different date formats
                if (typeof todo.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(todo.dueDate)) {
                    const [year, month, day] = todo.dueDate.split("-");
                    displayDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                    try {
                        displayDate = new Date(todo.dueDate);
                    } catch (e) {
                        console.error("Error parsing date: " + e);
                        displayDate = new Date();
                    }
                }
            
                const formattedDate = displayDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });
        
                dateElement.textContent = "Due: " + formattedDate;
        
                // Mark overdue tasks
                const today = new Date();
                today.setHours(0, 0, 0, 0); 
            
                if (displayDate < today && !todo.completed) {
                    dateElement.classList.add("overdue");
                }
            }
    
            todoHeader.appendChild(checkbox);
            todoHeader.appendChild(title);
            todoHeader.appendChild(priorityBadge);
            if (dateElement) todoHeader.appendChild(dateElement);
    
            if (!todo.completed) {
                const deleteBtn = document.createElement("button");
                deleteBtn.classList.add("delete-todo-btn");
                deleteBtn.textContent = "X";
                deleteBtn.setAttribute("title", "Delete Todo");
                deleteBtn.setAttribute("aria-label", "Delete task: " + todo.title);
                todoHeader.appendChild(deleteBtn);
            }
    
            if (todo.description.trim()) {
                const description = document.createElement("p");
                description.classList.add("todo-description");
                description.textContent = todo.description;
                todoElement.appendChild(todoHeader);
                todoElement.appendChild(description);
            } else {
                todoElement.appendChild(todoHeader);
            }
    
            container.appendChild(todoElement);
        });
    };
    
    // Create modal form for new project
    const createProjectForm = () => {
        
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", "project-form-heading");
               
        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");
            
        const heading = document.createElement("h3");
        heading.textContent = "New project";
        heading.id = "project-form-heading";
        
        const form = document.createElement("form");
        form.id = "project-form";
        
        const formGroup = document.createElement("div");
        formGroup.classList.add("form-group");
        
        const label = document.createElement("label");
        label.setAttribute("for", "project-name");
        label.textContent = "Project name:";
        
        const input = document.createElement("input");
        input.type = "text";
        input.id = "project-name";
        input.required = true;
        
        const formButtons = document.createElement("div");
        formButtons.classList.add("form-buttons");
        
        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.classList.add("btn");
        submitButton.textContent = "Create";
        
        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.classList.add("btn", "cancel-btn");
        cancelButton.textContent = "Cancel";
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        
        formButtons.appendChild(submitButton);
        formButtons.appendChild(cancelButton);
        
        form.appendChild(formGroup);
        form.appendChild(formButtons);
        
        modalContent.appendChild(heading);
        modalContent.appendChild(form);
        
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            input.focus();
        }, 0);
        
        return {
            modal,
            form,
            cancelButton,
            input
        };
    };
    
    // Create modal form for new todo
    const createTodoForm = (projectId) => {
        
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", "todo-form-heading");
               
        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content", "todo-form-content");
            
        const heading = document.createElement("h3");
        heading.textContent = "New Task";
        heading.id = "todo-form-heading";
        
        const form = document.createElement("form");
        form.id = "todo-form";
        
        const titleGroup = document.createElement("div");
        titleGroup.classList.add("form-group");
        
        const titleLabel = document.createElement("label");
        titleLabel.setAttribute("for", "todo-title");
        titleLabel.textContent = "Title:";
        
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.id = "todo-title";
        titleInput.required = true;
        
        titleGroup.appendChild(titleLabel);
        titleGroup.appendChild(titleInput);
        
        const descGroup = document.createElement("div");
        descGroup.classList.add("form-group");
        
        const descLabel = document.createElement("label");
        descLabel.setAttribute("for", "todo-description");
        descLabel.textContent = "Description:";
        
        const descTextarea = document.createElement("textarea");
        descTextarea.id = "todo-description";
        descTextarea.rows = 3;
        
        descGroup.appendChild(descLabel);
        descGroup.appendChild(descTextarea);
        
        const dateGroup = document.createElement("div");
        dateGroup.classList.add("form-group");
        
        const dateLabel = document.createElement("label");
        dateLabel.setAttribute("for", "todo-due-date");
        dateLabel.textContent = "Due Date:";
        
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.id = "todo-due-date";
        dateInput.required = true;
        
        dateGroup.appendChild(dateLabel);
        dateGroup.appendChild(dateInput);
        
        const priorityGroup = document.createElement("div");
        priorityGroup.classList.add("form-group");
        
        const priorityLabel = document.createElement("label");
        priorityLabel.setAttribute("for", "todo-priority");
        priorityLabel.textContent = "Priority:";
        
        const prioritySelect = document.createElement("select");
        prioritySelect.id = "todo-priority";
        
        // Set up priority options with medium as default
        const priorities = ["low", "medium", "high"];
        priorities.forEach(priority => {
            const option = document.createElement("option");
            option.value = priority;
            option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
            
            if (priority === "medium") {
                option.selected = true;
            }
            
            prioritySelect.appendChild(option);
        });
        
        priorityGroup.appendChild(priorityLabel);
        priorityGroup.appendChild(prioritySelect);
        
        const formButtons = document.createElement("div");
        formButtons.classList.add("form-buttons");
        
        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.classList.add("btn");
        submitButton.textContent = "Create";
        
        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.classList.add("btn", "cancel-btn");
        cancelButton.textContent = "Cancel";
        
        form.appendChild(titleGroup);
        form.appendChild(descGroup);
        form.appendChild(dateGroup);
        form.appendChild(priorityGroup);
        
        formButtons.appendChild(submitButton);
        formButtons.appendChild(cancelButton);
        
        form.appendChild(formButtons);
        
        modalContent.appendChild(heading);
        modalContent.appendChild(form);
        
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            titleInput.focus();
        }, 0);
        
        return {
            modal,
            form,
            cancelButton,
            titleInput,
            descTextarea,
            dateInput,
            prioritySelect
        };
    };

    // Create modal form for editing todo
    const createTodoEditForm = (todo) => {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", "todo-edit-form-heading");

        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content", "todo-form-content");

        const heading = document.createElement("h3");
        heading.textContent = "Edit Todo";
        heading.id = "todo-edit-form-heading";

        const form = document.createElement("form");
        form.id = "todo-edit-form";

        const titleGroup = document.createElement("div");
        titleGroup.classList.add("form-group");

        // Title is displayed but not editable
        const titleLabel = document.createElement("label");
        titleLabel.setAttribute("for", "todo-title-display");
        titleLabel.textContent = "Title:";

        const titleDisplay = document.createElement("div");
        titleDisplay.classList.add("todo-title-display");
        titleDisplay.textContent = todo.title;

        const titleInput = document.createElement("input");
        titleInput.type = "hidden";
        titleInput.id = "todo-title-edit";
        titleInput.value = todo.title;

        titleGroup.appendChild(titleLabel);
        titleGroup.appendChild(titleDisplay);
        titleGroup.appendChild(titleInput);

        const descGroup = document.createElement("div");
        descGroup.classList.add("form-group");

        const descLabel = document.createElement("label");
        descLabel.setAttribute("for", "todo-description-edit");
        descLabel.textContent = "Description:";

        const descTextarea = document.createElement("textarea");
        descTextarea.id = "todo-description-edit";
        descTextarea.rows = 3;
        descTextarea.value = todo.description || "";

        descGroup.appendChild(descLabel);
        descGroup.appendChild(descTextarea);

        const dateGroup = document.createElement("div");
        dateGroup.classList.add("form-group");

        const dateLabel = document.createElement("label");
        dateLabel.setAttribute("for", "todo-due-date-edit");
        dateLabel.textContent = "Due Date:";

        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.id = "todo-due-date-edit";
        dateInput.required = true;

        // Format date for input value
        if (todo.dueDate) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(todo.dueDate)) {
                dateInput.value = todo.dueDate;
            } else {
                try {
                    const date = new Date(todo.dueDate);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    dateInput.value = year + "-" + month + "-" + day;
                } catch (e) {
                    console.error("Could not parse date: " + e);
                    dateInput.value = "";
                }
            }
        }

        dateGroup.appendChild(dateLabel);
        dateGroup.appendChild(dateInput);

        const priorityGroup = document.createElement("div");
        priorityGroup.classList.add("form-group");

        const priorityLabel = document.createElement("label");
        priorityLabel.setAttribute("for", "todo-priority-edit");
        priorityLabel.textContent = "Priority:";

        const prioritySelect = document.createElement("select");
        prioritySelect.id = "todo-priority-edit";

        // Set priority options with current one selected
        const priorities = ["low", "medium", "high"];
        priorities.forEach(priority => {
            const option = document.createElement("option");
            option.value = priority;
            option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
    
            if (priority === todo.priority) {
                option.selected = true;
            }
    
            prioritySelect.appendChild(option);
        });

        priorityGroup.appendChild(priorityLabel);
        priorityGroup.appendChild(prioritySelect);

        const formButtons = document.createElement("div");
        formButtons.classList.add("form-buttons");

        const saveButton = document.createElement("button");
        saveButton.type = "submit";
        saveButton.classList.add("btn");
        saveButton.textContent = "Save Changes";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.classList.add("btn", "cancel-btn");
        cancelButton.textContent = "Cancel";

        form.appendChild(titleGroup);
        form.appendChild(descGroup);
        form.appendChild(dateGroup);
        form.appendChild(priorityGroup);

        formButtons.appendChild(saveButton);
        formButtons.appendChild(cancelButton);

        form.appendChild(formButtons);

        modalContent.appendChild(heading);
        modalContent.appendChild(form);

        modal.appendChild(modalContent);

        document.body.appendChild(modal);

        return {
            modal,
            form,
            cancelButton,
            titleInput,
            descTextarea,
            dateInput,
            prioritySelect
        };
    };
    
    // Create confirmation dialog modal
    const createConfirmationDialog = (message) => {
        
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        
        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");
        
        const messageElement = document.createElement("p");
        messageElement.textContent = message;
        
        const buttonsContainer = document.createElement("div");
        buttonsContainer.classList.add("form-buttons");
        
        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.classList.add("btn");
        confirmButton.textContent = "Yes";
        
        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.classList.add("btn", "cancel-btn");
        cancelButton.textContent = "No";
        
        buttonsContainer.appendChild(confirmButton);
        buttonsContainer.appendChild(cancelButton);
        
        modalContent.appendChild(messageElement);
        modalContent.appendChild(buttonsContainer);
        
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        return {
            modal,
            confirmButton,
            cancelButton
        };
    };
    
    // Handle clicks on project list
    const handleProjectClick = (e, projects, handleProjectSelect, handleProjectDelete) => {
        
        // Delete button clicked
        if (e.target.classList.contains("delete-project-btn")) {        
            const projectElement = e.target.closest(".project");
            const projectId = projectElement.dataset.projectId;
                    
            handleProjectDelete(projectId);
            return;
        }
             
        // Project clicked
        const projectElement = e.target.closest(".project");
        if (projectElement) {
            const projectId = projectElement.dataset.projectId;
            handleProjectSelect(projectId);
        }
    };

    // Handle clicks on todo items
    const handleTodoAction = (e, todos, handleTodoToggle, handleTodoDelete, handleTodoEdit) => {
        const todoElement = e.target.closest(".todo");
        if (!todoElement) return;
    
        const todoId = todoElement.dataset.todoId;
    
        const todo = todos.find(t => t.id === todoId);
    
        // Ignore clicks on completed todos
        if (todo && todo.completed) {
            return;
        }
    
        // Checkbox clicked - complete todo
        if (e.target.classList.contains("todo-checkbox")) {
            handleTodoToggle(todoId);
            return; 
        }
    
        // Delete button clicked
        if (e.target.classList.contains("delete-todo-btn")) {
            handleTodoDelete(todoId);
            return; 
        }
    
        // Click on todo element not checkbox or delete to edit todo
        if (!e.target.classList.contains("todo-checkbox") && 
            !e.target.classList.contains("delete-todo-btn")) {
            handleTodoEdit(todoId);
        }
    };

    return {
        initializeProjects,
        renderProjects,
        renderTodos,
        createProjectForm,
        createTodoForm,
        createTodoEditForm,
        createConfirmationDialog,
        handleProjectClick,
        handleTodoAction,
        closeModal
    };
})();

export default UI;