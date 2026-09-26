const formspreeEndpoint = "https://formspree.io/f/mwlpowwb";
const panels = [...document.querySelectorAll(".panel")];
const panelCount = panels.length;
const panelNumber = document.querySelector("#current-panel");
const progressBar = document.querySelector(".progress-bar");
const previousButton = document.querySelector("#previous-panel");
const nextButton = document.querySelector("#next-panel");
const invite = document.querySelector("#invite");
const itinerary = document.querySelector("#itinerary");
const form = document.querySelector("#date-form");
const dateInput = document.querySelector("#date-input");
const commentsInput = document.querySelector("#comments-input");
const answerInput = document.querySelector("#answer-input");
const answerButtons = [...document.querySelectorAll(".answer-option")];
const success = document.querySelector("#success");
let currentPanel = 0;

function setAnswerChoice(selectedAnswer) {
	answerInput.value = selectedAnswer;
	answerButtons.forEach((button) => {
		const isSelected = button.dataset.answer === selectedAnswer;
		button.classList.toggle("selected", isSelected);
		button.setAttribute("aria-pressed", String(isSelected));
	});
	updateFormValidation();
}

function updateFormValidation() {
	const selectedAnswer = answerInput.value;

	const dateRequired = selectedAnswer === "Yes";
	dateInput.required = dateRequired;
	if (selectedAnswer === "Yes") {
		dateInput.setCustomValidity(dateInput.value ? "" : "Please choose a date if you said yes.");
	} else {
		dateInput.setCustomValidity("");
	}

	const commentsRequired = selectedAnswer === "Maybe" || selectedAnswer === "No";
	commentsInput.required = commentsRequired;
	if (selectedAnswer === "Maybe") {
		commentsInput.setCustomValidity(commentsInput.value.trim() ? "" : "Please add a note if you are unsure.");
	} else if (selectedAnswer === "No") {
		commentsInput.setCustomValidity(commentsInput.value.trim() ? "" : "Please add a comment if you are declining.");
	} else {
		commentsInput.setCustomValidity("");
	}
}

answerButtons.forEach((button) => {
	button.addEventListener("click", () => setAnswerChoice(button.dataset.answer));
});

function showPanel(index) {
	currentPanel = Math.max(0, Math.min(index, panelCount - 1));
	const isLastPanel = currentPanel === panelCount - 1;
	panels.forEach((panel, panelIndex) => {
		panel.hidden = panelIndex !== currentPanel;
	});
	invite.hidden = !isLastPanel;
	itinerary.hidden = !isLastPanel;
	panelNumber.textContent = `${String(currentPanel + 1).padStart(2, "0")} / ${String(panelCount).padStart(2, "0")}`;
	progressBar.style.width = `${((currentPanel + 1) / panelCount) * 100}%`;
	previousButton.disabled = currentPanel === 0;
	nextButton.textContent = currentPanel === panelCount - 1 ? "See the details" : "Next page";
}

previousButton.addEventListener("click", () => showPanel(currentPanel - 1));
nextButton.addEventListener("click", () => {
	if (currentPanel === panelCount - 1) {
		itinerary.scrollIntoView({ behavior: "smooth", block: "start" });
		return;
	}
	showPanel(currentPanel + 1);
});

document.addEventListener("keydown", (event) => {
	if (event.key === "ArrowLeft") showPanel(currentPanel - 1);
	if (event.key === "ArrowRight") showPanel(currentPanel + 1);
});

dateInput.addEventListener("input", () => {
		const selectedDate = new Date(`${dateInput.value}T00:00:00`);
		if (answerInput.value === "Yes") {
			dateInput.setCustomValidity(selectedDate.getMonth() === 10 ? "" : "Please choose a date in November.");
		} else {
			dateInput.setCustomValidity("");
		}
});

commentsInput.addEventListener("input", () => {
	if (answerInput.value === "Maybe") {
		commentsInput.setCustomValidity(commentsInput.value.trim() ? "" : "Please add a note if you are unsure.");
	} else if (answerInput.value === "No") {
		commentsInput.setCustomValidity(commentsInput.value.trim() ? "" : "Please add a comment if you are declining.");
	}
});

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	updateFormValidation();

	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}

	const submitButton = form.querySelector("button[type=submit]");
	const details = new FormData(form);
	details.set("Answer", answerInput.value);
	details.set("Who", "Dabid and Linlin");
	details.append("subject", "A date invitation from Dudu");
	submitButton.disabled = true;
	success.textContent = "Sending the date details...";

	try {
		const response = await fetch(formspreeEndpoint, {
			method: "POST",
			body: details,
			headers: { Accept: "application/json" }
		});
		if (!response.ok) throw new Error("Form submission failed");
		form.reset();
		setAnswerChoice("Yes");
		success.textContent = "The date details were sent successfully.";
	} catch (error) {
		success.textContent = "The date details could not be sent. Please try again.";
	} finally {
		submitButton.disabled = false;
	}
});

setAnswerChoice("Yes");
showPanel(0);
