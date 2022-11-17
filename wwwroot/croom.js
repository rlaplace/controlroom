const editmode=0, runmode=1;
let mode=editmode;
var mainPanel, editPanel, editItems, menuPanel;
var svgNS="http://www.w3.org/2000/svg";
var objDragged=null;
var pntDragged=null;
var oldX, oldY;
var params=new Array();
var itemCount;

function plusButtonClick()
{
alert("S1");
}

function init() {
  mainPanel = document.getElementById("mainpanel");
  editPanel = document.getElementById("editpanel");
  editItems = document.getElementById("edititems");
  menuPanel = document.getElementById("menupanel");
}

function prepParams(element)
{
  var d = element.getAttribute("d");
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
	prepParams(objDragged);
    }
    menuPanel.setAttribute("visibility", "hidden");
  }
  catch (err)
  {
    window.alert("Error (A30): "+err);
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
      switch (objDragged.tagName) {
	case "image":
	case "rect":
	case "text":
	  objDragged.setAttribute("x", parseFloat(objDragged.getAttribute("x")) + dx);
	  objDragged.setAttribute("y", parseFloat(objDragged.getAttribute("y")) + dy);
	  break;
	case "circle":
	  objDragged.setAttribute("cx", parseFloat(objDragged.getAttribute("cx")) + dx);
	  objDragged.setAttribute("cy", parseFloat(objDragged.getAttribute("cy")) + dy);
	  break;
	case "path":
	  var xey = params[1].split(/[\s,]/);
	  params[1]= "" + (parseFloat(xey[0].trim()) + dx) + " " + (parseFloat(xey[1].trim()) + dy);
	  objDragged.setAttribute("d", params.join(" "));
	  break;
	case "g":
	  var trans = objDragged.getAttribute("transform").split(/([\(\)])/);
	  var newx = dx, newy = dy;
	  for (var i=0; i<trans.length; i++)
	    if (trans[i]=="translate")
	    {
	      var xey = trans[i+2].split(/([,])/);
	      newx += parseFloat(xey[0].trim());
	      newy += parseFloat(xey[2].trim());
	    }
	  objDragged.setAttribute("transform", "translate(" + newx + "," + newy + ")");
	  break;
	default:
	  window.alert('Error (A31): Unnexpected tagName "'+el.tagName+'"') ;
      }
    }
  }
  catch (err)
  {
    window.alert("Error (A29): "+err);
  }
}

function createItem(fieldName, fieldClass, fieldValue)
{
  var label = document.createElementNS(svgNS,"text");
  label.textContent=fieldName;
  label.setAttribute("x", "5");
  label.setAttribute("y", ""+(itemCount*25+16));
  label.setAttribute("text-anchor", "left");
  label.setAttribute("fill", "#FFDDDD");
  editItems.appendChild(label);
  var g = document.createElementNS(svgNS,"g");
  g.setAttribute("class", fieldClass);
  g.setAttribute("transform", "translate(95,"+(itemCount*25)+")");
  var width=56;
  var viewBox = document.createElementNS(svgNS,"svg");
  viewBox.setAttribute("x", "1");
  viewBox.setAttribute("y", "1");
  viewBox.setAttribute("width", ""+(width-2));
  viewBox.setAttribute("height", "21");
  viewBox.setAttribute("viewbox", "0 0 "+(width-2)+" 21");
  g.appendChild(viewBox);
  var background = document.createElementNS(svgNS,"path");
  background.setAttribute("d", "M -0.5 1.5 a 4 4 90 0 1 2 -2 h "+(width-5)+" a 4 4 90 0 1 2 2 v 18 a 4 4 90 0 1 -2 2 h -"+(width-5)+" a 4 4 90 0 1 -2 -2 z");
  background.setAttribute("fill", "#FFDDDD");
  background.setAttribute("stroke", "none");
  viewBox.appendChild(background);
  var inputText = document.createElementNS(svgNS,"text");
  inputText.setAttribute("x", "3");
  inputText.setAttribute("y", "16");
  inputText.setAttribute("text-anchor", "left");
  viewBox.appendChild(inputText);
  var inputBox = document.createElementNS(svgNS,"path");
  inputBox.setAttribute("d", "M 0.5 2.5 a 4 4 90 0 1 2 -2 h "+(width-5)+" a 4 4 90 0 1 2 2 v 18 a 4 4 90 0 1 -2 2 h -"+(width-5)+" a 4 4 90 0 1 -2 -2 z");
  inputBox.setAttribute("fill", "none");
  inputBox.setAttribute("stroke", "#220000");
  inputBox.setAttribute("stroke-width", "1");
  g.appendChild(inputBox);
  switch (fieldClass) {
    case "uiNumberPicker":
      if (fieldValue==null)
	inputText.textContent="0";
      else
	inputText.textContent=""+parseFloat(fieldValue);
      var plusButton = document.createElementNS(svgNS,"path");
      plusButton.setAttribute("d", "M "+(width-11)+".5 4.5 a 4 4 90 0 1 2 -2 h 4 a 4 4 90 0 1 2 2 v 4 a 4 4 90 0 1 -2 2 h -4 a 4 4 90 0 1 -2 -2 z M "+(width-9)+".5 6.5 h 4 M "+(width-7)+".5 4.5 v 4");
      plusButton.setAttribute("onclick", "plusButtonClick()");
      plusButton.setAttribute("fill", "#FFDDDD");
      plusButton.setAttribute("stroke", "#220000");
      plusButton.setAttribute("stroke-width", "1");
      g.appendChild(plusButton);
      var minusButton = document.createElementNS(svgNS,"path");
      minusButton.setAttribute("d", "M "+(width-11)+".5 14.5 a 4 4 90 0 1 2 -2 h 4 a 4 4 90 0 1 2 2 v 4 a 4 4 90 0 1 -2 2 h -4 a 4 4 90 0 1 -2 -2 z M "+(width-9)+".5 16.5 h 4");
      minusButton.setAttribute("fill", "#FFDDDD");
      minusButton.setAttribute("stroke", "#220000");
      minusButton.setAttribute("stroke-width", "1");
      g.appendChild(minusButton);
    break;
    default:
      if (fieldValue==null)
	inputText.textContent="";
      else
	inputText.textContent=""+fieldValue;
  }
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
    case "g":
      var trans = realtarget.getAttribute("transform").split(/([\(\)])/);
      var x = 0, y = 0;
      for (var i=0; i<trans.length; i++)
	if (trans[i]=="translate")
	{
	  var xey = trans[i+2].split(/([,])/);
	  x += parseFloat(xey[0].trim());
	  y += parseFloat(xey[2].trim());
	}
      createItem("x", "uiNumberPicker", x);
      createItem("y", "uiNumberPicker", y);
      break;
    case "path":
      createItem("d", "uiText", realtarget.getAttribute("d"));
      break;
  }
  if (realtarget.getAttribute("class")=="graph") {
    createItem("width", "uiNumberPicker", realtarget.getAttribute("width"));
    createItem("height", "uiNumberPicker", realtarget.getAttribute("height"));
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
      createItem("href", "uiText", realtarget.getAttribute("href"));
      break;
    case "text":
    case "rect":
    case "circle":
    case "g":
    case "path":
      createItem("fill", "uiColorPicker", realtarget.getAttribute("fill"));
      createItem("stroke", "uiColorPicker", realtarget.getAttribute("stroke"));
      break;
  }
  switch (realtarget.tagName) {
    case "text":
    case "image":
    case "rect":
    case "circle":
    case "g":
    case "path":
      break;
  }
  editPanel.setAttribute("visibility", "display");
}

function insertPath() {
  var newNode = document.createElementNS(svgNS,"path");
  newNode.setAttribute("d","M 70 220 l 70 -150 l 60 100 l 70 -150");
  newNode.setAttribute("fill","none");
  newNode.setAttribute("stroke","black");
  newNode.setAttribute("stroke-linecap","round");
  newNode.setAttribute("stroke-width","2");
  mainPanel.appendChild(newNode);
  menuPanel.setAttribute("visibility", "hidden");
}

function insertCircle() {
  var newNode = document.createElementNS(svgNS,"circle");
  newNode.setAttribute("cx","70");
  newNode.setAttribute("cy","90");
  newNode.setAttribute("r","40");
  newNode.setAttribute("fill","blue");
  newNode.setAttribute("stroke","black");
  newNode.setAttribute("stroke-width","2");
  mainPanel.appendChild(newNode);
  menuPanel.setAttribute("visibility", "hidden");
}

function insertRect() {
  var newNode = document.createElementNS(svgNS,"rect");
  newNode.setAttribute("x","70");
  newNode.setAttribute("y","70");
  newNode.setAttribute("width","50");
  newNode.setAttribute("height","150");
  newNode.setAttribute("rx","5");
  newNode.setAttribute("ry","5");
//  newNode.setAttribute("fill","url('#myGradient')");
  newNode.setAttribute("fill","blue");
  newNode.setAttribute("stroke","black");
  newNode.setAttribute("stroke-width","2");
  mainPanel.appendChild(newNode);
  menuPanel.setAttribute("visibility", "hidden");
}

function insertElement(element) {
  var newNode = element.cloneNode(true);
  newNode.removeAttribute("id");
  switch (newNode.tagName) {
    case "image":
    case "rect":
    case "text":
      newNode.setAttribute("x", "50");
      newNode.setAttribute("y", "50");
      break;
    case "circle":
      newNode.setAttribute("cx", "50");
      newNode.setAttribute("cy", "50");
      break;
    case "path":
      prepParams(newNode);
      params[1]= "50 50";
      newNode.setAttribute("d", params.join(" "));
      break;
    case "g":
      newNode.setAttribute("transform", "translate(50,50)");
      break;
    default:
      window.alert('Error (A32): Unnexpected tagName "'+newNode.tagName+'"') ;
  }
  mainPanel.appendChild(newNode);
  menuPanel.setAttribute("visibility", "hidden");
}
