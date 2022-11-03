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

function loadConsent() {
    changePage("page_welcome", "page_consent");
    // let elem = document.body;
    // openFullscreen(elem);
}

function loadDataProtection() {
    changePage("page_consent", "page_dataprotection");
    // let elem = document.body;
    // requestFullScreen(elem);
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