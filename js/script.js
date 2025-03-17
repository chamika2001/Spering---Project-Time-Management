// Tab Switching Functionality
document.getElementById("cpmTab").addEventListener("click", function() {
    document.getElementById("cpmContent").classList.add("active");
    document.getElementById("pertContent").classList.remove("active");
    document.getElementById("cpmTab").classList.add("active");
    document.getElementById("pertTab").classList.remove("active");
});

document.getElementById("pertTab").addEventListener("click", function() {
    document.getElementById("pertContent").classList.add("active");
    document.getElementById("cpmContent").classList.remove("active");
    document.getElementById("pertTab").classList.add("active");
    document.getElementById("cpmTab").classList.remove("active");
});

// Function to add tasks in CPM and display Critical Path
let cpmTasks = [];
let pertTasks = [];

function addCPMTask() {
    let taskName = document.getElementById("task").value;
    let duration = document.getElementById("duration").value;
    let dependencies = document.getElementById("dependencies").value;

    if (taskName && duration) {
        let task = {
            name: taskName,
            duration: parseInt(duration),
            dependencies: dependencies.split(",").map(dep => dep.trim()),
            es: 0, // Earliest Start
            ef: 0, // Earliest Finish
            ls: 0, // Latest Start
            lf: 0, // Latest Finish
            slack: 0 // Slack Time
        };
        cpmTasks.push(task);

        displayCPMTasks();
        calculateCriticalPath(cpmTasks, "criticalPath");
        displayGanttChart(cpmTasks, "ganttChart");
    }
}

function addPERTTask() {
    let taskName = document.getElementById("taskPert").value;
    let optimisticTime = parseFloat(document.getElementById("optimisticTime").value);
    let mostLikelyTime = parseFloat(document.getElementById("mostLikelyTime").value);
    let pessimisticTime = parseFloat(document.getElementById("pessimisticTime").value);
    let dependencies = document.getElementById("dependenciesPert").value;

    if (taskName && optimisticTime && mostLikelyTime && pessimisticTime) {
        let expectedTime = (optimisticTime + 4 * mostLikelyTime + pessimisticTime) / 6;

        let task = {
            name: taskName,
            duration: expectedTime,
            dependencies: dependencies.split(",").map(dep => dep.trim()),
            es: 0, // Earliest Start
            ef: 0, // Earliest Finish
            ls: 0, // Latest Start
            lf: 0, // Latest Finish
            slack: 0 // Slack Time
        };
        pertTasks.push(task);

        displayPERTTasks();
        calculateCriticalPath(pertTasks, "pertResult");
        displayGanttChart(pertTasks, "pertGanttChart");
    }
}

function displayCPMTasks() {
    let cpmGraph = document.getElementById("cpmGraph");
    cpmGraph.innerHTML = "<h3>Tasks:</h3>";

    cpmTasks.forEach(task => {
        let taskElement = document.createElement("div");
        taskElement.className = "task";
        taskElement.innerHTML = `<p><strong>${task.name}</strong>: Duration ${task.duration} days, Dependencies: ${task.dependencies.join(", ") || "None"}</p>`;
        cpmGraph.appendChild(taskElement);
    });
}

function displayPERTTasks() {
    let pertResult = document.getElementById("pertResult");
    pertResult.innerHTML = "<h3>Tasks:</h3>";

    pertTasks.forEach(task => {
        let taskElement = document.createElement("div");
        taskElement.className = "task";
        taskElement.innerHTML = `<p><strong>${task.name}</strong>: Expected Time ${task.duration.toFixed(2)} days, Dependencies: ${task.dependencies.join(", ") || "None"}</p>`;
        pertResult.appendChild(taskElement);
    });
}

function calculateCriticalPath(tasks, resultElementId) {
    // Step 1: Calculate Earliest Start (ES) and Earliest Finish (EF)
    tasks.forEach(task => {
        if (task.dependencies.length === 0) {
            task.es = 0; // No dependencies, starts at 0
        } else {
            task.es = Math.max(...task.dependencies.map(dep => {
                let dependencyTask = tasks.find(t => t.name === dep);
                return dependencyTask ? dependencyTask.ef : 0;
            }));
        }
        task.ef = task.es + task.duration;
    });

    // Step 2: Calculate Latest Start (LS) and Latest Finish (LF)
    let projectDuration = Math.max(...tasks.map(task => task.ef)); // Total project duration
    tasks.slice().reverse().forEach(task => {
        if (task.ef === projectDuration) {
            task.lf = projectDuration; // Last task in the project
            task.ls = task.lf - task.duration;
        } else {
            task.lf = Math.min(...tasks.filter(t => t.dependencies.includes(task.name)).map(t => t.ls));
            task.ls = task.lf - task.duration;
        }
        task.slack = task.ls - task.es; // Calculate Slack Time
    });

    // Step 3: Identify Critical Path
    let criticalPath = tasks.filter(task => task.slack === 0).map(task => task.name);

    // Display Critical Path
    let criticalPathElement = document.getElementById(resultElementId);
    criticalPathElement.innerHTML += `<h3>Critical Path: ${criticalPath.join(" → ")}</h3>`;
}

function displayGanttChart(tasks, chartElementId) {
    let ganttChart = document.getElementById(chartElementId);
    ganttChart.innerHTML = "<h3>Gantt Chart:</h3>";

    // Sort tasks based on Earliest Start (ES)
    let sortedTasks = tasks.sort((a, b) => a.es - b.es);

    sortedTasks.forEach(task => {
        let ganttBar = document.createElement("div");
        ganttBar.className = "gantt-bar";
        ganttBar.style.width = `${task.duration * 50}px`;
        ganttBar.style.marginLeft = `${task.es * 50}px`;
        ganttBar.innerHTML = `${task.name} (${task.duration.toFixed(2)} days)`;
        if (task.slack === 0) {
            ganttBar.classList.add("critical-path"); // Highlight critical path tasks
        }
        ganttChart.appendChild(ganttBar);

        // Display dependencies as arrows
        task.dependencies.forEach(dep => {
            let dependencyTask = tasks.find(t => t.name === dep);
            if (dependencyTask) {
                let arrow = document.createElement("div");
                arrow.className = "dependency-arrow";
                arrow.innerHTML = "→";
                arrow.style.marginLeft = `${dependencyTask.ef * 20}px`;
                ganttChart.appendChild(arrow);
            }
        });
    });
}
// Function to calculate Critical Path and Project Duration
function calculateCriticalPath(tasks, resultElementId) {
    // Step 1: Calculate Earliest Start (ES) and Earliest Finish (EF)
    tasks.forEach(task => {
        if (task.dependencies.length === 0) {
            task.es = 0; // No dependencies, starts at 0
        } else {
            task.es = Math.max(...task.dependencies.map(dep => {
                let dependencyTask = tasks.find(t => t.name === dep);
                return dependencyTask ? dependencyTask.ef : 0;
            }));
        }
        task.ef = task.es + task.duration;
    });

    // Step 2: Calculate Latest Start (LS) and Latest Finish (LF)
    let projectDuration = Math.max(...tasks.map(task => task.ef)); // Total project duration
    tasks.slice().reverse().forEach(task => {
        if (task.ef === projectDuration) {
            task.lf = projectDuration; // Last task in the project
            task.ls = task.lf - task.duration;
        } else {
            task.lf = Math.min(...tasks.filter(t => t.dependencies.includes(task.name)).map(t => t.ls));
            task.ls = task.lf - task.duration;
        }
        task.slack = task.ls - task.es; // Calculate Slack Time
    });

    // Step 3: Identify Critical Path
    let criticalPath = tasks.filter(task => task.slack === 0).map(task => task.name);

    // Display Critical Path and Project Duration
    let criticalPathElement = document.getElementById(resultElementId);
    criticalPathElement.innerHTML += `<h3>Critical Path: ${criticalPath.join(" → ")}</h3>`;
    criticalPathElement.innerHTML += `<h3>Project Duration: ${projectDuration.toFixed(2)} days</h3>`;

    return projectDuration; // Return project duration for Gantt chart
}

// Function to display Gantt Chart with Project Duration
function displayGanttChart(tasks, chartElementId) {
    let ganttChart = document.getElementById(chartElementId);
    ganttChart.innerHTML = "<h3>Gantt Chart:</h3>";

    // Sort tasks based on Earliest Start (ES)
    let sortedTasks = tasks.sort((a, b) => a.es - b.es);

    // Calculate project duration
    let projectDuration = Math.max(...tasks.map(task => task.ef));

    // Display project duration
    ganttChart.innerHTML += `<h4>Total Project Duration: ${projectDuration.toFixed(2)} days</h4>`;

    // Display tasks in the Gantt chart
    sortedTasks.forEach(task => {
        let ganttBar = document.createElement("div");
        ganttBar.className = "gantt-bar";
        ganttBar.style.width = `${task.duration * 50}px`;
        ganttBar.style.marginLeft = `${task.es * 50}px`;
        ganttBar.innerHTML = `${task.name} (${task.duration.toFixed(2)} days)`;
        if (task.slack === 0) {
            ganttBar.classList.add("critical-path"); // Highlight critical path tasks
        }
        ganttChart.appendChild(ganttBar);

        // Function to display Gantt Chart with Dependency Arrows
function displayGanttChart(tasks, chartElementId) {
    let ganttChart = document.getElementById(chartElementId);
    ganttChart.innerHTML = "<h3>Gantt Chart:</h3>";

    // Sort tasks based on Earliest Start (ES)
    let sortedTasks = tasks.sort((a, b) => a.es - b.es);

    // Calculate project duration
    let projectDuration = Math.max(...tasks.map(task => task.ef));

    // Display project duration
    ganttChart.innerHTML += `<h4>Total Project Duration: ${projectDuration.toFixed(2)} days</h4>`;

    // Create a container for the Gantt chart
    let ganttContainer = document.createElement("div");
    ganttContainer.className = "gantt-container";
    ganttChart.appendChild(ganttContainer);

    // Display tasks in the Gantt chart
    sortedTasks.forEach(task => {
        let taskBar = document.createElement("div");
        taskBar.className = "gantt-bar";
        taskBar.style.width = `${task.duration * 50}px`;
        taskBar.style.marginLeft = `${task.es * 50}px`;
        taskBar.innerHTML = `${task.name} (${task.duration.toFixed(2)} days)`;
        if (task.slack === 0) {
            taskBar.classList.add("critical-path"); // Highlight critical path tasks
        }
        ganttContainer.appendChild(taskBar);

        // Display dependencies as arrows
        task.dependencies.forEach(dep => {
            let dependencyTask = tasks.find(t => t.name === dep);
            if (dependencyTask) {
                let arrow = document.createElement("div");
                arrow.className = "dependency-arrow";
                arrow.innerHTML = "→";
                arrow.style.left = `${dependencyTask.ef * 20}px`; // Position arrow at the end of the dependency task
                arrow.style.top = `${sortedTasks.indexOf(task) * 50 + 25}px`; // Position arrow vertically between tasks
                ganttContainer.appendChild(arrow);
            }
        });
    });

    // Add a timeline at the bottom of the Gantt chart
    let timeline = document.createElement("div");
    timeline.className = "timeline";
    timeline.style.width = `${projectDuration * 50}px`;
    timeline.innerHTML = `<p>Timeline (0 to ${projectDuration.toFixed(2)} days)</p>`;
    ganttChart.appendChild(timeline);
}
    });

    // Add a timeline at the bottom of the Gantt chart
    let timeline = document.createElement("div");
    timeline.className = "timeline";
    timeline.style.width = `${projectDuration * 50}px`;
    timeline.innerHTML = `<p>Timeline (0 to ${projectDuration.toFixed(2)} days)</p>`;
    ganttChart.appendChild(timeline);
}

