import { $, MESSAGE } from "./consts.js";

const BASE_URL = "http://localhost:3000/api";

const MenuAPI = {
  async getAllMenuByCategory(category) {
    const response = await fetch(`${BASE_URL}/category/${category}/menu`);
    return response.json();
  },
  async createMenu(category, name) {
    const response = await fetch(`${BASE_URL}/category/${category}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      console.error("에러가 발생했습니다.");
      // console.log(response.error);
    }
  },
};

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
    this.menuItemInfoList[
      this.currentCategory
    ] = await MenuAPI.getAllMenuByCategory(this.currentCategory);
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

    $menuList.addEventListener("click", (e) => {
      if (isContainedClass("menu-edit-button", e)) modifyMenuItem(e);
      else if (isContainedClass("menu-remove-button", e)) removeMenuItem(e);
      else if (isContainedClass("menu-sold-out-button", e)) {
        const $listItem = e.target.closest("li");
        const menuId = $listItem.dataset.id;
        let soldOut = this.menuItemInfoList[this.currentCategory][menuId]
          .soldOut;
        this.menuItemInfoList[this.currentCategory][menuId].soldOut = !soldOut;
        setLocalStorage();
      }
    });

    $categoryNav.addEventListener("click", async (e) => {
      if (isContainedClass("cafe-category-name", e)) {
        this.currentCategory = e.target.dataset.categoryName;
        $menuTitle.innerText = `${e.target.innerText} 메뉴 관리`;
        await fetch(`${BASE_URL}/category/${this.currentCategory}/menu`)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            this.menuItemInfoList[this.currentCategory] = data;
          });
        render();
      }
    });
  };

  const render = () => {
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
      (item) => item.menuName === newMenuName
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

    // add menu
    await MenuAPI.createMenu(this.currentCategory, $menuNameInput.value);
    // await fetch(`${BASE_URL}/category/${this.currentCategory}/menu`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ name: $menuNameInput.value }),
    // })
    //   .then((response) => {
    //     return response.json();
    //   })
    //   .then((data) => {
    //     console.log(data);
    //   });

    this.menuItemInfoList[
      this.currentCategory
    ] = await MenuAPI.getAllMenuByCategory(this.currentCategory);
    render();
  };

  const modifyMenuItem = (e) => {
    const $listItem = e.target.closest("li");
    const $menuName = $listItem.querySelector(".menu-name");
    const newMenuName = prompt(
      MESSAGE.CHECK_MODIFY,
      $menuName.textContent
    ).trim();

    if (isduplicatedMenuName(newMenuName)) {
      alert(MESSAGE.ALREADY_EXIST);
    } else if (newMenuName.trim() === "") {
      alert(MESSAGE.WARN_BLANK);
    } else if (newMenuName !== null) {
      this.menuItemInfoList[this.currentCategory][
        $listItem.dataset.id
      ].menuName = newMenuName;
      setLocalStorage();
    }
  };

  const removeMenuItem = (e) => {
    const $listItem = e.target.closest("li");
    if (confirm(MESSAGE.CHECK_REMOVE)) {
      this.menuItemInfoList[this.currentCategory].splice(
        $listItem.dataset.id,
        1
      );
      setLocalStorage();
    }
  };
}

const app = new App();
app.init();
