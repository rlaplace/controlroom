const editmode=0, runmode=1;
let mode=editmode;
var mainPanel, editPanel, editItems, menuPanel;
var svgNS="http://www.w3.org/2000/svg";
var objDragged=null;
var pntDragged=null;
var oldX, oldY;
var params=new Array();
var uiNumberPickers;
var itemCount;

function plusButtonClick()
{
alert("S1");
}

function assemblyUiNumberPicker(element)
{
  while (element.hasChildNodes())
    element.removeChild(element.firstChild);
  var width=56;
  var inputBox = document.createElementNS(svgNS,'path');
  inputBox.setAttribute("d", "M 0.5 2.5 a 4 4 90 0 1 2 -2 h "+(width-4)+" a 4 4 90 0 1 2 2 v 18 a 4 4 90 0 1 -2 2 h -"+(width-4)+" a 4 4 90 0 1 -2 -2 z");
  inputBox.setAttribute("fill", "#FFDDDD");
  inputBox.setAttribute("stroke", "#220000");
  inputBox.setAttribute("stroke-width", "1");
  element.appendChild(inputBox);
  var inputText = document.createElementNS(svgNS,'text');
  inputText.textContent="250";
  inputText.setAttribute("x", "5");
  inputText.setAttribute("y", "16");
  inputText.setAttribute("text-anchor", "left");
  element.appendChild(inputText);
  var plusButton = document.createElementNS(svgNS,'path');
  plusButton.setAttribute("d", "M "+(width-10)+".5 4.5 a 4 4 90 0 1 2 -2 h 4 a 4 4 90 0 1 2 2 v 4 a 4 4 90 0 1 -2 2 h -4 a 4 4 90 0 1 -2 -2 z M "+(width-8)+".5 6.5 h 4 M "+(width-6)+".5 4.5 v 4");
  plusButton.setAttribute("onclick", "plusButtonClick()");
  plusButton.setAttribute("fill", "#FFDDDD");
  plusButton.setAttribute("stroke", "#220000");
  plusButton.setAttribute("stroke-width", "1");
  element.appendChild(plusButton);
  var minusButton = document.createElementNS(svgNS,'path');
  minusButton.setAttribute("d", "M "+(width-10)+".5 14.5 a 4 4 90 0 1 2 -2 h 4 a 4 4 90 0 1 2 2 v 4 a 4 4 90 0 1 -2 2 h -4 a 4 4 90 0 1 -2 -2 z M "+(width-8)+".5 16.5 h 4 M "+(width-6)+".5 4.5 v 4");
  minusButton.setAttribute("fill", "#FFDDDD");
  minusButton.setAttribute("stroke", "#220000");
  minusButton.setAttribute("stroke-width", "1");
  element.appendChild(minusButton);
}

function init() {
  mainPanel = document.getElementById("mainpanel");
  editPanel = document.getElementById("editpanel");
  editItems = document.getElementById("edititems");
  menuPanel = document.getElementById("menupanel");
}

function touch(evt)
{
  try
  {
    objDragged=null;
    pntDragged=null;
    oldX=evt.clientX;
    oldY=evt.clientY;
    if (evt.target.getAttribute("class")=="pontojunta")
      pntDragged=evt.target;
    else if (evt.target.id!="background")
    {
      var realtarget=evt.target;
      while ((realtarget.parentNode!=mainPanel)&&(realtarget.parentNode!=null))
	realtarget=realtarget.parentNode;
      objDragged=realtarget;
      if (objDragged.nodeName=="path")
      {
	var d = objDragged.getAttribute("d");
	params = d.split(/([MmZzLlHhVvCcSsQqTtAa])/);
	for (var i=0; i<params.length; i++)
	  if (params[i]=="")
	  {
	    params.splice(i, 1);
	    i--;
	  }
	  else
	    params[i] = params[i].trim();
      }
    }
    menuPanel.setAttribute("visibility", "hidden");
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
      objDragged.setAttribute("d", params.join(" "));
      movePontos(altx, alty, segmento);
      document.getElementById("d").value=params.join(" ");
    }
    else
    {
      var dx=evt.clientX-oldX;
      var dy=evt.clientY-oldY;
      oldX=evt.clientX;
      oldY=evt.clientY;
      if (objDragged.nodeName=="circle")
      {
	objDragged.setAttribute("cx", parseFloat(objDragged.getAttribute("cx")) + dx);
	objDragged.setAttribute("cy", parseFloat(objDragged.getAttribute("cy")) + dy);
      }
      else
      {
	if (objDragged.nodeName=="path")
	{
	  var xey = params[1].split(/[\s,]/);
	  var newx = parseFloat(xey[0].trim()) + dx;
	  var newy = parseFloat(xey[1].trim()) + dy;
	  params[1]= "" + newx + " " + newy;
	  objDragged.setAttribute("d", params.join(" "));
	}
	else if (objDragged.nodeName=="g")
	{
	  var trans = objDragged.getAttribute("transform").split(/([\(\)])/);
	  var newx, newy;
	  for (var i=0; i<trans.length; i++)
	    if (trans[i]=="translate")
	    {
	      var xey = trans[i+2].split(/([,])/);
	      newx = parseFloat(xey[0].trim()) + dx;
	      newy = parseFloat(xey[2].trim()) + dy;
	      objDragged.setAttribute("transform", "translate("+newx+","+newy+")");
	    }
	}
	else
	{
	  objDragged.setAttribute("x", parseFloat(objDragged.getAttribute("x")) + dx);
	  objDragged.setAttribute("y", parseFloat(objDragged.getAttribute("y")) + dy);
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

function createItem(fieldName, fieldClass, fieldValue)
{
  var label = document.createElementNS(svgNS,'text');
  label.textContent=fieldName;
  label.setAttribute("x", "5");
  label.setAttribute("y", ""+(itemCount*25+17));
  label.setAttribute("text-anchor", "left");
  label.setAttribute("fill", "#FFDDDD");
  editItems.appendChild(label);
  var g = document.createElementNS(svgNS,'g');
  g.setAttribute("class", fieldClass);
  g.setAttribute("transform", "translate(95,"+(itemCount*25+17)+")");
  editItems.appendChild(g);
  itemCount++;
}

function drop(evt)
{
  objDragged=null;
  pntDragged=null;
  var realtarget=evt.target;
  while ((realtarget.parentNode!=mainPanel)&&(realtarget.parentNode!=null))
    realtarget=realtarget.parentNode;
  while (editItems.hasChildNodes())
    editItems.removeChild(editItems.firstChild);
  itemCount=0;
  switch (realtarget.tagName) {
    case "text":
    case "image":
    case "rect":
      createItem("x", "uiNumberPicker", realtarget.getAttribute("x"));
      createItem("y", "uiNumberPicker", realtarget.getAttribute("y"));
      break;
    case "circle":
      createItem("cx", "uiNumberPicker", realtarget.getAttribute("cx"));
      createItem("cy", "uiNumberPicker", realtarget.getAttribute("cy"));
      createItem("radius", "uiNumberPicker", realtarget.getAttribute("r"));
      break;
    case "path":
      createItem("d", "uiText", realtarget.getAttribute("d"));
      break;
  }
  switch (realtarget.tagName) {
    case "text":
      createItem("Text", "uiText", realtarget.textContent);
      break;
    case "image":
    case "rect":
      createItem("width", "uiNumberPicker", realtarget.getAttribute("width"));
      createItem("height", "uiNumberPicker", realtarget.getAttribute("height"));
      break;
  }
  switch (realtarget.tagName) {
    case "image":
      createItem("Source", "uiText", realtarget.getAttribute("href"));
      break;
    case "text":
    case "rect":
    case "circle":
    case "path":
      createItem("fill", "uiColorPicker", realtarget.getAttribute("fill"));
      break;
  }
  switch (realtarget.tagName) {
    case "text":
    case "image":
    case "rect":
      break;
    case "circle":
      break;
    case "g":
    case "path":
      break;
  }
  switch (realtarget.tagName) {
    case "text":
    case "image":
    case "rect":
      break;
    case "circle":
      break;
    case "g":
    case "path":
      break;
  }
  uiNumberPickers = document.getElementsByClassName("uiNumberPicker");
  for(var i=0; i<uiNumberPickers.length; i++)
    assemblyUiNumberPicker(uiNumberPickers[i]);
  editPanel.setAttribute("visibility", "display");
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
    case "path":
      var xey = params[1].split(/[\s,]/);
      var newx = parseFloat(xey[0].trim()) + dx;
      var newy = parseFloat(xey[1].trim()) + dy;
      params[1]= "" + newx + " " + newy;
      objDragged.setAttribute("d", params.join(" "));
      break;
    case "g":
      el.setAttribute("transform", "translate(" + x + "," + y + ")");
      break;
    default:
      window.alert('Error (A31): Unnexpected tagName "'+el.tagName+'"') ;
  }
}

function insertPath() {
  var newNode = document.createElementNS(svgNS,'path');
  newNode.setAttribute('d','M 70 220 l 70 -150 l 60 100 l 70 -150');
  newNode.setAttribute('fill','none');
  newNode.setAttribute('stroke','black');
  newNode.setAttribute('stroke-linecap','round');
  newNode.setAttribute('stroke-width','2');
  mainPanel.appendChild(newNode);
  menuPanel.setAttribute("visibility", "hidden");
}

function insertCircle() {
  var newNode = document.createElementNS(svgNS,'circle');
  newNode.setAttribute('cx',70);
  newNode.setAttribute('cy',90);
  newNode.setAttribute('r',40);
  newNode.setAttribute('fill','blue');
  newNode.setAttribute('stroke','black');
  newNode.setAttribute('stroke-width','2');
  mainPanel.appendChild(newNode);
  menuPanel.setAttribute("visibility", "hidden");
}

function insertRect() {
  var newNode = document.createElementNS(svgNS,'rect');
  newNode.setAttribute('x',70);
  newNode.setAttribute('y',70);
  newNode.setAttribute('width',50);
  newNode.setAttribute('height',150);
  newNode.setAttribute('rx',5);
  newNode.setAttribute('ry',5);
//  newNode.setAttribute('fill','url("#myGradient")');
  newNode.setAttribute('fill','blue');
  newNode.setAttribute('stroke','black');
  newNode.setAttribute('stroke-width','2');
  mainPanel.appendChild(newNode);
  menuPanel.setAttribute("visibility", "hidden");
}

function insertElement(element) {
  var newNode = element.cloneNode(true);
  newNode.removeAttribute("id");
  setPosition(newNode, 50, 50);
  mainPanel.appendChild(newNode);
  menuPanel.setAttribute("visibility", "hidden");
}
