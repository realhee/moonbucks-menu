import { $, MESSAGE } from "./consts.js";
import { MenuAPI } from "./api/index.js";

function App() {
  const $menuForm = $("#espresso-menu-form");
  const $menuList = $("#espresso-menu-list");
  const $menuNameInput = $("#espresso-menu-name");
  const $submitButton = $("#espresso-menu-submit-button");
  const $counter = $(".menu-count");
  const $categoryNav = $("#cafe-category-nav");
  const $categoryList = document.getElementsByClassName("cafe-category-name");
  const $menuTitle = $(".mt-1");

  this.init = async () => {
    this.menuItemInfoList = {};
    this.currentCategory = $categoryList[0].dataset.categoryName;
    const categoryArray = [...$categoryList].map(
      (item) => item.dataset.categoryName
    );
    categoryArray.map((item) => {
      this.menuItemInfoList[item] = [];
    });
    initEventHandlers();
    render();
  };

  const initEventHandlers = () => {
    $menuForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });

    $menuNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && $menuNameInput.value !== "") addMenuItem();
    });

    $submitButton.addEventListener("click", () => addMenuItem());

    $menuList.addEventListener("click", async (e) => {
      if (isContainedClass("menu-edit-button", e)) modifyMenuItem(e);
      else if (isContainedClass("menu-remove-button", e)) removeMenuItem(e);
      else if (isContainedClass("menu-sold-out-button", e)) {
        const $listItem = e.target.closest("li");
        const menuId = $listItem.dataset.id;
        await MenuAPI.toggleSoldOutMenu(this.currentCategory, menuId);
        render();
      }
    });

    $categoryNav.addEventListener("click", (e) => {
      if (isContainedClass("cafe-category-name", e)) {
        this.currentCategory = e.target.dataset.categoryName;
        $menuTitle.innerText = `${e.target.innerText} 메뉴 관리`;
        render();
      }
    });
  };

  const render = async () => {
    this.menuItemInfoList[
      this.currentCategory
    ] = await MenuAPI.getAllMenuByCategory(this.currentCategory);
    if (this.menuItemInfoList[this.currentCategory]) {
      $menuList.innerHTML = this.menuItemInfoList[this.currentCategory]
        .map((item) => menuItemTemplate(item))
        .join("");
      updateMenuCount();
      initMenuNameInput();
    }
  };

  const menuItemTemplate = (item) => {
    return `<li data-id="${
      item.id
    }" class="menu-list-item  d-flex items-center py-2">
              <span class="${
                item.isSoldOut ? "sold-out" : ""
              } w-100 pl-2 menu-name">${item.name}</span>
              <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
          >
            품절
          </button>
              <button
              type="button"
              class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
              >
              수정
              </button>
              <button
              type="button"
              class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
              >
              삭제
              </button>
          </li>`;
  };

  const initMenuNameInput = () => {
    $menuNameInput.value = "";
    $menuNameInput.focus();
  };

  const isContainedClass = (className, e) => {
    if (e.target.classList.contains(className)) return true;
    return false;
  };

  const isduplicatedMenuName = (newMenuName) => {
    const duplicatedMenuItem = this.menuItemInfoList[this.currentCategory].find(
      (item) => item.name === newMenuName
    );

    if (duplicatedMenuItem) return true;
    return false;
  };

  const updateMenuCount = () => {
    const menuCount = this.menuItemInfoList[this.currentCategory].length;
    $counter.textContent = `총 ${menuCount} 개`;
  };

  const addMenuItem = async () => {
    if (isduplicatedMenuName($menuNameInput.value)) {
      alert(MESSAGE.ALREADY_EXIST);
      initMenuNameInput();
      return;
    }
    if ($menuNameInput.value.trim() === "") {
      alert(MESSAGE.WARN_BLANK);
      initMenuNameInput();
      return;
    }

    await MenuAPI.createMenu(this.currentCategory, $menuNameInput.value);
    render();
  };

  const modifyMenuItem = async (e) => {
    const $listItem = e.target.closest("li");
    const $menuName = $listItem.querySelector(".menu-name");
    const newMenuName = prompt(MESSAGE.CHECK_MODIFY, $menuName.textContent);

    if (newMenuName === null) return;
    if (isduplicatedMenuName(newMenuName)) {
      alert(MESSAGE.ALREADY_EXIST);
    } else if (newMenuName.trim() === "") {
      alert(MESSAGE.WARN_BLANK);
    } else {
      const menuId = $listItem.dataset.id;
      await MenuAPI.updateMenu(this.currentCategory, newMenuName, menuId);
    }
    render();
  };

  const removeMenuItem = async (e) => {
    const $listItem = e.target.closest("li");
    const menuId = $listItem.dataset.id;
    if (confirm(MESSAGE.CHECK_REMOVE)) {
      await MenuAPI.deleteMenu(this.currentCategory, menuId);
    }
    render();
  };
}

const app = new App();
app.init();
