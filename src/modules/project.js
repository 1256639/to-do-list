const createProject = (name, id = Date.now().toString()) => {
    return {
        id,
        name,
        todos: []
    };
};

export default createProject;