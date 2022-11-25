const editmode=0, runmode=1;
let mode=editmode;
var mainPanel, editPanel, editItems, menuPanel;
var colorPicker;
var svgNS="http://www.w3.org/2000/svg";
var objDragged=null;
var pntDragged=null;
var oldX, oldY;
var params=new Array();
var itemCount;
var elementBeingChanged;

function plusButtonTouch(targetId)
{
  elementBeingChanged = document.getElementById("dinamic_id_"+targetId);
  if (elementBeingChanged!=null)
    elementBeingChanged.textContent=parseFloat(elementBeingChanged.textContent)+1;
}

function plusButtonScrub()
{
  if (elementBeingChanged!=null)
    elementBeingChanged.textContent=parseFloat(elementBeingChanged.textContent)+1;
}

function plusButtonDrop()
{
  elementBeingChanged=null;
}

function init() {
  mainPanel = document.getElementById("mainpanel");
  editPanel = document.getElementById("editpanel");
  editItems = document.getElementById("edititems");
  menuPanel = document.getElementById("menupanel");
  colorPicker = document.getElementById("uiColorPickerWindow");
  var midx=130, midy=60, hexdx=0, hexdy=0, hexsize=8, n=3, spacing=1, lightning=50;
  const sin60=0.86602540378;
  var hex = document.createElementNS(svgNS,"path");
  hex.setAttribute("onmouseenter", "enterColor(evt)");
  hex.setAttribute("onmouseleave", "leaveColor(evt)");
  hex.setAttribute("d", "M 0 0 h " + hexsize + " l " + (hexsize/2) + " " + (hexsize*sin60) + "l -" + (hexsize/2) + " " + (hexsize*sin60) + " h -" + hexsize + " l -" + (hexsize/2) + " -" + (hexsize*sin60) + " z");
  hex.setAttribute("fill", "hsl(0,0%," + lightning + "%)");
  hex.setAttribute("stroke", "none");
  hex.setAttribute("stroke-width", "1");
  hex.setAttribute("transform",  "translate(" + (midx+hexdx) + "," + (midy+hexdy) + ")");
  colorPicker.appendChild(hex);
  for (var i=1; i<=n; i++)
  {
    hexdx = 0;
    hexdy = 0 - i*((hexsize*sin60*2) + spacing);
    for (var j=0; j<i; j++)
    {
      hexdx += (hexsize*1.5) + (spacing*sin60);
      hexdy += (hexsize*sin60) + (spacing/2);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc((60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + lightning + "%)");
      hex.setAttribute("transform",  "translate(" + (midx+hexdx) + "," + (midy+hexdy) + ")");
      colorPicker.appendChild(hex);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(180+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + lightning + "%)");
      hex.setAttribute("transform",  "translate(" + (midx-hexdx) + "," + (midy-hexdy) + ")");
      colorPicker.appendChild(hex);
    }
    for (var j=0; j<i; j++)
    {
      hexdy += (hexsize*sin60*2) + spacing;
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(60+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + lightning + "%)");
      hex.setAttribute("transform",  "translate(" + (midx+hexdx) + "," + (midy+hexdy) + ")");
      colorPicker.appendChild(hex);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(240+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + lightning + "%)");
      hex.setAttribute("transform",  "translate(" + (midx-hexdx) + "," + (midy-hexdy) + ")");
      colorPicker.appendChild(hex);
    }
    for (var j=0; j<i; j++)
    {
      hexdx -= (hexsize*1.5) + (spacing*sin60);
      hexdy += (hexsize*sin60) + (spacing/2);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(120+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + lightning + "%)");
      hex.setAttribute("transform",  "translate(" + (midx+hexdx) + "," + (midy+hexdy) + ")");
      colorPicker.appendChild(hex);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(300+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + lightning + "%)");
      hex.setAttribute("transform",  "translate(" + (midx-hexdx) + "," + (midy-hexdy) + ")");
      colorPicker.appendChild(hex);
    }
    hexdx = 0;
    hexdy = i*((hexsize*sin60*2) + spacing);
  }
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
  switch (fieldClass) {
    case "uiText":
      var newNode = document.getElementById("uiTextSeed").cloneNode(true);
      newNode.setAttribute("transform", "translate(55,"+(itemCount*25)+")");
      newNode.removeAttribute("id");
      var inputText = newNode.getElementsByTagName("text")[0];
      if (fieldValue==null)
	inputText.textContent="";
      else
	inputText.textContent=""+fieldValue;
      editItems.appendChild(newNode);
      break;
    case "uiNumberPicker":
      var newNode = document.getElementById("uiNumberPickerSeed").cloneNode(true);
      newNode.setAttribute("transform", "translate(55,"+(itemCount*25)+")");
      newNode.removeAttribute("id");
      var inputText = newNode.getElementsByTagName("text")[0];
      if (fieldValue==null)
	inputText.textContent="0";
      else
	inputText.textContent=""+parseFloat(fieldValue);
      editItems.appendChild(newNode);
      break;
    case "uiColorPicker":
      var newNode = document.getElementById("uiColorPickerSeed").cloneNode(true);
      newNode.setAttribute("transform", "translate(55,"+(itemCount*25)+")");
      newNode.removeAttribute("id");
      editItems.appendChild(newNode);
      var colorBox = newNode.getElementsByTagName("rect")[1];
      if ((fieldValue==null)||(fieldValue=="none"))
	colorBox.setAttribute("fill", "none");
      else
	colorBox.setAttribute("fill", fieldValue);
      var inputText = newNode.getElementsByTagName("text")[0];
      if (fieldValue==null)
	inputText.textContent="not set";
      else
	inputText.textContent=""+fieldValue;
      editItems.appendChild(newNode);
      break;
    default:
//      if (fieldValue==null)
//	inputText.textContent="";
//      else
//	inputText.textContent=""+fieldValue;
  }
  itemCount++;
}

function openColorPicker(evt)
{
  colorPicker.setAttribute("visibility", "display");
}

function enterColor(evt)
{
  evt.target.setAttribute("stroke", "white");
}

function leaveColor(evt)
{
  evt.target.setAttribute("stroke", "none");
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
