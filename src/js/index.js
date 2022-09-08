import { biomeData } from "./biomeData.js";
import { enemyTypes } from "./enemyTypes.js";

const style = getComputedStyle(document.documentElement);
const rows = Number(style.getPropertyValue("--rows"));
const cols = Number(style.getPropertyValue("--cols"));
const startHealth = 10;
const numberOfEnemies = 10;
const playerQuery = "[data-is-player='true']";
const enemyQuery = "[data-is-enemy='true']";
const treasureQuery = "[data-is-treasure='true']";
let helpScreenVisible = false;
let paused = false;

let currentEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

const canMove = (key) => {
  const currentCoords = getPlayerCoords();
  const next = getNextCoords(key, currentCoords);
  const isBlocked = lookupBiomeDataAtElement(getElementFromCoords(next))
    .isBlocking;
  const inMapBounds =
    next[0] >= 0 && next[0] < cols && next[1] >= 0 && next[1] < rows;
  return inMapBounds && !isBlocked && !paused
};

const isVictory = (currCoords) => {
  const treasureCoords = getCoordsFromElement(
    document.querySelector(treasureQuery)
  );
  return isArrayEqual(currCoords, treasureCoords);
};

const checkEnemyCollision = () => {
  if (document.querySelectorAll(`${playerQuery}${enemyQuery}`).length > 0) {
    setPlayerHealth(0);
    clearInterval(checkForResting);
    clearInterval(countdownToDeath);
  }
};

const checkValidKeys = (event) => {
  const movementKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  const menuKeys = ["r", "R", "?", "Escape"];
  if (movementKeys.includes(event.key)) {
    event.preventDefault();
    canMove(event.key) ? setPlayerCoords(getNextCoords(event.key)) : null;
  } else if (menuKeys.includes(event.key)) {
    if (event.key == "Escape") {
      if (helpScreenVisible) {
        paused = false
        hideHelpText()
      } else {
        paused = true
        showHelpText()      
      }
    } 
    if (["r", "R"].includes(event.key)) {
      reset();
    }
  }
};

const checkForResting = setInterval(() => {
  if (getPlayerElement().dataset.biomeName === "campsite" && !paused) {
    const health = getPlayerHealth();
    health < 10 ? setPlayerHealth(health + 1) : setPlayerHealth(health);
  }
}, 500);

const createListeners = () => {
  document.addEventListener("keyup", () => {
    checkValidKeys(event);
  });
  window.addEventListener("resize", () => scrollToPlayer());
};

const decorateBiomes = () => {
  Object.keys(biomeData).forEach((biome) => {
    const cells = document.querySelectorAll(`[data-biome-name="${biome}"]`);
    cells.forEach((cell, i) => {
      const rIndex = Math.round(
        Math.random() * (biomeData[`${biome}`].decorations.length - 1)
      );
      if (Math.random() <= biomeData[`${biome}`].decorationChance) {
        const decorationClass = `${biome}${rIndex}`;
        cell.classList.add(decorationClass);
      }
    });
  });
};

const decrementHealth = () => {
  if(!paused){
    const currHealth = getElementFromCoords(getPlayerCoords()).dataset.health;
    currHealth > 0 ? setPlayerHealth(currHealth - 1) : null;
  }
};

const getCoordsFromElement = (ele) => {
  return [Number(ele.dataset.col), Number(ele.dataset.row)];
};

const getPlayerCoords = () => {
  return getCoordsFromElement(document.querySelector(playerQuery));
};

const getPlayerElement = () => {
  return getElementFromCoords(getPlayerCoords());
};

const getElementFromCoords = (coords) => {
  return document.querySelector(
    `[data-col="${coords[0]}"][data-row="${coords[1]}"]`
  );
};

const getNextCoords = (key) => {
  let nextCoords;
  const cur = getPlayerCoords();
  switch (key) {
    case "ArrowUp":
      nextCoords = [cur[0], cur[1] - 1];
      break;
    case "ArrowDown":
      nextCoords = [cur[0], cur[1] + 1];
      break;
    case "ArrowLeft":
      nextCoords = [cur[0] - 1, cur[1]];
      break;
    case "ArrowRight":
      nextCoords = [cur[0] + 1, cur[1]];
      break;
  }
  return nextCoords;
};

const getPlayerHealth = () => {
  const cur = getPlayerElement();
  return Number(getPlayerElement().dataset.health);
};

const getRandomCoords = () => {
  return [
    Math.floor(Math.random() * (cols - 1)),
    Math.floor(Math.random() * (rows - 1)),
  ];
};

const getRandomPerimeterCoords = () => {
  let coords = getRandomCoords();
  let side = Math.round(Math.random() * 3);
  switch (side) {
    case 0: // top
      coords = [coords[0], 1];
      break;
    case 1: // right
      coords = [cols - 1, coords[1]];
      break;
    case 2: // bottom
      coords = [coords[0], rows - 1];
      break;
    case 3: // left
      coords = [1, coords[1]];
      break;
  }
  return coords;
};

const getWeightedRandom = (weights) => {
  // DND style random table! Weights are thought of as, e.g. 00-10, 11-50, 51-99,
  // and the random() is like d100
  let sum = 0,
    r = Math.random();
  for (let i in weights) {
    sum += weights[i];
    if (r <= sum) return i;
  }
};

const isArrayEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const reset = () => window.location.reload();

const setPlayerCoords = (nextCoords) => {
  const currCoords = getPlayerCoords();
  if (
    document.querySelector(playerQuery).dataset.health <= 0 ||
    isVictory(currCoords)
  )
    return;
  getElementFromCoords(currCoords).dataset.isPlayer = "false";
  getElementFromCoords(nextCoords).dataset.isPlayer = "true";
  setPlayerHealth(getElementFromCoords(currCoords).dataset.health);
  scrollToPlayer();
  checkEnemyCollision();
  if (isVictory(nextCoords)) {
    clearInterval(countdownToDeath);
  }
};

const setPlayerHealth = (health) => {
  const coords = getPlayerCoords();
  getElementFromCoords(coords).dataset.health = health;
  health <= 0 ? (getPlayerElement().dataset.isDead = "true") : null;
};

const setPlayerStartConditions = () => {
  const colMiddle = Math.round(cols / 2);
  const rowMiddle = Math.round(rows / 2);
  const startLocation = document.querySelector(
    `[data-col='${colMiddle}'][data-row='${rowMiddle}']`
  );
  startLocation.dataset.isPlayer = "true";
  startLocation.dataset.health = startHealth;
};

const setTreasureLocation = () => {
  const playerLocation = getPlayerCoords();
  const randomCoords = getRandomPerimeterCoords();
  const el = getElementFromCoords(randomCoords);
  el.dataset.isTreasure = "true";
  el.dataset.biomeName = "forest";
};

const scrollToPlayer = () => {
  const player = document
    .querySelector(playerQuery)
    .scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
};

const lookupBiomeDataAtElement = (el) => {
  return biomeData[el.dataset.biomeName];
};

const moveEnemies = () => {
  if(!paused){
    const playerCoords = getPlayerCoords();
    const enemies = document.querySelectorAll(enemyQuery);
    const moveEnemyTo = (enemy, coords, direction) => {
      const nextEnemyElement = getElementFromCoords(coords);
      enemy.removeAttribute("data-is-enemy");
      enemy.removeAttribute("data-enemy-type");
      nextEnemyElement.dataset.isEnemy = "true";
      nextEnemyElement.dataset.enemyType = currentEnemy;
      nextEnemyElement.dataset.direction = direction;
      checkEnemyCollision();
    };
    enemies.forEach((enemy) => {
      const enemyCoords = getCoordsFromElement(enemy);
      let coords = [];
      let direction = "right";
      if (!isArrayEqual(enemyCoords, playerCoords)) {
        if (playerCoords[0] > enemyCoords[0]) {
          coords[0] = enemyCoords[0] + 1;
          direction = "right";
        } else if (playerCoords[0] < enemyCoords[0]) {
          coords[0] = enemyCoords[0] - 1;
          direction = "left";
        } else {
          coords[0] = enemyCoords[0];
          direction = "direction";
        }
        if (playerCoords[1] > enemyCoords[1]) {
          coords[1] = enemyCoords[1] + 1;
        } else if (playerCoords[1] < enemyCoords[1]) {
          coords[1] = enemyCoords[1] - 1;
        } else {
          coords[1] = enemyCoords[1];
        }
        moveEnemyTo(enemy, coords, direction);
      }
    });
  
  }
};

const populateBiomes = () => {
  const weights = Object.keys(biomeData).map(
    (biome) => biomeData[biome].weight
  );
  const biomes = Object.keys(biomeData);
  const map = [];
  for (let i = 0; i < rows; i++) {
    map.push(
      Array.from({ length: cols }, () =>
        Math.floor(Math.random() * biomes.length)
      )
    );
  }
  map.forEach((row, ri) => {
    row.forEach((col, ci) => {
      const cell = document.createElement("div");
      const biomeName = biomes[Number(getWeightedRandom(weights))];
      cell.classList.add("biome");
      cell.dataset.biomeName = biomeName;
      cell.dataset.col = ci;
      cell.dataset.row = ri;
      document.getElementById("map").appendChild(cell);
    });
  });
};

const populateEnemies = () => {
  // todo: ensure same number of enemies when there's a collision with player. currently if the 
  // coordinates intersect with the player, we just move on to the next wolf
  const playerElement = document.querySelector(playerQuery);
  for (let i = 0; i < numberOfEnemies; i++) {
    const randomCoords = getRandomCoords();
    if (!isArrayEqual(randomCoords, getCoordsFromElement(playerElement))) {
      let ds = getElementFromCoords(randomCoords).dataset;
      ds.isEnemy = "true";
      ds.enemyType = currentEnemy;
    }
  }
};

const setupCampsites = () => {
  const campsiteEl = getPlayerElement();
  campsiteEl.dataset.biomeName = "campsite";
  campsiteEl.classList = "";
  campsiteEl.classList.add("biome", "campsite");
};

const setupMap = () => {
  // let map = document.createElement("div");
  // map.setAttribute("id", "map");
  // document.body.appendChild(map);
};

const startCountdownToDeath = () => {
  if (!paused){
    let countdownToDeath = setInterval(() => {
      decrementHealth();
      moveEnemies();
      if (isPlayerDead()) {
        clearInterval(countdownToDeath);
      }
    }, 2000);  
  }
};

const isPlayerDead = () => {
  const player = getPlayerElement();
  const isExhausted = Number(player.dataset.health) <= 0;
  const isMauled =
    player.dataset.isPlayer === "true" && player.dataset.isEnemy === "true";
  return isExhausted || isMauled;
};

const showHelpText = () => {
  helpScreenVisible = true;
  paused = true
  document.querySelector("#help").classList.add("shown")
}
const hideHelpText = () => {
  helpScreenVisible = false 
  paused = false
  document.querySelector("#help").classList.remove("shown")
}

// init
const init = () => {
  console.clear();
  // setupMap();
  populateBiomes();
  decorateBiomes();
  setPlayerStartConditions();
  setTreasureLocation();
  scrollToPlayer();
  createListeners();
  populateEnemies();
  setupCampsites();
  startCountdownToDeath();
  showHelpText();  
};

init();
