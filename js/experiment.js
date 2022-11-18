// Author: Alex Kipnis
const studyID = "cue-sim";
const fs = true;
const nCues = 3;
let allowKeypress = true;
let sliderMoved = false;
let trialNum = 0;


// Data
function randomID(length = 32) {
    let result = "";
    const chars = "0123456789abcdefghjklmnopqrstuvwxyz";
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}


function twoPad(n) {
    return String(n).padStart(2, '0');
}

function getTimeStamp(type = "full") {
    let date = new Date();

    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let date_string = [year, month, day].join('-');
    if (type == "date") return date_string

    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let ms = date.getMilliseconds();
    let time_string = [hour, minute, second].map(t => twoPad(t)).join(':');
    time_string = [time_string, ms].join(".");
    if (type == "time") return time_string

    return [date_string, time_string].join(" ")
}

function permute(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array
}


function cartesianProduct(a, b) {
    let start = [];
    const combine = (prev, x) => [...prev, ...b.map(y => [x, y])]
    return a.reduce(combine, start)
}


function allUniqueCombs(n) {
    let a = Array.from(Array(n).keys());
    let cp = cartesianProduct(a, a);
    return cp.filter(e => e[0] != e[1]);
}


function saveData(body, dictionary) {
    let filename = './data/' + body + '.json';
    $.post("write_data.php", {
        postresult: JSON.stringify(dictionary),
        postfile: filename
    });
    return true;
}


function saveDataWrapper() {
    let body = studyID + "_data__subject_id=" + data["subject_id"] + "__start=" + data["start"];
    saveData(body, data);
}


let data = {
    "subject_id": randomID(8),
    "start": getTimeStamp(),
    "stim_left": "",
    "stim_right": "",
    "similarity": [],
    "trial_start": [],
    "trial_end": [],
    "end_time": "",
    "gender": "",
    "age": "",
    "nationality": "",
    "comments": ""
}


let cueFiles = [];
for (let i = 0; i < nCues; i++) cueFiles.push("cues/c_" + String.fromCharCode(i + 65) + ".png");
trials = permute(allUniqueCombs(cueFiles.length));
data["stim_left"] = trials.map(t => t[0]);
data["stim_right"] = trials.map(t => t[1]);
const nTrials = trials.length;
let sliderIntervals = [];
for (let i = 0; i <= nTrials; i++) sliderIntervals.push(i / (nTrials + 2) * 100);


// Stimuli
function initImage(src) {
    let img = new Image();
    img.src = src;
    return img
}


function displayCues([i, j]) {
    document.getElementById("left_stim").appendChild(cueImages[i]);
    document.getElementById("right_stim").appendChild(cueImages[j]);
}


function clearCanvas() {
    const ids = ["left_stim", "right_stim"];
    for (let id of ids) {
        const myNode = document.getElementById(id);
        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }
    }
}


let cueImages = cueFiles.map(f => initImage(f));


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

function loadQuestions() {
    changePage("page_questionsintro", "page_questions");
}

function loadMain() {
    changePage("page_fs", "page_main", fullScreen = fs);
    data["survey_time"] = getTimeStamp();
    document.getElementById("progress_outer").style.display = "block";
    displayCues(trials[trialNum]);
    data["trial_start"].push(getTimeStamp())
    window.addEventListener("keydown", event => {
        if (allowKeypress) {
            if (event.key == "ArrowLeft" || event.key == "ArrowRight") moveSlider(event);
            if (event.key == "ArrowUp" || event.key == "ArrowDown") event.preventDefault();
            if (event.key == " " || event.key == "SpaceBar") {
                if (sliderMoved) nextStimulus(event);
                else instruct2moveSlider();
            }
        }
    });
}

function fillSelect(id, list) {
    let sel = document.getElementById(id);
    for (let el of list) {
        let opt = document.createElement("option");
        opt.value = el;
        opt.innerHTML = el;
        sel.appendChild(opt);
    }
}

function fillAge() {
    let ages = Array.from(Array(100).keys()).filter(i => i > 17);
    fillSelect("age", ages);
}
fillAge();

function fillNationalities() {
    fillSelect("nationality", nats);
}
fillNationalities();

function loadEnd() {
    let checkq1 = document.querySelector('input[name="q1"]:checked');
    let checkq2 = document.getElementById('age').value;
    let checkq3 = document.getElementById('nationality').value;

    if (checkq1 == null || checkq2 == "" || checkq3 == "") {
        swal({
            text: "Some questions have missing responses!",
            icon: "warning",
            buttons: ["OK", false]
        });
    } else {
        moveProgressBar(100);
        data["gender"] = checkq1.value;
        data["age"] = checkq2;
        data["nationality"] = checkq3;
        data["comments"] = document.getElementById('comments').value;
        data["end_time"] = getTimeStamp();
        changePage("page_questions", "page_end");
        saveDataWrapper();
    }
}


function moveProgressBar(goal_width = 100) {
    let bar = document.getElementById("progress");
    let width = parseInt(bar.style.width);
    let id = setInterval(frame, 10);
    function frame() {
        if (width >= goal_width) {
            clearInterval(id);
        } else {
            width++;
            bar.style.width = width + '%';
        }
    }
}


function moveSlider(event, by = 5) {
    let slider = document.getElementById("similarityJudgement");
    if (event.key == "ArrowLeft") {
        slider.value = Math.max(0, parseInt(slider.value) - by);
    } else {
        slider.value = Math.min(100, parseInt(slider.value) + by);
    }
    event.preventDefault();
    sliderMoved = true;
}


async function instruct2moveSlider() {
    let stopper = document.getElementById("stopper");
    stopper.style.display = "";
    await new Promise(resolve => setTimeout(resolve, 1500));
    stopper.style.opacity = "0";
    await new Promise(resolve => setTimeout(resolve, 1000));
    stopper.style.display = "None";
    stopper.style.opacity = "1";
}


function nextStimulus(event) {
    event.preventDefault();
    document.getElementById("page_main").style.display = "none";
    let slider = document.getElementById("similarityJudgement");
    data["similarity"].push(slider.value);
    data["trial_end"].push(getTimeStamp());
    slider.value = "51";
    trialNum++;
    clearCanvas();
    allowKeypress = false;
    moveProgressBar(sliderIntervals[trialNum]);

    if (trialNum < nTrials) {
        setTimeout(() => {
            displayCues(trials[trialNum]);
            document.getElementById("page_main").style.display = "block";
            allowKeypress = true;
            sliderMoved = false;
            data["trial_start"].push(getTimeStamp());
        },
            750);
    } else {
        setTimeout(() => {
            document.getElementById("page_questionsintro").style.display = "block";
            sliderMoved = false;
        },
            1000);
    }
}


function exit(page) {
    if (document.fullscreenElement != null) closeFullscreen();
    changePage(page, "page_exit");
}
