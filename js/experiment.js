// Author: Alex Kipnis

let jsPsych = initJsPsych();
const timestamp = getTimeStamp();
console.log(timestamp);
let subject_id = jsPsych.randomization.randomID(8);
let fs = true;

// Helpers
function twoPad(n) {
    return String(n).padStart(2, '0');
}

function getTimeStamp(type = 1) {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let ms = date.getMilliseconds();
    let T = [month, day, hour, minute, second].map(t => twoPad(t));
    if (type == 0) {
        T.push(ms);
        return T.slice(2).join('-');
    }
    return [year, ...T].join('-');
}

// Page navigation
function changePage(hide, show, fullScreen = false) {
    document.getElementById(hide).style.display = "none";
    document.getElementById(show).style.display = "block";
    window.scrollTo(0, 0);
    if (fullScreen) {
        let elem = document.body;
        openFullscreen(elem);
    }
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
}

function loadDataProtection() {
    changePage("page_consent", "page_dataprotection");
}

function loadFS() {
    changePage("page_dataprotection", "page_fs");
}

function loadMain() {
    changePage("page_fs", "page_main", fullScreen = fs);
    data["survey_time"] = getTimeStamp();
    window.addEventListener("keydown", event => {
        nextStimulus(event);
    })
}

function nextStimulus(event) {
    if (event.key == "Space" || " ") {
        let slider = document.getElementById("similarityJudgement");
        data["similarity_judgements"].push(slider.value);
        data["judgement_time"].push(getTimeStamp(0));
        console.log(data);
        event.preventDefault();
    }
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


// Stimuli
function initImage(src, id, visibility = "") {
    let img = new Image();
    img.src = src;
    img.style.visibility = visibility;
    document.getElementById(id).appendChild(img);
}

let cueFiles = [];
for (let i = 1; i < 6; i++) cueFiles.push("cues/c_" + String.fromCharCode(i + 65) + ".png");


// Data
var data = {
    "start_time": timestamp,
    "survey_time": "",
    "end_time": "",
    "similarity_judgements": [],
    "judgement_time": [],
    "gender": "",
    "age": "",
    "nationality": "",
    "opencomments": ""
}



// Testing
initImage(cueFiles[0], "left_stim")
initImage(cueFiles[1], "right_stim")
// console.log(getTimeStamp());
