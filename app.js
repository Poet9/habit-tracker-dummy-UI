var dailyId = 1;
/******* setting up models *********/
const actionTypes = { // the 3 types of actions
    addHabit : "ADD_HABIT",
    updateHabit : "UPDATE_HABIT",
    deleteHabit : "DELETE_HABIT",
    autoUpdate: "AUTO_UPDATE_HABIT"
}
const actions = (type= "", update = {})=>({ // action function template
    type,
    payload : {
        ...update
    }
});
/******** REDUX THINGS ***********/
const reducer = (state = [], action)=>{
    switch (action.type) {
        case actionTypes.addHabit: 
            return [
                ...state, {id: ++dailyId, description: action.payload.description, timePast: 1,
                    doneCount: 0, done : false}
            ]
        case actionTypes.updateHabit:
            return state.map(habit => habit.id == action.payload.habitId? 
                {...habit, done: true, doneCount: ++habit.doneCount} : habit);
        case actionTypes.autoUpdate:
            return state.map(habit => {return {...habit, done: false, timePast: ++habit.timePast}});
        case actionTypes.deleteHabit:
            return state.filter(habit=> habit.id != action.payload.habitId && habit);
        default: 
            return state;
    }
}
const store = Redux.createStore(reducer);

/************ setting up DOM ***********/
const domElements = { //getting dom elements that will be used
    daily : document.getElementById("dailyHabits"),
    monthly : document.getElementById("monthlyHabits"),
    habitInput : document.getElementById('addHabitInput')
}
/******* mena bdate khadma ******/
/* 
    * Add event listener for form that adds habits
    * set event dispatcher for store to add {add action}
    * for now thats it
*/
var lastUpdate = "";
var lastUpdateHabitId= 1;
document.getElementById("addHabitBtn").addEventListener('click', (event)=>{
    event.preventDefault();
    if(!document.getElementById('addHabitInput').value){
        return console.log("nothing there", document.getElementById('addHabitInput').value);
    }
    const newHabit= {
        description : document.getElementById('addHabitInput').value
    };
    lastUpdate = actionTypes.addHabit;
    const newAction = actions(actionTypes.addHabit, newHabit);
    store.dispatch(newAction);
});
/************** rerender function  *****************/
const rerender = ()=>{
    if( lastUpdate === actionTypes.addHabit) {
        const item = store.getState().at(-1);
        const dailyHtml = `<div id=${item.id} class="habit">
            <label>${item.description}</label>
            <input class="update-habit" name=${item.description} type="checkbox">
            <img class="delete-habit" src="./cancel.png" alt="X">
            </div>`;
        domElements.daily.insertAdjacentHTML('beforeend', dailyHtml);
        // rendering the monthly chart
        const monthlyHtml = `<div id="monthly-${item.id}" class="chart-wrapper">
            <p>${item.description}</p>
            <canvas class="myChart" id="chart-${item.id}"></canvas>
            </div>`;
        domElements.monthly.insertAdjacentHTML("beforeend", monthlyHtml);
        // inserting the chart
        const ctx = document.getElementById(`chart-${item.id}`);
        const myChart = new Chart(ctx, {
            type: 'pie',
            data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#FB3640', '#253D5B']
            }],
            labels: ["DONE", "SKIPPED"]
            },
            options: {
                cutoutPercentage: 40,
                responsive: false,
                backgroundColor: "unset",
                legend: {
                    position: 'none'
                }
            }
        });
    }
    else if (lastUpdate === actionTypes.deleteHabit){
        const habit = document.getElementById(lastUpdateHabitId);
        domElements.daily.removeChild(habit);
        const monthlyHabit = document.getElementById(`monthly-${lastUpdateHabitId}`);
        domElements.monthly.removeChild(monthlyHabit);
    }
    else if (lastUpdate === actionTypes.updateHabit){
        const habits = store.getState();

        const habitObject = habits.find(habit => habit.id == lastUpdateHabitId);
        const habitPercentage = habitObject.doneCount / habitObject.timePast * 100;
        const ctx = document.getElementById(`chart-${habitObject.id}`);
        const myChart = new Chart(ctx, {
            type: 'pie',
            data: {
            datasets: [{
                data: [habitPercentage, 100-habitPercentage],
                backgroundColor: ['#FB3640', '#253D5B']
            }],
            labels: ["DONE", "SKIPPED"]
            },
            options: {
                cutoutPercentage: 40,
                responsive: false,
                backgroundColor: "unset",
                legend: {
                    position: 'none'
                }
            }
        });
    }
}
store.subscribe(rerender);
/*************** delete habit ****************/
domElements.daily.addEventListener('click', (e)=>{
    if(e.target.className === "delete-habit") {
        const habitId = e.target.parentNode.id;
        lastUpdate = actionTypes.deleteHabit;
        const newAction = actions(actionTypes.deleteHabit, {habitId});
        lastUpdateHabitId = habitId;
        store.dispatch(newAction);
    }
    else if(e.target.className === "update-habit"){
        const habitId = e.target.parentNode.id;
        const image = document.createElement('img');
        image.src = "./check.png";
        image.alt = "Y";
        image.classList.add('checked-img');
        e.target.parentNode.replaceChild(image,e.target);

        lastUpdate = actionTypes.updateHabit;
        const newAction = actions(actionTypes.updateHabit, {habitId});
        lastUpdateHabitId = habitId;
        store.dispatch(newAction);
    }
});
/******* chart creator *******/
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'pie',
    data: {
    datasets: [{
        data: [30, 70],
        backgroundColor: ['#FB3640', '#253D5B']
    }],
    labels: ["DONE", "SKIPPED"]
    },
    options: {
        cutoutPercentage: 40,
        responsive: false,
        backgroundColor: "unset",
        legend: {
            position: 'none'
        }
    }
});

/******** auto update  *********/
setInterval(()=>{
    lastUpdate = actionTypes.autoUpdate;
    const newAction  = actions(actionTypes.autoUpdate);
    store.dispatch(newAction);
}, 86400000);
