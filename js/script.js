console.log("Areeba's portfolio is running!");
document.querySelectorAll("nav a").forEach((link) => {
    if (link.href === window.location.href) {
        link.style.color = "#00e5cc";
    }
});