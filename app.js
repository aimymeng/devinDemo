document.addEventListener('DOMContentLoaded', function() {
    const mindMap = {
        id: 'root',
        text: 'Mind Map',
        children: []
    };

    const container = document.getElementById('mind-map-container');
    const addNodeBtn = document.getElementById('add-node');
    const removeNodeBtn = document.getElementById('remove-node');
    const saveMapBtn = document.getElementById('save-map');

    function renderMindMap() {
        container.innerHTML = '';
        const rootElement = createNodeElement(mindMap);
        container.appendChild(rootElement);
    }

    function createNodeElement(node) {
        const element = document.createElement('div');
        element.className = 'mind-map-node';
        element.dataset.id = node.id;
        
        const textElement = document.createElement('div');
        textElement.className = 'node-text';
        textElement.textContent = node.text;
        element.appendChild(textElement);

        if (node.children && node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'node-children';
            
            node.children.forEach(child => {
                const childElement = createNodeElement(child);
                childrenContainer.appendChild(childElement);
            });
            
            element.appendChild(childrenContainer);
        }

        return element;
    }

    addNodeBtn.addEventListener('click', function() {
        const newNodeText = prompt('Enter node text:');
        if (newNodeText) {
            const newNode = {
                id: 'node_' + Date.now(),
                text: newNodeText,
                children: []
            };
            
            mindMap.children.push(newNode);
            renderMindMap();
        }
    });

    removeNodeBtn.addEventListener('click', function() {
        if (mindMap.children.length > 0) {
            mindMap.children.pop();
            renderMindMap();
        }
    });

    saveMapBtn.addEventListener('click', function() {
        const mapData = JSON.stringify(mindMap, null, 2);
        localStorage.setItem('savedMindMap', mapData);
        alert('Mind map saved!');
    });

    const savedMap = localStorage.getItem('savedMindMap');
    if (savedMap) {
        try {
            const parsedMap = JSON.parse(savedMap);
            Object.assign(mindMap, parsedMap);
        } catch (e) {
            console.error('Error loading saved mind map:', e);
        }
    }

    renderMindMap();
});
