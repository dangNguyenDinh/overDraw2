function addStyle() {
    //Thêm link style vào html
    var style = document.createElement("style");
    style.innerHTML = `
    #color{
        border: brown 2px;
        box-sizing: border-box;
        background-color: brown;
        height: 20px;
    }
    #canvas{
        cursor: pointer;
    }
    #black{
        width: 50px;
        height: 20px;
        margin: 0;
        background: black;
        color: white;
    }
    #exit{
        width: 30px;
        height: 20px;
        margin: 0;
        background: aliceblue;
        color: black;
    }
    #board{
        position: fixed;
        top: -200vh;
        width: 100vw;
        height: 100vh;
        z-index: -99999;
        background-color: rgba(0,0,0,0.1);
    }
    #clearBtn{
        width: 50px;
        height: 20px;
        margin: 0;
    }
    #colors{
        display: inline-block;
        border: black 2px solid;
    }
`
    document.querySelector("body").appendChild(style);
}

addStyle();




//kiểm soát phím kích hoạt được nhấn
let controlPopUp = true;
document.addEventListener("keydown", function (event) {
    if (event.code === "Insert" || event.code === "Escape") {
        if (controlPopUp) {
            var res = confirm("Enable board");
            if (res) {
                board.style.zIndex = 99999;
                board.style.top = '0';
                controlPopUp = false;
                //xoá bỏ thuộc tính có thể lăn chuột khi đang vẽ
                document.querySelector("html").style.overflow = "hidden";
            }
        } else {
            var res = confirm("Disable board");
            if (res) {
                board.style.zIndex = -99999;
                board.style.top = '-200vh';
                //thêm lại thuộc tính có thể lăn chuột khi hết vẽ
                document.querySelector("html").style.overflow = "auto";
                controlPopUp = true;
            }
        }
    }
});

var boardContent = `
    <div id='colors'>
        <button id='black'>Black</button>
        <button id='clearBtn'>Clear</button>
        <button id='exit'>&#8612;</button>
    </div>
    <canvas id='canvas' width='2000' height='1000'></canvas>
`
//thêm bảng vẽ vào trang
var board = document.createElement("div");
board.id = "board";
board.innerHTML = boardContent;
document.querySelector("body").appendChild(board);

//js 
var arr_touches = [];
var canvas;
var ctx;
var down = false;
var color = 'black';
var width = 1;
window.onload = function () {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.lineWidth = width;
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mouseup', handleUp);
    canvas.addEventListener("touchstart", handleStart, false);
    canvas.addEventListener("touchend", handleEnd, false);
    canvas.addEventListener("touchcancel", handleCancel, false);
    canvas.addEventListener("touchleave", handleEnd, false);
    canvas.addEventListener("touchmove", handleTouchMove, false);
};
function handleMove(e) {
    xPos = e.clientX - canvas.offsetLeft;
    yPos = e.clientY - canvas.offsetTop;
    if (down == true) {
        ctx.lineTo(xPos, yPos);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}
function handleDown() {
    down = true;
    ctx.beginPath();
    ctx.moveTo(xPos, yPos);
}
function handleUp() {
    down = false;
}
function handleStart(evt) {
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        if (isValidTouch(touches[i])) {
            evt.preventDefault();
            arr_touches.push(copyTouch(touches[i]));
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
}
function handleTouchMove(evt) {
    var touches = evt.changedTouches;
    var offset = findPos(canvas);
    for (var i = 0; i < touches.length; i++) {
        if (isValidTouch(touches[i])) {
            evt.preventDefault();
            var idx = ongoingTouchIndexById(touches[i].identifier);
            if (idx >= 0) {
                ctx.beginPath();
                ctx.moveTo(arr_touches[idx].clientX - offset.x, arr_touches[idx].clientY - offset.y);
                ctx.lineTo(touches[i].clientX - offset.x, touches[i].clientY - offset.y);
                ctx.strokeStyle = color;
                ctx.stroke();
                arr_touches.splice(idx, 1, copyTouch(touches[i]));
            }
        }
    }
}
function handleEnd(evt) {
    var touches = evt.changedTouches;
    var offset = findPos(canvas);
    for (var i = 0; i < touches.length; i++) {
        if (isValidTouch(touches[i])) {
            evt.preventDefault();
            var idx = ongoingTouchIndexById(touches[i].identifier);
            if (idx >= 0) {
                ctx.lineWidth = 4;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(arr_touches[idx].clientX - offset.x, arr_touches[idx].clientY - offset.y);
                ctx.lineTo(touches[i].clientX - offset.x, touches[i].clientY - offset.y);
                arr_touches.splice(i, 1);
            }
        }
    }
}
function handleCancel(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        arr_touches.splice(i, 1);
    }
}
function copyTouch(touch) {
    return { identifier: touch.identifier, clientX: touch.clientX, clientY: touch.clientY };
}
function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < arr_touches.length; i++) {
        var id = arr_touches[i].identifier;
        if (id == idToFind) {
            return i;
        }
    }
    return -1;
}
function changeColor() {
    if (color == 'black') {
        color = 'red';
        document.getElementById("black").style.backgroundColor = "red";
        document.getElementById("black").textContent = "Red";
    } else {
        color = 'black';
        document.getElementById("black").style.backgroundColor = "black";
        document.getElementById("black").textContent = "Black";
    }
}
function clearCanvas() {
    console.log("hêhe")
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function isValidTouch(touch) {
    var curleft = 0, curtop = 0;
    var offset = 0;
    if (canvas.offsetParent) {
        do {
            curleft += canvas.offsetLeft;
            curtop += canvas.offsetTop;
        } while (touch == canvas.offsetParent);
        offset = { x: curleft - document.body.scrollLeft, y: curtop - document.body.scrollTop };
    }
    if (touch.clientX - offset.x > 0 &&
        touch.clientX - offset.x < parseFloat(canvas.width) &&
        touch.clientY - offset.y > 0 &&
        touch.clientY - offset.y < parseFloat(canvas.height)) {
        return true;
    }
    else {
        return false;
    }
}
function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj == obj.offsetParent);
        return { x: curleft - document.body.scrollLeft, y: curtop - document.body.scrollTop };
    }
}

document.getElementById("clearBtn").onclick = clearCanvas;
document.getElementById("black").onclick = changeColor;
document.getElementById("exit").onclick = () => {
    board.style.zIndex = -1;
    board.style.top = '-200vh';
    //thêm lại thuộc tính có thể lăn chuột khi hết vẽ
    document.querySelector("html").style.overflow = "auto";
    controlPopUp = true;
}

enable.onclick = () => {
    console.log("hehe")
    board.style.zIndex = 99999;
    board.style.top = '0';
    controlPopUp = false;
    //xoá bỏ thuộc tính có thể lăn chuột khi đang vẽ
    document.querySelector("html").style.overflow = "hidden";
}