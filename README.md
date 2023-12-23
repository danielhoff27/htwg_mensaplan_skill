# htwg_mensaplan_skill
Leider muss die outputMenu.json zurzeit manuell geparst und aktualisiert werden 
Dazu folgende Schritte (Visual Studio Code):
1. HTML Code in menuPlan.html durch aktuellen Coden ersetzten
(Optional) 1.1 Shitf+Alt+F zum formatieren
(Optional) 1.2 Ctrl+H -> Use Regular Expressions -> ^$\n -> Replace All zum entfernen leerer Zeilen
2. node -e "require('./ownParser.js').mainParse()" zum ausführen und parsen, dadurch wird die alte outputMenu.json überschrieben
3. git add .
4. git commit -m "<Commit-Nachricht>";
5. deployen
