document.addEventListener('DOMContentLoaded', function () {
    // Création du canvas
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = document.body.clientWidth;
    canvas.height = 1020;
    console.log(canvas.width, canvas.height);
    document.body.appendChild(canvas);

    // Chargement des images
    var bgReady = false;
    var bgImage = new Image();
    bgImage.onload = function () {
        bgReady = true;
    };
    bgImage.src = "images/background.png";

    var heroReady = false;
    var heroImage = new Image();
    heroImage.onload = function () {
        heroReady = true;
    };
    heroImage.src = "images/character.png"; // Image sprite 256x256

    var caisseReady = false;
    var caisseImage = new Image();
    caisseImage.onload = function () {
        caisseReady = true;
    };
    caisseImage.src = "images/caisse.webp"; // Assurez-vous d'avoir une image pour la caisse

    var billReady = false;
    var billImage = new Image();
    billImage.onload = function () {
        billReady = true;
    };
    billImage.src = "images/coins.png"; // Image pour la pièce qui tombe

    // Objet du héros
    var hero = {
        speed: 400, // vitesse en pixels par seconde
        x: 0,
        y: 0,
        width: 64, // Taille de chaque image du sprite
        height: 64,
        frameX: 0, // Image courante dans l'animation
        frameY: 0, // Ligne courante (direction)
        tickCount: 0, // Compteur pour l'animation
        ticksPerFrame: 10 // Nombre de ticks avant de changer de frame
    };

    var caisse = {};
    var bills = []; // Tableau pour les billets
    var gameOver = false;
    var showRefuser = false; // Variable pour contrôler l'affichage de "Refuser"

    // Gestion des touches du clavier
    var keysDown = {};
    window.addEventListener('keydown', function (e) {
        keysDown[e.keyCode] = true;
    }, false);
    window.addEventListener('keyup', function (e) {
        delete keysDown[e.keyCode];
    }, false);

    // Réinitialisation du jeu
    var reset = function () {
        /* hero.x = canvas.width / 2;
        hero.y = canvas.height / 2; */
        caisse.x = 32 + (Math.random() * (canvas.width - 64));
        caisse.y = 32 + (Math.random() * (canvas.height - 64));
    };

    // Mise à jour du héros et de la caisse
    var update = function (modifier) {
        if (gameOver) return;

        hero.tickCount++;

        if (hero.tickCount > hero.ticksPerFrame) {
            hero.tickCount = 0;
            hero.frameX = (hero.frameX + 1) % 3; // Cycle entre les 3 frames
        }

        if (38 in keysDown) { // Haut
            hero.y -= hero.speed * modifier;
            hero.frameY = 3; // Ligne du sprite pour le haut
        }
        if (40 in keysDown) { // Bas
            hero.y += hero.speed * modifier;
            hero.frameY = 0; // Ligne du sprite pour le bas
        }
        if (37 in keysDown) { // Gauche
            hero.x -= hero.speed * modifier;
            hero.frameY = 1; // Ligne du sprite pour la gauche
        }
        if (39 in keysDown) { // Droite
            hero.x += hero.speed * modifier;
            hero.frameY = 2; // Ligne du sprite pour la droite
        }

        // Collision avec la caisse
        if (
            hero.x <= (caisse.x + 32)
            && caisse.x <= (hero.x + 32)
            && hero.y <= (caisse.y + 32)
            && caisse.y <= (hero.y + 32)
        ) {
            // Chance de 100% de gagner
            if (Math.random() < 0.1) {
                // Gagner des billets
                for (let i = 0; i < 50; i++) {
                    setTimeout(function () {
                        bills.push({
                            x: Math.random() * canvas.width, // Position aléatoire
                            y: -64,
                            frame: 0,
                            tickCount: 0,      // Compteur de ticks pour le billet
                            ticksPerFrame: 15  // Nombre de ticks avant de changer de frame (augmente cette valeur pour ralentir)
                        }); // Ajouter 10 billets
                    }, i * 300);
                }
            } else {
                showRefuser = true; // Afficher "Refuser" lorsqu'il y a une collision
                setTimeout(function () {
                    showRefuser = false; // Cacher "Refuser" après 1 seconde
                }, 1000);
            }
            reset(); // Réinitialiser la caisse
        }

        // Mise à jour des billets
        for (let i = 0; i < bills.length; i++) {
            bills[i].y += 2; // Chute des billets
            bills[i].tickCount++; // Incrémentation du compteur

            if (bills[i].tickCount > bills[i].ticksPerFrame) {
                bills[i].tickCount = 0; // Réinitialise le compteur
                bills[i].frame++; // Passe à la frame suivante
                if (bills[i].frame >= 4) { // S'il dépasse 3 (pour 4 frames)
                    bills[i].frame = 0; // Revient à la première frame
                }
            }

            // Vérification si le héros touche un billet
            if (
                hero.x <= (bills[i].x + 32) &&
                bills[i].x <= (hero.x + 32) &&
                hero.y <= (bills[i].y + 32) &&
                bills[i].y <= (hero.y + 32)
            ) {
                gameOver = true; // Perdre le jeu si le héros touche un billet
            }
        }
    };

    // Rendu du jeu
    var render = function () {
        context.clearRect(0, 0, canvas.width, canvas.height); // Nettoyage du canvas

        if (bgReady) {
            context.drawImage(bgImage, 0, 0);
        }

        if (heroReady) {
            // Découpe du sprite en fonction de frameX et frameY
            context.drawImage(
                heroImage,
                hero.frameX * hero.width,  // Position X dans le sprite
                hero.frameY * hero.height, // Position Y dans le sprite
                hero.width,                // Largeur de chaque frame
                hero.height,               // Hauteur de chaque frame
                hero.x,                    // Position X sur le canvas
                hero.y,                    // Position Y sur le canvas
                hero.width,                // Largeur à dessiner sur le canvas
                hero.height                // Hauteur à dessiner sur le canvas
            );
        }

        if (caisseReady) {
            context.drawImage(caisseImage, caisse.x, caisse.y, 64, 64);
        }

        // Affichage des billets
        for (let i = 0; i < bills.length; i++) {
            if (billReady) {
                context.drawImage(
                    billImage,
                    bills[i].frame * 210.75, 0, // Ajuste la taille ici (par exemple, 64px si chaque billet fait 64px)
                    210.75, 192,                 // Largeur et hauteur de chaque frame de billet
                    bills[i].x, bills[i].y,
                    64, 64                   // Taille à afficher sur le canvas
                );
            }
        }

        // Affichage de "Refuser" si requis
        if (showRefuser) {
            context.fillStyle = "rgb(255, 0, 0)";
            context.font = "30px Helvetica";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("Refuser", canvas.width / 2, canvas.height / 2 - 50); // Position au centre de l'écran
        }

        // Message de game over
        if (gameOver) {
            context.fillStyle = "rgb(255, 0, 0)";
            context.font = "48px Helvetica";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("Jeu terminé !", canvas.width / 2, canvas.height / 2);
        }
    };

    // Boucle principale
    var main = function () {
        var now = Date.now();
        var delta = now - then;
        update(delta / 1000);
        render();
        then = now;
        requestAnimationFrame(main);
    };

    // Initialisation du jeu
    var then = Date.now();
    reset();
    main();
});
