// Author: Alex Kipnis
// let jsPsych = initJsPsych();
const timestamp = getTimeStamp();


function twoPad(n) {
    return String(n).padStart(2, '0');
}

function getTimeStamp() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    return [year, twoPad(month), twoPad(day), twoPad(hour), twoPad(minute), twoPad(second)].join('-');
}

// Testing
console.log(getTimeStamp());