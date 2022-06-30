const editmode=0, runmode=1;
let mode=editmode;
var mainSVGDoc, editMenuDoc;
var mainSVG, editMenu;

function getSubDocument(embedding_element) {
  if (embedding_element.contentDocument) {
    return embedding_element.contentDocument;
  } else {
    var subdoc = null;
    try {
      subdoc = embedding_element.getSVGDocument();
    } catch(e) {}
    return subdoc;
  }
}

function docLoad(mainDoc, menuDoc) {
  mainSVGDoc = getSubDocument(mainDoc);
  editMenuDoc = getSubDocument(menuDoc);
  mainSVG = mainSVGDoc.firstChild;
  editMenu = editMenuDoc.firstChild;
}

function duplicateSVGElement(element) {
window.alert(mainSVG);
  mainSVG.appendChild();
}
