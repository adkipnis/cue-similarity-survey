// Author: Alex Kipnis
// let jsPsych = initJsPsych();
const timestamp = getTimeStamp();
let fs = false;

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

// Page navigation
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

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}

function pageStep(from, to) {
    changePage(from, to);
    if (fs) {
        let elem = document.body;
        openFullscreen(elem);
    }
}

function loadConsent() {
    pageStep("page_welcome", "page_consent");
}

function loadDataProtection() {
    pageStep("page_consent", "page_dataprotection");
}

function loadFS() {
    pageStep("page_dataprotection", "page_fs");
}

function loadMain() {
    changePage("page_fs", "page_main");
    let elem = document.body;
    openFullscreen(elem);
}


function exit(page) {
    if (document.fullscreenElement != null) closeFullscreen();
    // if (page == "page_main") {
    //     // document.getElementById("canvas").remove();
    //     changePage(page, "page_timeout");
    //     clearInterval(interval);
    //     clearInterval(timeoutinterval);
    // }
    // else
    changePage(page, "page_exit");
}

// // Testing
// console.log(getTimeStamp());