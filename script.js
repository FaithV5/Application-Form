function blockNonNumericInput() {
  const ageField = document.getElementById("age");
  const contactField = document.getElementById("contact-number");

  const preventNonNumeric = function (event) {
    const invalidChars = ["e", "E", "+", "-", "."];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  };

  if (ageField) {
    ageField.addEventListener("keypress", preventNonNumeric);
  }
  if (contactField) {
    contactField.addEventListener("keypress", preventNonNumeric);
  }
}

function createFamilyRow() {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" aria-label="Family member name" /></td>
    <td><input type="text" aria-label="Family relationship" /></td>
    <td><input type="number" min="0" aria-label="Family age" /></td>
    <td>
      <select aria-label="Family civil status">
        <option value="" selected disabled>Select status</option>
        <option>Single</option>
        <option>Separated</option>
        <option>Widower</option>
        <option>Married</option>
      </select>
    </td>
    <td><input type="text" aria-label="Family occupation or income" /></td>
  `;

  return row;
}

function wireFamilyRowButton() {
  const addRowButton = document.getElementById("add-family-row");
  const familyBody = document.getElementById("family-body");

  if (!addRowButton || !familyBody) {
    return;
  }

  addRowButton.addEventListener("click", function () {
    familyBody.appendChild(createFamilyRow());
  });
}

function setupSpecifyForCheckboxes() {
  const optionLabels = document.querySelectorAll(".check-option");

  optionLabels.forEach(function (label) {
    const optionText = label.textContent || "";
    if (!/specify/i.test(optionText)) {
      return;
    }

    const checkbox = label.querySelector('input[type="checkbox"]');
    if (!checkbox) {
      return;
    }

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.className = "specify-input";
    textInput.placeholder = "Please specify";
    textInput.setAttribute("aria-label", "Specify details");
    textInput.hidden = true;

    label.insertAdjacentElement("afterend", textInput);

    checkbox.addEventListener("change", function () {
      textInput.hidden = !checkbox.checked;
      if (!checkbox.checked) {
        textInput.value = "";
      }
    });
  });
}

function setupSpecifyForSelects() {
  const selects = document.querySelectorAll("select");

  selects.forEach(function (selectElement) {
    const hasSpecifyOption = Array.from(selectElement.options).some(function (opt) {
      return /specify/i.test(opt.textContent || "");
    });

    if (!hasSpecifyOption) {
      return;
    }

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.className = "specify-input";
    textInput.placeholder = "Please specify";
    textInput.setAttribute("aria-label", "Specify details");
    textInput.hidden = true;

    selectElement.insertAdjacentElement("afterend", textInput);

    selectElement.addEventListener("change", function () {
      const selected = selectElement.options[selectElement.selectedIndex];
      const shouldShow = selected && /specify/i.test(selected.textContent || "");
      textInput.hidden = !shouldShow;
      if (!shouldShow) {
        textInput.value = "";
      }
    });
  });
}

function setupUploadButtons() {
  const uploadInputs = document.querySelectorAll('.upload-input:not(#upload-verification)');

  uploadInputs.forEach(function (inputElement) {
    const uploadBox = inputElement.nextElementSibling;
    if (!uploadBox || !uploadBox.classList.contains("upload-box")) {
      return;
    }

    const fileNameLabel = uploadBox.querySelector(".upload-file-name");

    inputElement.addEventListener("change", function () {
      if (!fileNameLabel) {
        return;
      }

      if (inputElement.files && inputElement.files.length > 0) {
        fileNameLabel.textContent = inputElement.files[0].name;
      } else {
        fileNameLabel.textContent = "No file selected";
      }
    });

    uploadBox.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        inputElement.click();
      }
    });
  });
}

function setupFaceCamera() {
  const openButton = document.getElementById("open-face-camera");
  const closeButton = document.getElementById("close-face-camera");
  const previewWrap = document.getElementById("face-camera-preview");
  const videoElement = document.getElementById("face-camera-video");
  const statusLabel = document.getElementById("face-camera-status");
  const fallbackInput = document.getElementById("upload-verification");

  if (!openButton || !closeButton || !previewWrap || !videoElement) {
    return;
  }

  let faceStream = null;

  const setStatus = function (message) {
    if (statusLabel) {
      statusLabel.textContent = message;
    }
  };

  const stopCamera = function () {
    if (faceStream) {
      faceStream.getTracks().forEach(function (track) {
        track.stop();
      });
      faceStream = null;
    }

    videoElement.srcObject = null;
    previewWrap.hidden = true;
    openButton.setAttribute("aria-expanded", "false");
  };

  openButton.addEventListener("click", async function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("Camera access is not supported in this browser. Opening file capture instead.");
      if (fallbackInput) {
        fallbackInput.click();
      }
      return;
    }

    if (faceStream) {
      setStatus("Camera is already open.");
      return;
    }

    try {
      faceStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        },
        audio: false
      });

      videoElement.srcObject = faceStream;
      previewWrap.hidden = false;
      openButton.setAttribute("aria-expanded", "true");
      setStatus("Camera opened successfully.");
    } catch (error) {
      setStatus("Unable to access camera. Please allow permission, then try again.");
      if (fallbackInput) {
        fallbackInput.click();
      }
    }
  });

  closeButton.addEventListener("click", function () {
    stopCamera();
    setStatus("Camera closed.");
  });

  window.addEventListener("beforeunload", function () {
    stopCamera();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  blockNonNumericInput();
  wireFamilyRowButton();
  setupSpecifyForCheckboxes();
  setupSpecifyForSelects();
  setupUploadButtons();
  setupFaceCamera();
});
