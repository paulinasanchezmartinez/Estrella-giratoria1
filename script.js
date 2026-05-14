const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// --- VARIABLES GLOBALES ---
let idReloj = null;
let idGiro3D = null;
let hManual, mManual, sManual; 

// Ángulos para la rotación de la estrella
let anguloX = 0, anguloY = 0, anguloZ = 0;
let direccionGiro = 1;
let ejeActual = 'Z';

// --- FUNCIONES DE DIBUJO BÁSICO ---
function drawPoint(x, y, radius = 3, color = 'red') {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawLine(x1, y1, x2, y2, color = 'black', width = 2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function drawRectangle(x, y, width, height, color = 'black') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color = 'black') {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawTriangle(x1, y1, x2, y2, x3, y3, fillColor = null, strokeColor = 'black', width = 2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.lineWidth = width;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
}

function drawPolygon(points, fillColor = null, strokeColor = 'black', width = 2) {
    if (points.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.lineWidth = width;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
}

function drawText(text, x, y, color = 'black', font = '20px Arial') {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}

function drawImage(x, y, width, height) {
    const img = new Image();
    img.src = './images/imagen1.jpg';
    img.onload = () => {
        ctx.drawImage(img, x, y, width, height);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Función para limpiar pantalla y RESETEAR ángulos de la estrella
function limpiarTodo() {
    detenerReloj();
    detenerGiro3D();
    anguloX = 0;
    anguloY = 0;
    anguloZ = 0;
    clearCanvas();
    dibujarPlanoCartesiano();
}

function dibujarPlanoCartesiano() {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 10) {
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for (let i = 0; i < canvas.height; i += 10) {
        ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
    }
    ctx.stroke();

    ctx.fillStyle = 'blue';
    ctx.font = '12px Arial';
    ctx.fillText('Y', canvas.width / 2 + 5, 15);
    ctx.fillText('X', canvas.width - 15, canvas.height / 2 - 5);
}

// --- FUNCIONES ESPECIALES ---

function drawLineFromAtoB() {
    const xCenter = canvas.width / 2;
    const yCenter = canvas.height / 2;
    let x1 = parseInt(document.getElementById('x1').value) || 0;
    let y1 = parseInt(document.getElementById('y1').value) || 0;
    let x2 = parseInt(document.getElementById('x2').value) || 0;
    let y2 = parseInt(document.getElementById('y2').value) || 0;
    y1 *= -1; y2 *= -1;
    drawLine(xCenter + x1, yCenter + y1, xCenter + x2, yCenter + y2);
}

// --- LÓGICA ESTRELLA 3D ---

function drawStar(ax = 0, ay = 0, az = 0) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const pasos = 25; 
    const largoEje = 250; 

    function proyectar3D(x, y, z) {
        // Rotación en X
        let y1 = y * Math.cos(ax) - z * Math.sin(ax);
        let z1 = y * Math.sin(ax) + z * Math.cos(ax);
        // Rotación en Y
        let x2 = x * Math.cos(ay) + z1 * Math.sin(ay);
        let z2 = -x * Math.sin(ay) + z1 * Math.cos(ay);
        // Rotación en Z
        let x3 = x2 * Math.cos(az) - y1 * Math.sin(az);
        let y3 = x2 * Math.sin(az) + y1 * Math.cos(az);
        
        return { x: x3 + cx, y: y3 + cy };
    }

    let brazoDer = [], brazoIzq = [], brazoAbajo = [], brazoArriba = [];

    for (let i = 0; i <= pasos; i++) {
        let d = (i / pasos) * largoEje;
        brazoDer.push(proyectar3D(d, 0, 0));
        brazoIzq.push(proyectar3D(-d, 0, 0));
        brazoAbajo.push(proyectar3D(0, d, 0));
        brazoArriba.push(proyectar3D(0, -d, 0));
    }

    for (let i = 0; i < brazoDer.length; i++) {
        let j = brazoDer.length - 1 - i;
        drawLine(brazoDer[i].x, brazoDer[i].y, brazoArriba[j].x, brazoArriba[j].y, "black", 1);
        drawLine(brazoDer[i].x, brazoDer[i].y, brazoAbajo[j].x, brazoAbajo[j].y, "black", 1);
        drawLine(brazoIzq[i].x, brazoIzq[i].y, brazoArriba[j].x, brazoArriba[j].y, "black", 1);
        drawLine(brazoIzq[i].x, brazoIzq[i].y, brazoAbajo[j].x, brazoAbajo[j].y, "black", 1);
    }
}

// --- CONTROLES DE ANIMACIÓN ESTRELLA ---

function girarX(dir) { ejeActual = 'X'; direccionGiro = dir; iniciarGiro3D(); }
function girarY(dir) { ejeActual = 'Y'; direccionGiro = dir; iniciarGiro3D(); }
function girarZ(dir) { ejeActual = 'Z'; direccionGiro = dir; iniciarGiro3D(); }

function iniciarGiro3D() {
    if (idGiro3D) clearInterval(idGiro3D);
    detenerReloj(); 
    idGiro3D = setInterval(() => {
        clearCanvas();
        dibujarPlanoCartesiano();
        
        if (ejeActual === 'X') anguloX += (0.04 * direccionGiro);
        if (ejeActual === 'Y') anguloY += (0.04 * direccionGiro);
        if (ejeActual === 'Z') anguloZ += (0.04 * direccionGiro);
        
        drawStar(anguloX, anguloY, anguloZ);
    }, 30);
}

function detenerGiro3D() {
    if (idGiro3D) { clearInterval(idGiro3D); idGiro3D = null; }
}

function drawStarEstatica() {
    limpiarTodo();
    drawStar(0, 0, 0);
}

// --- CIRCULO MATH ---

function drawCircleWithMath() {
    for (let i = 0; i < 360; i += 10) {
        drawLineFromCircleWithDegrees(i, 'red', 2);
    }
}

function drawLineFromCircleWithDegrees(degrees, color = 'red', width = 2) {
    const xCenter = canvas.width / 2;
    const yCenter = canvas.height / 2;
    const x = (parseInt(document.getElementById('x').value) || 0) + xCenter;
    const y = (parseInt(document.getElementById('y').value) || 0) + yCenter;
    const radius = parseInt(document.getElementById('radius').value) || 100;
    const angle = degrees * Math.PI / 180;
    const x1 = x + radius * Math.cos(angle);
    const y1 = y + radius * Math.sin(angle);
    drawLine(x, y, x1, y1, color, width);
}

// --- RELOJES ---

function dibujarRelojPersonalizado() {
    const totalPasos = parseInt(document.getElementById('numDivisiones').value) || 12;
    let pasoActual = 0;
    const radio = 180;
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2;

    detenerReloj();
    detenerGiro3D();

    idReloj = setInterval(() => {
        clearCanvas();
        dibujarPlanoCartesiano();
        ctx.strokeStyle = "red";
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i <= pasoActual; i++) {
            let angulo = (i * 2 * Math.PI / totalPasos) - Math.PI / 2;
            let x = centroX + radio * Math.cos(angulo);
            let y = centroY + radio * Math.sin(angulo);

            ctx.beginPath();
            ctx.globalAlpha = 0.2;
            ctx.moveTo(centroX, centroY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            if (i > 0) {
                let angPrev = ((i - 1) * 2 * Math.PI / totalPasos) - Math.PI / 2;
                drawLine(centroX + radio * Math.cos(angPrev), centroY + radio * Math.sin(angPrev), x, y, "red", 2);
            }
            ctx.fillText(i, centroX + (radio + 20) * Math.cos(angulo), centroY + (radio + 20) * Math.sin(angulo));
        }
        pasoActual++;
        if (pasoActual > totalPasos) clearInterval(idReloj);
    }, 100);
}

function iniciarRelojFuncional() {
    detenerReloj();
    detenerGiro3D();
    idReloj = setInterval(() => {
        const ahora = new Date();
        dibujarEstructuraReloj(canvas.width / 2, canvas.height / 2, 180);
        
        const h = ahora.getHours();
        const m = ahora.getMinutes();
        const s = ahora.getSeconds();

        const angS = (s * Math.PI / 30) - Math.PI / 2;
        const angM = (m * Math.PI / 30) - Math.PI / 2;
        const angH = (h * Math.PI / 6) + (m * Math.PI / 360) - Math.PI / 2;

        dibujarManecilla(canvas.width / 2, canvas.height / 2, angS, 160, 2, "red");
        dibujarManecilla(canvas.width / 2, canvas.height / 2, angM, 140, 5, "black");
        dibujarManecilla(canvas.width / 2, canvas.height / 2, angH, 100, 8, "black");
    }, 1000);
}

function iniciarRelojManual() {
    hManual = parseInt(document.getElementById('inputHrs').value) || 0;
    mManual = parseInt(document.getElementById('inputMin').value) || 0;
    sManual = parseInt(document.getElementById('inputSeg').value) || 0;

    detenerReloj();
    detenerGiro3D();
    idReloj = setInterval(() => {
        sManual++;
        if (sManual >= 60) { sManual = 0; mManual++; }
        if (mManual >= 60) { mManual = 0; hManual++; }
        if (hManual >= 24) hManual = 0;

        dibujarEstructuraReloj(canvas.width / 2, canvas.height / 2, 180);

        const angS = (sManual * Math.PI / 30) - Math.PI / 2;
        const angM = (mManual * Math.PI / 30) + (sManual * Math.PI / 1800) - Math.PI / 2;
        const angH = (hManual * Math.PI / 6) + (mManual * Math.PI / 360) - Math.PI / 2;

        dibujarManecilla(canvas.width / 2, canvas.height / 2, angS, 160, 2, "red");
        dibujarManecilla(canvas.width / 2, canvas.height / 2, angM, 140, 5, "black");
        dibujarManecilla(canvas.width / 2, canvas.height / 2, angH, 100, 8, "black");
    }, 1000);
}

function detenerReloj() {
    if (idReloj) {
        clearInterval(idReloj);
        idReloj = null;
    }
}

function dibujarEstructuraReloj(cx, cy, r) {
    clearCanvas();
    dibujarPlanoCartesiano();

    for (let i = 0; i < 60; i++) {
        let angulo = (i * Math.PI / 30);
        let largo = (i % 5 === 0) ? 20 : 10;
        let xI = cx + r * Math.cos(angulo);
        let yI = cy + r * Math.sin(angulo);
        let xF = cx + (r - largo) * Math.cos(angulo);
        let yF = cy + (r - largo) * Math.sin(angulo);
        drawLine(xI, yI, xF, yF, (i % 5 === 0) ? "black" : "gray", (i % 5 === 0) ? 3 : 1);
    }

    ctx.fillStyle = "black";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 1; i <= 12; i++) {
        let ang = (i * Math.PI / 6) - Math.PI / 2;
        ctx.fillText(i, cx + (r - 40) * Math.cos(ang), cy + (r - 40) * Math.sin(ang));
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function dibujarManecilla(cx, cy, angulo, longitud, grosor, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + longitud * Math.cos(angulo), cy + longitud * Math.sin(angulo));
    ctx.stroke();
}
