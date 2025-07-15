import "./styles.css";
import createProject from "./modules/project";
import createTodo from "./modules/todo";
import UI from "./modules/ui";
import Storage from "./modules/storage";

const App = (() => {
    let projects = [];
    let activeProjectId = "";
    
    // DOM element selectors
    const addProjectBtn = document.querySelector(".add-project-btn");
    const addTodoBtn = document.querySelector(".add-todo-btn");
    const projectListContainer = document.querySelector(".project-list");
    const todosListContainer = document.querySelector(".todos-list");
    
    // Save current state to localStorage
    const saveToStorage = () => {
        if (Storage.isAvailable()) {
            try {
                Storage.saveProjects(projects);
            } catch (error) {
                console.error("Error saving projects: " + error);
            }
        }
    };
    
    // Initialize the application
    const init = () => {
        // Load saved data if available
        if (Storage.isAvailable()) {
            try {
                projects = Storage.loadProjects();
            } catch (error) {
                console.error("Error loading projects: " + error);
                projects = [];
            }
        } else {
            projects = [];
            console.warn("localStorage is not available. Your data will not be saved.");
        }
        
        // Set active project to first one or empty if none exist
        if (projects.length > 0) {
            activeProjectId = projects[0].id;
        } else {
            activeProjectId = "";
        }
        
        UI.renderProjects(projects, activeProjectId);
        renderActiveTodos();
        
        setupEventListeners();
    };
    
    const setupEventListeners = () => {
        addProjectBtn.addEventListener("click", handleAddProject);
        
        projectListContainer.addEventListener("click", (e) => {
            UI.handleProjectClick(e, projects, handleProjectSelect, handleProjectDelete);
        });
        
        addTodoBtn.addEventListener("click", handleAddTodo);
        
        todosListContainer.addEventListener("click", (e) => {
            UI.handleTodoAction(e, getActiveTodos(), handleTodoToggle, handleTodoDelete, handleTodoEdit);
        });
    };
    
    const getActiveProject = () => {
        return projects.find(project => project.id === activeProjectId);
    };
    
    const getActiveTodos = () => {
        if (activeProjectId === "") {
            return null;
        }
    
        const activeProject = getActiveProject();
        return activeProject ? activeProject.todos : [];
    };
    
    const renderActiveTodos = () => {
        const todos = getActiveTodos();
        UI.renderTodos(todos);
    
        // Disable "Add Task" button if no project is selected
        if (activeProjectId === "") {
            addTodoBtn.disabled = true;
            addTodoBtn.classList.add("disabled");
        } else {
            addTodoBtn.disabled = false;
            addTodoBtn.classList.remove("disabled");
        }
    };
    
    // Project creation handler
    const handleAddProject = () => {
        const { modal, form, cancelButton, input } = UI.createProjectForm();
        
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const projectName = input.value.trim();
            
            if (projectName) {
                const newProject = createProject(projectName);
                
                projects.push(newProject);

                activeProjectId = newProject.id;
                
                UI.renderProjects(projects, activeProjectId);
                renderActiveTodos();
                
                saveToStorage();
                
                UI.closeModal(modal);
            }
        });
        
        cancelButton.addEventListener("click", () => {
            UI.closeModal(modal);
        });
    };
    
    // Todo creation handler
    const handleAddTodo = () => {
        const { modal, form, cancelButton, titleInput, descTextarea, dateInput, prioritySelect } = UI.createTodoForm(activeProjectId);
        
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const title = titleInput.value.trim();
            const dueDate = dateInput.value;
            
            if (title && dueDate) {
                const newTodo = createTodo({
                    title,
                    description: descTextarea.value.trim(),
                    dueDate: dueDate,
                    priority: prioritySelect.value,
                    projectId: activeProjectId
                });
                
                const activeProject = getActiveProject();
                activeProject.todos.push(newTodo);
                
                renderActiveTodos();
                
                saveToStorage();
                
                UI.closeModal(modal);
            } else {
                if (!title) titleInput.classList.add("input-error");
                if (!dueDate) dateInput.classList.add("input-error");
            }
        });
        
        cancelButton.addEventListener("click", () => {
            UI.closeModal(modal);
        });
    };
    
    // Project selection handler
    const handleProjectSelect = (projectId) => {
        activeProjectId = projectId;
        
        UI.renderProjects(projects, activeProjectId);
        renderActiveTodos();
    };
    
    // Project deletion handler
    const handleProjectDelete = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        
        const { modal, confirmButton, cancelButton } = UI.createConfirmationDialog(
            "Are you sure you want to delete " + project.name + "?"
        );
        
        confirmButton.addEventListener("click", () => {
            projects = projects.filter(p => p.id !== projectId);
            
            // If active project was deleted, select another one
            if (activeProjectId === projectId) {
                if (projects.length > 0) {
                    activeProjectId = projects[0].id;
                } else {
                    activeProjectId = "";
                }
            }
            
            UI.renderProjects(projects, activeProjectId);
            renderActiveTodos();
            
            saveToStorage();
            
            UI.closeModal(modal);
        });
        
        cancelButton.addEventListener("click", () => {
            UI.closeModal(modal);
        });
    };
    
    // Todo completion handler
    const handleTodoToggle = (todoId) => {
        const activeProject = getActiveProject();
        const todo = activeProject.todos.find(t => t.id === todoId);
    
        if (todo.completed) {
            return;
        }

        const todoElement = document.querySelector(".todo[data-todo-id=\"" + todoId + "\"]");
        const checkbox = todoElement.querySelector(".todo-checkbox");
    
        const { modal, confirmButton, cancelButton } = UI.createConfirmationDialog(
            "Complete task: " + todo.title + "?"
        );
    
        confirmButton.addEventListener("click", () => {
            todo.completed = true;
            todo.completedDate = new Date().toISOString();
        
            renderActiveTodos();
            
            saveToStorage();
        
            UI.closeModal(modal);
        });
    
        cancelButton.addEventListener("click", () => {
            checkbox.checked = false;
            UI.closeModal(modal);
        });
    };

    // Todo edit handler
    const handleTodoEdit = (todoId) => {
        const activeProject = getActiveProject();
        const todo = activeProject.todos.find(t => t.id === todoId);
    
        const { modal, form, cancelButton, titleInput, descTextarea, dateInput, prioritySelect } = UI.createTodoEditForm(todo);
    
        form.addEventListener("submit", (e) => {
            e.preventDefault();
    
            const dueDate = dateInput.value;

            if (dueDate) {
                todo.description = descTextarea.value.trim();
                todo.priority = prioritySelect.value;
                todo.dueDate = dueDate;
        
                todo.dueDate = dateInput.value || null;
        
                renderActiveTodos();
            
                saveToStorage();
        
                UI.closeModal(modal);
            } else {
                dateInput.classList.add("input-error");
            }
            
        });
    
        cancelButton.addEventListener("click", () => {
            UI.closeModal(modal);
        });
    };
    
    // Todo deletion handler
    const handleTodoDelete = (todoId) => {
        const activeProject = getActiveProject();
        const todo = activeProject.todos.find(t => t.id === todoId);
        
        const { modal, confirmButton, cancelButton } = UI.createConfirmationDialog(
            "Are you sure you want to delete \"" + todo.title + "\"?"
        );
        
        confirmButton.addEventListener("click", () => {
            activeProject.todos = activeProject.todos.filter(t => t.id !== todoId);
            
            renderActiveTodos();
            
            saveToStorage();
            
            UI.closeModal(modal);
        });
        
        cancelButton.addEventListener("click", () => {
            UI.closeModal(modal);
        });
    };
    
    return {
        init
    };
})();

document.addEventListener("DOMContentLoaded", App.init);