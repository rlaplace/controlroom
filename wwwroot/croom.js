const editmode=0, runmode=1;
let mode=editmode;
var mainPanel, editPanel;
var svgNS="http://www.w3.org/2000/svg";
var idcount=0;
var objCurrent=null;
var objSelected=null;
var objDragging=null;
var dx=0, dy=0;

function touch(evt)
{
alert("z1");
  try
  {
    if (evt.target==mainPanel)
    {
alert("z2");
      objDragging=null;
      objCurrent=null;
      selectObj(null);
    }
    else if (evt.target.id=="background")
    {
alert("z3");
      objDragging=null;
      objCurrent=null;
      selectObj(evt.target);
    }
    else
    {
alert("z4");
      var newtarget=null;
      while ((newtarget.parentNode!=mainPanel)&&(newtarget.parentNode!=null))
	newtarget=newtarget.parentNode;
      objCurrent=newtarget;
      var changed=false;
      if (objSel!=newtarget)
      {
	selectObj(newtarget);
	changed=true;
      }
      objDragging=newtarget;
      if (objDragging.nodeName=="circle")
      {
	dx=parseFloat(objDragging.getAttribute("cx"))-evt.clientX;
	dy=parseFloat(objDragging.getAttribute("cy"))-evt.clientY;
      }
      else
      {
	dx=parseFloat(objDragging.getAttribute("x"))-evt.clientX;
	dy=parseFloat(objDragging.getAttribute("y"))-evt.clientY;
      }
    }
alert("z5");
  }
  catch (err)
  {
    window.alert("Erro (A30): "+err);
  }
}

function init() {
  mainPanel = document.getElementById("mainpanel");
  editPanel = document.getElementById("editpanel");
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
      window.alert (el.tagName) ;
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

function teste() {
  alert("hello world!");
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
  idcount=idcount+1;
  newNode.setAttribute('id','elid'+idcount);
//  newNode.setAttribute('onclick','setPosition(document.getElementById("elid'+idcount+'"),200,200)');
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
