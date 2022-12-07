const editmode=0, runmode=1;
let mode=editmode;
var mainPanel, editPanel, editItems, menuPanel;
var colorPicker;
var svgNS="http://www.w3.org/2000/svg";
var objBeingDraged=null;
var objBeingEdited=null;
var ptnBeingDraged=null;
var oldX, oldY;
var params=new Array();
var itemCount;
var attrElBeingChanged;
var oldColorEl, currentColorEl, selectedColorEl, selectedLightEl, selectedAlphaEl;

function clickColor(target)
{
  var fill=target.getAttribute ("fill");
  if (fill==null)
  {
    currentColorEl.removeAttribute ("fill");
    fill="hsl(0,0%,0%)";
  }
  else
    currentColorEl.setAttribute ("fill", fill);
  if (fill=="none")
    fill="hsl(0,0%,0%)";
  if (fill.startsWith("hsl("))
    var hs = fill.replace(/,\d*\%\)/, "");
  else
    var hs = "hsl(0,0%";
  var lightElements = document.getElementById("lightgroup").getElementsByTagName("rect");
  for (var i=0; i<lightElements.length; i++)
    lightElements[i].setAttribute ("fill", hs+","+(100-(i*10))+"%)");
  var alphaElements = document.getElementById("alphagroup").getElementsByTagName("rect");
  for (var i=0; i<alphaElements.length; i++)
    alphaElements[i].setAttribute ("fill", fill);
  selectedColorEl.setAttribute("stroke-width", "0");
  selectedColorEl = target;
  selectedColorEl.setAttribute("stroke-width", "2");
}

function clickLight(target)
{
  var fill=target.getAttribute ("fill");
  if (fill.startsWith("hsl("))
    var light = fill.replace(/hsl\(\d*,\d*\%,/, ",");
  else
    var light = ",50%)";
  var colorElements = document.getElementById("colorgroup").getElementsByTagName("path");
  for (var i=0; i<colorElements.length; i++)
    colorElements[i].setAttribute ("fill", colorElements[i].getAttribute ("fill").replace(/,\d*\%\)/, "")+light);
  var alphaElements = document.getElementById("alphagroup").getElementsByTagName("rect");
  for (var i=0; i<alphaElements.length; i++)
    alphaElements[i].setAttribute ("fill", fill);
  currentColorEl.setAttribute ("fill", fill);
  selectedLightEl.setAttribute("stroke-width", "0");
  selectedLightEl = target;
  selectedLightEl.setAttribute("stroke-width", "2");
}

function clickAlpha(target)
{
  currentColorEl.setAttribute ("fill-opacity", target.getAttribute ("fill-opacity"));
  selectedAlphaEl.setAttribute("stroke-width", "0");
  selectedAlphaEl = target;
  selectedAlphaEl.setAttribute("stroke-width", "2");
}

function resetToOldColor()
{
  var fill=oldColorEl.getAttribute ("fill");
  if (fill==null)
    var light = 0;
  else if (fill.startsWith("hsl("))
    var light = parseInt(fill.replace(/hsl\(\d*,\d*\%,/, "").match(/\d*/));
  else
    var light = 50;
  var lightindex = Math.trunc((100-light)/10);
  clickLight(document.getElementById("lightgroup").getElementsByTagName("rect")[lightindex]);
  clickColor(oldColorEl);
  var alpha=oldColorEl.getAttribute ("fill-opacity");
  if (alpha==null)
    alpha = 1;
  else
    alpha = parseFloat(alpha);
  var alphaindex = Math.trunc((1-alpha)*10);
  clickAlpha(document.getElementById("alphagroup").getElementsByTagName("rect")[alphaindex]);
}

function setToCurrentColor()
{
  var colorBox = attrElBeingChanged.getElementsByTagName("rect")[1];
  var fill = currentColorEl.getAttribute("fill");
  if (fill==null) {
    colorBox.removeAttribute("fill");
    objBeingEdited.removeAttribute("fill");
  }
  else {
    colorBox.setAttribute("fill", fill);
    objBeingEdited.setAttribute("fill", fill);
  }
  var opacity = currentColorEl.getAttribute("fill-opacity");
  if (opacity==null) {
    colorBox.removeAttribute("fill-opacity");
    objBeingEdited.removeAttribute("fill-opacity");
  }
  else {
    colorBox.setAttribute("fill-opacity", opacity);
    objBeingEdited.setAttribute("fill-opacity", opacity);
  }
  colorPicker.setAttribute("visibility", "hidden");
}

function init() {
  mainPanel = document.getElementById("mainpanel");
  editPanel = document.getElementById("editpanel");
  editItems = document.getElementById("edititems");
  menuPanel = document.getElementById("menupanel");
  colorPicker = document.getElementById("uiColorPickerWindow");
  var midx=130, midy=63, hexdx=0, hexdy=0, hexsize=6, n=4, spacing=1, light=50;
  const sin60=0.86602540378;
  var g = document.createElementNS(svgNS,"g");
  g.setAttribute("id", "colorgroup");
  colorPicker.appendChild(g);
  var hex = document.createElementNS(svgNS,"path");
  hex.setAttribute("onmouseenter", "enterColor(evt)");
  hex.setAttribute("onmouseleave", "leaveColor(evt)");
  hex.setAttribute("onclick", "clickColor(evt.target)");
  hex.setAttribute("d", "M 0 0 h " + hexsize + " l " + (hexsize/2) + " " + (hexsize*sin60) + "l -" + (hexsize/2) + " " + (hexsize*sin60) + " h -" + hexsize + " l -" + (hexsize/2) + " -" + (hexsize*sin60) + " z");
  hex.setAttribute("fill", "hsl(0,0%," + light + "%)");
  hex.setAttribute("stroke", "hsl(0,0%,100%)");
  hex.setAttribute("stroke-width", "0");
  hex.setAttribute("transform",  "translate(" + (midx+hexdx) + "," + (midy+hexdy) + ")");
  g.appendChild(hex);
  for (var i=1; i<=n; i++)
  {
    hexdx = 0;
    hexdy = 0 - i*((hexsize*sin60*2) + spacing);
    for (var j=0; j<i; j++)
    {
      hexdx += (hexsize*1.5) + (spacing*sin60);
      hexdy += (hexsize*sin60) + (spacing/2);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc((60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + light + "%)");
      hex.setAttribute("transform",  "translate(" + (midx+hexdx) + "," + (midy+hexdy) + ")");
      g.appendChild(hex);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(180+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + light + "%)");
      hex.setAttribute("transform",  "translate(" + (midx-hexdx) + "," + (midy-hexdy) + ")");
      g.appendChild(hex);
    }
    for (var j=0; j<i; j++)
    {
      hexdy += (hexsize*sin60*2) + spacing;
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(60+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + light + "%)");
      hex.setAttribute("transform",  "translate(" + (midx+hexdx) + "," + (midy+hexdy) + ")");
      g.appendChild(hex);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(240+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + light + "%)");
      hex.setAttribute("transform",  "translate(" + (midx-hexdx) + "," + (midy-hexdy) + ")");
      g.appendChild(hex);
    }
    for (var j=0; j<i; j++)
    {
      hexdx -= (hexsize*1.5) + (spacing*sin60);
      hexdy += (hexsize*sin60) + (spacing/2);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(120+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + light + "%)");
      hex.setAttribute("transform",  "translate(" + (midx+hexdx) + "," + (midy+hexdy) + ")");
      g.appendChild(hex);
      hex = hex.cloneNode(true);
      hex.setAttribute("fill", "hsl(" + Math.trunc(300+(60/i)*(j+1)) + "," + Math.trunc(i/n*100) + "%," + light + "%)");
      hex.setAttribute("transform",  "translate(" + (midx-hexdx) + "," + (midy-hexdy) + ")");
      g.appendChild(hex);
    }
    hexdx = 0;
    hexdy = i*((hexsize*sin60*2) + spacing);
  }
  oldColorEl = document.getElementById("oldcolor");
  currentColorEl = document.getElementById("currentcolor");
  selectedColorEl = oldColorEl;
  selectedLightEl = document.getElementById("lightgroup").getElementsByTagName("rect")[5];
  selectedAlphaEl = document.getElementById("alphagroup").getElementsByTagName("rect")[0];
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
    objBeingDraged=null;
    ptnBeingDraged=null;
    oldX=evt.clientX;
    oldY=evt.clientY;
    if (evt.target.getAttribute("class")=="pontojunta")
      ptnBeingDraged=evt.target;
    else if (evt.target.id!="background")
    {
      var realtarget=evt.target;
      while ((realtarget.parentNode!=mainPanel)&&(realtarget.parentNode!=null))
	realtarget=realtarget.parentNode;
      objBeingDraged=realtarget;
      if (objBeingDraged.nodeName=="path")
	prepParams(objBeingDraged);
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
    if (objBeingDraged==null)
    {
      if (ptnBeingDraged==null)
	return;
      var x=evt.clientX;
      var y=evt.clientY;
      var altx = (x-dx) - parseFloat(ptnBeingDraged.getAttribute("cx"));
      var alty = (y-dy) - parseFloat(ptnBeingDraged.getAttribute("cy"));
      var segmento = parseInt(ptnBeingDraged.getAttribute("segmento"));
      var attr = params[segmento*2+1].split(/[\s,]/);
      attr[attr.length-2] = parseFloat(attr[attr.length-2]) + altx;
      attr[attr.length-1] = parseFloat(attr[attr.length-1]) + alty;
      params[segmento*2+1] = attr.join(" ")
      objBeingDraged.setAttribute("d", params.join(" "));
      movePontos(altx, alty, segmento);
      document.getElementById("d").value=params.join(" ");
    }
    else
    {
      var dx=evt.clientX-oldX;
      var dy=evt.clientY-oldY;
      oldX=evt.clientX;
      oldY=evt.clientY;
      switch (objBeingDraged.tagName) {
	case "image":
	case "rect":
	case "text":
	  objBeingDraged.setAttribute("x", parseFloat(objBeingDraged.getAttribute("x")) + dx);
	  objBeingDraged.setAttribute("y", parseFloat(objBeingDraged.getAttribute("y")) + dy);
	  break;
	case "circle":
	  objBeingDraged.setAttribute("cx", parseFloat(objBeingDraged.getAttribute("cx")) + dx);
	  objBeingDraged.setAttribute("cy", parseFloat(objBeingDraged.getAttribute("cy")) + dy);
	  break;
	case "path":
	  var xey = params[1].split(/[\s,]/);
	  params[1]= "" + (parseFloat(xey[0].trim()) + dx) + " " + (parseFloat(xey[1].trim()) + dy);
	  objBeingDraged.setAttribute("d", params.join(" "));
	  break;
	case "g":
	  var trans = objBeingDraged.getAttribute("transform").split(/([\(\)])/);
	  var newx = dx, newy = dy;
	  for (var i=0; i<trans.length; i++)
	    if (trans[i]=="translate")
	    {
	      var xey = trans[i+2].split(/([,])/);
	      newx += parseFloat(xey[0].trim());
	      newy += parseFloat(xey[2].trim());
	    }
	  objBeingDraged.setAttribute("transform", "translate(" + newx + "," + newy + ")");
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
  label.setAttribute("fill", "hsl(0,100%,93%)");
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
  attrElBeingChanged = evt.target.parentNode;
  var colorBox = attrElBeingChanged.getElementsByTagName("rect")[1];
  var fill = colorBox.getAttribute("fill");
  if (fill==null)
    oldColorEl.removeAttribute("fill");
  else
    oldColorEl.setAttribute("fill", fill);
  var opacity = colorBox.getAttribute("fill-opacity");
  if (opacity==null)
    oldColorEl.removeAttribute("fill-opacity");
  else
    oldColorEl.setAttribute("fill-opacity", opacity);
  resetToOldColor();
  colorPicker.setAttribute("visibility", "display");
}

function enterColor(evt)
{
  if ((selectedColorEl!=evt.target)&&(selectedLightEl!=evt.target)&&(selectedAlphaEl!=evt.target))
    evt.target.setAttribute("stroke-width", "2");
}

function leaveColor(evt)
{
  if ((selectedColorEl!=evt.target)&&(selectedLightEl!=evt.target)&&(selectedAlphaEl!=evt.target))
    evt.target.setAttribute("stroke-width", "0");
}

function drop(evt)
{
  objBeingDraged=null;
  ptnBeingDraged=null;
  objBeingEdited=evt.target;
  while ((objBeingEdited.parentNode!=mainPanel)&&(objBeingEdited.parentNode!=null))
    objBeingEdited=objBeingEdited.parentNode;
  while (editItems.hasChildNodes())
    editItems.removeChild(editItems.firstChild);
  itemCount=0;
  switch (objBeingEdited.tagName) {
    case "text":
    case "image":
    case "rect":
      createItem("x", "uiNumberPicker", objBeingEdited.getAttribute("x"));
      createItem("y", "uiNumberPicker", objBeingEdited.getAttribute("y"));
      break;
    case "circle":
      createItem("cx", "uiNumberPicker", objBeingEdited.getAttribute("cx"));
      createItem("cy", "uiNumberPicker", objBeingEdited.getAttribute("cy"));
      createItem("radius", "uiNumberPicker", objBeingEdited.getAttribute("r"));
      break;
    case "g":
      var trans = objBeingEdited.getAttribute("transform").split(/([\(\)])/);
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
      createItem("d", "uiText", objBeingEdited.getAttribute("d"));
      break;
  }
  if (objBeingEdited.getAttribute("class")=="graph") {
    createItem("width", "uiNumberPicker", objBeingEdited.getAttribute("width"));
    createItem("height", "uiNumberPicker", objBeingEdited.getAttribute("height"));
  }
  switch (objBeingEdited.tagName) {
    case "text":
      createItem("Text", "uiText", objBeingEdited.textContent);
      break;
    case "image":
    case "rect":
      createItem("width", "uiNumberPicker", objBeingEdited.getAttribute("width"));
      createItem("height", "uiNumberPicker", objBeingEdited.getAttribute("height"));
      break;
  }
  switch (objBeingEdited.tagName) {
    case "image":
      createItem("href", "uiText", objBeingEdited.getAttribute("href"));
      break;
    case "text":
    case "rect":
    case "circle":
    case "g":
    case "path":
      createItem("fill", "uiColorPicker", objBeingEdited.getAttribute("fill"));
      createItem("stroke", "uiColorPicker", objBeingEdited.getAttribute("stroke"));
      break;
  }
  switch (objBeingEdited.tagName) {
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
  newNode.setAttribute("stroke","hsl(0,0%,0%)");
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
  newNode.setAttribute("fill","hsl(240,100%,50%)");
  newNode.setAttribute("stroke","hsl(0,0%,0%)");
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
  newNode.setAttribute("fill","hsl(240,100%,50%)");
  newNode.setAttribute("stroke","hsl(0,0%,0%)");
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
