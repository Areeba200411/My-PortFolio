
const chatbotPanel = document.getElementById("chatbotPanel");
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const portfolioAnswers = [
    {
        keywords: ["skill", "technology", "programming", "language", "tech stack"],
        answer: "Areeba's portfolio lists Python, C++, JavaScript, SQL, HTML, CSS, React, Node.js, Express.js, MySQL, MongoDB, Pandas, NumPy, Scikit-learn, Git, and GitHub. Please check her Skills section for the latest details."
    },
    {
        keywords: ["project", "work", "built", "portfolio"],
        answer: "Areeba has worked on a personal portfolio website, an Online Payment Fraud Detection System using machine learning, and web development projects. Explore the Projects section of her portfolio for more information."
    },
    {
        keywords: ["education", "degree", "university", "study", "student", "cgpa"],
        answer: "Areeba is a BS Computer Science student at UMT, with expected graduation in 2027. Visit the About section for her education details."
    },
    {
        keywords: ["contact", "email", "reach", "hire", "message"],
        answer: "You can contact Areeba through the Contact page on this portfolio. Look there for her available contact details."
    },
    {
        keywords: ["who are you", "about areeba", "introduce", "about her"],
        answer: "Areeba Sharif is a Computer Science student interested in web development and AI. Explore the About and Projects sections to learn more about her."
    }
];

function openChatbot() {
    chatbotPanel.classList.add("open");
    chatbotToggle.setAttribute("aria-expanded", "true");
    chatbotInput.focus();
}

function closeChatbot() {
    chatbotPanel.classList.remove("open");
    chatbotToggle.setAttribute("aria-expanded", "false");
    chatbotToggle.focus();
}

function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `chatbot-message ${sender}`;
    message.textContent = text;
    chatbotMessages.appendChild(message);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getPortfolioAnswer(question) {
    const normalizedQuestion = question.toLowerCase();

    const match = portfolioAnswers.find(item =>
        item.keywords.some(keyword => normalizedQuestion.includes(keyword))
    );

    if (match) {
        return match.answer;
    }

    return "I can help with questions about Areeba's skills, projects, education, and contact details. Try asking about one of these topics!";
}

function askQuestion(question) {
    const cleanedQuestion = question.trim();

    if (!cleanedQuestion) return;

    addMessage(cleanedQuestion, "user");

    const answer = getPortfolioAnswer(cleanedQuestion);

    addMessage(answer, "bot");
}

chatbotToggle.addEventListener("click", () => {
    if (chatbotPanel.classList.contains("open")) {
        closeChatbot();
    } else {
        openChatbot();
    }
});

chatbotClose.addEventListener("click", closeChatbot);

chatbotForm.addEventListener("submit", event => {
    event.preventDefault();
    askQuestion(chatbotInput.value);
    chatbotInput.value = "";
    chatbotInput.focus();
});

document.querySelectorAll(".chatbot-suggestions button").forEach(button => {
    button.addEventListener("click", () => {
        askQuestion(button.dataset.question);
    });
});
