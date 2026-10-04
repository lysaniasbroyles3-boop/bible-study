```javascript
/*
    VERSEQUEST
    Bible Study Level-Up System
*/

const verses = [
    {
        reference: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
    },
    {
        reference: "Psalm 23:1",
        text: "The LORD is my shepherd; I shall not want."
    },
    {
        reference: "Philippians 4:13",
        text: "I can do all things through Christ which strengtheneth me."
    },
    {
        reference: "Proverbs 3:5",
        text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding."
    },
    {
        reference: "Joshua 1:9",
        text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest."
    },
    {
        reference: "Psalm 119:105",
        text: "Thy word is a lamp unto my feet, and a light unto my path."
    },
    {
        reference: "Jeremiah 29:11",
        text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end."
    }
];


/* -----------------------------
   SAVED GAME DATA
----------------------------- */

let game = JSON.parse(localStorage.getItem("verseQuestGame")) || {
    xp: 0,
    versesRead: 0,
    streak: 0,
    lastRead: null,
    favorites: [],
    reflections: {},
    completedDates: []
};


/* -----------------------------
   DAILY VERSE
----------------------------- */

function getDayNumber() {
    const start = new Date("2026-01-01");
    const today = new Date();

    const difference =
        Math.floor((today - start) / 86400000);

    return Math.abs(difference);
}

function getTodayVerse() {
    return verses[getDayNumber() % verses.length];
}


/* -----------------------------
   LEVEL SYSTEM
----------------------------- */

function getLevel() {
    return Math.floor(game.xp / 100) + 1;
}

function getLevelName(level) {

    if (level >= 20) return "Bible Master";
    if (level >= 15) return "Scripture Scholar";
    if (level >= 10) return "Faith Leader";
    if (level >= 7) return "Dedicated Student";
    if (level >= 5) return "Growing Disciple";
    if (level >= 3) return "Faith Explorer";

    return "New Reader";
}


/* -----------------------------
   UPDATE INTERFACE
----------------------------- */

function updateUI() {

    const level = getLevel();
    const levelXP = game.xp % 100;
    const progress = levelXP;

    document.getElementById("levelNumber").textContent = level;
    document.getElementById("levelName").textContent =
        getLevelName(level);

    document.getElementById("totalXP").textContent =
        `${game.xp} XP`;

    document.getElementById("versesRead").textContent =
        game.versesRead;

    document.getElementById("streak").textContent =
        game.streak;

    document.getElementById("achievementCount").textContent =
        getUnlockedAchievements();

    document.getElementById("xpBadge").textContent =
        `${game.xp} XP`;

    document.getElementById("currentLevelText").textContent =
        `Level ${level}`;

    document.getElementById("nextLevelText").textContent =
        `${levelXP} / 100 XP`;

    document.getElementById("xpProgress").style.width =
        `${progress}%`;


    // Progress page

    document.getElementById("bigLevel").textContent =
        level;

    document.getElementById("bigLevelName").textContent =
        getLevelName(level);

    document.getElementById("bigXPProgress").style.width =
        `${progress}%`;

    document.getElementById("bigXPText").textContent =
        `${levelXP} / 100 XP`;

    document.getElementById("progressXP").textContent =
        game.xp;

    document.getElementById("progressVerses").textContent =
        game.versesRead;

    document.getElementById("progressStreak").textContent =
        game.streak;

    updateAchievements();
    updateFavoriteButton();
}


/* -----------------------------
   DAILY VERSE
----------------------------- */

function loadVerse() {

    const verse = getTodayVerse();

    document.getElementById("verseReference").textContent =
        verse.reference;

    document.getElementById("verseText").textContent =
        verse.text;

    document.getElementById("verseDate").textContent =
        new Date().toLocaleDateString();

    const today = getDateKey();

    const completed =
        game.completedDates.includes(today);

    const button =
        document.getElementById("completeButton");

    if (completed) {

        button.textContent = "✓ Study Completed";

        button.classList.add("completed");

        button.disabled = true;

    } else {

        button.textContent =
            "✓ Complete Today's Study";

        button.classList.remove("completed");

        button.disabled = false;
    }

    document.getElementById("reflection").value =
        game.reflections[today] || "";
}


/* -----------------------------
   COMPLETE STUDY
----------------------------- */

document
    .getElementById("completeButton")
    .addEventListener("click", completeStudy);


function completeStudy() {

    const today = getDateKey();

    if (game.completedDates.includes(today)) {
        return;
    }

    const oldLevel = getLevel();

    game.xp += 25;

    game.versesRead++;

    updateStreak();

    game.completedDates.push(today);

    saveGame();

    const newLevel = getLevel();

    if (newLevel > oldLevel) {

        alert(
            `🎉 LEVEL UP!\n\nYou reached Level ${newLevel}!\n\n${getLevelName(newLevel)}`
        );
    } else {

        alert("📖 Daily study complete!\n\n+25 XP");
    }

    loadVerse();

    updateUI();
}


/* -----------------------------
   STREAK
----------------------------- */

function updateStreak() {

    const today = getDateKey();

    if (!game.lastRead) {

        game.streak = 1;

    } else {

        const yesterday =
            getDateKey(-1);

        if (game.lastRead === yesterday) {

            game.streak++;

        } else if (game.lastRead !== today) {

            game.streak = 1;
        }
    }

    game.lastRead = today;
}


/* -----------------------------
   DATE
----------------------------- */

function getDateKey(offset = 0) {

    const date = new Date();

    date.setDate(date.getDate() + offset);

    return date.toISOString().split("T")[0];
}


/* -----------------------------
   FAVORITES
----------------------------- */

document
    .getElementById("favoriteButton")
    .addEventListener("click", toggleFavorite);


function toggleFavorite() {

    const verse = getTodayVerse();

    const exists =
        game.favorites.some(
            item => item.reference === verse.reference
        );

    if (exists) {

        game.favorites =
            game.favorites.filter(
                item => item.reference !== verse.reference
            );

    } else {

        game.favorites.push(verse);
    }

    saveGame();

    updateFavoriteButton();

    renderFavorites();
}


function updateFavoriteButton() {

    const verse = getTodayVerse();

    const exists =
        game.favorites.some(
            item => item.reference === verse.reference
        );

    const button =
        document.getElementById("favoriteButton");

    button.classList.toggle("favorite", exists);

    button.textContent =
        exists ? "♥" : "♡";
}


/* -----------------------------
   REFLECTION
----------------------------- */

document
    .getElementById("saveReflection")
    .addEventListener("click", () => {

        const today = getDateKey();

        game.reflections[today] =
            document.getElementById("reflection").value;

        saveGame();

        const message =
            document.getElementById("savedMessage");

        message.textContent = "Saved ✓";

        setTimeout(() => {
            message.textContent = "";
        }, 2000);
    });


/* -----------------------------
   ACHIEVEMENTS
----------------------------- */

const achievements = [

    {
        icon: "🌱",
        title: "First Step",
        description: "Read your first verse.",
        check: () => game.versesRead >= 1
    },

    {
        icon: "🔥",
        title: "7-Day Streak",
        description: "Study for 7 days in a row.",
        check: () => game.streak >= 7
    },

    {
        icon: "📖",
        title: "Bookworm",
        description: "Read 10 verses.",
        check: () => game.versesRead >= 10
    },

    {
        icon: "⭐",
        title: "XP Hunter",
        description: "Earn 100 XP.",
        check: () => game.xp >= 100
    },

    {
        icon: "🏆",
        title: "Faith Builder",
        description: "Reach Level 5.",
        check: () => getLevel() >= 5
    },

    {
        icon: "👑",
        title: "Bible Master",
        description: "Reach Level 20.",
        check: () => getLevel() >= 20
    }
];


function updateAchievements() {

    const container =
        document.getElementById("achievementGrid");

    container.innerHTML = "";

    achievements.forEach(achievement => {

        const unlocked =
            achievement.check();

        const card =
            document.createElement("div");

        card.className =
            "achievement" +
            (unlocked ? " unlocked" : "");

        card.innerHTML = `
            <div class="achievement-icon">
                ${achievement.icon}
            </div>

            <h3>${achievement.title}</h3>

            <p>${achievement.description}</p>

            <p style="margin-top:10px;font-weight:700;">
                ${unlocked ? "✓ Unlocked" : "🔒 Locked"}
            </p>
        `;

        container.appendChild(card);
    });
}


function getUnlockedAchievements() {

    return achievements.filter(
        achievement => achievement.check()
    ).length;
}


/* -----------------------------
   FAVORITES PAGE
----------------------------- */

function renderFavorites() {

    const container =
        document.getElementById("favoritesList");

    container.innerHTML = "";

    if (game.favorites.length === 0) {

        container.innerHTML = `
            <div class="favorite-item">
                <h3>No favorites yet</h3>
                <p>
                    Tap the ♡ button on a verse to save it here.
                </p>
            </div>
        `;

        return;
    }

    game.favorites.forEach(verse => {

        const item =
            document.createElement("div");

        item.className = "favorite-item";

        item.innerHTML = `
            <h3>${verse.reference}</h3>
            <p>“${verse.text}”</p>
        `;

        container.appendChild(item);
    });
}


/* -----------------------------
   NAVIGATION
----------------------------- */

document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            const target =
                button.dataset.section;

            document
                .querySelectorAll(".section")
                .forEach(section => {

                    section.classList.remove(
                        "active-section"
                    );
                });

            document
                .getElementById(target)
                .classList.add(
                    "active-section"
                );

            document
                .querySelectorAll(".nav-btn")
                .forEach(btn => {

                    btn.classList.remove("active");

                });

            button.classList.add("active");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });


/* -----------------------------
   DARK MODE
----------------------------- */

document
    .getElementById("themeButton")
    .addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const dark =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "verseQuestDarkMode",
            dark
        );

        document.getElementById("themeButton")
            .textContent = dark ? "☀️" : "🌙";
    });


if (
    localStorage.getItem("verseQuestDarkMode") === "true"
) {

    document.body.classList.add("dark");

    document.getElementById("themeButton")
        .textContent = "☀️";
}


/* -----------------------------
   SAVE
----------------------------- */

function saveGame() {

    localStorage.setItem(
        "verseQuestGame",
        JSON.stringify(game)
    );
}


/* -----------------------------
   START APP
----------------------------- */

loadVerse();
updateUI();
renderFavorites();
```
