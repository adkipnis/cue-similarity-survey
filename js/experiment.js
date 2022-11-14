// Author: Alex Kipnis

let jsPsych = initJsPsych();
const timestamp = getTimeStamp();
let subject_id = jsPsych.randomization.randomID(8);
let fs = true;
let sliderMoved = false;
let trialNum = 0;


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

async function changePage(hide, show, fullScreen = false, timeout = 0) {
    document.getElementById(hide).style.display = "none";
    await new Promise(resolve => setTimeout(resolve, timeout));
    document.getElementById(show).style.display = "block";
    window.scrollTo(0, 0);
    if (fullScreen) {
        let elem = document.body;
        openFullscreen(elem);
    }
}

function wait(id, duration = 500) {
    changePage(id, id, fullScreen = false, timeout = duration);
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
    metadata["survey_time"] = getTimeStamp(0);
    displayCues(data["trials"][trialNum]);
    window.addEventListener("keydown", event => {
        if (event.key == "ArrowLeft" || event.key == "ArrowRight") moveSlider(event);
        if (event.key == "ArrowUp" || event.key == "ArrowDown") event.preventDefault();
        if (event.key == " " || event.key == "SpaceBar") {
            if (sliderMoved) nextStimulus(event);
            else instruct2moveSlider();
        }
    });
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
    let slider = document.getElementById("similarityJudgement");
    data["similarity_judgements"].push(slider.value);
    data["judgement_times"].push(getTimeStamp(0));
    slider.value = "51";
    trialNum++;
    clearCanvas();

    if (trialNum < nTrials) {
        wait("page_main", duration = 500);
        displayCues(data["trials"][trialNum]);
    } else {
        changePage("page_main", "page_end");
    }
    event.preventDefault();
    sliderMoved = false;
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
    metadata["end_time"] = getTimeStamp(0);
    changePage(page, "page_exit");
}


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

let cueFiles = [];
for (let i = 1; i < 6; i++) cueFiles.push("cues/c_" + String.fromCharCode(i + 65) + ".png");
let cueImages = cueFiles.map(f => initImage(f));


// Data
let metadata = {
    "subject_id": subject_id,
    "start_time": timestamp,
    "survey_time": "",
    "end_time": "",
    "gender": "", // TODO
    "age": "", // TODO
    "nationality": "", // TODO
    "opencomments": "" // TODO
}

let data = {
    "trials": "",
    "similarity_judgements": [],
    "judgement_times": [],
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

data["trials"] = permute(allUniqueCombs(cueFiles.length));
const nTrials = data["trials"].length;

// Testing
// console.log(nTrials);

