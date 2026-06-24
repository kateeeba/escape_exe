document.addEventListener("DOMContentLoaded", () => {
  const dialogInhalt = {
    text: "Finde das richtige Kabel, um den Tunnel wieder mit Strom zu versorgen.",
    answers: [
      {
        text: "Was soll ich als Nächstes tun?",
        response:
          "Untersuche zuerst das Festplatten-Archiv und repariere anschließend den CPU-Kern.",
        log: "Spieler fragt nach nächstem Ziel",
      },
      {
        text: "Was ist mit der Firewall?",
        response:
          "Die Firewall bleibt gesperrt, bis Archiv und CPU-Kern erfolgreich repariert wurden.",
        log: "Spieler fragt nach Firewall",
      },
      {
        text: "Später",
        close: true,
        log: "Dialog beendet",
      },
    ],
  };

  const sysroot = document.querySelector("#sysroot-npc");
  const dialog = document.querySelector("#sysroot-dialog");
  const dialogText = document.querySelector("#sysroot-dialog-text");
  const antwortBereich = document.querySelector("#sysroot-dialog-antworten");
  const schliessenButton = document.querySelector("#sysroot-dialog-schliessen");

  if (
    !sysroot ||
    !dialog ||
    !dialogText ||
    !antwortBereich ||
    !schliessenButton
  ) {
    return;
  }

  const dialogSchliessen = () => {
    dialog.hidden = true;
    antwortBereich.replaceChildren();
    sysroot.focus();
  };

  const antwortenRendern = () => {
    antwortBereich.replaceChildren();

    dialogInhalt.answers.forEach((antwort) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = antwort.text;

      button.addEventListener("click", () => {
        console.log(antwort.log);

        if (antwort.close) {
          dialogSchliessen();
          return;
        }

        dialogText.textContent = antwort.response;
        antwortBereich.replaceChildren();
      });

      antwortBereich.appendChild(button);
    });
  };

  const dialogOeffnen = () => {
    dialogText.textContent = dialogInhalt.text;
    antwortenRendern();
    dialog.hidden = false;
    antwortBereich.querySelector("button")?.focus();
  };

  sysroot.addEventListener("click", dialogOeffnen);
  schliessenButton.addEventListener("click", dialogSchliessen);
});
