const editmode=0, runmode=1;
let mode=editmode;
var mainPanel, editPanel;
var svgNS="http://www.w3.org/2000/svg";
var objCurrent=null;
var objSelected=null;
var objDragged=null;
var pntDragged=null;
var oldX, oldY;


function init() {
  mainPanel = document.getElementById("mainpanel");
  editPanel = document.getElementById("editpanel");
}

function selectObj(obj)
{
}

function selecionaObj(obj)
{
  objSelected = obj;
  var lista = document.getElementById("lista");
  if (foreground!=null)
  {
    SVGroot.removeChild(foreground);
    foreground = null;
  }
  if (objSelected==null)
  {
    document.getElementById("frm").reset();
    lista.style.display="none";
  }
  else
  {
    lista.style.display="inline";
    // Escondendo e exibindo os campos de atributos
    var listatudo = new Array ("x", "y", "cx", "cy", "width", "height", "r", "rx", "ry", "d", "font-family", "font-size", "PropTexto", "Texto", "xlink:href", "series", "fill_def", "fill-opacity", "stroke_def", "stroke-width", "stroke-opacity", "marker-start", "marker-end", "link", "tag", "atribtag", "vistag");
    for (var i=0; i<listatudo.length; i++)
      document.getElementById("tr_"+listatudo[i]).style.display="none";
    if (objSelected.id=="background")
      var listaattr = new Array ("width", "height", "xlink:href", "fill_def");
    else
      var listaattr = listaAttributos(objSelected.nodeName);
    for (var i=0; i<listaattr.length; i++)
      document.getElementById("tr_"+listaattr[i]).style.display="inline";
    if ((objSelected.id!="background")&&(objSelected.nodeName!="g"))
      document.getElementById("tr_vistag").style.display="inline";
    if (objSelected.nodeName=="text")
    {
      document.getElementById("tr_PropTexto").style.display="inline";
      setOpcN(objSelected.getAttribute("font-weight")=="bold");
      setOpcI(objSelected.getAttribute("font-style")=="italic");
      setOpcA(objSelected.getAttribute("text-anchor"));
    }
    // Carregar campos com os atributos do objeto
    for (var i=0; i<listaattr.length; i++)
      document.getElementById(listaattr[i]).value = objSelected.getAttribute(listaattr[i]);
    // PersonalizaÃ§Ã£o de atributos especiais
    if (objSelected.nodeName=="g")
    {
      var trans = objSelected.getAttribute("transform").split(/([\(\)])/);
      for (var i=0; i<trans.length; i++)
	if (trans[i]=="translate")
	{
	  var xey = trans[i+2].split(/([,])/);
	  document.getElementById("x").value = xey[0].trim();
	  document.getElementById("y").value = xey[2].trim();
	}
    }
    else if (objSelected.nodeName=="path")
    {
      var d = objSelected.getAttribute("d");
      params = d.split(/([MmZzLlHhVvCcSsQqTtAa])/);
      for (var i=0; i<params.length; i++)
	if (params[i]=="")
	{
	  params.splice(i, 1);
	  i--;
	}
	else
	  params[i] = params[i].trim();
      var dxedy = params[1].split(/[\s,]/);
      document.getElementById("d").value = params.join(" ");
      foreground = SVGdoc.createElementNS(svgns, "svg");
      foreground.setAttributeNS (null, "x", "-2000");
      foreground.setAttributeNS (null, "y", "-2000");
      foreground.setAttributeNS (null, "width", "9000");
      foreground.setAttributeNS (null, "height", "9000");
      var x=0;
      var y=0;
      for (var i=0; i<params.length; i+=2)
      {
	if ("Zz".indexOf(params[i])>=0) // nenhum parÃ¢metro
	  break;
	var attr = params[i+1].split(/[\s,]/);
	for (var j=0; j<attr.length; j++)
	  if (attr[j]=="")
	  {
	    attr.splice(j, 1);
	    j--;
	  }
	  else
	    attr[j] = attr[j].trim();
	params[i+1] = attr.join(" ");
	// Mm - Move (x y)
	// Zz - Close poligon ()
	// Ll - Line (x y)
	// Hh - Horizontal line (x)
	// Vv - Vertical line (y)
	// Cc - Cubic Bezier curve (x1 y1 x2 y2 x y)
	// Ss - Smooth cubic Bezier curve (x2 y2 x y)
	// Qq - Quadratic Bezier curve (x1 y1 x y) 
	// Tt - Smooth quadratic Bezier curve (x y)
	// Aa - Eliptic arc (rx ry rotacao flag1 flag2 x y)
	if ("MLCSQTA".indexOf(params[i])>=0)
	{
	  x = 2000 + parseFloat(attr[attr.length-2]);
	  y = 2000 + parseFloat(attr[attr.length-1]);
	}
	else if ("mlcsqta".indexOf(params[i])>=0)
	{
	  x += parseFloat(attr[attr.length-2]);
	  y += parseFloat(attr[attr.length-1]);
	}
	else if (params[i]=="H")
	  x = 2000 + parseFloat(attr[0]);
	else if (params[i]=="h")
	  x += parseFloat(attr[0]);
	else if (params[i]=="V")
	  y = 2000 + parseFloat(attr[0]);
	else if (params[i]=="v")
	  y += parseFloat(attr[0]);
	var ponto = SVGdoc.createElementNS(svgns, "circle");
	ponto.setAttributeNS (null, "class", "pontojunta");
	ponto.setAttributeNS (null, "segmento", (i/2));
	ponto.setAttributeNS (null, "cx", x);
	ponto.setAttributeNS (null, "cy", y);
	ponto.setAttributeNS (null, "r", "2.2");
	ponto.setAttributeNS (null, "fill", "lightblue");
	ponto.setAttributeNS (null, "stroke", "black");
	ponto.setAttributeNS (null, "stroke-width", "0.5");
	foreground.appendChild(ponto);
      }
      SVGroot.appendChild(foreground);
    }
    // Visualization field value selection
    if (objSelected.id!="background")
    {
      var vistag = objSelected.getAttribute("vistag");
      var campoVis = document.getElementById("vistag");
      var vistagsetado = false;
      for (var i=0; i<campoVis.childNodes.length; i++)
	if (campoVis.childNodes.item(i).nodeName=="OPTION")
	{
	  if (campoVis.childNodes.item(i).value==vistag)
	  {
	    campoVis.childNodes.item(i).selected = true;
	    vistagsetado = true;
	  }
	  else
	    campoVis.childNodes.item(i).selected = false;
	}
      if (!vistagsetado)
      {
//	for (var i=0; i<campoVis.childNodes.length; i++)
//	  if (campoVis.childNodes.item(i).nodeName=="OPTION")
//	    campoVis.childNodes.item(i).selected = true;
      }
    }
  }
}

function touch(evt)
{
  try
  {
    objDragged=null;
    objCurrent=null;
    oldX=evt.clientX;
    oldY=evt.clientY;
    if (evt.target.getAttribute("class")=="pontojunta")
      pntDragged=evt.target;
    else if (evt.target.id!="background")
    {
      var newtarget=evt.target;
      while ((newtarget.parentNode!=mainPanel)&&(newtarget.parentNode!=null))
	newtarget=newtarget.parentNode;
      objDragged=newtarget;
      objCurrent=newtarget;
    }
  }
  catch (err)
  {
    window.alert("Erro (A30): "+err);
  }
}

function drag(evt)
{
  try
  {
    if (objDragged==null)
    {
      if (pntDragged==null)
	return;
      var x=evt.clientX;
      var y=evt.clientY;
      var altx = (x-dx) - parseFloat(pntDragged.getAttribute("cx"));
      var alty = (y-dy) - parseFloat(pntDragged.getAttribute("cy"));
      var segmento = parseInt(pntDragged.getAttribute("segmento"));
      var attr = params[segmento*2+1].split(/[\s,]/);
      attr[attr.length-2] = parseFloat(attr[attr.length-2]) + altx;
      attr[attr.length-1] = parseFloat(attr[attr.length-1]) + alty;
      params[segmento*2+1] = attr.join(" ")
      objSelected.setAttribute("d", params.join(" "));
      movePontos(altx, alty, segmento);
      document.getElementById("d").value=params.join(" ");
    }
    else
    {
      var dx=oldX-evt.clientX;
      var dy=oldY-evt.clientY;
      if (objDragged.nodeName=="circle")
      {
	objDragged.setAttribute("cx", parseFloat(objDragged.getAttribute("cx")) + dx;
	objDragged.setAttribute("cy", parseFloat(objDragged.getAttribute("cy")) + dy;
      }
      else
      {
	if (objDragged.nodeName=="path")
	{
	  params[1]= "" + x + " " + y;
	  document.getElementById("d").value=params.join(" ");
	  objDragged.setAttribute("d", params.join(" "));
	  if (foreground!=null)
	  {
	    foreground.setAttribute ("x", x-Mx-2000);
	    foreground.setAttribute ("y", y-My-2000);
	  }
	}
	else if (objDragged.nodeName=="g")
	{
	  objDragged.setAttribute("transform", "translate("+x+","+y+")");
	}
	else
	{
	  objDragged.setAttribute("x", x);
	  objDragged.setAttribute("y", y);
	}
//	document.getElementById("x").value=x;
//	document.getElementById("y").value=y;
      }
    }
  }
  catch (err)
  {
    window.alert("Erro (A29): "+err);
  }
}

function drop(evt)
{
  objDragged=null;
  objCurrent=null;
  pntDragged=null;
  cliqueFerramenta("toolSeleciona");
}

function setPosition(el, x, y) {
//alert("x="+x+" y="+y);
  switch (el.tagName) {
    case "image":
    case "rect":
    case "text":
      el.setAttribute("x", x);
      el.setAttribute("y", y);
      break;
    case "circle":
      el.setAttribute("cx", x);
      el.setAttribute("cy", y);
      break;
    case "g":
    case "path":
      el.setAttribute("transform", "translate(" + x + "," + y + ")");
      break;
    default:
      window.alert('Error (A31): Unnexpected tagName "'+el.tagName+'"') ;
  }
}

function insertPath() {
  var newNode = document.createElementNS(svgNS,'path');
  setPosition(newNode, 70, 220);
  newNode.setAttribute('d','M 0,0 l 70,-150 l 60,100 l 70,-150');
  newNode.setAttribute('fill','none');
  newNode.setAttribute('stroke','black');
  newNode.setAttribute('stroke-linecap','round');
  newNode.setAttribute('stroke-width','2');
  mainPanel.appendChild(newNode);
  editPanel.style.display = "none";
}

function insertCircle() {
  var newNode = document.createElementNS(svgNS,'circle');
  setPosition(newNode, 70, 90);
  newNode.setAttribute('r',40);
  newNode.setAttribute('fill','blue');
  newNode.setAttribute('stroke','black');
  newNode.setAttribute('stroke-width','2');
  mainPanel.appendChild(newNode);
  editPanel.style.display = "none";
}

function insertRect() {
  var newNode = document.createElementNS(svgNS,'rect');
  setPosition(newNode, 70, 70);
  newNode.setAttribute('width',50);
  newNode.setAttribute('height',150);
  newNode.setAttribute('rx',5);
  newNode.setAttribute('ry',5);
  newNode.setAttribute('fill','blue');
  newNode.setAttribute('stroke','black');
  newNode.setAttribute('stroke-width','2');
  mainPanel.appendChild(newNode);
  editPanel.style.display = "none";
}

function insertElement(element) {
  var newNode = element.cloneNode(true);
  newNode.removeAttribute("id");
  setPosition(newNode, 50, 50);
  mainPanel.appendChild(newNode);
  editPanel.style.display = "none";
}
