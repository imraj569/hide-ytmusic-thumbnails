let isHidden = true;

chrome.storage.local.get(['isHidden'], function(result) {
    if (result.isHidden !== undefined) {
        isHidden = result.isHidden;
    }
    createButton();
    applyVisibility();
});

function deepQuerySelectorAll(selector) {
    const results = [];
    
    function search(root) {
        const elements = root.querySelectorAll(selector);
        elements.forEach(el => results.push(el));
        
        root.querySelectorAll('*').forEach(element => {
            if (element.shadowRoot) {
                search(element.shadowRoot);
            }
        });
    }

    search(document);
    return results;
}

function applyVisibility() {
    const elementsToHide = [
        '#img',
        '.video-stream.html5-main-video',
        '.image.style-scope.ytmusic-player-bar',
        'ytmusic-player-bar[player-ui-state="PLAYER_PAGE"]'
    ];

    elementsToHide.forEach(selector => {
        deepQuerySelectorAll(selector).forEach(element => {
            element.style.display = isHidden ? 'none' : '';
        });
    });
}

function createButton() {
    let button = document.getElementById('ytm-hide-toggle');
    if (!button) {
        // Create button
        button = document.createElement('button');
        button.id = 'ytm-hide-toggle';
        button.innerHTML = '👁️';
        
        // Button styling
        button.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            z-index: 9999;
            width: 40px;
            height: 40px;
            padding: 0;
            background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            transition: all 0.3s ease;
            animation: pulse 2s ease;
        `;

        // Add hover/active styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: translateY(-50%) scale(1); }
                50% { transform: translateY(-50%) scale(1.2); }
                100% { transform: translateY(-50%) scale(1); }
            }
            #ytm-hide-toggle:hover {
                transform: translateY(-50%) scale(1.15) !important;
                box-shadow: 0 6px 20px rgba(0,0,0,0.4) !important;
                background: linear-gradient(45deg, #FF8E8E, #FF6B6B) !important;
            }
            #ytm-hide-toggle:active {
                transform: translateY(-50%) scale(0.9) !important;
            }
            #ytm-hide-toggle.hidden::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 70%;
                height: 2px;
                background: #fff;
                transform: translate(-50%, -50%) rotate(45deg);
                opacity: 0.8;
                border-radius: 1px;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(button);
    }

    // Update button state
    button.classList.toggle('hidden', isHidden);
    button.style.background = isHidden 
        ? 'linear-gradient(45deg, #4ECDC4, #45B7AF)'
        : 'linear-gradient(45deg, #FF6B6B, #FF8E8E)';

    button.onclick = function() {
        isHidden = !isHidden;
        chrome.storage.local.set({ isHidden: isHidden }, () => {
            applyVisibility();
            button.classList.toggle('hidden', isHidden);
            button.style.background = isHidden 
                ? 'linear-gradient(45deg, #4ECDC4, #45B7AF)'
                : 'linear-gradient(45deg, #FF6B6B, #FF8E8E)';
        });
    };
}

// Mutation Observer and event listener remain the same
let observerTimeout;
const observer = new MutationObserver((mutations) => {
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(applyVisibility, 300);
});

observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
});

document.addEventListener('yt-navigate-finish', applyVisibility);