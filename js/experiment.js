// Author: Alex Kipnis
// let jsPsych = initJsPsych();
const timestamp = getTimeStamp();

// Helpers
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

// Before Experiment
function changePage(hide, show) {
    document.getElementById(hide).style.display = "none";
    document.getElementById(show).style.display = "block";
    window.scrollTo(0, 0);
}

function openFullscreen(elem, testing = false) {
    if (testing) return
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

function loadConsent() {
    changePage("page_welcome", "page_consent");
    // let elem = document.body;
    // openFullscreen(elem);
}

// Testing
console.log(getTimeStamp());