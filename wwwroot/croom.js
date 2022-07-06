const editmode=0, runmode=1;
let mode=editmode;
var mainPanel, editPanel;

function init() {
  mainPanel = document.getElementById("mainpanel");
  editPanel = document.getElementById("editpanel");
}

function setPosition(el, x, y) {
  switch (el.tagName) {
    case "image":
    case "text":
      el.setAttribute("x", x);
      el.setAttribute("y", y);
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
}

function insertCircle() {
}

function insertRect() {
}

function insertElement(element) {
  var newNode = element.cloneNode(true);
  newNode.removeAttribute("id");
  setPosition(newNode, 50, 50);
  mainPanel.appendChild(newNode);
  editPanel.style.display = "none";
}
