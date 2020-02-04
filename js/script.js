"use strict";

if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
  alert("The File APIs are not fully supported in this browser, Please update your browser or use a different one.");
}

var droppedFile, imageType;
var convertFromType = "image/*";

/* Converts image to canvas; returns new canvas element */
function convertImageToCanvas(imageSrc, callback) {
  var image = new Image();
  image.src = imageSrc;

  image.onload = function() {
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);
    callback(canvas);
  };
}

/* Converts canvas to an a downloadable link (Deprecated) */
function convertCanvasToLink(canvas, extension) {
  var link = document.createElement("a");
  link.href = canvas.toDataURL("image/" + extension);
  link.download = "output" + new Date().toString().slice(0, 24) + "." + extension;
  return link;
}

/* Saves the canvas Image with a file extension */
function downloadCanvasImageAs(canvas, extension) {
  canvas.toBlob(function(blob) {
    saveAs(blob, "output" + new Date().toString().slice(0, 24) + "." + extension);
  });
}

/* Converts canvas image to black and white */
function greyScale(canvas, w, h) {
  var imgPixels = canvas.getContext("2d").getImageData(0, 0, w, h);

  for (var y = 0; y < imgPixels.height; y++) {
    for (var x = 0; x < imgPixels.width; x++) {
      var i = y * 4 * imgPixels.width + x * 4;
      var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
      imgPixels.data[i] = avg;
      imgPixels.data[i + 1] = avg;
      imgPixels.data[i + 2] = avg;
    }
  }

  canvas.getContext("2d").putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
  return canvas.toDataURL(imageType);
}

/* Function to handle the dropped file's data*/
function handleDroppedFile(evt, file) {
  var output;
  file = file || evt.target.files[0];

  if (!file.type.match(convertFromType)) {
    document.querySelector(".alert").style.display = "block";
    document.querySelector(".done-convert").classList.remove("green-text");
    document.querySelector(".done-drag").classList.remove("green-text");
    document.querySelector(".convert").classList.add("disabled");
    document.querySelector(".convert").classList.add("grey");
    document.querySelector(".convert").classList.remove("green");
    document.querySelector(".thumb-img").src = "";
    document.querySelector(".thumb").style.display = "none";
    document.querySelector(".dragUpload").classList.remove("s8");
    document.querySelector(".dragUpload").classList.add("s12");
    return;
  } else {
    imageType = file.type;
    document.querySelector(".alert").style.display = "none";
    document.querySelector(".done-drag").classList.add("green-text");
    document.querySelector(".convert").classList.remove("disabled");
    document.querySelector(".convert").classList.remove("grey");
    document.querySelector(".convert").classList.add("green");
  }

  var reader = new FileReader();

  reader.onload = (function() {
    return function(e) {
      // Render thumbnail.
      var imageData = e.target.result;
      document.querySelector(".thumb").style.display = "inline-block";
      document.querySelector(".thumb-img").src = imageData;
      document.querySelector(".dragUpload").classList.remove("s12");
      document.querySelector(".dragUpload").classList.add("s8");
      document.querySelector(".done-convert").classList.remove("green-text");
    };
  })(file);

  reader.readAsDataURL(file);
  document.getElementById("file").value = null;
}

function addEventListeners() {
  /*DRAG AND DROP EVENT LISTENERS */
  ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach(function(e) {
    document.querySelector(".dragUpload").addEventListener(e, function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
    });
  });
  ["dragover", "dragenter"].forEach(function(e) {
    document.querySelector(".dragUpload").addEventListener(e, function(evt) {
      document.querySelector(".dragUpload").classList.add("dragged");
    });
  });
  ["dragleave", "dragend", "drop"].forEach(function(e) {
    document.querySelector(".dragUpload").addEventListener(e, function(evt) {
      document.querySelector(".dragUpload").classList.remove("dragged");
    });
  });
}

/* Image to greyscale handler */
function convertToGreyScale() {
  addEventListeners();
  document.querySelector(".dragUpload").addEventListener("drop", function(evt) {
    droppedFile = evt.dataTransfer.files[0];
    handleDroppedFile(null, droppedFile);
  });
  document.getElementById("file").addEventListener("change", handleDroppedFile, false);
  document.querySelector(".convert").addEventListener("click", function() {
    /* Convert image */
    var canvas = convertImageToCanvas(document.querySelector(".thumb-img").src, function(canvas) {
      greyScale(canvas, canvas.width, canvas.height);
      downloadCanvasImageAs(canvas, imageType.split("/")[1]);
      document.querySelector(".done-convert").classList.add("green-text");
    });
  });
  document.querySelector(".reset").addEventListener("click", function() {
    location.reload();
  });
}

/* Image type conversion handler*/
function initImageConversion(fromExt, toExt, extraParams) {
  convertFromType = "image/" + (extraParams || fromExt);
  addEventListeners();
  document.querySelector(".dragUpload").addEventListener("drop", function(evt) {
    droppedFile = evt.dataTransfer.files[0];
    handleDroppedFile(null, droppedFile);
  });

  /* IF USER DIDN't Use Drag and Drop functionality and used the click instead*/
  document.getElementById("file").addEventListener("change", handleDroppedFile, false);
  /* FILE READER API */
  // Check for the various File API support.
  document.querySelector(".convert").addEventListener("click", function() {
    /* Convert image */
    var canvas = convertImageToCanvas(document.querySelector(".thumb-img").src, function(canvas) {
      downloadCanvasImageAs(canvas, toExt);
      document.querySelector(".done-convert").classList.add("green-text");
    });
  });
  document.querySelector(".reset").addEventListener("click", function() {
    location.reload();
  });
}

function initBase64Conversion() {
  addEventListeners();
  document.querySelector(".dragUpload").addEventListener("drop", function(evt) {
    droppedFile = evt.dataTransfer.files[0];
    handleDroppedFile(null, droppedFile);
  });
  document.getElementById("file").addEventListener("change", handleDroppedFile, false);
  document.querySelector(".convert").addEventListener("click", function() {
    let imageData = document.querySelector(".thumb-img").src;
    document.getElementById("base64").value = imageData;
    document.getElementById("htmlcode").value = `<img src="${imageData}" alt="">`;
    document.getElementById("csscode").value = `background-image: url(${imageData});`;
    document.querySelector(".done-convert").classList.add("green-text");
  });
  document.querySelector(".reset").addEventListener("click", function() {
   location.reload(); 
  });

  document.querySelectorAll(".copy").forEach(btn => {
    btn.addEventListener("click", function(evt) {
      let textArea = document.querySelector(evt.target.dataset.copy);
      let text = textArea.value;
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      /* Show a tooltip */
      M.Tooltip.init(evt.target, {
        exitDelay: 2000,
        position: "left"
      });
      M.Tooltip.getInstance(evt.target).open();
      setTimeout(function() {
        M.Tooltip.getInstance(evt.target).destroy();
      }, 2000) 
    }) 
  })
}