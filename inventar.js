const STORAGE_KEY = "gameState";
const LEGACY_STORAGE_KEY = "escapeExeInventar";

const INITIAL_STATE = {
  inventory: ["Debug-Lupe"],
  activeItem: null,
  world: {
    terminalAOk: false,
    terminalBOk: false,
    terminalCOk: false,
    bootDone: false,
    kabelDone: false,
    archivDone: false,
    cpuCableConnected: false,
    energyChipTaken: false,
    cpuDone: false,
    firewallHintFound: false,
    firewallDone: false,
    usbDone: false,
    usbStickInserted: false,
    energyChipActivated: false,
    exitConfirmed: false,
  },
};

const state = structuredClone(INITIAL_STATE);

function stateZuruecksetzen() {
  state.inventory = [...INITIAL_STATE.inventory];
  state.activeItem = INITIAL_STATE.activeItem;
  state.world = { ...INITIAL_STATE.world };
}

const gegenstaende = {
  "Debug-Lupe": {
    bild: "bilder/items/debug-lupe.png",
  },
  "Stromleiter-Kabel": {
    bild: "bilder/items/kabel.png",
  },
  Energiechip: {
    bild: "bilder/items/energiechip.png",
  },
  "Fragment 1": {
    bild: "bilder/items/fragment1.png",
    raumId: "item-fragment1",
  },
  "Fragment 2": {
    bild: "bilder/items/fragment2.png",
    raumId: "item-fragment2",
  },
  "Fragment 3": {
    bild: "bilder/items/fragment3.png",
    raumId: "item-fragment3",
  },
  "Fragment 4": {
    bild: "bilder/items/fragment4.png",
    raumId: "item-fragment4",
  },
  "Reparierte Datei": {
    bild: "bilder/items/passwort.png",
  },
  "Speicher-Stick": {
    bild: "bilder/items/speicher_stick.png",
    raumId: "item-speicherstick",
  },
  "Admin-Schlüssel": {
    bild: "bilder/items/admin.png",
    raumId: "item-adminkey",
  },
};

const inventarReihenfolge = Object.keys(gegenstaende);
const fragmentNamen = [
  "Fragment 1",
  "Fragment 2",
  "Fragment 3",
  "Fragment 4",
];

const alteInventarNamen = {
  debugLupe: "Debug-Lupe",
  stromleiterKabel: "Stromleiter-Kabel",
  energiechip: "Energiechip",
  fragment1: "Fragment 1",
  fragment2: "Fragment 2",
  fragment3: "Fragment 3",
  fragment4: "Fragment 4",
  reparierteDatei: "Reparierte Datei",
  speicherstick: "Speicher-Stick",
  adminSchluessel: "Admin-Schlüssel",
};

const raumStatus = {
  1: "bootDone",
  2: "kabelDone",
  3: "archivDone",
  4: "cpuDone",
  5: "firewallDone",
  6: "usbDone",
};

function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const geladenerState = JSON.parse(saved);
      state.inventory = Array.isArray(geladenerState.inventory)
        ? geladenerState.inventory
        : [];
      state.activeItem = geladenerState.activeItem ?? null;
      state.world = {
        ...INITIAL_STATE.world,
        ...(geladenerState.world || {}),
      };
    } catch {
      stateZuruecksetzen();
    }
  } else {
    const altesInventar = localStorage.getItem(LEGACY_STORAGE_KEY);

    try {
      const alteDaten = altesInventar ? JSON.parse(altesInventar) : [];
      state.inventory = Array.isArray(alteDaten)
        ? alteDaten.map((item) => alteInventarNamen[item] || item)
        : [...INITIAL_STATE.inventory];
      state.activeItem = null;
      state.world = { ...INITIAL_STATE.world };
    } catch {
      stateZuruecksetzen();
    }
  }

  state.inventory = Array.isArray(state.inventory)
    ? [...new Set(state.inventory.filter((item) => gegenstaende[item]))]
    : [];

  if (!state.inventory.includes("Debug-Lupe")) {
    state.inventory.unshift("Debug-Lupe");
  }

  if (state.world.energyChipInserted) {
    state.world.energyChipTaken = true;
  }

  if (state.world.cpuDone) {
    state.world.cpuCableConnected = true;
    state.world.energyChipTaken = true;
  }

  if (state.world.cpuCableConnected) {
    state.inventory = state.inventory.filter(
      (itemName) => itemName !== "Stromleiter-Kabel",
    );
  }

  if (
    state.world.energyChipTaken &&
    !state.inventory.includes("Energiechip")
  ) {
    state.inventory.push("Energiechip");
  }

  if (state.world.usbDone) {
    state.world.usbStickInserted = true;
    state.world.energyChipActivated = true;
    state.world.exitConfirmed = true;
  }

  if (!state.inventory.includes(state.activeItem)) {
    state.activeItem = null;
  }

  if (state.world.bootDone) {
    state.world.terminalAOk = true;
    state.world.terminalBOk = true;
    state.world.terminalCOk = true;
  }

  saveGame();
}

function inventarAuffuellen(tabellenKoerper) {
  const benoetigteLeerzeilen = Math.max(0, 5 - state.inventory.length);

  for (let i = 0; i < benoetigteLeerzeilen; i += 1) {
    const leerzeile = document.createElement("tr");
    leerzeile.className = "inv-leer";
    leerzeile.setAttribute("aria-hidden", "true");
    leerzeile.innerHTML = "<td></td><td>–</td>";
    tabellenKoerper.appendChild(leerzeile);
  }
}

function itemAuswaehlen(itemName) {
  state.activeItem = itemName;
  saveGame();
  renderInventory();
}

function renderInventory() {
  const tabellenKoerper = document.querySelector("#inv-tabelle tbody");
  if (!tabellenKoerper) return;

  tabellenKoerper.replaceChildren();

  inventarReihenfolge.forEach((itemName) => {
    if (!state.inventory.includes(itemName)) return;

    const gegenstand = gegenstaende[itemName];
    const zeile = document.createElement("tr");
    zeile.classList.toggle("aktiv", state.activeItem === itemName);
    zeile.dataset.itemName = itemName;
    zeile.tabIndex = 0;
    zeile.setAttribute("role", "button");
    zeile.setAttribute("aria-pressed", String(state.activeItem === itemName));
    zeile.innerHTML = `
      <td><img src="${gegenstand.bild}" alt="${itemName}"></td>
      <td>${itemName}</td>
    `;
    zeile.addEventListener("click", () => itemAuswaehlen(itemName));
    zeile.addEventListener("keydown", (ereignis) => {
      if (ereignis.key !== "Enter" && ereignis.key !== " ") return;
      ereignis.preventDefault();
      itemAuswaehlen(itemName);
    });
    tabellenKoerper.appendChild(zeile);
  });

  inventarAuffuellen(tabellenKoerper);
}

function gegenstandHinzufuegen(itemName) {
  if (!gegenstaende[itemName] || state.inventory.includes(itemName)) {
    return false;
  }

  state.inventory.push(itemName);
  renderInventory();
  saveGame();
  return true;
}

function raumobjektBereitsEingesammelt(itemName) {
  const fragmentWurdeRepariert =
    fragmentNamen.includes(itemName) &&
    (state.inventory.includes("Reparierte Datei") || state.world.archivDone);

  return (
    state.inventory.includes(itemName) || fragmentWurdeRepariert
  );
}

function gesammelteRaumobjekteAusblenden() {
  Object.entries(gegenstaende).forEach(([itemName, gegenstand]) => {
    if (gegenstand.raumId && raumobjektBereitsEingesammelt(itemName)) {
      document.getElementById(gegenstand.raumId)?.remove();
    }
  });
}

function scrollbarEinrichten() {
  const tabelle = document.querySelector("#inv-tabelle");
  if (!tabelle || tabelle.parentElement?.classList.contains("inventar-scroll")) {
    return;
  }

  const scrollBereich = document.createElement("div");
  scrollBereich.className = "inventar-scroll";
  tabelle.parentNode.insertBefore(scrollBereich, tabelle);
  scrollBereich.appendChild(tabelle);
}

function aktuellerRaum() {
  const klasse = Array.from(document.body.classList).find((name) =>
    /^raum[1-6]$/.test(name),
  );
  return klasse ? Number(klasse.replace("raum", "")) : null;
}

function raumIstFreigeschaltet(raumNummer) {
  if (raumNummer === 1) return true;
  if (raumNummer === 2) return state.world.bootDone;
  if (raumNummer === 3) return state.world.kabelDone;
  if (raumNummer === 4) return state.world.kabelDone;
  if (raumNummer === 5) {
    return state.world.archivDone && state.world.cpuDone;
  }
  if (raumNummer === 6) return state.world.firewallDone;
  return false;
}

let resetModalVorherigerFokus = null;

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  stateZuruecksetzen();
  window.location.href = "raum1.html";
}

function openResetModal() {
  const overlay = document.querySelector("#reset-overlay");
  const spielContainer = document.querySelector("#spiel-container");
  if (!overlay) return;

  resetModalVorherigerFokus = document.activeElement;
  overlay.hidden = false;
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("reset-modal-offen");
  spielContainer?.setAttribute("inert", "");
  document.querySelector("#btn-reset-cancel")?.focus();
}

function closeResetModal() {
  const overlay = document.querySelector("#reset-overlay");
  const spielContainer = document.querySelector("#spiel-container");
  if (!overlay || overlay.hidden) return;

  overlay.hidden = true;
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reset-modal-offen");
  spielContainer?.removeAttribute("inert");
  resetModalVorherigerFokus?.focus();
}

function resetModalErstellen() {
  if (document.querySelector("#reset-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "reset-overlay";
  overlay.hidden = true;
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <section
      id="reset-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-title"
      aria-describedby="reset-text"
    >
      <div class="reset-modal-kopf">
        <span aria-hidden="true">⚠</span>
        <h2 id="reset-title">SYSROOT</h2>
      </div>
      <div id="reset-text" class="reset-text">
        <p>Achtung.</p>
        <p>Ein Neustart des Systems löscht:</p>
        <ul>
          <li>Inventar</li>
          <li>Spielstand</li>
          <li>Freigeschaltete Bereiche</li>
        </ul>
        <p>Fortfahren?</p>
      </div>
      <div class="reset-modal-aktionen">
        <button id="btn-reset-confirm" type="button">
          SYSTEM NEUSTARTEN
        </button>
        <button id="btn-reset-cancel" type="button">ABBRECHEN</button>
      </div>
    </section>
  `;

  document.body.appendChild(overlay);
  document
    .querySelector("#btn-reset-confirm")
    ?.addEventListener("click", resetGame);
  document
    .querySelector("#btn-reset-cancel")
    ?.addEventListener("click", closeResetModal);

  overlay.addEventListener("keydown", (ereignis) => {
    if (ereignis.key === "Escape") {
      closeResetModal();
      return;
    }

    if (ereignis.key !== "Tab") return;

    const fokusElemente = Array.from(
      overlay.querySelectorAll("button:not(:disabled)"),
    );
    const erstesElement = fokusElemente[0];
    const letztesElement = fokusElemente.at(-1);

    if (ereignis.shiftKey && document.activeElement === erstesElement) {
      ereignis.preventDefault();
      letztesElement?.focus();
    } else if (
      !ereignis.shiftKey &&
      document.activeElement === letztesElement
    ) {
      ereignis.preventDefault();
      erstesElement?.focus();
    }
  });
}

function neuesSpielEinrichten() {
  resetModalErstellen();

  const neuesSpielButton = Array.from(
    document.querySelectorAll("button"),
  ).find((button) => button.textContent.trim() === "Neues Spiel");

  neuesSpielButton?.addEventListener("click", openResetModal);
}

function updateMiniMap() {
  const miniMap = document.querySelector("#mini-map");
  if (!miniMap) return;

  const aktiverRaum = aktuellerRaum();
  const raumBoxen = Array.from(miniMap.querySelectorAll(".map-box"));

  raumBoxen.forEach((box) => {
    const nummerText = box.querySelector(".map-box-nr")?.textContent || "";
    const treffer = nummerText.match(/Raum\s+([1-6])/);
    if (!treffer) return;

    const raumNummer = Number(treffer[1]);
    const istAktiv = raumNummer === aktiverRaum;
    const istFrei = raumIstFreigeschaltet(raumNummer);
    const istFertig = state.world[raumStatus[raumNummer]];
    const neueBox = document.createElement(
      istAktiv || istFrei ? "a" : "div",
    );

    neueBox.className = `map-box ${
      istAktiv ? "aktiv" : istFrei ? "erreichbar" : "gesperrt"
    }`;
    neueBox.setAttribute("style", box.getAttribute("style") || "");

    if (istAktiv || istFrei) {
      neueBox.href = `raum${raumNummer}.html`;
    }

    const raumName =
      box.querySelector(".map-box-name")?.textContent?.trim() || "";
    neueBox.innerHTML = `
      <span class="map-box-nr">Raum ${raumNummer}${istFertig ? " ✓" : ""}</span>
      <span class="map-box-name">${raumName}</span>
      ${!istAktiv && !istFrei ? '<span class="map-lock">🔒</span>' : ""}
    `;
    box.replaceWith(neueBox);
  });
}

function raumAbschliessen(flag) {
  if (!Object.hasOwn(state.world, flag) || state.world[flag]) return;
  state.world[flag] = true;
  saveGame();
  updateMiniMap();
}

function checkGameState() {
  if (!document.body.classList.contains("raum6")) return;

  const bildbereich = document.querySelector("#bildbereich");
  const abschlussText = document.querySelector("#usb-abschluss-text");
  const stickButton = document.querySelector("#btn-usb-stick");
  const energieButton = document.querySelector("#btn-energiechip");
  const ausgangButton = document.querySelector("#btn-ausgang");
  const meldung = document.querySelector("#meldung");

  if (stickButton) {
    stickButton.disabled = state.world.usbStickInserted;
    stickButton.textContent = state.world.usbStickInserted
      ? "✓ Speicher-Stick eingesetzt"
      : "Speicher-Stick einsetzen";
  }

  if (energieButton) {
    energieButton.disabled = state.world.energyChipActivated;
    energieButton.textContent = state.world.energyChipActivated
      ? "✓ Energiechip aktiviert"
      : "Energiechip aktivieren";
  }

  if (ausgangButton) {
    ausgangButton.disabled = state.world.usbDone;
    ausgangButton.textContent = state.world.usbDone
      ? "✓ Ausgang geöffnet"
      : "Ausgang bestätigen";
  }

  const spielAbgeschlossen =
    state.world.usbStickInserted &&
    state.world.energyChipActivated &&
    state.world.exitConfirmed;

  if (spielAbgeschlossen) {
    state.world.usbDone = true;
    bildbereich?.classList.add("usb-aktiv");
    if (abschlussText) abschlussText.hidden = false;
    if (meldung) {
      meldung.className = "erfolg";
      meldung.textContent = "SYSTEM RESTORED. GOODBYE.";
    }
    saveGame();
    updateMiniMap();
  }
}

function raum6Einrichten() {
  if (!document.body.classList.contains("raum6")) return;

  const stickButton = document.querySelector("#btn-usb-stick");
  const energieButton = document.querySelector("#btn-energiechip");
  const ausgangButton = document.querySelector("#btn-ausgang");
  const meldung = document.querySelector("#meldung");

  const meldungAnzeigen = (text, erfolgreich) => {
    if (!meldung) return;
    meldung.className = erfolgreich ? "erfolg" : "fehler";
    meldung.textContent = text;
  };

  stickButton?.addEventListener("click", () => {
    const vorhanden = state.inventory.includes("Speicher-Stick");

    if (vorhanden) {
      state.world.usbStickInserted = true;
      meldungAnzeigen("Speicher-Stick eingesetzt.", true);
    } else {
      meldungAnzeigen("Du brauchst den Speicher-Stick.", false);
    }

    saveGame();
    checkGameState();
  });

  energieButton?.addEventListener("click", () => {
    const vorhanden = state.inventory.includes("Energiechip");

    if (vorhanden) {
      state.world.energyChipActivated = true;
      meldungAnzeigen("Energiechip aktiviert.", true);
    } else {
      meldungAnzeigen("Du brauchst den Energiechip.", false);
    }

    saveGame();
    checkGameState();
  });

  ausgangButton?.addEventListener("click", () => {
    const ausgangBereit =
      state.world.usbStickInserted && state.world.energyChipActivated;

    if (ausgangBereit) {
      state.world.exitConfirmed = true;
      state.world.usbDone = true;
      meldungAnzeigen("SYSTEM RESTORED. GOODBYE.", true);
    } else {
      meldungAnzeigen("Der Ausgang ist noch nicht bereit.", false);
    }

    saveGame();
    checkGameState();
  });

  checkGameState();
}

function raum1Einrichten() {
  if (!document.body.classList.contains("raum1")) return;

  const meldung = document.querySelector("#meldung");
  const terminalFlags = {
    A: "terminalAOk",
    B: "terminalBOk",
    C: "terminalCOk",
  };

  const terminalOkAnzeigen = (terminal) => {
    const status = terminal.querySelector(".terminal-status");
    if (!status) return;

    status.className = "terminal-status ok";
    status.textContent = "\u2713 OK";
    terminal.classList.add("terminal-ok");
    terminal.disabled = true;
    terminal.setAttribute("aria-disabled", "true");
  };

  const bootSequenzAbschliessen = () => {
    const bootBalken = document.querySelector(".boot-balken");
    const bootProzent = document.querySelector(".boot-monitor strong");
    const bootLog = document.querySelector(".boot-log");

    if (bootBalken) bootBalken.style.width = "100%";
    if (bootProzent) bootProzent.textContent = "100%";
    if (bootLog) {
      bootLog.innerHTML =
        "&gt; SYSTEM INITIALISIERT...<br>&gt; BOOT SEQUENCE COMPLETED";
    }
  };

  const alleTerminalsOk = () =>
    Object.values(terminalFlags).every((flag) => state.world[flag]);

  document.querySelectorAll(".diagnose-terminal").forEach((terminal) => {
    const terminalName = terminal.dataset.terminal;
    const flag = terminalFlags[terminalName];
    if (!flag) return;

    if (state.world[flag]) {
      terminalOkAnzeigen(terminal);
      return;
    }

    terminal.addEventListener("click", () => {
      if (state.world[flag]) return;

      state.world[flag] = true;
      terminalOkAnzeigen(terminal);

      if (meldung) {
        meldung.className = "erfolg";
        meldung.textContent = `Terminal ${terminalName} wurde aktiviert.`;
      }

      if (alleTerminalsOk()) {
        state.world.bootDone = true;
        bootSequenzAbschliessen();
        updateMiniMap();
      }

      saveGame();
    });
  });

  if (alleTerminalsOk()) {
    state.world.bootDone = true;
    bootSequenzAbschliessen();
    updateMiniMap();
    saveGame();
  }
}

function raum3Einrichten() {
  if (!document.body.classList.contains("raum3")) return;

  const meldung = document.querySelector("#meldung");
  const reparierenButton = document.querySelector("#datei-reparieren");

  const meldungAnzeigen = (text, typ = "erfolg") => {
    if (!meldung) return;
    meldung.textContent = text;
    meldung.className = typ;
  };

  const reparaturFreischalten = () => {
    if (!reparierenButton) return;
    const alleFragmenteGesammelt = fragmentNamen.every((itemName) =>
      state.inventory.includes(itemName),
    );
    reparierenButton.hidden =
      !alleFragmenteGesammelt ||
      state.inventory.includes("Reparierte Datei");
  };

  const gegenstandEinsammeln = (itemName) => {
    const gegenstand = gegenstaende[itemName];

    if (raumobjektBereitsEingesammelt(itemName)) {
      document.getElementById(gegenstand.raumId)?.remove();
      return;
    }

    if (!gegenstandHinzufuegen(itemName)) return;

    document.getElementById(gegenstand.raumId)?.remove();
    meldungAnzeigen(`${itemName} eingesammelt.`);
    reparaturFreischalten();
  };

  Object.entries(gegenstaende).forEach(([itemName, gegenstand]) => {
    if (!gegenstand.raumId || raumobjektBereitsEingesammelt(itemName)) return;

    const raumObjekt = document.getElementById(gegenstand.raumId);
    raumObjekt?.addEventListener("click", () =>
      gegenstandEinsammeln(itemName),
    );
    raumObjekt?.addEventListener("keydown", (ereignis) => {
      if (ereignis.key !== "Enter" && ereignis.key !== " ") return;
      ereignis.preventDefault();
      gegenstandEinsammeln(itemName);
    });
  });

  reparierenButton?.addEventListener("click", () => {
    reparierenButton.disabled = true;
    meldungAnzeigen("Datei wird rekonstruiert...", "info");

    window.setTimeout(() => {
      state.inventory = state.inventory.filter(
        (itemName) => !fragmentNamen.includes(itemName),
      );

      if (!state.inventory.includes("Reparierte Datei")) {
        state.inventory.push("Reparierte Datei");
      }

      if (fragmentNamen.includes(state.activeItem)) {
        state.activeItem = null;
      }

      raumAbschliessen("archivDone");
      renderInventory();
      saveGame();
      reparierenButton.hidden = true;
      reparierenButton.disabled = false;
      meldungAnzeigen(
        "Datei erfolgreich repariert.\n\nZugriffscode gefunden:\n1010",
      );
    }, 1200);
  });

  reparaturFreischalten();
}

function raum2Einrichten() {
  if (!document.body.classList.contains("raum2")) return;

  const bildbereich = document.querySelector("#bildbereich");
  const kabelButtons = document.querySelectorAll(".tunnel-kabel");
  const meldung = document.querySelector("#meldung");
  const aktionsHinweis = document.querySelector("#aktionen");
  const energieStatus = document.querySelector("#energieverteiler-status span");

  const tunnelAktivAnzeigen = () => {
    bildbereich?.classList.add("tunnel-aktiv");
    if (aktionsHinweis) {
      aktionsHinweis.hidden = false;
      aktionsHinweis.textContent = "Energieversorgung wiederhergestellt.";
    }
    if (energieStatus) energieStatus.textContent = "ONLINE";
    kabelButtons.forEach((button) => {
      button.disabled = true;
      button.classList.toggle("kabel-richtig", button.dataset.kabel === "gelb");
    });
  };

  if (state.world.kabelDone) {
    tunnelAktivAnzeigen();
  }

  kabelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state.world.kabelDone) return;

      if (button.dataset.kabel !== "gelb") {
        if (meldung) {
          meldung.className = "info";
          meldung.textContent =
            button.dataset.kabel === "rot"
              ? "SYSROOT:\nKeine Energieübertragung erkannt."
              : "SYSROOT:\nSignal erkannt, aber keine Stromversorgung verfügbar.";
        }
        return;
      }

      if (!state.inventory.includes("Stromleiter-Kabel")) {
        state.inventory.push("Stromleiter-Kabel");
      }
      state.world.kabelDone = true;
      tunnelAktivAnzeigen();

      if (meldung) {
        meldung.className = "erfolg";
        meldung.textContent =
          "SYSROOT:\nStromkreis geschlossen.\nEnergieversorgung wiederhergestellt.";
      }

      renderInventory();
      saveGame();
      checkGameState();
      updateMiniMap();
    });
  });
}

function raum4Einrichten() {
  if (!document.body.classList.contains("raum4")) return;

  const bildbereich = document.querySelector("#bildbereich");
  const meldung = document.querySelector("#meldung");
  const kabelButton = document.querySelector("#btn-schritt1");
  const chipButton = document.querySelector("#btn-schritt2");
  const startButton = document.querySelector("#btn-schritt3");

  const schritteDarstellen = () => {
    if (kabelButton) {
      kabelButton.disabled = state.world.cpuCableConnected;
      kabelButton.textContent = state.world.cpuCableConnected
        ? "✓ Stromleiter-Kabel angeschlossen"
        : "1. Stromleiter-Kabel anschließen";
    }

    if (chipButton) {
      chipButton.hidden = !state.world.cpuCableConnected;
      chipButton.disabled = state.world.energyChipTaken;
      chipButton.textContent = state.world.energyChipTaken
        ? "✓ Energiechip entnommen"
        : "2. Energiechip entnehmen";
    }

    if (startButton) {
      startButton.hidden = !state.world.energyChipTaken;
      startButton.disabled = state.world.cpuDone;
      startButton.textContent = state.world.cpuDone
        ? "✓ System stabilisiert"
        : "3. System starten";
    }

    bildbereich?.classList.toggle("cpu-stabil", state.world.cpuDone);

    if (state.world.cpuDone && meldung) {
      meldung.className = "erfolg";
      meldung.textContent = "CPU-Kern stabilisiert.";
    }
  };

  kabelButton?.addEventListener("click", () => {
    if (state.world.cpuCableConnected) return;

    if (!state.inventory.includes("Stromleiter-Kabel")) {
      if (meldung) {
        meldung.className = "fehler";
        meldung.textContent =
          "SYSROOT: Kein Stromleiter-Kabel gefunden. Verbindung fehlgeschlagen.";
      }
      return;
    }

    state.inventory = state.inventory.filter(
      (itemName) => itemName !== "Stromleiter-Kabel",
    );
    if (state.activeItem === "Stromleiter-Kabel") {
      state.activeItem = null;
    }
    state.world.cpuCableConnected = true;
    if (meldung) {
      meldung.className = "erfolg";
      meldung.textContent =
        "Stromleiter-Kabel angeschlossen. Energiefluss stabilisiert.";
    }
    schritteDarstellen();
    renderInventory();
    saveGame();
    checkGameState();
  });

  chipButton?.addEventListener("click", () => {
    if (state.world.energyChipTaken) return;

    if (!state.world.cpuCableConnected) {
      if (meldung) {
        meldung.className = "fehler";
        meldung.textContent =
          "SYSROOT: Energiechip nicht erreichbar. Verbinde zuerst das Stromleiter-Kabel.";
      }
      return;
    }

    gegenstandHinzufuegen("Energiechip");
    state.world.energyChipTaken = true;
    if (meldung) {
      meldung.className = "erfolg";
      meldung.textContent =
        "Energiechip entnommen und ins Inventar gelegt.";
    }
    schritteDarstellen();
    renderInventory();
    saveGame();
    checkGameState();
  });

  startButton?.addEventListener("click", () => {
    if (state.world.cpuDone) return;

    const reparaturVollstaendig =
      state.world.cpuCableConnected && state.world.energyChipTaken;

    if (!reparaturVollstaendig) {
      if (meldung) {
        meldung.className = "fehler";
        meldung.textContent =
          "SYSROOT: Startsequenz blockiert. Reparatur unvollständig.";
      }
      return;
    }

    state.world.cpuDone = true;
    if (meldung) {
      meldung.className = "erfolg";
      meldung.textContent =
        "CPU-Kern stabilisiert. Systemleistung wiederhergestellt.";
    }
    schritteDarstellen();
    renderInventory();
    saveGame();
    checkGameState();
    updateMiniMap();
  });

  schritteDarstellen();
}

function raum5Einrichten() {
  if (!document.body.classList.contains("raum5")) return;

  const bildbereich = document.querySelector("#bildbereich");
  const lupeButton = document.querySelector("#btn-debug-lupe");
  const codeEingabe = document.querySelector("#code-input");
  const bestaetigenButton = document.querySelector("#btn-bestaetigen");
  const meldung = document.querySelector("#meldung");

  const meldungAnzeigen = (text, typ) => {
    if (!meldung) return;
    meldung.className = typ;
    meldung.textContent = text;
  };

  const firewallStatusDarstellen = () => {
    const istOffen = state.world.firewallDone;
    bildbereich?.classList.toggle("firewall-offen", istOffen);

    if (lupeButton) {
      lupeButton.disabled = istOffen || state.world.firewallHintFound;
      lupeButton.textContent = state.world.firewallHintFound
        ? "\u2713 Debug-Lupe verwendet"
        : "Debug-Lupe verwenden";
    }
    if (codeEingabe) codeEingabe.disabled = istOffen;
    if (bestaetigenButton) {
      bestaetigenButton.disabled = istOffen;
      bestaetigenButton.textContent = istOffen
        ? "✓ Firewall geöffnet"
        : "Bestätigen";
    }

    if (istOffen) {
      meldungAnzeigen("Firewall bereits geöffnet.", "erfolg");
    } else if (state.world.firewallHintFound) {
      meldungAnzeigen(
        "Analyse abgeschlossen.\n\nZusätzlicher Hinweis gefunden:\n\nRechner denken in 0 und 1.",
        "info",
      );
    }
  };

  lupeButton?.addEventListener("click", () => {
    if (state.world.firewallHintFound || state.world.firewallDone) return;

    if (!state.inventory.includes("Debug-Lupe")) {
      meldungAnzeigen("Du brauchst die Debug-Lupe.", "fehler");
      return;
    }

    state.world.firewallHintFound = true;
    meldungAnzeigen(
      "Analyse abgeschlossen.\n\nZusätzlicher Hinweis gefunden:\n\nRechner denken in 0 und 1.",
      "info",
    );
    firewallStatusDarstellen();
    saveGame();
    checkGameState();
  });

  const codePruefen = () => {
    if (state.world.firewallDone) return;

    const code = codeEingabe?.value.trim() || "";

    if (!code) {
      meldungAnzeigen("SYSROOT:\nKein Code eingegeben.", "fehler");
      return;
    }

    if (code === "1010") {
      meldungAnzeigen(
        "SYSROOT:\nFalsches Zahlenformat. Die Firewall erwartet einen Dezimalwert.",
        "fehler",
      );
      return;
    }

    if (code === "10") {
      state.world.firewallDone = true;
      firewallStatusDarstellen();
      meldungAnzeigen(
        "Firewall entsperrt.\n\nZugang gewährt.",
        "erfolg",
      );
      saveGame();
      checkGameState();
      updateMiniMap();
      return;
    }

    if (/^\d+$/.test(code) && Number(code) <= 9) {
      meldungAnzeigen(
        "SYSROOT:\nZugriff verweigert. Wert zu klein.",
        "fehler",
      );
      return;
    }

    meldungAnzeigen(
      "SYSROOT:\nUngültiger Zugangscode.",
      "fehler",
    );
  };

  bestaetigenButton?.addEventListener("click", codePruefen);
  codeEingabe?.addEventListener("keydown", (ereignis) => {
    if (ereignis.key === "Enter") codePruefen();
  });

  firewallStatusDarstellen();
}

window.state = state;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.renderInventory = renderInventory;
window.updateMiniMap = updateMiniMap;
window.raumAbschliessen = raumAbschliessen;
window.checkGameState = checkGameState;
window.openResetModal = openResetModal;
window.closeResetModal = closeResetModal;
window.resetGame = resetGame;

document.addEventListener("DOMContentLoaded", () => {
  loadGame();
  neuesSpielEinrichten();
  scrollbarEinrichten();
  renderInventory();
  gesammelteRaumobjekteAusblenden();
  updateMiniMap();
  raum1Einrichten();
  raum2Einrichten();
  raum3Einrichten();
  raum4Einrichten();
  raum5Einrichten();
  raum6Einrichten();
});
