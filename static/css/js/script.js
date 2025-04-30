document
  .getElementById("chat-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const userInput = document.getElementById("user-input").value;

    // Отправка запроса на сервер
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),
    })
      .then((response) => response.json())
      .then((data) => {
        const chatBox = document.getElementById("chat-box");
        chatBox.innerHTML += `<p><strong>Вы:</strong> ${userInput}</p>`;
        chatBox.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
      });
  });
// --- Функция фильтрации ---
function filterCharacters() {
  const searchQuery = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const showAll = allButton().classList.contains("active");
  const filter18Checked = document.getElementById("filter18").checked;
  const pattern = new RegExp(words18Plus.join("|"), "i");

  document.querySelectorAll(".character-item").forEach((item) => {
    const name = (item.dataset.name || "").toLowerCase();
    const dataDesc = (item.dataset.desc || "").toLowerCase();
    const descElem = item.querySelector(".character-desc");
    const descInnerText = descElem ? descElem.textContent.toLowerCase() : "";
    const fullDesc = dataDesc + " " + descInnerText;
    const cleanedDesc = fullDesc.replace(/[^a-zA-Zа-яА-Я0-9]+/g, "");
    const contains18Plus = pattern.test(cleanedDesc);

    // Поиск по имени и описанию
    if (
      searchQuery &&
      !(
        item.dataset.name.toLowerCase().includes(searchQuery) ||
        fullDesc.includes(searchQuery)
      )
    ) {
      item.style.display = "none";
      if (matchesTags) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
        return;
      }
    }

    // Теги
    const tags = JSON.parse(item.dataset.tags || "[]");
    let matchesTags = true;

    if (!showAll) {
      if (selectedTags.size > 0) {
        matchesTags = Array.from(selectedTags).some((t) => tags.includes(t));
      }
    } else {
      if (tags.includes("NSFW")) {
        matchesTags = false;
      }
    }

    // Логика по 18+
    if (filter18Checked) {
      if (!contains18Plus) matchesTags = false;
    } else {
      if (contains18Plus) matchesTags = false;
    }
    // Показывать или скрывать карточку
    if (matchesTags) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
  // После этого вызываем функцию для выравнивания карточек
  updateLayout();
}

// Обработка переключателей и фильтров
document.querySelectorAll(".btn-filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.textContent.trim();

    if (text === "Все") {
      // Сброс всех тегов
      selectedTags.clear();
      // Удаляем активность у всех
      document
        .querySelectorAll(".btn-filter")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    } else {
      // Переключение тега
      if (selectedTags.has(text)) {
        selectedTags.delete(text);
        btn.classList.remove("active");
      } else {
        selectedTags.add(text);
        btn.classList.add("active");
      }
      // Управление активностью "Все"
      const allBtnEl = Array.from(
        document.querySelectorAll(".btn-filter")
      ).find((b) => b.textContent.trim() === "Все");
      if (selectedTags.size > 0) {
        allBtnEl.classList.remove("active");
      } else {
        allBtnEl.classList.add("active");
      }
    }
    filterCharacters();
  });
});
// Исправленная загрузка страницы
window.addEventListener("load", () => {
  addBlurOverlayToAllCards();
  document.querySelectorAll(".character-item").forEach((item) => {
    // Изначально скрываем
    item.style.display = "none";
    item.classList.remove("show");
  });

  // Запускаем фильтр, чтобы показать подходящих персонажей
  const allBtnEl = Array.from(document.querySelectorAll(".btn-filter")).find(
    (b) => b.textContent.trim() === "Все"
  );
  if (allBtnEl) {
    allBtnEl.classList.add("active");
    filterCharacters();
  }

  // После задержки показываем карточки
  setTimeout(() => {
    document.querySelectorAll(".character-item").forEach((item) => {
      // Показываем только если карточка не скрыта фильтром
      if (item.style.display !== "none") {
        item.classList.add("show");
      }
    });
  }, 50);
});

function updateBlurOverlay() {
  document.querySelectorAll(".character-item").forEach((item) => {
    const overlay = item.querySelector(".blur-overlay");
    // Проверка фильтра
    const filterOff = !document.getElementById("filter18").checked; // если фильтр 18+ выключен
    if (filterOff) {
      overlay.style.display = "flex";
      item.classList.add("disabled"); // блокировать клики
    } else {
      overlay.style.display = "none";
      item.classList.remove("disabled");
    }
  });
}
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("disable-filter-btn")) {
    // отключить фильтр
    document.getElementById("filter18").checked = false;
    filterCharacters();
    updateBlurOverlay();
  }
});

function addBlurOverlayToAllCards() {
  document.querySelectorAll(".character-item").forEach((item) => {
    if (!item.querySelector(".blur-overlay")) {
      const overlay = document.createElement("div");
      overlay.className = "blur-overlay";
      overlay.innerHTML = `
        <h2>18+ NSFW контент</h2>
        <button class="disable-filter-btn">Отключить фильтр 18+</button>
      `;
      overlay.style.display = "none"; // скрыт по умолчанию
      item.appendChild(overlay);
    }
  });
}

// остальные ваши действия
document.querySelectorAll(".character-item").forEach((item) => {
  item.style.display = "none";
  item.classList.remove("show");
});
const allBtnEl = Array.from(document.querySelectorAll(".btn-filter")).find(
  (b) => b.textContent.trim() === "Все"
);
if (allBtnEl) {
  allBtnEl.classList.add("active");
  filterCharacters();
}
setTimeout(() => {
  document.querySelectorAll(".character-item").forEach((item) => {
    if (item.style.display !== "none") {
      item.classList.add("show");
    }
  });
}, 50);
