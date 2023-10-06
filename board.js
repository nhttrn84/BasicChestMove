const chessboard = document.querySelector('.chessboard');
for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        const square = document.createElement('div');
        const id = 'square' + i + j;
        square.className = (i + j) % 2 === 0 ? 'white' : 'black';
        square.id = id;
        chessboard.appendChild(square);
    }
}

window.onload = function(){
    const pieces = document.querySelectorAll(".piece");
    pieces.forEach(function(piece){
        piece.addEventListener("mousedown", handleMouseDown);
    });
};

function handleMouseDown(e){
    originalPiece = this;
    originalPiece.isDown = true;
    originalPiece.cldX = e.clientX - originalPiece.offsetLeft;
    originalPiece.cldY = e.clientY - originalPiece.offsetTop;

    const originalSquareId = getSquare(this.id);
    const originalSquare = document.getElementById(originalSquareId);
    
    const thumb = originalPiece.cloneNode(true);
    thumb.classList.toggle("thumb");
    thumb.style.left = originalPiece.offsetLeft + "px";
    thumb.style.top = originalPiece.offsetTop + "px";
    document.body.appendChild(thumb);

    getLegalMoves(this.id);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    function handleMouseMove(e){
        if (originalPiece.isDown){
            thumb.style.left = e.clientX - originalPiece.cldX + "px";
            thumb.style.top = e.clientY - originalPiece.cldY + "px";
        }
    }

    function handleMouseUp(){
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        if (originalPiece.isDown){
            const posx = parseInt(thumb.style.left) + (originalPiece.offsetWidth / 2);
            const posy = parseInt(thumb.style.top) + (originalPiece.offsetHeight / 2);

            const destination = getSquareByPosition(posx, posy);
            const destinationSquare = document.getElementById(destination);

            if (destination !== null && ishighlighted(destinationSquare)){
                //kill the piece in the destination square
                if(checkBusy(destinationSquare)){
                    const enemyId = findPieceInSquare(destinationSquare);
                    const enemyPiece = document.getElementById(enemyId);
                    enemyPiece.remove();
                }

                originalSquare.setAttribute("data-occupied", "false");
                setPosition(originalPiece, destinationSquare);
                destinationSquare.setAttribute("data-occupied", "true");
            }

            thumb.remove();
            originalPiece.isDown = false;
            originalPiece = null;

            const previouslyhighlightedSquares = document.querySelectorAll('[class*="highlighted-square"]');
            previouslyhighlightedSquares.forEach(square => {
                square.classList.remove("green-highlighted-square");
                square.classList.remove("red-highlighted-square");
            });
        }
    }
}

//find the piece in the square
function findPieceInSquare(square) {
    if (checkBusy(square)) {
        const pieces = document.querySelectorAll('[class^="piece"]');
        const squareRect = square.getBoundingClientRect();
        let result = null;

        pieces.forEach(piece => {
            const pieceRect = piece.getBoundingClientRect();

            if (
                pieceRect.top >= squareRect.top &&
                pieceRect.left >= squareRect.left &&
                pieceRect.bottom <= squareRect.bottom &&
                pieceRect.right <= squareRect.right &&
                piece.id !== originalPiece.id 
            ) {
                result = piece.id;
            }
        });

        return result;
    }
}

//set a piece to the square
function setPosition(piece, square) {
    const squareRect = square.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();

    const top = squareRect.top + (squareRect.height - pieceRect.height) / 2;
    const left = squareRect.left + (squareRect.width - pieceRect.width) / 2;

    piece.style.top = top + "px";
    piece.style.left = left + "px";
}

//return the squareid of the square that the piece is in it right now
function getSquare(pieceID) {
    const squares = document.querySelectorAll('[id^="square"]');
    const piece = document.getElementById(pieceID);

    const pieceRect = piece.getBoundingClientRect();

    let result = null;

    squares.forEach(square => {
        const squareRect = square.getBoundingClientRect();

        if (
            pieceRect.top >= squareRect.top &&
            pieceRect.left >= squareRect.left &&
            pieceRect.bottom <= squareRect.bottom &&
            pieceRect.right <= squareRect.right
        ) {
            result = square.id;
        }
    });

    return result;
}

function getSquareByPosition(x, y) {
    const squares = document.querySelectorAll('[id^="square"]');
    let result = null;

    squares.forEach(square => {
        const squareRect = square.getBoundingClientRect();
        if (
            y >= squareRect.top + 5 &&
            x >= squareRect.left + 5&&
            y <= squareRect.bottom - 5&&
            x <= squareRect.right - 5
        ) {
            result = square.id;
        }
    });

    return result;
}

function checkBusy(square) {
    const occupiedValue = square.getAttribute("data-occupied");
    return occupiedValue === "true";
}

function ishighlighted(square) {
    const classes = square.classList;
    for (let i = 0; i < classes.length; i++) {
        if (classes[i].includes('highlighted-square')) {
            return true;
        }
    }
    return false;
}

function highlightSquare(number, squareId, distance){
    resultId = number + distance;

    if (!(resultId % 10 > 7 || resultId < 0 || resultId > 78)){
        newId = squareId.replace(match[0], String(resultId).padStart(2, '0'));
        targetSquare = document.querySelector("#" + newId);
        
        if(!checkBusy(targetSquare)){
            targetSquare.classList.add("green-highlighted-square");
        }
    }
}

function highlightKillSquare(pieceId, number, squareId, distance){
    resultId = number + distance;

    if (!(resultId % 10 > 7 || resultId < 0 || resultId > 78)){
        newId = squareId.replace(match[0], String(resultId).padStart(2, '0'));
        targetSquare = document.querySelector("#" + newId);
        targetPieceId = findPieceInSquare(targetSquare);
    
        if(checkBusy(targetSquare) && pieceId[0] !== targetPieceId[0]){
            targetSquare.classList.add("red-highlighted-square");
        }
    }
}

function getLegalMoves(pieceId) {
    switch (true) {
        case pieceId.startsWith('wp'):
            squareId = getSquare(pieceId);
            match = squareId.match(/\d+/);
            number = parseInt(match[0]);

            highlightKillSquare(pieceId, number, squareId, -11);
            highlightKillSquare(pieceId, number, squareId, -9);

            if (number >= 60 && number <= 68){
                highlightSquare(number, squareId, -10);
                highlightSquare(number, squareId, -20);
            } else{
                highlightSquare(number, squareId, -10);
            }

            break;
        case pieceId.startsWith('bp'):
            squareId = getSquare(pieceId);
            match = squareId.match(/\d+/);
            number = parseInt(match[0]);

            highlightKillSquare(pieceId, number, squareId, 11);
            highlightKillSquare(pieceId, number, squareId, 9);

            if (number >= 10 && number <= 18){
                highlightSquare(number, squareId, 10);
                highlightSquare(number, squareId, 20);
            } else{
                highlightSquare(number, squareId, 10);
            }

            break;
        case pieceId.includes('c'):
            squareId = getSquare(pieceId);
            match = squareId.match(/\d+/);
            number = parseInt(match[0]);

            highlightKillSquare(pieceId, number, squareId, -11);
            highlightKillSquare(pieceId, number, squareId, -10);
            highlightKillSquare(pieceId, number, squareId, -9);
            highlightKillSquare(pieceId, number, squareId, -1);
            highlightKillSquare(pieceId, number, squareId, 1);
            highlightKillSquare(pieceId, number, squareId, 11);
            highlightKillSquare(pieceId, number, squareId, 10);
            highlightKillSquare(pieceId, number, squareId, 9);

            highlightSquare(number, squareId, -11);
            highlightSquare(number, squareId, -10);
            highlightSquare(number, squareId, -9);
            highlightSquare(number, squareId, -1);
            highlightSquare(number, squareId, 1);
            highlightSquare(number, squareId, 11);
            highlightSquare(number, squareId, 10);
            highlightSquare(number, squareId, 9);

            break;
        case pieceId.includes('q'):
            squareId = getSquare(pieceId);
            match = squareId.match(/\d+/);
            number = parseInt(match[0]);

            moveBishop(pieceId, squareId, number);
            moveRook(pieceId, squareId, number);

            break;
        case pieceId.includes('s'):
            squareId = getSquare(pieceId);
            match = squareId.match(/\d+/);
            number = parseInt(match[0]);
            
            moveBishop(pieceId, squareId, number);

            break;
        case pieceId.includes('k'):
            squareId = getSquare(pieceId);
            match = squareId.match(/\d+/);
            number = parseInt(match[0]);

            highlightKillSquare(pieceId, number, squareId, -19);
            highlightKillSquare(pieceId, number, squareId, -8);
            highlightKillSquare(pieceId, number, squareId, 12);
            highlightKillSquare(pieceId, number, squareId, 21);
            highlightKillSquare(pieceId, number, squareId, -12);
            highlightKillSquare(pieceId, number, squareId, -21);
            highlightKillSquare(pieceId, number, squareId, 19);
            highlightKillSquare(pieceId, number, squareId, 8);

            highlightSquare(number, squareId, -19);
            highlightSquare(number, squareId, -8);
            highlightSquare(number, squareId, 12);
            highlightSquare(number, squareId, 21);
            highlightSquare(number, squareId, -12);
            highlightSquare(number, squareId, -21);
            highlightSquare(number, squareId, 19);
            highlightSquare(number, squareId, 8);

            break;
        case pieceId.includes('r'):
            squareId = getSquare(pieceId);
            match = squareId.match(/\d+/);
            number = parseInt(match[0]);
            
            moveRook(pieceId, squareId, number);

            break;
        default:
            // Handle cases where pieceTypeId doesn't match any pattern
    }
}

function moveBishop(pieceId, squareId, number){
    for (i = 11; (i + number) % 10 <= 7 && i <= 77; i = i + 11){
        if (i + number >= 0 && i + number <= 77){
            newId = squareId.replace(match[0], String(i + number).padStart(2, '0'));
            targetSquare = document.querySelector("#" + newId);

            if (checkBusy(targetSquare)){
                targetPieceId = findPieceInSquare(targetSquare);

                if (pieceId[0] !== targetPieceId[0]){
                    highlightKillSquare(pieceId, number, squareId, i);
                }
                break;
            }
        }
        highlightSquare(number, squareId, i);
    }

    for (i = -9; (i + number) % 10 <= 7 && i >= -63; i = i - 9){
        if (i + number >= 0 && i + number <= 77){
            newId = squareId.replace(match[0], String(i + number).padStart(2, '0'));
            targetSquare = document.querySelector("#" + newId);

            if (checkBusy(targetSquare)){
                targetPieceId = findPieceInSquare(targetSquare);

                if (pieceId[0] !== targetPieceId[0]){
                    highlightKillSquare(pieceId, number, squareId, i);
                }
                break;
            }
        }
        highlightSquare(number, squareId, i);
    }

    for (i = -11; (i + number) % 10 <= 7 && i >= -77; i = i - 11){
        if (i + number >= 0 && i + number <= 77){
            newId = squareId.replace(match[0], String(i + number).padStart(2, '0'));
            targetSquare = document.querySelector("#" + newId);

            if (checkBusy(targetSquare)){
                targetPieceId = findPieceInSquare(targetSquare);

                if (pieceId[0] !== targetPieceId[0]){
                    highlightKillSquare(pieceId, number, squareId, i);
                }
                break;
            }
        }
        highlightSquare(number, squareId, i);
    }

    for (i = 9; (i + number) % 10 <= 7 && i <= 63; i = i + 9){
        if (i + number >= 0 && i + number <= 77){
            newId = squareId.replace(match[0], String(i + number).padStart(2, '0'));
            targetSquare = document.querySelector("#" + newId);

            if (checkBusy(targetSquare)){
                targetPieceId = findPieceInSquare(targetSquare);

                if (pieceId[0] !== targetPieceId[0]){
                    highlightKillSquare(pieceId, number, squareId, i);
                }
                break;
            }
        }
        highlightSquare(number, squareId, i);
    }
}

function moveRook(pieceId, squareId, number){
    for (i = 10; i <= 70; i = i + 10){
        if (i + number >= 0 && i + number <= 77){
            newId = squareId.replace(match[0], String(i + number).padStart(2, '0'));
            targetSquare = document.querySelector("#" + newId);

            if (checkBusy(targetSquare)){
                targetPieceId = findPieceInSquare(targetSquare);

                if (pieceId[0] !== targetPieceId[0]){
                    highlightKillSquare(pieceId, number, squareId, i);
                }
                break;
            }
        }
        highlightSquare(number, squareId, i);
    }

    for (i = -10; i >= -70; i = i - 10){
        if (i + number >= 0 && i + number <= 77){
            newId = squareId.replace(match[0], String(i + number).padStart(2, '0'));
            targetSquare = document.querySelector("#" + newId);

            if (checkBusy(targetSquare)){
                targetPieceId = findPieceInSquare(targetSquare);

                if (pieceId[0] !== targetPieceId[0]){
                    highlightKillSquare(pieceId, number, squareId, i);
                }
                break;
            }
        }
        highlightSquare(number, squareId, i);
    }

    for (i = 1; i <= 7 && (number + i) % 10 <= 7; i++){
        if (i + number >= 0 && i + number <= 77){
            newId = squareId.replace(match[0], String(i + number).padStart(2, '0'));
            targetSquare = document.querySelector("#" + newId);

            if (checkBusy(targetSquare)){
                targetPieceId = findPieceInSquare(targetSquare);

                if (pieceId[0] !== targetPieceId[0]){
                    highlightKillSquare(pieceId, number, squareId, i);
                }
                break;
            }
        }
        highlightSquare(number, squareId, i);
    }

    for (i = -1; i >= -7 && (number + i) % 10 <= 7; i--){
        if (i + number >= 0 && i + number <= 77){
            newId = squareId.replace(match[0], String(i + number).padStart(2, '0'));
            targetSquare = document.querySelector("#" + newId);

            if (checkBusy(targetSquare)){
                targetPieceId = findPieceInSquare(targetSquare);

                if (pieceId[0] !== targetPieceId[0]){
                    highlightKillSquare(pieceId, number, squareId, i);
                }
                break;
            }
        }
        highlightSquare(number, squareId, i);
    }
}