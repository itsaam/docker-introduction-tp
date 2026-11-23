const workspace = document.querySelector(".workspace");
const intro = document.querySelector("#intro");
const links = document.querySelectorAll("nav a");
const views = new Map();
let activeLink;

for (const link of links) {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (activeLink === link) return;

    if (activeLink) {
      activeLink.removeAttribute("aria-current");
      views.get(activeLink).hidden = true;
    }

    let frame = views.get(link);
    if (!frame) {
      frame = document.createElement("iframe");
      frame.src = link.href;
      frame.title = link.textContent;
      views.set(link, frame);
      workspace.append(frame);
    }

    intro.hidden = true;
    frame.hidden = false;
    link.setAttribute("aria-current", "true");
    activeLink = link;
  });
}
