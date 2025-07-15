const createTodo = ({
    title,
    description = "",
    dueDate = null,
    priority = "medium",
    projectId,
    id = Date.now().toString(),
    completed = false
}) => {
    return {
        id,
        title,
        description,
        dueDate,
        priority,
        projectId,
        completed
    };
};

export default createTodo;