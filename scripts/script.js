// Common functionality shared across pages
document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements that exist on all pages
    initNavigation();
    
    // Check if hero section exists and initialize
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        initHero();
    }
    
    // Add chess pattern background to certain elements
    addChessPatterns();
    
    // Get all nodes and other DOM elements
    const nodes = document.querySelectorAll('.node');
    const roadmap = document.querySelector('.roadmap');
    const svg = document.querySelector('.connections');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetViewBtn = document.getElementById('reset-view');
    
    // Variable to store checkboxes state
    let userProgress = JSON.parse(localStorage.getItem('chessRoadmapProgress')) || {};
    
    // Zoom functionality
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let startX, startY;
    const scaleStep = 0.1;
    const minScale = 0.5;
    const maxScale = 2;
    
    // Initialize the transform
    applyTransform();
    
    // Zoom in button
    zoomInBtn.addEventListener('click', () => {
        if (scale < maxScale) {
            scale += scaleStep;
            applyTransform();
        }
    });
    
    // Zoom out button
    zoomOutBtn.addEventListener('click', () => {
        if (scale > minScale) {
            scale -= scaleStep;
            applyTransform();
        }
    });
    
    // Reset view button
    resetViewBtn.addEventListener('click', () => {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        applyTransform();
    });
    
    // Mouse wheel zoom
    document.querySelector('.roadmap-container').addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0 && scale < maxScale) {
            // Zoom in
            scale += scaleStep;
        } else if (e.deltaY > 0 && scale > minScale) {
            // Zoom out
            scale -= scaleStep;
        }
        applyTransform();
    });
    
    // Drag functionality
    roadmap.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        roadmap.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        applyTransform();
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        roadmap.style.cursor = 'grab';
    });
    
    // Touch support for mobile
    roadmap.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX - offsetX;
        startY = e.touches[0].clientY - offsetY;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        offsetX = e.touches[0].clientX - startX;
        offsetY = e.touches[0].clientY - startY;
        applyTransform();
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Apply transform to roadmap
    function applyTransform() {
        roadmap.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${scale})`;
        drawConnections();
    }
    
    // Draw SVG connections between nodes
    function drawConnections() {
        // Clear previous connections
        svg.innerHTML = '';
        
        // Parent-child relationships to visualize
        const relationships = [
            { parent: 'fundamentals', children: ['rules', 'tactics'] },
            { parent: 'rules', children: ['notation'] },
            { parent: 'tactics', children: ['openings', 'endgames'] },
            { parent: 'notation', children: ['patterns'] },
            { parent: 'endgames', children: ['patterns'] },
            { parent: 'patterns', children: ['strategies', 'calculation'] },
            { parent: 'strategies', children: ['advanced-openings', 'middlegame'] },
            { parent: 'calculation', children: ['complex-endgames'] },
            { parent: 'advanced-openings', children: ['positional-play'] },
            { parent: 'middlegame', children: ['attack'] },
            { parent: 'complex-endgames', children: ['positional-play', 'attack'] },
            { parent: 'positional-play', children: ['theory', 'dynamic-play'] },
            { parent: 'attack', children: ['psychology'] },
            { parent: 'theory', children: ['mastery'] },
            { parent: 'dynamic-play', children: ['mastery'] },
            { parent: 'psychology', children: ['mastery'] }
        ];
        
        // Draw each connection
        relationships.forEach(rel => {
            const parentEl = document.getElementById(rel.parent);
            if (!parentEl) return;
            
            const parentRect = parentEl.getBoundingClientRect();
            const containerRect = roadmap.getBoundingClientRect();
            
            rel.children.forEach(childId => {
                const childEl = document.getElementById(childId);
                if (!childEl) return;
                
                const childRect = childEl.getBoundingClientRect();
                
                // Calculate start and end points relative to the SVG
                const startX = (parentRect.left + parentRect.width / 2 - containerRect.left) / scale;
                const startY = (parentRect.bottom - containerRect.top) / scale;
                const endX = (childRect.left + childRect.width / 2 - containerRect.left) / scale;
                const endY = (childRect.top - containerRect.top) / scale;
                
                // Create path
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                
                // Calculate control points for a curved line
                const midY = startY + (endY - startY) / 2;
                
                // Create a smooth bezier curve
                path.setAttribute('d', `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`);
                path.classList.add('connector');
                
                svg.appendChild(path);
            });
        });
    }

    // Call once on load
    drawConnections();
    
    // Node descriptions and content for modals with learning resources
    const nodeInfo = {
        fundamentals: {
            title: "Chess Fundamentals",
            description: "Build a solid foundation by learning how each piece moves and understanding the basic concepts of chess.",
            elo: "0-800",
            content: [
                "Board layout and starting position",
                "Learning piece names and movements",
                "Understanding check, checkmate, and stalemate",
                "Game objective and basic strategy",
                "Introduction to piece values and material"
            ],
            resources: [
                { name: "ChessKid Beginner Videos", url: "https://www.chesskid.com/videos/beginner" },
                { name: "Chess.com Beginner Lessons", url: "https://www.chess.com/lessons/beginner" },
                { name: "GothamChess Learn in 10 Minutes", url: "https://www.youtube.com/watch?v=OCSbzArwB10" }
            ]
        },
        rules: {
            title: "Rules & Setup",
            description: "Master all chess rules including special moves and tournament regulations.",
            elo: "0-800",
            content: [
                "Special moves (castling, en passant, promotion)",
                "Illegal moves and touch-move rule",
                "Draw rules (stalemate, repetition, 50-move)",
                "Tournament rules and time controls",
                "Basic chess etiquette"
            ],
            resources: [
                { name: "Lichess Interactive Rules", url: "https://lichess.org/learn" },
                { name: "FIDE Laws of Chess", url: "https://www.fide.com/FIDE/handbook/LawsOfChess.pdf" },
                { name: "Practice with Chess Bots", url: "https://www.chess.com/play/computer" }
            ]
        },
        tactics: {
            title: "Basic Tactics",
            description: "Learn fundamental tactical patterns and improve your calculation abilities.",
            elo: "1000-1400",
            content: [
                "Forks and double attacks",
                "Pins, skewers, and discovered attacks",
                "Basic mating patterns (back rank, smothered)",
                "Material-winning combinations",
                "Common tactical motifs in openings"
            ],
            resources: [
                { name: "ChessTempo Tactics Trainer", url: "https://chesstempo.com/chess-tactics/" },
                { name: "Lichess Puzzle Streak", url: "https://lichess.org/streak" },
                { name: "Hanging Pawns Tactics", url: "https://www.youtube.com/c/HangingPawns/playlists" }
            ]
        },
        notation: {
            title: "Chess Notation",
            description: "Learn to read and write chess moves in standard algebraic notation.",
            elo: "800-1200",
            content: [
                "Understanding the chessboard coordinates",
                "Writing and reading algebraic notation",
                "Special move notation (0-0, 0-0-0, e.p.)",
                "Game recording and scoresheets",
                "Using chess databases and PGN format"
            ],
            resources: [
                { name: "Interactive Notation Trainer", url: "https://lichess.org/training/coordinate" },
                { name: "Chess.com Notation Guide", url: "https://www.chess.com/article/view/chess-notation" },
                { name: "Practice Recording Games", url: "https://www.chess.com/terms/chess-notation" }
            ]
        },
        openings: {
            title: "Opening Principles",
            description: "Learn core opening concepts and basic repertoire for both colors.",
            elo: "1000-1400",
            content: [
                "Center control and piece development",
                "Common structures (e4/e5, d4/d5)",
                "Basic opening strategies",
                "Avoiding common mistakes",
                "Building a basic repertoire"
            ],
            resources: [
                { name: "Gotham's Opening Guide", url: "https://www.youtube.com/playlist?list=PLBRhQ8t5YXS0UjIe6Uk3F6g1XMXQn1_Ri" },
                { name: "Basic Opening Principles", url: "https://www.chess.com/article/view/the-principles-of-the-chess-opening" },
                { name: "Building Your Repertoire", url: "https://www.chessable.com/basic-principles-of-opening-play/course/96221/" }
            ]
        },
        endgames: {
            title: "Basic Endgames",
            description: "Master fundamental endgame techniques every chess player must know.",
            elo: "1000-1400",
            content: [
                "King and pawn endings",
                "Rook endgame fundamentals",
                "Basic checkmates (K+Q, K+R)",
                "Opposition and zugzwang",
                "Converting material advantage"
            ],
            resources: [
                { name: "100 Endgames You Must Know", url: "https://www.chessable.com/100-endgames-you-must-know/course/5193/" },
                { name: "John Bartholomew Endgames", url: "https://www.youtube.com/playlist?list=PLl9uuRYQ-6MBwqkmwT42l1fI7Z0bYuwwO" },
                { name: "Basic Endgame Practice", url: "https://lichess.org/practice/basic-endgames" }
            ]
        },
        patterns: {
            title: "Pattern Recognition",
            description: "Develop your ability to recognize common patterns and motifs across all phases of the game.",
            elo: "1200-1600",
            content: [
                "Tactical patterns in different openings",
                "Common mating patterns",
                "Recurring strategic themes",
                "Piece coordination patterns",
                "Pattern-based calculation"
            ],
            resources: [
                { name: "The Woodpecker Method", url: "https://www.amazon.com/Woodpecker-Method-Axel-Smith/dp/1784830542" },
                { name: "Chess Pattern Recognition", url: "https://www.chessable.com/pattern-recognition/s/2464/" },
                { name: "Puzzle Rush on Chess.com", url: "https://www.chess.com/puzzles/rush" }
            ]
        },
        strategies: {
            title: "Strategic Concepts",
            description: "Master advanced positional play and strategic understanding.",
            elo: "1400-2000",
            content: [
                "Weak squares and outposts",
                "Pawn structure strategy",
                "Good vs bad pieces",
                "Prophylactic thinking",
                "Long-term planning"
            ],
            resources: [
                { name: "Silman's Chess Course", url: "https://www.chessable.com/reassess-your-chess-the-complete-chess-mastery-course/course/5797/" },
                { name: "Chess Strategy for Club Players", url: "https://www.amazon.com/Chess-Strategy-Club-Players-Grooten/dp/9056916343" },
                { name: "Strategic Play Studies", url: "https://lichess.org/study/strategic-play" }
            ]
        },
        calculation: {
            title: "Calculation",
            description: "Sharpen your ability to visualize and evaluate variations accurately.",
            elo: "1400-1800",
            content: [
                "Calculation methodology",
                "Candidate moves selection",
                "Visualization techniques",
                "Evaluation of positions",
                "Blunder checking"
            ],
            resources: [
                { name: "Perfect Your Chess", url: "https://www.amazon.com/Perfect-Your-Chess-Andrei-Volokitin/dp/9056912186" },
                { name: "Calculate Like a Grandmaster", url: "https://www.amazon.com/Calculate-Like-Grandmaster-Learn-Modern/dp/178194536X" },
                { name: "Calculation Training on Chess.com", url: "https://www.chess.com/vision" }
            ]
        },
        "advanced-openings": {
            title: "Advanced Opening Theory",
            description: "Build a sophisticated opening repertoire with deep theoretical knowledge.",
            elo: "1800-2200",
            content: [
                "Complex opening systems",
                "Move order subtleties",
                "Theory of critical lines",
                "Opening preparation methods",
                "Building a GM-level repertoire"
            ],
            resources: [
                { name: "GM Opening Preparation", url: "https://www.chessable.com/opening-preparation/course/45897/" },
                { name: "Modern Chess Openings", url: "https://www.amazon.com/Modern-Chess-Openings-Nick-Silva/dp/0812936825" },
                { name: "ChessBase Opening Encyclopedia", url: "https://shop.chessbase.com/en/products/mega_database_2023" }
            ]
        },
        middlegame: {
            title: "Middlegame Plans",
            description: "Develop strategic planning skills and understanding of typical middlegame positions.",
            elo: "1600-2000",
            content: [
                "Planning in different pawn structures",
                "Attacking the king",
                "Defensive techniques",
                "Improving piece placement",
                "Transition to favorable endgames"
            ],
            resources: [
                { name: "The Middlegame in Chess", url: "https://www.amazon.com/Art-Middlegame-Dover-Chess/dp/0486261549" },
                { name: "Mastering Chess Strategy", url: "https://www.amazon.com/Mastering-Chess-Strategy-Johan-Hellsten/dp/1857445007" },
                { name: "Prophylactic Thinking", url: "https://www.chess.com/lessons/prophylactic-thinking" }
            ]
        },
        "complex-endgames": {
            title: "Complex Endgames",
            description: "Master advanced endgame techniques and theoretical positions.",
            elo: "1600-2000",
            content: [
                "Complex rook endgames",
                "Bishop endgames",
                "Knight endgames",
                "Queen vs minor pieces",
                "Multi-piece endgames"
            ],
            resources: [
                { name: "Dvoretsky's Endgame Manual", url: "https://www.amazon.com/Dvoretskys-Endgame-Manual-Mark-Dvoretsky/dp/1936490137" },
                { name: "Endgame Challenge by Nunn", url: "https://www.amazon.com/John-Nunns-Chess-Endgame-Challenge/dp/1906454272" },
                { name: "ChessTempo Endgame Studies", url: "https://chesstempo.com/chess-endgames/" }
            ]
        },
        "positional-play": {
            title: "Positional Play",
            description: "Develop deep positional understanding and prophylactic thinking.",
            elo: "1800-2200",
            content: [
                "Prophylactic thinking",
                "Long-term planning",
                "Pawn structure mastery",
                "Piece maneuvering in closed positions",
                "Strategic sacrifices"
            ],
            resources: [
                { name: "Positional Decision Making in Chess", url: "https://www.amazon.com/Positional-Decision-Making-Chess-Gelfand/dp/1784830054" },
                { name: "Judgment and Planning in Chess", url: "https://www.amazon.com/Judgment-Planning-Chess-First-Collection/dp/4871874990" },
                { name: "Strategic Play by McDonald", url: "https://www.amazon.com/Chess-Strategy-Advanced-Neil-McDonald/dp/1904600182" }
            ]
        },
        attack: {
            title: "Attack & Defense",
            description: "Master the art of attacking and defending in complex positions.",
            elo: "1800-2200",
            content: [
                "Attacking the castled king",
                "Piece sacrifices for attack",
                "Defensive resources",
                "Counterattacking techniques",
                "Evaluating attacks"
            ],
            resources: [
                { name: "Art of Attack in Chess", url: "https://www.amazon.com/Art-Attack-Chess-Vladimir-Vukovic/dp/1857444000" },
                { name: "Practical Chess Defence", url: "https://www.amazon.com/Practical-Chess-Defence-Jacob-Aagaard/dp/1904600824" },
                { name: "How to Attack Without Sacrificing", url: "https://www.chess.com/lessons/how-to-attack-without-sacrificing" }
            ]
        },
        theory: {
            title: "Opening Theory",
            description: "Study deep opening theory and stay current with theoretical developments.",
            elo: "2000+",
            content: [
                "Critical lines analysis",
                "Modern theory in main openings",
                "Novelty preparation",
                "Computer analysis of openings",
                "Opening trends at top level"
            ],
            resources: [
                { name: "New In Chess Yearbooks", url: "https://www.newinchess.com/yearbook" },
                { name: "ChessBase Magazine", url: "https://shop.chessbase.com/en/categories/magazine" },
                { name: "Current GM Games Analysis", url: "https://lichess.org/study" }
            ]
        },
        "dynamic-play": {
            title: "Dynamic Play",
            description: "Master the art of unbalanced, dynamic positions and complex calculations.",
            elo: "2000+",
            content: [
                "Complex sacrifices",
                "Dynamic imbalances",
                "Initiative and momentum",
                "Intuitive play",
                "Risk management"
            ],
            resources: [
                { name: "Dynamic Chess Strategy", url: "https://www.amazon.com/Dynamic-Chess-Strategy-Mihai-Suba/dp/1901983498" },
                { name: "Secrets of Dynamic Chess", url: "https://www.newinchess.com/the-secrets-of-modern-chess-strategy" },
                { name: "My Great Predecessors (Kasparov)", url: "https://www.amazon.com/My-Great-Predecessors-Part-1/dp/1781943761" }
            ]
        },
        psychology: {
            title: "Chess Psychology",
            description: "Understand the psychological aspects of chess competition.",
            elo: "2000+",
            content: [
                "Tournament psychology",
                "Handling pressure",
                "Time management",
                "Opponent-specific preparation",
                "Mental training"
            ],
            resources: [
                { name: "Psychology of Chess", url: "https://www.amazon.com/Psychology-Chess-Player-Reuben-Fine/dp/4871875407" },
                { name: "Mental Toughness in Chess", url: "https://www.amazon.com/When-Life-Chess-Mental-Toughness/dp/1936490382" },
                { name: "Chess for Zebras", url: "https://www.amazon.com/Chess-Zebras-Jonathan-Rowson/dp/1901983854" }
            ]
        },
        mastery: {
            title: "Chess Mastery",
            description: "Achieve mastery across all aspects of chess and compete at a high level.",
            elo: "2200+",
            content: [
                "Professional tournament preparation",
                "Advanced calculation training",
                "Engine-assisted analysis",
                "Modern chess theory",
                "High-level competition skills"
            ],
            resources: [
                { name: "1-on-1 GM Coaching", url: "https://www.chess.com/coaches" },
                { name: "ChessBase Pro Package", url: "https://shop.chessbase.com/en/categories/chess_programs" },
                { name: "Advanced Tournament Guide", url: "https://www.fide.com/FIDE/handbook/Tournament_Regulations.pdf" }
            ]
        }
    };

    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.display = 'none';
    document.body.appendChild(modalContainer);

    // Add click event listener to each node
    nodes.forEach(node => {
        node.addEventListener('click', () => {
            const nodeId = node.id;
            const info = nodeInfo[nodeId];
            
            if (info) {
                // Initialize progress for this node if not already present
                if (!userProgress[nodeId]) {
                    userProgress[nodeId] = {
                        completed: Array(info.content.length).fill(false),
                        resourcesVisited: Array(info.resources.length).fill(false)
                    };
                }
                
                // Create checkboxes for content items
                const contentItems = info.content.map((item, index) => {
                    const isChecked = userProgress[nodeId].completed[index] ? 'checked' : '';
                    return `
                        <div class="checkbox-container" data-type="content" data-index="${index}">
                            <div class="custom-checkbox ${isChecked}"></div>
                            <span>${item}</span>
                        </div>
                    `;
                }).join('');
                
                // Create resource links with checkboxes
                const resourceItems = info.resources.map((resource, index) => {
                    const isChecked = userProgress[nodeId].resourcesVisited[index] ? 'checked' : '';
                    return `
                        <div class="checkbox-container" data-type="resource" data-index="${index}">
                            <div class="custom-checkbox ${isChecked}"></div>
                            <a href="${resource.url}" class="resource-link" target="_blank" data-index="${index}">${resource.name}</a>
                        </div>
                    `;
                }).join('');
                
                // Create modal content
                const modalContent = `
                    <div class="modal-header">
                        <h2>${info.title}</h2>
                        <span class="elo-range">ELO: ${info.elo}</span>
                        <span class="close-btn">&times;</span>
                    </div>
                    <div class="modal-body">
                        <p class="description">${info.description}</p>
                        <h3>What You'll Learn:</h3>
                        <div class="content-list">
                            ${contentItems}
                        </div>
                        <h3>Recommended Resources:</h3>
                        <div class="resources-list">
                            ${resourceItems}
                        </div>
                        <div class="progress-tracker">
                            <h3>Track Your Progress</h3>
                            <button class="save-btn">Save Progress</button>
                        </div>
                    </div>
                `;
                
                // Update modal container
                modalContainer.innerHTML = `<div class="modal">${modalContent}</div>`;
                modalContainer.style.display = 'flex';
                
                // Add close functionality
                const closeBtn = document.querySelector('.close-btn');
                closeBtn.addEventListener('click', () => {
                    modalContainer.style.display = 'none';
                });
                
                // Close when clicking outside
                modalContainer.addEventListener('click', (e) => {
                    if (e.target === modalContainer) {
                        modalContainer.style.display = 'none';
                    }
                });
                
                // Add checkbox functionality
                const checkboxes = document.querySelectorAll('.custom-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener('click', () => {
                        const container = checkbox.parentElement;
                        const type = container.dataset.type;
                        const index = parseInt(container.dataset.index);
                        
                        checkbox.classList.toggle('checked');
                        
                        if (type === 'content') {
                            userProgress[nodeId].completed[index] = checkbox.classList.contains('checked');
                        } else if (type === 'resource') {
                            userProgress[nodeId].resourcesVisited[index] = checkbox.classList.contains('checked');
                        }
                    });
                });
                
                // Mark resources as visited when clicked
                const resourceLinks = document.querySelectorAll('.resource-link');
                resourceLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        const index = parseInt(link.dataset.index);
                        userProgress[nodeId].resourcesVisited[index] = true;
                        
                        // Update checkbox
                        const checkbox = link.previousElementSibling;
                        checkbox.classList.add('checked');
                    });
                });
                
                // Save progress button
                const saveBtn = document.querySelector('.save-btn');
                saveBtn.addEventListener('click', () => {
                    localStorage.setItem('chessRoadmapProgress', JSON.stringify(userProgress));
                    
                    // Update progress bar
                    updateProgressBar(nodeId);
                    
                    // Show feedback
                    saveBtn.textContent = 'Progress Saved!';
                    setTimeout(() => {
                        saveBtn.textContent = 'Save Progress';
                    }, 2000);
                });
            }
        });
    });
    
    // Update progress bar based on completed items
    function updateProgressBar(nodeId) {
        if (!userProgress[nodeId]) return;
        
        const totalItems = userProgress[nodeId].completed.length + userProgress[nodeId].resourcesVisited.length;
        const completedItems = 
            userProgress[nodeId].completed.filter(Boolean).length + 
            userProgress[nodeId].resourcesVisited.filter(Boolean).length;
        
        const progressPercentage = Math.round((completedItems / totalItems) * 100);
        
        // Update the progress bar width
        const progressBar = document.querySelector(`#${nodeId} .progress`);
        progressBar.style.width = `${progressPercentage}%`;
    }
    
    // Initialize progress bars on page load
    function initializeProgressBars() {
        Object.keys(userProgress).forEach(nodeId => {
            updateProgressBar(nodeId);
        });
    }
    
    // Call once on load
    initializeProgressBars();
    
    // Window resize event to redraw connections
    window.addEventListener('resize', drawConnections);
});

/* Initialize navigation functionality */
function initNavigation() {
    // Get current page URL
    const currentPage = window.location.pathname.split('/').pop();
    
    // Highlight active navigation link
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialize hero section animations
 */
function initHero() {
    const hero = document.querySelector('.hero');
    
    // Add subtle animation to hero section
    setTimeout(() => {
        hero.style.opacity = '1';
        hero.style.transform = 'translateY(0)';
    }, 100);
}

/**
 * Add chess pattern backgrounds to elements
 */
function addChessPatterns() {
    // Add chess pattern background to footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.classList.add('chess-pattern-bg');
    }
    
    // Add position relative to hero for ::before pseudo-element
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.position = 'relative';
        hero.style.overflow = 'hidden';
    }
}

/**
 * Utility function to format ELO rating
 * @param {number} elo - The ELO rating to format
 * @return {string} - Formatted ELO rating
 */
function formatELO(elo) {
    return elo.toString().padStart(4, '0');
}

/**
 * Utility function to scroll to an element smoothly
 * @param {string} elementId - The ID of the element to scroll to
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}