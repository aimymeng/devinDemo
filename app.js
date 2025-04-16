document.addEventListener('DOMContentLoaded', function() {
    const defaultMindMap = {
        id: 'root',
        label: 'Central Topic',
        title: '思维导图',
        type: 'rect',
        style: {
            fill: '#4D9DE0',
            stroke: '#1565C0',
            radius: 4
        },
        children: []
    };

    let mindMapData = JSON.parse(JSON.stringify(defaultMindMap));
    
    let selectedNode = null;
    
    let clipboard = null;
    
    const history = {
        past: [],
        future: [],
        current: null,
        maxSize: 20,
        
        saveState: function(data) {
            if (this.current !== null) {
                this.past.push(this.current);
                if (this.past.length > this.maxSize) {
                    this.past.shift();
                }
            }
            this.current = JSON.parse(JSON.stringify(data));
            this.future = [];
            
            updateUndoRedoButtons();
        },
        
        undo: function() {
            if (this.past.length === 0) return null;
            
            const previous = this.past.pop();
            this.future.push(this.current);
            this.current = previous;
            
            updateUndoRedoButtons();
            
            return JSON.parse(JSON.stringify(previous));
        },
        
        redo: function() {
            if (this.future.length === 0) return null;
            
            const next = this.future.pop();
            this.past.push(this.current);
            this.current = next;
            
            updateUndoRedoButtons();
            
            return JSON.parse(JSON.stringify(next));
        }
    };
    
    const container = document.getElementById('mind-map-container');
    const nodeTextInput = document.getElementById('node-text');
    const nodeDescInput = document.getElementById('node-desc');
    const nodeTagInput = document.getElementById('node-tag-input');
    const nodeColorInput = document.getElementById('node-color');
    const nodeShapeSelect = document.getElementById('node-shape');
    const nodePrioritySelect = document.getElementById('node-priority');
    const layoutDirectionSelect = document.getElementById('layout-direction');
    const tagsList = document.getElementById('tags-list');
    const contextMenu = document.getElementById('context-menu');
    const nodeTooltip = document.getElementById('node-tooltip');
    const minimapContainer = document.getElementById('minimap');
    
    const addChildBtn = document.getElementById('add-child');
    const addSiblingBtn = document.getElementById('add-sibling');
    const removeNodeBtn = document.getElementById('remove-node');
    const collapseExpandBtn = document.getElementById('collapse-expand');
    const applyPropertiesBtn = document.getElementById('apply-properties');
    const applyLayoutBtn = document.getElementById('apply-layout');
    const addTagBtn = document.getElementById('add-tag');
    const newMapBtn = document.getElementById('new-map');
    const saveMapBtn = document.getElementById('save-map');
    const loadMapBtn = document.getElementById('load-map');
    const exportImageBtn = document.getElementById('export-image');
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomFitBtn = document.getElementById('zoom-fit');
    
    function initGraph() {
        G6.registerNode('xmind-node', {
            draw: (cfg, group) => {
                const { id, label, title, description, tags, priority, collapsed, style = {} } = cfg;
                
                const nodeStyle = {
                    fill: '#4D9DE0',
                    stroke: '#1565C0',
                    radius: 4,
                    ...style
                };
                
                let titleShape;
                if (title) {
                    titleShape = group.addShape('text', {
                        attrs: {
                            text: title,
                            x: 0,
                            y: -20,
                            fontFamily: 'Segoe UI',
                            fill: '#666',
                            fontSize: 12,
                            textAlign: 'left',
                            textBaseline: 'top',
                            cursor: 'pointer'
                        },
                        name: 'title-shape'
                    });
                }
                
                const labelShape = group.addShape('text', {
                    attrs: {
                        text: label || 'Topic',
                        x: 0,
                        y: 0,
                        fontFamily: 'Segoe UI',
                        fill: '#fff',
                        fontSize: 14,
                        textAlign: 'left',
                        textBaseline: 'top',
                        cursor: 'pointer'
                    },
                    name: 'label-shape'
                });
                
                const labelBBox = labelShape.getBBox();
                const width = Math.max(labelBBox.width + 24, 80);
                const height = labelBBox.height + 16;
                
                let keyShape;
                if (cfg.type === 'ellipse') {
                    keyShape = group.addShape('ellipse', {
                        attrs: {
                            x: width / 2,
                            y: height / 2,
                            width: width,
                            height: height,
                            ...nodeStyle
                        },
                        name: 'key-shape'
                    });
                } else if (cfg.type === 'diamond') {
                    const diamondWidth = width * 1.2;
                    const diamondHeight = height * 1.2;
                    keyShape = group.addShape('polygon', {
                        attrs: {
                            points: [
                                [0, diamondHeight / 2],
                                [diamondWidth / 2, 0],
                                [diamondWidth, diamondHeight / 2],
                                [diamondWidth / 2, diamondHeight]
                            ],
                            ...nodeStyle
                        },
                        name: 'key-shape'
                    });
                } else if (cfg.type === 'hexagon') {
                    const hexWidth = width * 1.1;
                    const hexHeight = height * 1.2;
                    keyShape = group.addShape('polygon', {
                        attrs: {
                            points: [
                                [hexWidth * 0.25, 0],
                                [hexWidth * 0.75, 0],
                                [hexWidth, hexHeight * 0.5],
                                [hexWidth * 0.75, hexHeight],
                                [hexWidth * 0.25, hexHeight],
                                [0, hexHeight * 0.5]
                            ],
                            ...nodeStyle
                        },
                        name: 'key-shape'
                    });
                } else if (cfg.type === 'star') {
                    const starRadius = Math.max(width, height) / 2;
                    const outerRadius = starRadius;
                    const innerRadius = starRadius * 0.4;
                    const points = [];
                    
                    for (let i = 0; i < 5; i++) {
                        const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                        const innerAngle = outerAngle + Math.PI / 5;
                        
                        points.push([
                            starRadius + outerRadius * Math.cos(outerAngle),
                            starRadius + outerRadius * Math.sin(outerAngle)
                        ]);
                        
                        points.push([
                            starRadius + innerRadius * Math.cos(innerAngle),
                            starRadius + innerRadius * Math.sin(innerAngle)
                        ]);
                    }
                    
                    keyShape = group.addShape('polygon', {
                        attrs: {
                            points,
                            ...nodeStyle
                        },
                        name: 'key-shape'
                    });
                } else {
                    keyShape = group.addShape('rect', {
                        attrs: {
                            x: 0,
                            y: 0,
                            width: width,
                            height: height,
                            ...nodeStyle
                        },
                        name: 'key-shape'
                    });
                }
                
                labelShape.attr({
                    x: 12,
                    y: 8
                });
                
                if (priority && priority !== 'none') {
                    const priorityColors = {
                        '1': '#e74c3c',
                        '2': '#f39c12',
                        '3': '#3498db'
                    };
                    
                    group.addShape('rect', {
                        attrs: {
                            x: 0,
                            y: 0,
                            width: 4,
                            height: height,
                            fill: priorityColors[priority]
                        },
                        name: 'priority-indicator'
                    });
                }
                
                if (description) {
                    group.addShape('text', {
                        attrs: {
                            text: '📝',
                            x: width - 16,
                            y: height - 16,
                            fontSize: 12,
                            fill: 'rgba(255, 255, 255, 0.8)',
                            cursor: 'pointer'
                        },
                        name: 'description-indicator'
                    });
                }
                
                if (collapsed && cfg.children && cfg.children.length > 0) {
                    group.addShape('circle', {
                        attrs: {
                            x: width,
                            y: height / 2,
                            r: 6,
                            fill: '#fff',
                            stroke: '#666',
                            lineWidth: 1
                        },
                        name: 'collapsed-indicator'
                    });
                    
                    group.addShape('text', {
                        attrs: {
                            text: '+',
                            x: width - 3,
                            y: height / 2,
                            fontSize: 10,
                            fill: '#666',
                            textAlign: 'center',
                            textBaseline: 'middle'
                        },
                        name: 'collapsed-text'
                    });
                }
                
                if (tags && tags.length > 0) {
                    const tagsContainer = group.addGroup({
                        name: 'tags-container'
                    });
                    
                    let tagX = 12;
                    let tagY = height - 24;
                    
                    tags.forEach((tag, index) => {
                        const tagColors = {
                            'P0': '#e74c3c',
                            'P1': '#f39c12',
                            'P2': '#3498db',
                            'LIN': '#2ecc71',
                            '通过': '#27ae60',
                            'Android': '#9b59b6',
                            'iOS': '#34495e',
                            'default': '#95a5a6'
                        };
                        
                        const tagColor = tagColors[tag] || tagColors.default;
                        
                        const tagBg = tagsContainer.addShape('rect', {
                            attrs: {
                                x: tagX,
                                y: tagY,
                                width: tag.length * 6 + 8,
                                height: 16,
                                fill: tagColor,
                                radius: 8
                            },
                            name: `tag-bg-${index}`
                        });
                        
                        tagsContainer.addShape('text', {
                            attrs: {
                                text: tag,
                                x: tagX + 4,
                                y: tagY + 8,
                                fontSize: 10,
                                fill: '#fff',
                                textBaseline: 'middle'
                            },
                            name: `tag-text-${index}`
                        });
                        
                        tagX += tag.length * 6 + 12;
                        if (tagX > width - 20) {
                            tagX = 12;
                            tagY -= 20;
                        }
                    });
                }
                
                return keyShape;
            },
            
            update: (cfg, item) => {
                const group = item.getContainer();
                const keyShape = item.getKeyShape();
                const labelShape = group.find(element => element.get('name') === 'label-shape');
                const titleShape = group.find(element => element.get('name') === 'title-shape');
                const oldPriorityIndicator = group.find(element => element.get('name') === 'priority-indicator');
                const oldDescIndicator = group.find(element => element.get('name') === 'description-indicator');
                const oldCollapsedIndicator = group.find(element => element.get('name') === 'collapsed-indicator');
                const oldCollapsedText = group.find(element => element.get('name') === 'collapsed-text');
                const oldTagsContainer = group.find(element => element.get('name') === 'tags-container');
                
                if (labelShape) {
                    labelShape.attr('text', cfg.label || 'Topic');
                }
                
                if (titleShape) {
                    if (cfg.title) {
                        titleShape.attr('text', cfg.title);
                    } else {
                        titleShape.remove();
                    }
                } else if (cfg.title) {
                    group.addShape('text', {
                        attrs: {
                            text: cfg.title,
                            x: 0,
                            y: -20,
                            fontFamily: 'Segoe UI',
                            fill: '#666',
                            fontSize: 12,
                            textAlign: 'left',
                            textBaseline: 'top',
                            cursor: 'pointer'
                        },
                        name: 'title-shape'
                    });
                }
                
                if (cfg.style) {
                    keyShape.attr({
                        fill: cfg.style.fill,
                        stroke: cfg.style.stroke
                    });
                }
                
                if (oldPriorityIndicator) {
                    oldPriorityIndicator.remove();
                }
                
                if (cfg.priority && cfg.priority !== 'none') {
                    const priorityColors = {
                        '1': '#e74c3c',
                        '2': '#f39c12',
                        '3': '#3498db'
                    };
                    
                    const bbox = keyShape.getBBox();
                    
                    group.addShape('rect', {
                        attrs: {
                            x: 0,
                            y: 0,
                            width: 4,
                            height: bbox.height,
                            fill: priorityColors[cfg.priority]
                        },
                        name: 'priority-indicator'
                    });
                }
                
                if (oldDescIndicator) {
                    oldDescIndicator.remove();
                }
                
                if (cfg.description) {
                    const bbox = keyShape.getBBox();
                    
                    group.addShape('text', {
                        attrs: {
                            text: '📝',
                            x: bbox.width - 16,
                            y: bbox.height - 16,
                            fontSize: 12,
                            fill: 'rgba(255, 255, 255, 0.8)',
                            cursor: 'pointer'
                        },
                        name: 'description-indicator'
                    });
                }
                
                if (oldCollapsedIndicator) {
                    oldCollapsedIndicator.remove();
                }
                
                if (oldCollapsedText) {
                    oldCollapsedText.remove();
                }
                
                if (cfg.collapsed && cfg.children && cfg.children.length > 0) {
                    const bbox = keyShape.getBBox();
                    
                    group.addShape('circle', {
                        attrs: {
                            x: bbox.width,
                            y: bbox.height / 2,
                            r: 6,
                            fill: '#fff',
                            stroke: '#666',
                            lineWidth: 1
                        },
                        name: 'collapsed-indicator'
                    });
                    
                    group.addShape('text', {
                        attrs: {
                            text: '+',
                            x: bbox.width - 3,
                            y: bbox.height / 2,
                            fontSize: 10,
                            fill: '#666',
                            textAlign: 'center',
                            textBaseline: 'middle'
                        },
                        name: 'collapsed-text'
                    });
                }
                
                if (oldTagsContainer) {
                    oldTagsContainer.remove();
                }
                
                if (cfg.tags && cfg.tags.length > 0) {
                    const bbox = keyShape.getBBox();
                    const tagsContainer = group.addGroup({
                        name: 'tags-container'
                    });
                    
                    let tagX = 12;
                    let tagY = bbox.height - 24;
                    
                    cfg.tags.forEach((tag, index) => {
                        const tagColors = {
                            'P0': '#e74c3c',
                            'P1': '#f39c12',
                            'P2': '#3498db',
                            'LIN': '#2ecc71',
                            '通过': '#27ae60',
                            'Android': '#9b59b6',
                            'iOS': '#34495e',
                            'default': '#95a5a6'
                        };
                        
                        const tagColor = tagColors[tag] || tagColors.default;
                        
                        tagsContainer.addShape('rect', {
                            attrs: {
                                x: tagX,
                                y: tagY,
                                width: tag.length * 6 + 8,
                                height: 16,
                                fill: tagColor,
                                radius: 8
                            },
                            name: `tag-bg-${index}`
                        });
                        
                        tagsContainer.addShape('text', {
                            attrs: {
                                text: tag,
                                x: tagX + 4,
                                y: tagY + 8,
                                fontSize: 10,
                                fill: '#fff',
                                textBaseline: 'middle'
                            },
                            name: `tag-text-${index}`
                        });
                        
                        tagX += tag.length * 6 + 12;
                        if (tagX > bbox.width - 20) {
                            tagX = 12;
                            tagY -= 20;
                        }
                    });
                }
            }
        });
        
        const width = container.scrollWidth || 800;
        const height = container.scrollHeight || 600;
        
        const graph = new G6.TreeGraph({
            container: 'mind-map-container',
            width,
            height,
            modes: {
                default: [
                    'drag-canvas',
                    'zoom-canvas',
                    {
                        type: 'drag-node',
                        enableDelegate: true
                    }
                ]
            },
            defaultNode: {
                type: 'xmind-node',
                style: {
                    fill: '#4D9DE0',
                    stroke: '#1565C0',
                    radius: 4
                }
            },
            defaultEdge: {
                type: 'cubic-horizontal',
                style: {
                    stroke: '#A3B1BF',
                    lineWidth: 2,
                    endArrow: false
                }
            },
            layout: {
                type: 'mindmap',
                direction: 'H',
                getHeight: () => {
                    return 25;
                },
                getWidth: () => {
                    return 100;
                },
                getVGap: () => {
                    return 20;
                },
                getHGap: () => {
                    return 40;
                },
                getSide: (d) => {
                    return 'right';
                }
            },
            fitView: true,
            animate: true,
            plugins: [
                new G6.Minimap({
                    container: minimapContainer,
                    size: [150, 100]
                })
            ]
        });

        graph.on('node:click', (evt) => {
            const { item } = evt;
            const model = item.getModel();
            
            if (selectedNode && selectedNode !== model.id) {
                graph.setItemState(graph.findById(selectedNode), 'selected', false);
            }
            
            selectedNode = model.id;
            graph.setItemState(item, 'selected', true);
            
            updateNodeProperties(model);
            
            hideContextMenu();
        });
        
        graph.on('canvas:click', () => {
            if (selectedNode) {
                graph.setItemState(graph.findById(selectedNode), 'selected', false);
                selectedNode = null;
                clearNodeProperties();
            }
            
            hideContextMenu();
        });
        
        graph.on('node:contextmenu', (evt) => {
            evt.preventDefault();
            const { item, clientX, clientY } = evt;
            const model = item.getModel();
            
            if (selectedNode && selectedNode !== model.id) {
                graph.setItemState(graph.findById(selectedNode), 'selected', false);
            }
            selectedNode = model.id;
            graph.setItemState(item, 'selected', true);
            
            updateNodeProperties(model);
            
            showContextMenu(clientX, clientY, model);
        });

        graph.on('node:mouseenter', (evt) => {
            const { item } = evt;
            const model = item.getModel();
            
            if (model.description) {
                nodeTooltip.innerHTML = `<div class="node-desc-tooltip">${model.description}</div>`;
                nodeTooltip.style.display = 'block';
                nodeTooltip.style.left = `${evt.clientX + 10}px`;
                nodeTooltip.style.top = `${evt.clientY + 10}px`;
            }
        });
        
        graph.on('node:mouseleave', () => {
            nodeTooltip.style.display = 'none';
        });
        
        graph.on('node:click', (evt) => {
            const { item, target } = evt;
            const targetName = target.get('name');
            
            if (targetName === 'collapsed-indicator' || targetName === 'collapsed-text') {
                const model = item.getModel();
                
                if (model.children && model.children.length > 0) {
                    graph.updateItem(item, {
                        collapsed: !model.collapsed
                    });
                    
                    history.saveState(graph.save());
                    
                    graph.layout();
                    graph.fitView();
                }
            }
        });
        
        graph.on('node:dblclick', (evt) => {
            const { item, target } = evt;
            const targetName = target.get('name');
            
            if (targetName === 'label-shape' || targetName === 'key-shape') {
                const model = item.getModel();
                selectedNode = model.id;
                
                if (nodeTextInput) {
                    nodeTextInput.value = model.label || '';
                    nodeTextInput.focus();
                    nodeTextInput.select();
                    
                    const enterHandler = (e) => {
                        if (e.key === 'Enter') {
                            applyNodeProperties();
                            nodeTextInput.removeEventListener('keypress', enterHandler);
                        }
                    };
                    
                    nodeTextInput.addEventListener('keypress', enterHandler);
                }
            }
        });
        
        return graph;
    }
    
    function findNodeById(tree, id) {
        if (tree.id === id) {
            return tree;
        }
        
        if (tree.children) {
            for (let i = 0; i < tree.children.length; i++) {
                const found = findNodeById(tree.children[i], id);
                if (found) {
                    return found;
                }
            }
        }
        
        return null;
    }
    
    function findParentNode(tree, id) {
        if (!tree.children) {
            return null;
        }
        
        for (let i = 0; i < tree.children.length; i++) {
            if (tree.children[i].id === id) {
                return tree;
            }
            
            const found = findParentNode(tree.children[i], id);
            if (found) {
                return found;
            }
        }
        
        return null;
    }
    
    function generateId() {
        return 'node_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    
    function updateUndoRedoButtons() {
        if (undoBtn) {
            undoBtn.disabled = history.past.length === 0;
        }
        
        if (redoBtn) {
            redoBtn.disabled = history.future.length === 0;
        }
    }
    
    function showContextMenu(x, y, node) {
        if (!contextMenu) return;
        
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        
        const menuItems = contextMenu.querySelectorAll('li');
        menuItems.forEach(item => {
            item.onclick = (e) => {
                e.stopPropagation();
                const action = item.getAttribute('data-action');
                
                switch (action) {
                    case 'add-child':
                        addChildNode(node.id);
                        break;
                    case 'add-sibling':
                        addSiblingNode(node.id);
                        break;
                    case 'edit':
                        if (nodeTextInput) {
                            nodeTextInput.focus();
                        }
                        break;
                    case 'delete':
                        removeNode(node.id);
                        break;
                    case 'collapse':
                        toggleNodeCollapse(node.id);
                        break;
                    case 'copy':
                        copyNode(node.id);
                        break;
                    case 'paste':
                        pasteNode(node.id);
                        break;
                    case 'cut':
                        cutNode(node.id);
                        break;
                }
                
                hideContextMenu();
            };
        });
        
        document.addEventListener('click', hideContextMenu);
    }
    
    function hideContextMenu() {
        if (!contextMenu) return;
        
        contextMenu.style.display = 'none';
        document.removeEventListener('click', hideContextMenu);
    }
    
    function updateNodeProperties(node) {
        if (!node) return;
        
        if (nodeTextInput) {
            nodeTextInput.value = node.label || '';
        }
        
        if (nodeDescInput) {
            nodeDescInput.value = node.description || '';
        }
        
        if (nodeColorInput && node.style) {
            nodeColorInput.value = node.style.fill || '#4D9DE0';
        }
        
        if (nodeShapeSelect) {
            nodeShapeSelect.value = node.type || 'rect';
        }
        
        if (nodePrioritySelect) {
            nodePrioritySelect.value = node.priority || 'none';
        }
        
        updateTagsList(node.tags || []);
        enableNodeButtons(node);
    }
    
    function clearNodeProperties() {
        if (nodeTextInput) nodeTextInput.value = '';
        if (nodeDescInput) nodeDescInput.value = '';
        if (nodeColorInput) nodeColorInput.value = '#4D9DE0';
        if (nodeShapeSelect) nodeShapeSelect.value = 'rect';
        if (nodePrioritySelect) nodePrioritySelect.value = 'none';
        
        updateTagsList([]);
        disableNodeButtons();
    }
    
    function updateTagsList(tags) {
        if (!tagsList) return;
        
        tagsList.innerHTML = '';
        
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item';
            
            const tagText = document.createElement('span');
            tagText.textContent = tag;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-tag';
            removeBtn.textContent = '×';
            removeBtn.onclick = () => {
                removeTag(tag);
            };
            
            tagElement.appendChild(tagText);
            tagElement.appendChild(removeBtn);
            tagsList.appendChild(tagElement);
        });
    }
    
    function enableNodeButtons(node) {
        if (addChildBtn) addChildBtn.disabled = false;
        if (removeNodeBtn) removeNodeBtn.disabled = node.id === 'root';
        if (addSiblingBtn) addSiblingBtn.disabled = node.id === 'root';
        if (collapseExpandBtn) {
            const hasChildren = node.children && node.children.length > 0;
            collapseExpandBtn.disabled = !hasChildren;
            collapseExpandBtn.textContent = node.collapsed ? 'Expand' : 'Collapse';
        }
        if (applyPropertiesBtn) applyPropertiesBtn.disabled = false;
    }
    
    function disableNodeButtons() {
        if (addChildBtn) addChildBtn.disabled = true;
        if (removeNodeBtn) removeNodeBtn.disabled = true;
        if (addSiblingBtn) addSiblingBtn.disabled = true;
        if (collapseExpandBtn) collapseExpandBtn.disabled = true;
        if (applyPropertiesBtn) applyPropertiesBtn.disabled = true;
    }
    
    function addChildNode(parentId) {
        if (!parentId) return;
        
        const parent = findNodeById(mindMapData, parentId);
        if (!parent) return;
        
        if (!parent.children) {
            parent.children = [];
        }
        
        const newNode = {
            id: generateId(),
            label: 'New Topic',
            type: 'rect',
            style: {
                fill: '#4D9DE0',
                stroke: '#1565C0',
                radius: 4
            },
            children: []
        };
        
        parent.children.push(newNode);
        
        graph.changeData(mindMapData);
        history.saveState(graph.save());
        
        selectedNode = newNode.id;
        const item = graph.findById(newNode.id);
        if (item) {
            graph.setItemState(item, 'selected', true);
            updateNodeProperties(newNode);
        }
    }
    
    function addSiblingNode(nodeId) {
        if (!nodeId || nodeId === 'root') return;
        
        const parent = findParentNode(mindMapData, nodeId);
        if (!parent) return;
        
        const newNode = {
            id: generateId(),
            label: 'New Topic',
            type: 'rect',
            style: {
                fill: '#4D9DE0',
                stroke: '#1565C0',
                radius: 4
            },
            children: []
        };
        
        parent.children.push(newNode);
        
        graph.changeData(mindMapData);
        history.saveState(graph.save());
        
        selectedNode = newNode.id;
        const item = graph.findById(newNode.id);
        if (item) {
            graph.setItemState(item, 'selected', true);
            updateNodeProperties(newNode);
        }
    }
    
    function removeNode(nodeId) {
        if (!nodeId || nodeId === 'root') return;
        
        const parent = findParentNode(mindMapData, nodeId);
        if (!parent) return;
        
        parent.children = parent.children.filter(child => child.id !== nodeId);
        
        graph.changeData(mindMapData);
        history.saveState(graph.save());
        
        selectedNode = null;
        clearNodeProperties();
    }
    
    function toggleNodeCollapse(nodeId) {
        if (!nodeId) return;
        
        const node = findNodeById(mindMapData, nodeId);
        if (!node || !node.children || node.children.length === 0) return;
        
        node.collapsed = !node.collapsed;
        
        graph.changeData(mindMapData);
        history.saveState(graph.save());
        
        if (collapseExpandBtn) {
            collapseExpandBtn.textContent = node.collapsed ? 'Expand' : 'Collapse';
        }
    }
    
    function copyNode(nodeId) {
        if (!nodeId) return;
        
        const node = findNodeById(mindMapData, nodeId);
        if (!node) return;
        
        clipboard = JSON.parse(JSON.stringify(node));
    }
    
    function cutNode(nodeId) {
        if (!nodeId || nodeId === 'root') return;
        
        copyNode(nodeId);
        removeNode(nodeId);
    }
    
    function pasteNode(targetId) {
        if (!targetId || !clipboard) return;
        
        const target = findNodeById(mindMapData, targetId);
        if (!target) return;
        
        if (!target.children) {
            target.children = [];
        }
        
        function createCopyWithNewIds(node) {
            const copy = JSON.parse(JSON.stringify(node));
            copy.id = generateId();
            
            if (copy.children && copy.children.length > 0) {
                copy.children = copy.children.map(child => createCopyWithNewIds(child));
            }
            
            return copy;
        }
        
        const newNode = createCopyWithNewIds(clipboard);
        target.children.push(newNode);
        
        graph.changeData(mindMapData);
        history.saveState(graph.save());
        
        selectedNode = newNode.id;
        const item = graph.findById(newNode.id);
        if (item) {
            graph.setItemState(item, 'selected', true);
            updateNodeProperties(newNode);
        }
    }
    
    function addTag(tag) {
        if (!tag || !selectedNode) return;
        
        const node = findNodeById(mindMapData, selectedNode);
        if (!node) return;
        
        if (!node.tags) {
            node.tags = [];
        }
        
        if (node.tags.includes(tag)) return;
        
        node.tags.push(tag);
        
        graph.updateItem(selectedNode, node);
        history.saveState(graph.save());
        
        updateTagsList(node.tags);
    }
    
    function removeTag(tag) {
        if (!tag || !selectedNode) return;
        
        const node = findNodeById(mindMapData, selectedNode);
        if (!node || !node.tags) return;
        
        node.tags = node.tags.filter(t => t !== tag);
        
        graph.updateItem(selectedNode, node);
        history.saveState(graph.save());
        
        updateTagsList(node.tags);
    }
    
    function applyNodeProperties() {
        if (!selectedNode) return;
        
        const node = findNodeById(mindMapData, selectedNode);
        if (!node) return;
        
        if (nodeTextInput) {
            node.label = nodeTextInput.value;
        }
        
        if (nodeDescInput) {
            node.description = nodeDescInput.value;
        }
        
        if (nodeColorInput) {
            if (!node.style) {
                node.style = {};
            }
            node.style.fill = nodeColorInput.value;
            node.style.stroke = adjustColor(nodeColorInput.value, -20);
        }
        
        if (nodeShapeSelect) {
            node.type = nodeShapeSelect.value;
        }
        
        if (nodePrioritySelect) {
            node.priority = nodePrioritySelect.value;
        }
        
        graph.updateItem(selectedNode, node);
        
        const data = graph.save();
        mindMapData = data;
        
        history.saveState(data);
        
        graph.changeData(mindMapData);
        
        updateNodeProperties(node);
    }
    
    function adjustColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => 
            ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
        );
    }
    
    function applyLayout() {
        if (!layoutDirectionSelect) return;
        
        const direction = layoutDirectionSelect.value;
        
        graph.updateLayout({
            type: 'mindmap',
            direction: direction,
            getHeight: () => 25,
            getWidth: () => 100,
            getVGap: () => 20,
            getHGap: () => 40,
            getSide: () => 'right'
        });
        
        graph.layout();
        graph.fitView();
    }
    
    function createNewMap() {
        mindMapData = JSON.parse(JSON.stringify(defaultMindMap));
        
        graph.changeData(mindMapData);
        history.saveState(graph.save());
        
        selectedNode = null;
        clearNodeProperties();
    }
    
    function saveMap() {
        const data = JSON.stringify(mindMapData);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mind-map.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    function loadMap() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    mindMapData = data;
                    
                    graph.changeData(mindMapData);
                    history.saveState(graph.save());
                    
                    selectedNode = null;
                    clearNodeProperties();
                } catch (error) {
                    console.error('Error loading mind map:', error);
                    alert('Error loading mind map. Please check the file format.');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    function exportImage() {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mind-map.png';
        a.click();
    }
    
    if (addChildBtn) {
        addChildBtn.addEventListener('click', () => {
            if (selectedNode) {
                addChildNode(selectedNode);
            }
        });
    }
    
    if (addSiblingBtn) {
        addSiblingBtn.addEventListener('click', () => {
            if (selectedNode && selectedNode !== 'root') {
                addSiblingNode(selectedNode);
            }
        });
    }
    
    if (removeNodeBtn) {
        removeNodeBtn.addEventListener('click', () => {
            if (selectedNode && selectedNode !== 'root') {
                removeNode(selectedNode);
            }
        });
    }
    
    if (collapseExpandBtn) {
        collapseExpandBtn.addEventListener('click', () => {
            if (selectedNode) {
                toggleNodeCollapse(selectedNode);
            }
        });
    }
    
    if (applyPropertiesBtn) {
        applyPropertiesBtn.addEventListener('click', () => {
            applyNodeProperties();
        });
    }
    
    if (applyLayoutBtn) {
        applyLayoutBtn.addEventListener('click', () => {
            applyLayout();
        });
    }
    
    if (addTagBtn) {
        addTagBtn.addEventListener('click', () => {
            if (selectedNode && nodeTagInput && nodeTagInput.value.trim()) {
                addTag(nodeTagInput.value.trim());
                nodeTagInput.value = '';
            }
        });
    }
    
    if (nodeTagInput) {
        nodeTagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && nodeTagInput.value.trim()) {
                addTag(nodeTagInput.value.trim());
                nodeTagInput.value = '';
            }
        });
    }
    
    if (newMapBtn) {
        newMapBtn.addEventListener('click', () => {
            if (confirm('Create a new mind map? All unsaved changes will be lost.')) {
                createNewMap();
            }
        });
    }
    
    if (saveMapBtn) {
        saveMapBtn.addEventListener('click', () => {
            saveMap();
        });
    }
    
    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', () => {
            if (confirm('Load a mind map? All unsaved changes will be lost.')) {
                loadMap();
            }
        });
    }
    
    if (exportImageBtn) {
        exportImageBtn.addEventListener('click', () => {
            exportImage();
        });
    }
    
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            const data = history.undo();
            if (data) {
                graph.read(data);
                mindMapData = graph.save();
                
                selectedNode = null;
                clearNodeProperties();
            }
        });
    }
    
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            const data = history.redo();
            if (data) {
                graph.read(data);
                mindMapData = graph.save();
                
                selectedNode = null;
                clearNodeProperties();
            }
        });
    }
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            const zoom = graph.getZoom();
            graph.zoomTo(zoom * 1.1);
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            const zoom = graph.getZoom();
            graph.zoomTo(zoom / 1.1);
        });
    }
    
    if (zoomFitBtn) {
        zoomFitBtn.addEventListener('click', () => {
            graph.fitView();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            if (!e.shiftKey && undoBtn && !undoBtn.disabled) {
                undoBtn.click();
            }
            else if (e.shiftKey && redoBtn && !redoBtn.disabled) {
                redoBtn.click();
            }
        }
        
        if (e.ctrlKey && e.key === 'y' && redoBtn && !redoBtn.disabled) {
            e.preventDefault();
            redoBtn.click();
        }
        
        if (e.key === 'Tab' && selectedNode) {
            e.preventDefault();
            addChildBtn.click();
        }
        
        if (e.key === 'Enter' && selectedNode && selectedNode !== 'root') {
            e.preventDefault();
            addSiblingBtn.click();
        }
        
        if ((e.key === 'Delete' || e.key === 'Backspace') && 
            selectedNode && selectedNode !== 'root') {
            e.preventDefault();
            removeNodeBtn.click();
        }
        
        if (e.key === ' ' && selectedNode && collapseExpandBtn && !collapseExpandBtn.disabled) {
            e.preventDefault();
            collapseExpandBtn.click();
        }
        
        if (e.ctrlKey && e.key === 'c' && selectedNode) {
            e.preventDefault();
            copyNode(selectedNode);
        }
        
        if (e.ctrlKey && e.key === 'x' && selectedNode && selectedNode !== 'root') {
            e.preventDefault();
            cutNode(selectedNode);
        }
        
        if (e.ctrlKey && e.key === 'v' && selectedNode && clipboard) {
            e.preventDefault();
            pasteNode(selectedNode);
        }
        
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveMap();
        }
        
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            if (confirm('Load a mind map? All unsaved changes will be lost.')) {
                loadMap();
            }
        }
        
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            if (confirm('Create a new mind map? All unsaved changes will be lost.')) {
                createNewMap();
            }
        }
        
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            exportImage();
        }
        
        if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            zoomInBtn.click();
        }
        
        if (e.key === '-') {
            e.preventDefault();
            zoomOutBtn.click();
        }
        
        if (e.key === '0') {
            e.preventDefault();
            zoomFitBtn.click();
        }
    });
    
    window.addEventListener('resize', () => {
        if (graph) {
            graph.changeSize(container.scrollWidth, container.scrollHeight);
            graph.fitView();
        }
    });
    
    const graph = initGraph();
    
    graph.data(mindMapData);
    graph.render();
    graph.fitView();
    
    history.saveState(graph.save());
    
    updateUndoRedoButtons();
});
