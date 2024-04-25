const generar = document.querySelector("#generar"),
ingreso = document.querySelector("#ingresoDeDatos"),
grafica  = document.querySelector("#grafica"),
volver = document.querySelector("#volver"),
intervalos = document.querySelector("#intervalos"),
distribucion = document.querySelector("#distribucion"),
contenedorPrincipal = document.querySelector("#contenedorPrincipal"),
tituloDist = document.querySelector("#dist"),
okUniforme = document.querySelector("#okUniforme"),
okNormal = document.querySelector("#okNormal"),
okExponencial = document.querySelector("#okExponencial"),
popUniforme = document.querySelector("#popUniforme"),
popNormal = document.querySelector("#popNormal"),
popExponencial = document.querySelector("#popExponencial"),
popMostrarMas = document.querySelector("#popMostrarMas"),
inputA = document.querySelector("#inputA"),
inputB = document.querySelector("#inputB"),
lambda = document.querySelector("#lambda"),
media = document.querySelector("#media"),
desv = document.querySelector("#desv"),
columnaRandoms = document.querySelector("#columnaGenerados"),
columnaTransformados = document.querySelector("#columnaTransformados"),
mostrarMas = document.querySelector("#mostrarMas"),
masDatos = document.querySelector("#colRnd"),
salir = document.querySelector("#salir"),
popFondoNormal = document.querySelector("#popFondoNormal"),
popFondoExponencial = document.querySelector("#popFondoExponencial"),
popFondoUniforme = document.querySelector("#popFondoUniforme"),
popFondoMostrarMas = document.querySelector("#popFondoMostrarMas");
let myChart;
//canvas = document.querySelector("#myChart").getContext("2d"),

// Función para crear el gráfico

function crearGrafico(tablas) {
    const canvas = document.querySelector("#myChart").getContext("2d");

    // Eliminar el gráfico existente si lo hay
    if (myChart) {
        myChart.destroy();
    }
    const labels = tablas.map((tabla, index) => `${index + 1}`);
    // Crear el nuevo gráfico
    myChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Histograma de frecuencias",
                backgroundColor: "rgb(139, 47, 201)",
                data: tablas.map(tabla => tabla.frecuenciaObservada),
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'category',
                    barThickness: 50,
                    categorySpacing: 1,
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

let numerosAleatorios = document.querySelector("#numerosAleatorios")



// Evento click en el botón "Generar"
generar.addEventListener("click", () => {
    if (numerosAleatorios.value != "" && intervalos.value != "" && distribucion != "") {
        const numAleatorios = parseInt(numerosAleatorios.value);
        if (isNaN(numAleatorios) || numAleatorios <= 0 || numAleatorios > 1000000) {
            let texto = "Ingrese un número válido entre 1 y 1.000.000 en 'Números Aleatorios'.";
            sweetAlert("error", texto);
            return;
        } else {
            let numerosGenerados = crearAleatorios(numerosAleatorios.value);
            console.log(numerosGenerados);
            let numerosTransformados = comprobarTipoDistribucion();
            let numIntervalos = parseInt(intervalos.value);
            let tablas = calculoValoresParaTabla(numerosTransformados, numIntervalos, distribucion.value, media.value, desv.value);
            console.log("Aca van las tablas");
            console.log(tablas);
            tablaHTML(tablas, numerosTransformados, numerosGenerados);
            crearTabla(numerosGenerados, numerosTransformados);
            // Llama a la función para crear el gráfico, pasando tablas e intervalos como parámetros
            crearGrafico(tablas, numIntervalos);
            
            pantallaGrafico();
            numerosAleatorios.value = "";
            intervalos.value = "";
        }
    } else {
        let texto = "Complete todos los campos.";
        sweetAlert("error", texto);
    }
});

function comprobarTipoDistribucion(){
    if(distribucion.value == "uniforme"){
        let a = parseInt(inputA.value);
        let b = parseInt(inputB.value);
        let numerosUniformes = transformarAUniforme(numerosGenerados, a, b); 
        return numerosUniformes;
    }else if(distribucion.value == "exponencial"){
        let intLambda = parseInt(lambda.value)
        let numerosExponenciales = transformarAExponencial(numerosGenerados,intLambda)
        return numerosExponenciales;
    }else if(distribucion.value == "normal"){
        let mediaNormal = parseInt(media.value);
        let desvEst = parseInt(desv.value)
        let numerosNormales = transformarANormal(numerosAleatorios.value, mediaNormal, desvEst);
        console.log("Numeros normales: ");
        console.log(numerosNormales);
        return numerosNormales;
    }
}

let numerosGenerados = [];
let numerosTransformados = [];
//Genera los aleatorios entre 0 y 1
function crearAleatorios(limiteNum){
    let inputAleatorio = parseInt(limiteNum);
    
    for(let i = 0; i < inputAleatorio; i++){
        let numero = parseFloat(Math.random()); 
        numerosGenerados.push(numero);
    }

    return numerosGenerados; 
}


//Clase para la tabla de frecuencias
class Tabla {
    constructor(numeroIntervalo, li, ls, frecuenciaObservada, frecuenciaEsperada, chiCuadrado) {
        this.numeroIntervalo = numeroIntervalo;
        this.li = li;
        this.ls = ls;
        this.frecuenciaObservada = frecuenciaObservada;
        this.frecuenciaEsperada = frecuenciaEsperada;
        this.chiCuadrado = chiCuadrado;
    }
}

//Tranforma los numeros a la distribucion uniforme
function transformarAUniforme(numerosAleatorios, primerParametro, segundoParametro) {

    let numerosTransformados = [];
    for (let i = 0; i < numerosAleatorios.length; i++) {
        let valorTransformado = primerParametro + (segundoParametro - primerParametro) * numerosAleatorios[i];
        numerosTransformados.push(valorTransformado);
    }
    return numerosTransformados;
}

// Tranforma los numeros a la distribucion exponencial
function transformarAExponencial(numerosAleatorios, lambda) {
    
    let numerosTransformados = [];
    for (let i = 0; i < numerosAleatorios.length; i++) {
        let valorTransformado = (-(1/lambda) * Math.log(1 - numerosAleatorios[i]));

        numerosTransformados.push(parseFloat(valorTransformado));
    }

    return numerosTransformados;
}

//Tranforma los numeros a la distribucion normal
function transformarANormal(cantNumerosAleatorios, media, desviacionEstandar) {
    let numerosTransformados = [];
    //let vueltas = Math.floor(cantNumerosAleatorios / 2); // Borrar el / 2
    let vueltas = cantNumerosAleatorios;
    let rnd1 = [];
    let rnd2 = [];
    let rndZ1 = [];
    let rndZ2 = [];

    for (let i = 0; i < vueltas; i++) {
        let numAleatorio1 = Math.random();
        let numAleatorio2 = Math.random();

        rnd1.push(numAleatorio1);
        rnd2.push(numAleatorio2);

        let z1 = Math.sqrt(-2 * Math.log(1 - numAleatorio1)) * Math.cos(2 * Math.PI * numAleatorio2);
        let z2 = Math.sqrt(-2 * Math.log(1 - numAleatorio1)) * Math.sin(2 * Math.PI * numAleatorio2);


        z1 = z1 * desviacionEstandar + media;
        z2 = z2 * desviacionEstandar + media;

        rndZ1.push(z1);
        rndZ2.push(z2);


        // array para z1 y otro para z2 para el front
        numerosTransformados.push(z1, z2);
    }
    console.log("Rnd1");
    console.log(rnd1);
    console.log("Rnd2");
    console.log(rnd2);
    console.log("Array RNDZ1");
    console.log(rndZ1);
    console.log("Array RNDZ2");
    console.log(rndZ2);
    // Verificar si la cantidad de números aleatorios es impar
    if (cantNumerosAleatorios % 2 !== 0) {
        let numAleatorioExtra = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()) * desviacionEstandar + media;
        numerosTransformados.push(numAleatorioExtra);
    }
    return numerosTransformados;
}


//Calcula la frecuencia por intervalo
function calcularFrecuenciaEnIntervalos(numerosTransformados, limites) {
    let frecuencias = new Array(limites.length).fill(0);
    
    for (let numero of numerosTransformados) {
        let ultimo = false;
        for (let i = 0; i < limites.length; i++) {
            if (numero >= limites[i].li && numero <= limites[i].ls) {
                frecuencias[i]++;
                ultimo = true;
                break;
            }
        }
        // Si el número no está en ningún intervalo, contarlo en el último intervalo
        if (!ultimo) {
            frecuencias[limites.length - 1]++;
        }
    }
    return frecuencias;
}


//Calcula los chi de cada fila
function calcularChiCuadrado(frecuenciaObservada, frecuenciaEsperada) {
    return ((frecuenciaObservada - frecuenciaEsperada) ** 2) / frecuenciaEsperada;
}

//Cálculo de frecuencias esperadas para cada intervalo
function calcularFrecuenciasEsperadas(limites, numerosTransformados, tipoDistribucion, parametrosDistribucion, media, desv) {
    let frecuenciasEsperadas = [];
    for (let i = 0; i < limites.length; i++) {
        let frecuenciaEsperada;
        switch (tipoDistribucion) {
            case 'uniforme':
                frecuenciaEsperada = calcularFrecuenciaEsperadaUniforme(numerosTransformados.length, limites.length);
                break;
            case 'normal':
                frecuenciaEsperada = calcularFrecuenciaEsperadaNormal(limites[i].li, limites[i].ls, numerosTransformados.length, media, desv);
                break;
            case 'exponencial':
                frecuenciaEsperada = calcularFrecuenciaEsperadaExponencial(limites[i].li, limites[i].ls, numerosTransformados.length, lambda.value);
                console.log("Frecuencia exponencial esperada" + frecuenciaEsperada);
                break;
            default:
                console.error('Tipo de distribución no válido');
                break;
        }
        frecuenciasEsperadas.push(frecuenciaEsperada);
    }
    return frecuenciasEsperadas;
}

//calculoValoresParaTabla
function calculoValoresParaTabla(numerosTransformados, cantIntervalos, tipoDistribucion, media, desv,...parametrosDistribucion) {
    let limites = calcularLimitesIntervalos(numerosTransformados, cantIntervalos);
    let frecuencias = calcularFrecuenciaEnIntervalos(numerosTransformados, limites);
    console.log("Frecuencia: " + frecuencias);
    let frecuenciasEsperadas = calcularFrecuenciasEsperadas(limites, numerosTransformados, tipoDistribucion, parametrosDistribucion, media, desv);
    console.log("Frecuencia esperada: " + frecuenciasEsperadas);
    let tablas;
    if (tipoDistribucion === 'uniforme') {
        tablas = calcularChiCuadradoParaIntervalos(limites,frecuenciasEsperadas, frecuencias);
    } else {
        let { intervalosAgrupados, frecuenciasObservadasAgrupadas, frecuenciasEsperadasAgrupadas } = agruparIntervalos(limites, frecuencias, frecuenciasEsperadas);
        tablas = calcularChiCuadradoParaIntervalos(intervalosAgrupados, frecuenciasEsperadasAgrupadas, frecuenciasObservadasAgrupadas);
        
    }
    return tablas
}

//Calcula los limites sin agrupar
function calcularLimitesIntervalos(numerosTransformados, cantIntervalos) {
    let minimo = Infinity;
    let maximo = -Infinity;
    
    // Encontrar el mínimo y el máximo de los números transformados
    for (let numero of numerosTransformados) {
        if (numero < minimo) {
            minimo = numero;
        }
        if (numero > maximo) {
            maximo = numero;
        }
    }

    // Calcular la amplitud del intervalo
    let amplitud = parseFloat((maximo - minimo) / cantIntervalos);
    
    // Inicializar arreglo de límites
    let limites = [];
    
    // Calcular los límites para cada intervalo
    let limiteInferior = parseFloat(minimo);
    
    
    for (let i = 0; i < cantIntervalos; i++) {

        let limiteSuperior = parseFloat(limiteInferior + amplitud);
        limites.push({ li: limiteInferior, ls: limiteSuperior });
        limiteInferior = limiteSuperior;

    }
    
    return limites;
}

//Cálculo de chi-cuadrado para los intervalos agrupados
function calcularChiCuadradoParaIntervalos(intervalosAgrupados, frecuenciasEsperadasAgrupadas, frecuenciasObservadasAgrupadas) {

    let tablas = [];
    for (let i = 0; i < intervalosAgrupados.length; i++) {
        let chiCuadrado = calcularChiCuadrado(frecuenciasObservadasAgrupadas[i], frecuenciasEsperadasAgrupadas[i]);
        let liRedondeado = intervalosAgrupados[i].li.toFixed(4);
        let lsRedondeado = intervalosAgrupados[i].ls.toFixed(4);
        let tabla = new Tabla(i + 1, liRedondeado, lsRedondeado, frecuenciasObservadasAgrupadas[i], frecuenciasEsperadasAgrupadas[i], chiCuadrado);
        tablas.push(tabla);
    }
    return tablas;
}


function calcularFrecuenciaEsperadaUniforme(cantNumeros, cantIntervalos){
    return cantNumeros / cantIntervalos
}

function calcularFrecuenciaEsperadaNormal(limiteInferior, limiteSuperior, cantNumeros, media, desviacionEstandar ) {
    const phi = x => (1 + erf((x - media) / (desviacionEstandar * Math.sqrt(2)))) / 2;
    const phiInferior = phi(limiteInferior);
    const phiSuperior = phi(limiteSuperior);
    return (phiSuperior - phiInferior) * cantNumeros;
}

//const math = require('mathjs');

// Función de error, es para la normal
function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}

function calcularFrecuenciaEsperadaExponencial(limiteInferior, limiteSuperior, cantNumeros, lambda) {
    lambda = parseInt(lambda)
    console.log(typeof lambda);
    console.log("Limite inferior: " + limiteInferior);
    console.log("Limite superior: " + limiteSuperior);
    console.log("Limite cantNumeros: " + cantNumeros);
    console.log("Lambda: " + lambda);
    let eALaMenosLambdaLS = Math.exp(-lambda * limiteSuperior);
    let eALaMenosLambdaLI = Math.exp(-lambda * limiteInferior);
    console.log("Diferencia");
    console.log(eALaMenosLambdaLS);
    console.log(eALaMenosLambdaLI);
    let diferencia = (1 - eALaMenosLambdaLS) - (1 - eALaMenosLambdaLI);
    console.log("Diferencia: " + diferencia);
    console.log(diferencia * cantNumeros);
    return diferencia * cantNumeros;
}

//Agrupación de intervalos con frecuencias esperadas menores a 5
//Funcion Agrupar intervalo
function agruparIntervalos(limites, frecuencias, frecuenciasEsperadas) {
    console.log(frecuenciasEsperadas);
    console.log(frecuencias)
    console.log(limites)
    let intervalosAgrupados = [];
    let frecuenciasObservadasAgrupadas = [];
    let frecuenciasEsperadasAgrupadas = [];
    let acumuladorFrecuenciaEsperada = 0;
    let acumuladorFrecuenciaObservada = 0;
    let liIntervaloAgrupado = limites[0].li;
    let lsIntervaloAgrupado = limites[0].ls;
    let liPrimerIntervaloAgrupado = 0;
    

    for (let i = 0; i < limites.length; i++) { 
        // Actualizar los límites del intervalo agrupado al inicio del bucle
        lsIntervaloAgrupado = limites[i].ls;
        let frecuenciaObservada = frecuencias[i];
        let frecuenciaEsperada = frecuenciasEsperadas[i];
        acumuladorFrecuenciaEsperada += frecuenciaEsperada;
        acumuladorFrecuenciaObservada += frecuenciaObservada;

        if (acumuladorFrecuenciaEsperada < 5) {
            // Si la frecuencia esperada es menor a 5, se acumula con el intervalo anterior
            if(liIntervaloAgrupado != 0){
                lsIntervaloAgrupado = limites[i].ls;
            }else{
                //Esto es en el caso que agrupe muchos intervalos al principio, sino no andaba bien
                liPrimerIntervaloAgrupado =  limites[i].li
                
            } 
        } else {
            // Agregar el intervalo agrupado y reiniciar acumuladores
            if(liIntervaloAgrupado != 0){
                intervalosAgrupados.push({ li: liIntervaloAgrupado, ls: lsIntervaloAgrupado });
                frecuenciasObservadasAgrupadas.push(acumuladorFrecuenciaObservada);
                frecuenciasEsperadasAgrupadas.push(acumuladorFrecuenciaEsperada);
            }else{
                intervalosAgrupados.push({ li: liPrimerIntervaloAgrupado, ls: lsIntervaloAgrupado });
                frecuenciasObservadasAgrupadas.push(acumuladorFrecuenciaObservada);
                frecuenciasEsperadasAgrupadas.push(acumuladorFrecuenciaEsperada);}    
            // Establecer los límites del próximo intervalo si está definido
            if (limites[i + 1]) {
                liIntervaloAgrupado = limites[i + 1].li;
                lsIntervaloAgrupado = limites[i + 1].ls;
            }
            // Reiniciar acumuladores
            acumuladorFrecuenciaObservada = 0;
            acumuladorFrecuenciaEsperada = 0;
            liPrimerIntervaloAgrupado = 0;
        }
        
    }
    // Verificar si el último intervalo debe unirse al anterior
    if (acumuladorFrecuenciaEsperada < 5 && intervalosAgrupados.length > 0) {
        // Unir al intervalo anterior
        let ultimoIntervalo = intervalosAgrupados.pop();
        let ultimaFrecuenciaEsperada = frecuenciasEsperadasAgrupadas.pop() + acumuladorFrecuenciaEsperada;
        let ultimaFrecuenciaObservada = frecuenciasObservadasAgrupadas.pop() + acumuladorFrecuenciaObservada;

        ultimoIntervalo.ls = lsIntervaloAgrupado;
        intervalosAgrupados.push(ultimoIntervalo)
        frecuenciasObservadasAgrupadas.push(ultimaFrecuenciaObservada);
        frecuenciasEsperadasAgrupadas.push(ultimaFrecuenciaEsperada);
    } else {
        // Agregar el último intervalo normalmente
        intervalosAgrupados.push({ li: liIntervaloAgrupado, ls: lsIntervaloAgrupado });
        frecuenciasObservadasAgrupadas.push(acumuladorFrecuenciaObservada);
        frecuenciasEsperadasAgrupadas.push(acumuladorFrecuenciaEsperada);
    }
    return { intervalosAgrupados, frecuenciasObservadasAgrupadas, frecuenciasEsperadasAgrupadas };
}

function sumarChiCuadrado(tablas) {
    let suma = 0;
    for (let tabla of tablas) {
        suma += tabla.chiCuadrado;
    }
    return suma;
}

function limpiarLista(){
    let celdas = document.querySelectorAll(".columna");
    celdas.forEach((e)=>{
        e.remove();
    })
    numerosGenerados = [];
    numerosTransformados = [];
    console.log(numerosTransformados);
    rnd1 = [];
    rnd2 = [];
    rndZ1 = [];
    rndZ2 = [];
}

function pantallaGrafico(){
    ingreso.classList.remove("block");
    ingreso.classList.add("none");
    grafica.classList.remove("none");
    grafica.classList.add("block");
    contenedorPrincipal.classList.remove("contenedorPrincipal")
    contenedorPrincipal.classList.add("fullPantalla");
}

function pantallaPrincipal() {
    ingreso.classList.remove("none");
    ingreso.classList.add("block");
    grafica.classList.remove("block")
    grafica.classList.add("none")
    tabla.classList.remove("block");
    tabla.classList.add("none");
    contenedorPrincipal.classList.add("contenedorPrincipal")
    contenedorPrincipal.classList.remove("fullPantalla");
}


volver.addEventListener("click", (e) => {
    limpiarLista();
    pantallaPrincipal();
    if (myChart) {
        myChart.destroy();
    }
});

salir.addEventListener("click",()=>{
    popMostrarMas.classList.remove("block");
    popMostrarMas.classList.add("none");
    popFondoMostrarMas.classList.remove("block");
    popFondoMostrarMas.classList.add("none");
})

mostrarMas.addEventListener("click",()=>{
    masDatos.classList.remove("none");
    masDatos.classList.add("block");
    popMostrarMas.classList.remove("none");
    popMostrarMas.classList.add("block");
    popFondoMostrarMas.classList.remove("none");
    popFondoMostrarMas.classList.add("block");
})


/* Pop Ups */

distribucion.addEventListener("click",()=>{
    if(distribucion.value == "uniforme"){
        popUniforme.classList.remove("none");
        popUniforme.classList.add("block");
        popFondoUniforme.classList.remove("none");
        popFondoUniforme.classList.add("block");
        popNormal.classList.remove("block");
        popNormal.classList.add("none");
        popExponencial.classList.remove("block");
        popExponencial.classList.add("none");
        popFondoNormal.classList.remove("block");
        popFondoNormal.classList.add("none");
        popFondoExponencial.classList.remove("block");
        popFondoExponencial.classList.add("none");
    }else if(distribucion.value == "normal"){
        popNormal.classList.remove("none");
        popNormal.classList.add("block");
        popFondoNormal.classList.remove("none");
        popFondoNormal.classList.add("block");
        popFondoExponencial.classList.remove("block");
        popFondoExponencial.classList.add("none");
        popUniforme.classList.remove("block");
        popUniforme.classList.add("none");
        popExponencial.classList.remove("block");
        popExponencial.classList.add("none");
        popFondoUniforme.classList.remove("block");
        popFondoUniforme.classList.add("none");
    }else if(distribucion.value == "exponencial"){
        popExponencial.classList.remove("none");
        popExponencial.classList.add("block");
        popFondoExponencial.classList.remove("none");
        popFondoExponencial.classList.add("block");
        popNormal.classList.remove("block");
        popNormal.classList.add("none");
        popUniforme.classList.remove("block");
        popUniforme.classList.add("none");
        popFondoNormal.classList.remove("block");
        popFondoNormal.classList.add("none");
        popFondoUniforme.classList.remove("block");
        popFondoUniforme.classList.add("none");
    }
});

okUniforme.addEventListener("click",()=>{
    let a = parseInt(inputA.value);
    let b = parseInt(inputB.value);
    if (inputA.value == "" || inputB.value == "") {
        let txt = "Complete todos los campos";
        sweetAlert("error",txt);
    }else{
            if(a > b){
                let txt = "El valor de A debe ser menor al de B";
                sweetAlert("error",txt);
            }else{
                    popUniforme.classList.remove("block");
                    popUniforme.classList.add("none");
                    popNormal.classList.remove("block");
                    popNormal.classList.add("none");
                    popExponencial.classList.remove("block");
                    popExponencial.classList.add("none");
                    popFondoUniforme.classList.remove("block");
                    popFondoUniforme.classList.add("none");
                    popFondoNormal.classList.remove("block");
                    popFondoNormal.classList.add("none");
                    popFondoExponencial.classList.remove("block");
                    popFondoExponencial.classList.add("none");
                }
        }
});

okNormal.addEventListener("click",()=>{
    if (media.value == "" || desv.value == "") {
        let txt = "Complete todos los campos";
        sweetAlert("error",txt);
    }else{
        if (media.value <= 0 || desv.value <= 0) {
            let txt = "Ingrese numeros positivos";
            sweetAlert("error",txt);
        }else{
            popNormal.classList.remove("block");
            popNormal.classList.add("none");
            popUniforme.classList.remove("block");
            popUniforme.classList.add("none");
            popExponencial.classList.remove("block");
            popExponencial.classList.add("none");
            popFondoUniforme.classList.remove("block");
            popFondoUniforme.classList.add("none");
            popFondoNormal.classList.remove("block");
            popFondoNormal.classList.add("none");
            popFondoExponencial.classList.remove("block");
            popFondoExponencial.classList.add("none");
        }
    }
});

okExponencial.addEventListener("click",()=>{
    if (lambda.value == "") {
        let txt = "Complete todos los campos";
        sweetAlert("error",txt);
    }else{
        if (lambda.value <= 0) {
            let txt = "Ingrese numeros positivos";
            sweetAlert("error",txt);
        }else{
            popExponencial.classList.remove("block");
            popExponencial.classList.add("none");
            popNormal.classList.remove("block");
            popNormal.classList.add("none");
            popUniforme.classList.remove("block");
            popUniforme.classList.add("none");
            popFondoUniforme.classList.remove("block");
            popFondoUniforme.classList.add("none");
            popFondoNormal.classList.remove("block");
            popFondoNormal.classList.add("none");
            popFondoExponencial.classList.remove("block");
            popFondoExponencial.classList.add("none");
        }
    }
});

function tablaHTML(tablas, numerosTransformados, numerosGenerados){
    columnaRandoms.innerHTML = `<li class="columna">Randoms</li>`
    /*numerosGenerados.forEach(fila =>{
        columnaRandoms.innerHTML += `
                                        <li class="columna">${fila.toFixed(4)}</li>      
                                    `;
    });*/
    
    columnaTransformados.innerHTML = `<li class="columna encabezado">${distribucion.value}</li>`;
    tablaNumerosNuevo(numerosGenerados, numerosTransformados);
    /*numerosTransformados.forEach(elemento =>{
        let numero = parseFloat(elemento);
        if (!isNaN(numero)) {
            let celda = numero.toFixed(4);
            columnaTransformados.innerHTML += `
                <li class="columna">${celda}</li>      
            `;
        } else {
            console.error('El elemento no es un número válido:', elemento);
        }
    });*/

tabla.innerHTML += `<div class="fila"> 
                            <li class="columna encabezado">Intervalo</li>
                            <li class="columna encabezado">LI</li>
                            <li class="columna encabezado">LS</li>
                            <li class="columna encabezado">FO</li>
                            <li class="columna encabezado">FE</li>
                            <li class="columna encabezado">CHI CUADRADO</li> 
                    </div>`;


tablas.forEach(fila => {
    const {numeroIntervalo, li, ls, frecuenciaObservada, frecuenciaEsperada, chiCuadrado} = fila;
    //const numeroGenerado = numerosGenerados[numeroIndex] || ''; // Evita errores si el arreglo no tiene suficientes elementos
    //const numeroTransformado = numerosTransformados[numeroIndex] || '';
    
    tabla.innerHTML += `<div class="fila">
                                    <li class="columna">${numeroIntervalo}</li>
                                    <li class="columna">${li}</li>
                                    <li class="columna">${ls}</li>
                                    <li class="columna">${frecuenciaObservada.toFixed(4)}</li>
                                    <li class="columna">${frecuenciaEsperada.toFixed(4)}</li>
                                    <li class="columna">${chiCuadrado.toFixed(4)}</li>
                        </div>`
});

let chi = sumarChiCuadrado(tablas);
let chiRedondeado = chi.toFixed(4);
tabla.innerHTML += `<div class="fila">
                                <li class="columna"></li>
                                <li class="columna"></li>
                                <li class="columna"></li>
                                <li class="columna"></li>
                                <li class="columna"></li>
                                <li class="columna chi">Chi calc = ${chiRedondeado}</li>
                    </div>`

};

let tabla = document.querySelector("#tabla");

function crearTabla(numGen, numTransf){

    tabla.classList.remove("none");
    tabla.classList.add("block");
}


function tablaNumerosNuevo(randoms, transformados){
    let randomsRedondeados = redondear(randoms);
    let transformadosRedondeados  = redondear(transformados);
    //console.log(randomsRedondeados);
    //console.log(transformadosRedondeados);
    let cadenaRandoms =  randomsRedondeados.join(' ');
    let cadenaTransformados = transformadosRedondeados.join(' ');
    columnaRandoms.innerHTML += cadenaRandoms;
    columnaTransformados.innerHTML += cadenaTransformados;
}

function redondear(arr){
    let arregloRedondeado = [];
    arr.forEach(element => {
        arregloRedondeado.push(element.toFixed(4));
    });
    return arregloRedondeado
}


/* Framework Alertas */

function sweetAlert(icono, texto) {
    Swal.fire({
        title: texto,
        icon: icono,
        position: 'top-end', // Establece la posición en la esquina superior derecha
        customClass: {
            popup: 'custom-alert-class',
            content: 'custom-alert-content-class'
        },
    });
}


