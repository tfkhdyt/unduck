import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./global.css";

import { bangs } from "./bang";

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Und*ck</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
        <div class="url-container"> 
          <input 
            type="text" 
            class="url-input"
            value="https://unduck.link?q=%s"
            readonly 
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
        <label class="bang-container">
          <p>Default Bang (currently <span class="bang-current"></span>)</p>
          <input
            class="bang-input"
            type="text"
            value="g"
          />
        </label>
      </div>
      <footer class="footer">
        <a href="https://t3.chat" target="_blank">t3.chat</a>
        •
        <a href="https://x.com/theo" target="_blank">theo</a>
        •
        <a href="https://github.com/t3dotgg/unduck" target="_blank">github</a>
      </footer>
    </div>
  `;

  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;
  const bangInput = app.querySelector<HTMLInputElement>(".bang-input")!;
  const bangCurrent = app.querySelector<HTMLSpanElement>(".bang-current")!;

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });

  bangCurrent.innerText = bangInput.value =
    localStorage.getItem("default-bang") ?? "g";

  bangInput.addEventListener("input", () => {
    if (!bangInput.value) return;
    if (bangs.some((b) => b.t === bangInput.value)) {
      localStorage.setItem("default-bang", bangInput.value);
      bangInput.setCustomValidity("");
      bangCurrent.innerText = bangInput.value;
    } else {
      bangInput.setCustomValidity("Unknown bang");
    }
  });
}

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "g";
const defaultBang = bangs.find((b) => b.t === LS_DEFAULT_BANG);

function ensureProtocol(url: string, defaultProtocol = "https://") {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.href; // If valid, return as is
  } catch (e) {
    return `${defaultProtocol}${url}`;
  }
}

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!(\S+)/i);

  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;

  // Remove the first bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  // Redirect to base domain if cleanQuery is empty
  if (!cleanQuery && selectedBang?.d) {
    return ensureProtocol(selectedBang.d);
  }

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function feelingLuckyRedirect(query: string) {
  const cleanQuery = query.replace("!", "").trim();

  return `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(cleanQuery)}`;
}

function doRedirect() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const type = /!(?:\s|$)/i.test(query);

  if (type) {
    const searchUrl = feelingLuckyRedirect(query);
    if (!searchUrl) return;

    const link = document.createElement("a");
    link.href = searchUrl;
    link.rel = "noreferrer noopener";
    link.click();

    return;
  }

  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();
