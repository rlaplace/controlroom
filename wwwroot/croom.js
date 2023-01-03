const editmode=0, runmode=1;
let mode=editmode;
var mainPanel, editPanel, editItems, menuPanel;
var svgNS="http://www.w3.org/2000/svg";
var objBeingDraged=null;
var objBeingEdited=null;
var targetInput=null;
var ptnBeingDraged=null;
var oldX, oldY;
var params=new Array();
var itemCount;
var oldColorEl, selectedColorEl, selectedLightEl, selectedAlphaEl;

function clickColor(target)
{
  var fill=target.getAttribute ("fill");
  changeInputValue(targetInput, {"fill": fill});
  if (fill==null)
    fill="hsl(0,0%,0%)";
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
  if (selectedColorEl!=null)
    selectedColorEl.setAttribute("stroke-width", "0");
  selectedColorEl = target;
  selectedColorEl.setAttribute("stroke-width", "2");
}

function clickLight(target)
{
  var fill=target.getAttribute ("fill");
  changeInputValue(targetInput, {"fill": fill});
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
  if (selectedColorEl!=null)
    if (selectedColorEl.parentNode.id!="colorgroup") {
      selectedColorEl.setAttribute("stroke-width", "0");
      selectedColorEl = null;
    }
  selectedLightEl.setAttribute("stroke-width", "0");
  selectedLightEl = target;
  selectedLightEl.setAttribute("stroke-width", "2");
}

function clickAlpha(target)
{
  changeInputValue(targetInput, {"fill-opacity": target.getAttribute ("fill-opacity")});
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

function init() {
  mainPanel = document.getElementById("mainpanel");
  editPanel = document.getElementById("editpanel");
  editItems = document.getElementById("edititems");
  menuPanel = document.getElementById("menupanel");
  var midx=130, midy=63, hexdx=0, hexdy=0, hexsize=6, n=4, spacing=1, light=50;
  const sin60=0.86602540378;
  var g = document.getElementById("colorgroup");
  var hex = document.createElementNS(svgNS,"path");
  hex.setAttribute("onmouseenter", "enterColor(evt)");
  hex.setAttribute("onmouseleave", "leaveColor(evt)");
  hex.setAttribute("onclick", "clickColor(evt.target)");
  hex.setAttribute("d", "M 0 0 h " + hexsize + " l " + (hexsize/2) + " " + (hexsize*sin60) + "l -" + (hexsize/2) + " " + (hexsize*sin60) + " h -" + hexsize + " l -" + (hexsize/2) + " -" + (hexsize*sin60) + " z");
  hex.setAttribute("fill", "hsl(0,0%," + light + "%)");
  hex.setAttribute("stroke", "black");
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

function changeStrokeAttr(evt, attributeName)
{
  var attributeValue=evt.currentTarget.children[1].getAttribute(attributeName);
  changeInputValue(targetInput, {[attributeName]: attributeValue});
  expandCollapse(evt, attributeName.substring(7)+'ComboOptions');
}

function changeInputValue(node, fieldValue)
{
  var fieldClass = node.getAttribute("class");
  switch (fieldClass) {
    case "uiText":
      var inputText = node.getElementsByTagName("text")[0];
      if (fieldValue==null)
	inputText.textContent="";
      else
	inputText.textContent=""+fieldValue;
      break;
    case "uiNumberPicker":
      var inputText = node.getElementsByTagName("text")[0];
      if (fieldValue==null)
	inputText.textContent="0";
      else
	inputText.textContent=""+parseFloat(fieldValue);
      break;
    case "uiFillPicker":
      var text = node.getElementsByTagName("text")[0];
      var squaredBox = node.getElementsByTagName("rect")[1];
      var colorBox = node.getElementsByTagName("rect")[2];
      if (fieldValue.hasOwnProperty("fill")) {
	if (fieldValue["fill"]==null) {
	  text.textContent = "not set";
	  squaredBox.setAttribute("visibility", "hidden");
	  colorBox.setAttribute("visibility", "hidden");
	}
	else if (fieldValue["fill"]=="none") {
	  text.textContent = "none";
	  squaredBox.setAttribute("visibility", "hidden");
	  colorBox.setAttribute("visibility", "hidden");
	}
	else {
	  text.textContent = "";
	  squaredBox.setAttribute("visibility", "visible");
	  colorBox.setAttribute("visibility", "visible");
	}
      }
      for (const [key, value] of Object.entries(fieldValue)) {
	if (value==null)
	  colorBox.removeAttribute(key);
	else
	  colorBox.setAttribute(key, value);
      }
      break;
    case "uiStrokePicker":
      var polyline = node.getElementsByTagName("polyline")[0];
      var text = node.getElementsByTagName("text")[0];
      polyline.setAttribute("stroke", "none");
      if (fieldValue["stroke"]==null)
	text.textContent = "not set";
      else if (fieldValue["stroke"]=="none")
	text.textContent = "none";
      else {
	text.textContent = "";
	for (const [key, value] of Object.entries(fieldValue)) {
	  if (value==null)
	    polyline.removeAttribute(key);
	  else
	    polyline.setAttribute(key, value);
	}
      }
      break;
  }
  var parentNode = node.parentNode;
  if (parentNode!=null)
    if (parentNode.getAttribute("id")=="strokePickerWindow") {
      for (const [key, value] of Object.entries(fieldValue)) {
	targetInput.children[1].setAttribute(key, value);
      }
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
  var oldNode = document.getElementById(fieldClass+"Seed");
  if (oldNode!=null) {
    var newNode = oldNode.cloneNode(true);
    newNode.setAttribute("transform", "translate(55,"+(itemCount*25)+")");
    newNode.removeAttribute("id");
    changeInputValue(newNode, fieldValue);
    editItems.appendChild(newNode);
  }
  itemCount++;
}

function expandCollapse(evt, elementId)
{
  var element = document.getElementById(elementId);
  if (element!=null) {
    if (element.parentNode.nodeName=="defs") {
      targetInput = evt.currentTarget;
      if (elementId=="fillPickerWindow") {
	var colorBox = targetInput.getElementsByTagName("rect")[2];
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
      }
      var bBox = targetInput.firstElementChild.getBoundingClientRect();
      element.setAttribute("transform", "translate("+bBox.x+","+bBox.bottom+")");
      document.getElementById("dinamicWindowTree").appendChild(element);
      var zindex=0;
      if (element.parentNode.getAttribute("id")=="dinamicWindowTree")
	zindex=1;
      else
	zindex=2;
      element.setAttribute("zindex", zindex);
    }
    else {
      targetInput=null;
      element.removeAttribute("zindex");
      document.getElementsByTagName("defs")[0].appendChild(element);
    }
  }
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
      createItem("center x", "uiNumberPicker", objBeingEdited.getAttribute("cx"));
      createItem("center y", "uiNumberPicker", objBeingEdited.getAttribute("cy"));
      createItem("radius", "uiNumberPicker", objBeingEdited.getAttribute("r"));
      break;
    case "g":
    case "path":
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
    case "path":
      createItem("d", "uiText", objBeingEdited.getAttribute("d"));
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
      createItem("fill", "uiFillPicker", {
	"fill": objBeingEdited.getAttribute("fill"),
	"fill-opacity": objBeingEdited.getAttribute("fill-opacity")});
      createItem("stroke", "uiStrokePicker", {
	"stroke": objBeingEdited.getAttribute("stroke"),
	"stroke-opacity": objBeingEdited.getAttribute("stroke-opacity"),
	"stroke-width": objBeingEdited.getAttribute("stroke-width"),
	"stroke-linecap": objBeingEdited.getAttribute("stroke-linecap"),
	"stroke-linejoin": objBeingEdited.getAttribute("stroke-linejoin"),
	"stroke-dasharray": objBeingEdited.getAttribute("stroke-dasharray")});
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
  newNode.setAttribute("transform", "translate(70,220)");
  newNode.setAttribute("d","M 0 0 l 70 -150 l 60 100 l 70 -150");
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
    case "g":
      newNode.setAttribute("transform", "translate(50,50)");
      break;
    default:
      window.alert('Error (A32): Unnexpected tagName "'+newNode.tagName+'"') ;
  }
  mainPanel.appendChild(newNode);
  menuPanel.setAttribute("visibility", "hidden");
}
