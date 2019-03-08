var cantReinas = 0; //tamaño de matriz
var poblacion = 0;
var generaciones = 0;
var matriz = new Array(new Array());
var matrizTemp = new Array(new Array());
var indicePintar = -1;
var listaAtaques = new Array();
var listaPorcentajes = new Array();
var numGeneraciones = 0;
var candidatoApto = false;
$(function(){
	$("#btnGenerar").click(function(){
		candidatoApto = false;
		
		cantReinas = $("#txtNumReinas").val();
		poblacion = $("#txtPoblacion").val();
		generaciones = $("#txtGeneraciones").val();
		
		if(!cantReinas){$("#txtNumReinas").focus();return true;}
		if(!poblacion){$("#txtPoblacion").focus();return true;}
		if(!generaciones){$("#txtGeneraciones").focus();return true;}
		$("#texto").html("");
		$("#solucion").html("");
		
		generarPoblacionInicial();
		
		seleccionIndividuos();
			
		if(candidatoApto == false){
			cruzamientoIndividuos();
			mutarIndividuos()
			$("#btnResolver").show();
		}
		dibujarTablero();
	});
	
	$("#btnResolver").click(function(){
		do
		{
			
			//SELECCIÓN DE INDIVIDUOS PARA LA PRÓXIMA GENERACIÓN
			seleccionIndividuos();
			if(!candidatoApto)
			{
				//CRUZAMIENTO
				cruzamientoIndividuos();
				
				//MUTACIÓN
				mutarIndividuos();
				
				matriz = matrizTemp;//nueva generación
				
				dibujarTablero();
				numGeneraciones++;
			}
			else dibujarTablero();
			
		}while(!candidatoApto && numGeneraciones <= generaciones);
		if(!candidatoApto)$("#texto").html("se sobrepaso el número de generaciones limite: " + generaciones);
		else $("#btnResolver").hide();
		candidatoApto = false;
		numGeneraciones = 0;
		generaciones = 0;
		for(var k = 0; k < poblacion; k++)
		{
			listaAtaques[k] = 999;
			listaPorcentajes[k] = 100;
		}
	});
});

function mutarIndividuos()
{
	var i;
	for(i = 0; i < poblacion; i++)
	{
		if(generarAleatorio(0, 4) == 1)//si es 1, entonces muta el individuo actual i
		{
			console.log("se muto el individuo: " + i);
			mutar(i);
		}
	}
}

function mutar(indiceIndividuo)
{
	var indiceMutacion = generarAleatorio(0, cantReinas-1);
	var nuevoValor = generarAleatorio(0, cantReinas-1);
	
	console.log("-se muto la columna: " + indiceMutacion + " con el valor: " + nuevoValor);
	
	matrizTemp[indiceIndividuo][indiceMutacion] = nuevoValor;	
}

function cruzamientoIndividuos()
{	
	console.log("***Cruzamiento de individuos ***");
	var i;
	for(i = 0; i < poblacion-1; i++)
	{
		set(i, listaPorcentajes[i].indice);
		console.log("i: " + i + " indice: " + listaPorcentajes[i].indice);
	}
	console.log("i: " + (poblacion-1) + " indice: " + listaPorcentajes[poblacion-3].indice);
	set((poblacion-1), listaPorcentajes[poblacion-3].indice);
	
	var indiceCruze;
	for(i = 0; i <= poblacion/2; i+=2)
	{
		//generar el punto de cruze para un par de individuos
		indiceCruze = generarAleatorio(1, cantReinas-2);
		console.log("se genero el punto de cruze: " + indiceCruze + " para los individuos " + i + " y " + (i+1));
		swap(i,indiceCruze);
	}
}

function swap(indice, limite)
{
	var temp = new Array()
	var j;
	for(j = 0; j < cantReinas; j++){temp[j] = matrizTemp[indice][j];}
	var bandera = Math.round((Math.random()*1));
	if(bandera)
	{
		console.log("--primer grupo: " + indice + " y " + (indice+1));
		//swap del primer grupo
		for(j = 0; j <= limite; j++){matrizTemp[indice][j] = matrizTemp[indice+1][j];}
		for(j = 0; j <= limite; j++){matrizTemp[indice+1][j] = temp[j];}
	}
	else
	{
		console.log("--segundo grupo: " + indice + " y " + (indice+1));
		//swap del segundo grupo
		for(j = limite+1; j < cantReinas; j++){matrizTemp[indice][j] = matrizTemp[indice+1][j];}
		for(j = limite+1; j < cantReinas; j++){matrizTemp[indice+1][j] = temp[j];}
	}
}

function generarAleatorio(inferior, superior)
{
        var numPosibilidades = superior - inferior
        var aleat = Math.random() * numPosibilidades
        aleat = Math.round(aleat)
        return parseInt(inferior) + aleat
}

function set(indiceActual, indiceIndividuo)
{
	var j;
	for(j = 0; j < cantReinas; j++){matrizTemp[indiceActual][j] = matriz[indiceIndividuo][j];}	
}

function seleccionIndividuos()
{
	console.log("***Selección de individuos ***");
	$("#texto").html("");
	var i;
	var sumatoria = 0;
	for(i = 0; i < poblacion; i++)
	{
		listaAtaques[i] = obtenerAmenazas(i);
		sumatoria += listaAtaques[i];
		}
	for(i = 0; i < poblacion; i++)
	{
		listaPorcentajes[i] = {valor: Math.round((listaAtaques[i] / sumatoria) * 100), indice: i};
		if(listaPorcentajes[i].valor==0)
		{
			alert("solucion encontrada!");
			$("#texto").html("el cromosoma " + (i+1) + " de la generación " + numGeneraciones + " contiene una solucion al problema de las " + cantReinas + " reinas.");
			dibujarSolucion(i);
			indicePintar = i;
			candidatoApto = true;
			break;
		}
	}
	//console.clear();
	console.log(listaAtaques);
	console.log(listaPorcentajes);
	//porcentajes que se acerquen a 0% serán los idoneos
	ordenarBurbujaMejorado(listaPorcentajes, poblacion);
	
}

function ordenarBurbujaMejorado(arreglo, n)
{
	var aux,bandera;
	var i,j;
	aux = {valor: 0, indice: 0};
	bandera = 1;
	for(i = 0; i < (n-1) && bandera; i++)
	{
		bandera = 0;
		for(j = 0; j < (n-i-1); j++)
		{
			if(arreglo[j].valor > arreglo[j+1].valor)
			{
				bandera = 1;
				aux = arreglo[j];
				arreglo[j] = arreglo[j+1];
				arreglo[j+1] = aux;
			}
		}
	}
}

function generarPoblacionInicial()
{
	console.log("***Generar población inicial ***");
	var i,j;
	for(i = 0; i < poblacion; i++)
	{	
		matriz[i] = new Array();
		matrizTemp[i] = new Array();
	}
	
	for(i = 0; i < poblacion; i++)
	{
		for(j = 0; j < cantReinas; j++)
		{
			matriz[i][j] = Math.round((Math.random()*(cantReinas-1)));
		}
	}
}

function obtenerAmenazas(indicePoblacion)
{
	var c1,c2;
	var numeroAmenazas = 0;
	for(c1 = 0; c1 < cantReinas; c1++)
	{
		for(c2 = 0; c2 < cantReinas; c2++)
		{
			if ( c1 != c2 )
			{
				if( matriz[indicePoblacion][c1] ==  matriz[indicePoblacion][c2]
					|| Math.abs(matriz[indicePoblacion][c1] -  matriz[indicePoblacion][c2]) == Math.abs(c1 - c2)
					)numeroAmenazas++;
			}
		}
	}
	return (numeroAmenazas);
}

function dibujarTablero()
{
	var i,j;
	var htmlTabla = "";	
	htmlTabla += "<table class='datagrid' width='50%' align='center'>";
	for(i = 0; i < poblacion; i++)
	{
		if(i == indicePintar)//se pinta de rojo la fila que contiene al cromosoma solución
		{
			htmlTabla += "<tr bgcolor=\"#FF0000\">";
			indicePintar = -1;
		}
		else htmlTabla += "<tr>";
		for(j = 0; j < cantReinas; j++)
		{
			htmlTabla += "<td class='"+i+""+j+"' width='20px' height='80px'>" + matriz[i][j] + "</td>";
		}
		htmlTabla += "</tr>";
	}
	htmlTabla +="</table>";	
	$("#contenido").html(htmlTabla);
}


function dibujarSolucion(posFila)
{
	var i,j;
	var htmlTabla = "";
	htmlTabla = "<br/><br/><center>REPRESENTACIÓN DEL TABLERO " + cantReinas + " x " + cantReinas + " (INDIVIDUO " + (posFila+1) + ")</center>";
	htmlTabla += "<table class='datagrid' width='50%' align='center'>";
	for(i = 0; i < cantReinas; i++)
	{
		htmlTabla += "<tr>";
		for(j = 0; j < cantReinas; j++)
		{
			if(matriz[posFila][j] == i) htmlTabla += "<td class='"+i+""+j+"' width='20px' height='80px'><img src='reina.png' width='15px' height='37px' /></td>";
			else htmlTabla += "<td class='"+i+""+j+"' width='20px' height='80px'>&nbsp;</td>";
		}
		htmlTabla += "</tr>";
	}
	htmlTabla +="</table>";	
	$("#solucion").html(htmlTabla);
}