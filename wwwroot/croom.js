const editmode=0, runmode=1;
let mode=editmode;
var mainPanel, editPanel;
var svgNS="http://www.w3.org/2000/svg";
var objDragged=null;
var pntDragged=null;
var oldX, oldY;
var params=new Array();

function init() {
  mainPanel = document.getElementById("mainpanel");
  editPanel = document.getElementById("editpanel");
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
    editPanel.style.display = "none";
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
	  var xey = params[1].split(/([,])/);
	  var newx = parseFloat(xey[0].trim()) + dx;
	  var newy = parseFloat(xey[2].trim()) + dy;
	  params[1]= "" + newx + "," + newy;
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

function drop(evt)
{
  objDragged=null;
  pntDragged=null;
  editPanel.style.display = "inline";
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
