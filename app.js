document.addEventListener('DOMContentLoaded', function() {
    const defaultMindMap = {
        id: 'root',
        label: 'Central Topic',
        title: 'Mind Map',
        priority: 'P1',
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
            afterUpdate: function(cfg, node) {
                const group = node.getContainer();
                group.clear();
                console.log('Node afterUpdate called with:', cfg);
                return this.draw(cfg, group);
            },
            draw: function(cfg, group) {
                const { id, label, title, description, tags, priority, collapsed, style = {} } = cfg;
                console.log('Drawing node with:', { id, label, title, priority, tags });
                
                // Create a main group for the node with high z-index
                const mainGroup = group.addGroup({
                    name: 'main-node-group',
                    zIndex: 10
                });
                
                const nodeStyle = {
                    fill: '#4D9DE0',
                    stroke: '#1565C0',
                    radius: 4,
                    ...style
                };
                
                const labelShape = mainGroup.addShape('text', {
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
                
                let titleShape;
                if (title) {
                    console.log('Adding title to node:', title);
                    // Title background at the top of the node
                    mainGroup.addShape('rect', {
                        attrs: {
                            x: 0,
                            y: -24, // Position above the node
                            width: width,
                            height: 20,
                            radius: 4,
                            fill: '#e6f7ff',
                            stroke: '#1890ff',
                            lineWidth: 1,
                            opacity: 1
                        },
                        name: 'title-bg',
                        zIndex: 200 // Extremely high z-index to ensure visibility
                    });
                    
                    titleShape = mainGroup.addShape('text', {
                        attrs: {
                            text: title,
                            x: 8,
                            y: -14, // Center in background above the node
                            fontFamily: 'Segoe UI',
                            fill: '#333',
                            fontSize: 12,
                            fontWeight: 'bold',
                            textAlign: 'left',
                            textBaseline: 'middle',
                            cursor: 'pointer',
                            opacity: 1
                        },
                        name: 'title-shape',
                        zIndex: 205 // Extremely high z-index to ensure visibility
                    });
                    
                    labelShape.attr({
                        x: 12,
                        y: 8 // Original position
                    });
                }
                
                let keyShape;
                if (cfg.type === 'ellipse') {
                    keyShape = mainGroup.addShape('ellipse', {
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
                    keyShape = mainGroup.addShape('polygon', {
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
                    keyShape = mainGroup.addShape('polygon', {
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
                    
                    keyShape = mainGroup.addShape('polygon', {
                        attrs: {
                            points,
                            ...nodeStyle
                        },
                        name: 'key-shape'
                    });
                } else {
                    keyShape = mainGroup.addShape('rect', {
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
                    console.log('Adding priority to node:', priority);
                    const priorityColors = {
                        'P0': '#e74c3c',  // P0 - Red
                        'P1': '#f39c12',  // P1 - Orange
                        'P2': '#3498db'   // P2 - Blue
                    };
                    
                    // Priority indicator on the left side
                    mainGroup.addShape('rect', {
                        attrs: {
                            x: 0,
                            y: 0,
                            width: 4,
                            height: height,
                            fill: priorityColors[priority],
                            opacity: 0.9
                        },
                        name: 'priority-indicator',
                        zIndex: 90
                    });
                    
                    const priorityLabels = {
                        'P0': 'P0',
                        'P1': 'P1',
                        'P2': 'P2'
                    };
                    
                    // Priority label at the bottom of the node
                    mainGroup.addShape('rect', {
                        attrs: {
                            x: width - 30,
                            y: height + 4, // Position below the node
                            width: 26,
                            height: 18,
                            radius: 9,
                            fill: priorityColors[priority],
                            stroke: 'none',
                            opacity: 1
                        },
                        name: 'priority-label-bg',
                        zIndex: 210 // Extremely high z-index to ensure visibility
                    });
                    
                    mainGroup.addShape('text', {
                        attrs: {
                            text: priorityLabels[priority],
                            x: width - 17,
                            y: height + 13, // Position below the node
                            fontSize: 12,
                            fontWeight: 'bold',
                            fill: '#fff',
                            textAlign: 'center',
                            textBaseline: 'middle',
                            opacity: 1
                        },
                        name: 'priority-label-text',
                        zIndex: 215 // Extremely high z-index to ensure visibility
                    });
                }
                
                if (description) {
                    mainGroup.addShape('text', {
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
                    mainGroup.addShape('circle', {
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
                    
                    mainGroup.addShape('text', {
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
                
                // Move tags to the top of the node
                if (tags && tags.length > 0) {
                    const tagsContainer = mainGroup.addGroup({
                        name: 'tags-container',
                        zIndex: 120 // Significantly increased z-index to ensure visibility
                    });
                    
                    let tagX = 0;
                    let tagY = -30; // Position tags further above the node
                    
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
                                width: tag.length * 7 + 8,
                                height: 20,
                                fill: tagColor,
                                radius: 10,
                                stroke: 'rgba(0,0,0,0.1)',
                                lineWidth: 1,
                                shadowColor: 'rgba(0,0,0,0.1)',
                                shadowBlur: 2,
                                shadowOffsetX: 0,
                                shadowOffsetY: 1
                            },
                            name: `tag-bg-${index}`,
                            zIndex: 51
                        });
                        
                        tagsContainer.addShape('text', {
                            attrs: {
                                text: tag,
                                x: tagX + 4,
                                y: tagY + 10,
                                fontSize: 11,
                                fontWeight: 'bold',
                                fill: '#fff',
                                textBaseline: 'middle'
                            },
                            name: `tag-text-${index}`,
                            zIndex: 220 // Extremely high z-index to ensure visibility
                        });
                        
                        tagX += tag.length * 7 + 12;
                        if (tagX > width - 20) {
                            tagX = 0;
                            tagY -= 24; // Move up for next row of tags
                        }
                    });
                }
                
                return mainGroup;
            },
            
            update: (cfg, item) => {
                const group = item.getContainer();
                const keyShape = item.getKeyShape();
                
                let mainGroup = group.find(element => element.get('name') === 'main-node-group');
                if (!mainGroup) {
                    mainGroup = group.addGroup({
                        name: 'main-node-group',
                        zIndex: 10
                    });
                }
                
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
                    mainGroup.addShape('text', {
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
                
                const oldPriorityLabelBg = group.find(element => element.get('name') === 'priority-label-bg');
                if (oldPriorityLabelBg) {
                    oldPriorityLabelBg.remove();
                }
                
                const oldPriorityLabelText = group.find(element => element.get('name') === 'priority-label-text');
                if (oldPriorityLabelText) {
                    oldPriorityLabelText.remove();
                }
                
                if (cfg.priority && cfg.priority !== 'none') {
                    const priorityColors = {
                        'P0': '#e74c3c',
                        'P1': '#f39c12',
                        'P2': '#3498db'
                    };
                    
                    const priorityLabels = {
                        'P0': 'P0',
                        'P1': 'P1',
                        'P2': 'P2'
                    };
                    
                    const bbox = keyShape.getBBox();
                    
                    mainGroup.addShape('rect', {
                        attrs: {
                            x: 0,
                            y: 0,
                            width: 4,
                            height: bbox.height,
                            fill: priorityColors[cfg.priority]
                        },
                        name: 'priority-indicator'
                    });
                    
                    mainGroup.addShape('rect', {
                        attrs: {
                            x: 4,
                            y: bbox.height - 22,
                            width: 26,
                            height: 18,
                            radius: 9,
                            fill: priorityColors[cfg.priority],
                            stroke: 'none'
                        },
                        name: 'priority-label-bg'
                    });
                    
                    mainGroup.addShape('text', {
                        attrs: {
                            text: priorityLabels[cfg.priority],
                            x: 17,
                            y: bbox.height - 13,
                            fontSize: 12,
                            fontWeight: 'bold',
                            fill: '#fff',
                            textAlign: 'center',
                            textBaseline: 'middle'
                        },
                        name: 'priority-label-text'
                    });
                }
                
                if (oldDescIndicator) {
                    oldDescIndicator.remove();
                }
                
                if (cfg.description) {
                    const bbox = keyShape.getBBox();
                    
                    mainGroup.addShape('text', {
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
                    
                    mainGroup.addShape('circle', {
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
                    
                    mainGroup.addShape('text', {
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
                    const tagsContainer = mainGroup.addGroup({
                        name: 'tags-container'
                    });
                    
                    let tagX = 0;
                    let tagY = -24; // Position tags at the top of the node
                    
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
            console.log('Node clicked:', evt);
            const { item } = evt;
            const model = item.getModel();
            console.log('Node model:', model);
            
            if (selectedNode && selectedNode !== model.id) {
                graph.setItemState(graph.findById(selectedNode), 'selected', false);
            }
            
            selectedNode = model.id;
            graph.setItemState(item, 'selected', true);
            
            updateNodeProperties(model);
            
            hideContextMenu();
            
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.add('visible');
                console.log('Added visible class to sidebar');
            }
            
            console.log('Implementing direct popover display for node click');
            
            nodePopover = document.getElementById('node-popover');
            popoverClose = nodePopover.querySelector('.popover-close');
            const popover = nodePopover;
            
            if (popover) {
                const nodeBox = item.getBBox();
                const nodeGroup = item.getContainer();
                const { x, y } = nodeGroup.getCanvasBBox();
                
                const canvasContainer = document.getElementById('mind-map-container');
                const canvasRect = canvasContainer.getBoundingClientRect();
                
                let left = canvasRect.left + x + (nodeBox.width / 2) - 150; // Center popover horizontally
                let top = canvasRect.top + y - 150; // Position above the node
                
                showNodePopover(left, top, model, evt);
                
                popover.style.display = 'block';
                popover.style.zIndex = '9999';
                
                console.log('Direct popover positioned at:', { 
                    left: popover.style.left, 
                    top: popover.style.top,
                    display: popover.style.display,
                    zIndex: popover.style.zIndex
                });
                
                // Update active states based on node properties
                updatePopoverActiveStates(model);
                
                const priorityLabels = popover.querySelectorAll('.priority-label');
                priorityLabels.forEach(label => {
                    const priority = label.getAttribute('data-priority');
                    label.onclick = function(e) {
                        e.stopPropagation();
                        applyPriorityToNode(model.id, priority);
                        updatePopoverActiveStates(model);
                    };
                });
                
                const titleLabels = popover.querySelectorAll('.title-label');
                titleLabels.forEach(label => {
                    const title = label.getAttribute('data-title');
                    label.onclick = function(e) {
                        e.stopPropagation();
                        applyTitleToNode(model.id, title);
                        updatePopoverActiveStates(model);
                    };
                });
                
                if (popoverClose) {
                    popoverClose.onclick = function() {
                        popover.style.display = 'none';
                    };
                }
                
                // evt.stopPropagation();
                
                document.removeEventListener('click', handlePopoverOutsideClick);
                setTimeout(() => {
                    document.addEventListener('click', handlePopoverOutsideClick);
                }, 100);
                
                popover.style.display = 'block';
                popover.style.zIndex = '9999';
                
                console.log('Direct popover setup complete');
            }
        });
        
        function createPopoverElement() {
            const existingPopover = document.getElementById('node-popover');
            if (existingPopover) {
                console.log('Using existing popover element');
                return existingPopover;
            }
            
            // Create new popover if it doesn't exist
            const popover = document.createElement('div');
            popover.id = 'node-popover';
            popover.className = 'node-popover';
            
            popover.innerHTML = `
                <div class="popover-header">
                    <span class="popover-title">Node Properties</span>
                    <span class="popover-close">&times;</span>
                </div>
                <div class="popover-content">
                    <div class="popover-section">
                        <div class="popover-section-title">Priority</div>
                        <div class="popover-labels priority-labels">
                            <span class="popover-label priority-label" data-priority="P0">P0</span>
                            <span class="popover-label priority-label" data-priority="P1">P1</span>
                            <span class="popover-label priority-label" data-priority="P2">P2</span>
                        </div>
                    </div>
                    <div class="popover-section">
                        <div class="popover-section-title">Title Type</div>
                        <div class="popover-labels title-labels">
                            <span class="popover-label title-label" data-title="用例标题">用例标题</span>
                            <span class="popover-label title-label" data-title="前置条件">前置条件</span>
                            <span class="popover-label title-label" data-title="步骤">步骤</span>
                            <span class="popover-label title-label" data-title="预期结果">预期结果</span>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(popover);
            console.log('Popover element created and added to body');
            return popover;
        }
        
        graph.on('node:dblclick', (evt) => {
            console.log('Node double-clicked:', evt);
            const { item } = evt;
            const model = item.getModel();
            
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.zIndex = '10000';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = model.label || '';
            input.style.padding = '4px';
            input.style.border = '1px solid #1890ff';
            input.style.borderRadius = '4px';
            input.style.width = '200px';
            input.style.fontSize = '14px';
            
            container.appendChild(input);
            document.body.appendChild(container);
            
            const bbox = item.getBBox();
            const point = graph.getClientByPoint(bbox.centerX, bbox.centerY);
            container.style.left = `${point.x - 100}px`;
            container.style.top = `${point.y - 15}px`;
            
            input.focus();
            input.select();
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const newLabel = input.value.trim();
                    if (newLabel) {
                        model.label = newLabel;
                        graph.updateItem(item, model);
                        updateNodeProperties(model);
                        history.saveState(graph.save());
                    }
                    document.body.removeChild(container);
                } else if (e.key === 'Escape') {
                    document.body.removeChild(container);
                }
            });
            
            input.addEventListener('blur', () => {
                const newLabel = input.value.trim();
                if (newLabel) {
                    model.label = newLabel;
                    graph.updateItem(item, model);
                    updateNodeProperties(model);
                    history.saveState(graph.save());
                }
                document.body.removeChild(container);
            });
            
            evt.stopPropagation();
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
                    
                    evt.stopPropagation();
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
    
    let nodePopover = document.getElementById('node-popover');
    let popoverClose = document.querySelector('.popover-close');
    
    if (!nodePopover) {
        nodePopover = createPopoverElement();
        popoverClose = nodePopover.querySelector('.popover-close');
        console.log('Popover created and initialized');
    } else {
        document.body.appendChild(nodePopover);
        console.log('Popover initialized and moved to body');
    }
    
    function showNodePopover(x, y, node, evt) {
        console.log('showNodePopover called:', { x, y, node });
        
        const popover = document.getElementById('node-popover');
        nodePopover = popover;
        
        if (!popover) {
            console.error('Popover element not found in showNodePopover');
            return;
        }
        
        if (!document.body.contains(popover)) {
            console.log('Re-appending popover to body');
            document.body.appendChild(popover);
        }
        
        try {
            updatePopoverActiveStates(node);
            
            popover.style.zIndex = '9999';
            popover.style.position = 'fixed'; // Changed to fixed to match CSS
            popover.style.display = 'block';
            
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Position above the node
            let left = x;
            let top = y - 200; // Position well above the node
            
            if (left + 300 > viewportWidth) left = viewportWidth - 310;
            if (left < 10) left = 10;
            if (top < 10) top = 10;
            
            nodePopover.style.left = `${left}px`;
            nodePopover.style.top = `${top}px`;
            
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.add('visible');
            }
            
            document.addEventListener('click', handlePopoverOutsideClick);
            
            if (evt && evt.stopPropagation) {
                evt.stopPropagation();
            }
            
            console.log('Popover positioned at:', { left: nodePopover.style.left, top: nodePopover.style.top });
            
            if (popoverClose) {
                popoverClose.onclick = hideNodePopover;
            }
            
            console.log('Priority labels found:', nodePopover.querySelectorAll('.priority-label').length);
            console.log('Title labels found:', nodePopover.querySelectorAll('.title-label').length);
            
            const priorityLabels = nodePopover.querySelectorAll('.priority-label');
            console.log('Setting up click handlers for priority labels:', priorityLabels.length);
            
            priorityLabels.forEach(label => {
                label.removeEventListener('click', label._clickHandler);
                
                label._clickHandler = function(e) {
                    e.stopPropagation(); // Prevent closing the popover
                    e.preventDefault(); // Prevent default
                    
                    const priority = this.getAttribute('data-priority');
                    console.log('Priority label clicked:', priority, 'for node:', node.id);
                    
                    if (node && node.id) {
                        applyPriorityToNode(node.id, priority);
                        
                        const allLabels = nodePopover.querySelectorAll('.priority-label');
                        allLabels.forEach(l => l.classList.remove('active'));
                        this.classList.add('active');
                        
                        console.log('Priority applied successfully');
                    } else {
                        console.error('Cannot apply priority: Invalid node or node ID');
                    }
                };
                
                label.addEventListener('click', label._clickHandler);
                
                label.style.cursor = 'pointer';
                label.title = 'Click to apply ' + label.getAttribute('data-priority') + ' priority';
                
                console.log('Priority label handler attached:', label.getAttribute('data-priority'));
            });
            
            const titleLabels = nodePopover.querySelectorAll('.title-label');
            console.log('Setting up click handlers for title labels:', titleLabels.length);
            
            titleLabels.forEach(label => {
                label.removeEventListener('click', label._clickHandler);
                
                label._clickHandler = function(e) {
                    e.stopPropagation(); // Prevent closing the popover
                    e.preventDefault(); // Prevent default
                    
                    const title = this.getAttribute('data-title');
                    console.log('Title label clicked:', title, 'for node:', node.id);
                    
                    if (node && node.id) {
                        applyTitleToNode(node.id, title);
                        
                        const allLabels = nodePopover.querySelectorAll('.title-label');
                        allLabels.forEach(l => l.classList.remove('active'));
                        this.classList.add('active');
                        
                        console.log('Title applied successfully');
                    } else {
                        console.error('Cannot apply title: Invalid node or node ID');
                    }
                };
                
                label.addEventListener('click', label._clickHandler);
                
                label.style.cursor = 'pointer';
                label.title = 'Click to apply ' + label.getAttribute('data-title') + ' title';
                
                console.log('Title label handler attached:', label.getAttribute('data-title'));
            });
            
            document.removeEventListener('click', handlePopoverOutsideClick);
            document.addEventListener('click', handlePopoverOutsideClick);
            
            console.log('Popover setup complete');
            
            setTimeout(() => {
                const popoverElement = document.getElementById('node-popover');
                if (popoverElement) {
                    popoverElement.style.display = 'block';
                    console.log('Ensuring popover visibility after setup');
                }
            }, 50);
        } catch (error) {
            console.error('Error in showNodePopover:', error);
        }
    }
    
    function hideNodePopover() {
        if (!nodePopover) return;
        
        nodePopover.style.display = 'none';
        document.removeEventListener('click', handlePopoverOutsideClick);
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('visible');
        }
    }
    
    function handlePopoverOutsideClick(event) {
        console.log('Outside click handler called', event.target);
        if (nodePopover && !nodePopover.contains(event.target) && !event.target.closest('.g6-node') && !event.target.closest('.sidebar')) {
            hideNodePopover();
            
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.remove('visible');
                console.log('Removed visible class from sidebar');
            }
        }
    }
    
    function updatePopoverActiveStates(node) {
        const priorityLabels = nodePopover.querySelectorAll('.priority-label');
        priorityLabels.forEach(label => {
            const priority = label.getAttribute('data-priority');
            if (node.priority === priority) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
        
        const titleLabels = nodePopover.querySelectorAll('.title-label');
        titleLabels.forEach(label => {
            const title = label.getAttribute('data-title');
            if (node.title === title) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
    }
    
    function applyPriorityToNode(nodeId, priority) {
        console.log('applyPriorityToNode called with:', nodeId, priority);
        if (!nodeId) {
            console.error('No nodeId provided to applyPriorityToNode');
            return;
        }
        
        if (nodeId === 'debug') {
            console.log('Debug node detected, applying priority visually only');
            
            // Update the active state in the popover
            const popover = document.getElementById('node-popover');
            if (popover) {
                const allLabels = popover.querySelectorAll('.priority-label');
                allLabels.forEach(l => l.classList.remove('active'));
                
                const selectedLabel = popover.querySelector(`.priority-label[data-priority="${priority}"]`);
                if (selectedLabel) {
                    selectedLabel.classList.add('active');
                }
                
                console.log('Priority visually applied to debug node:', priority);
            }
            
            return;
        }
        
        try {
            const node = graph.findById(nodeId);
            if (!node) {
                console.error('Node not found in graph with id:', nodeId);
                return;
            }
            
            const model = node.getModel();
            console.log('Found node model:', model);
            
            // Update the node model with the priority
            model.priority = priority;
            
            // Update the node in the graph
            graph.updateItem(nodeId, {
                priority: priority
            });
            
            // Force a node redraw to ensure visual elements are updated
            graph.refreshItem(nodeId);
            
            mindMapData = graph.save();
            
            // Update the node properties panel
            if (nodePrioritySelect) {
                const priorityMap = {
                    'P0': 'P0',
                    'P1': 'P1',
                    'P2': 'P2'
                };
                
                if (Array.from(nodePrioritySelect.options).some(opt => opt.value === priority)) {
                    nodePrioritySelect.value = priority;
                } 
                else if (priorityMap[priority]) {
                    nodePrioritySelect.value = priorityMap[priority];
                }
            }
            
            history.saveState(mindMapData);
            
            console.log('Priority successfully applied to node:', priority);
            
            // Update the active state in the popover
            const popover = document.getElementById('node-popover');
            if (popover) {
                const allLabels = popover.querySelectorAll('.priority-label');
                allLabels.forEach(l => l.classList.remove('active'));
                
                const selectedLabel = popover.querySelector(`.priority-label[data-priority="${priority}"]`);
                if (selectedLabel) {
                    selectedLabel.classList.add('active');
                }
            }
        } catch (error) {
            console.error('Error applying priority to node:', error);
        }
    }
    
    function applyTitleToNode(nodeId, title) {
        console.log('applyTitleToNode called with:', nodeId, title);
        if (!nodeId) {
            console.error('No nodeId provided to applyTitleToNode');
            return;
        }
        
        if (nodeId === 'debug') {
            console.log('Debug node detected, applying title visually only');
            
            // Update the active state in the popover
            const popover = document.getElementById('node-popover');
            if (popover) {
                const allLabels = popover.querySelectorAll('.title-label');
                allLabels.forEach(l => l.classList.remove('active'));
                
                const selectedLabel = popover.querySelector(`.title-label[data-title="${title}"]`);
                if (selectedLabel) {
                    selectedLabel.classList.add('active');
                }
                
                console.log('Title visually applied to debug node:', title);
            }
            
            return;
        }
        
        try {
            const node = graph.findById(nodeId);
            if (!node) {
                console.error('Node not found in graph with id:', nodeId);
                return;
            }
            
            const model = node.getModel();
            console.log('Found node model for title update:', model);
            
            // Update the node model with the title
            model.title = title;
            
            // Update the node in the graph
            graph.updateItem(nodeId, {
                title: title
            });
            
            // Force a node redraw to ensure visual elements are updated
            graph.refreshItem(nodeId);
            
            mindMapData = graph.save();
            
            history.saveState(mindMapData);
            
            console.log('Title successfully applied to node:', title);
            
            // Update the active state in the popover
            const popover = document.getElementById('node-popover');
            if (popover) {
                const allLabels = popover.querySelectorAll('.title-label');
                allLabels.forEach(l => l.classList.remove('active'));
                
                const selectedLabel = popover.querySelector(`.title-label[data-title="${title}"]`);
                if (selectedLabel) {
                    selectedLabel.classList.add('active');
                }
            }
        } catch (error) {
            console.error('Error applying title to node:', error);
        }
        
        // if (nodeId !== 'debug') {
        //     hideNodePopover();
        // }
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
            title: 'New Title', // Add default title
            priority: 'P1', // Default priority
            type: 'rect',
            style: {
                fill: '#4D9DE0',
                stroke: '#1565C0',
                radius: 4
            },
            children: []
        };
        
        parent.children.push(newNode);
        
        const currentZoom = graph.getZoom();
        const matrix = graph.get('group').getMatrix();
        
        graph.addItem('node', newNode);
        
        graph.addItem('edge', {
            source: parentId,
            target: newNode.id
        });
        
        history.saveState(graph.save());
        
        if (matrix) {
            graph.get('group').setMatrix(matrix);
            graph.zoomTo(currentZoom);
        }
        
        selectedNode = newNode.id;
        const item = graph.findById(newNode.id);
        if (item) {
            graph.setItemState(item, 'selected', true);
            updateNodeProperties(newNode);
            
            graph.refreshItem(newNode.id);
        }
    }
    
    function addSiblingNode(nodeId) {
        if (!nodeId || nodeId === 'root') return;
        
        const parent = findParentNode(mindMapData, nodeId);
        if (!parent) return;
        
        const newNode = {
            id: generateId(),
            label: 'New Topic',
            title: 'New Title', // Add default title
            priority: 'P1', // Default priority
            type: 'rect',
            style: {
                fill: '#4D9DE0',
                stroke: '#1565C0',
                radius: 4
            },
            children: []
        };
        
        parent.children.push(newNode);
        
        const currentZoom = graph.getZoom();
        const matrix = graph.get('group').getMatrix();
        
        graph.addItem('node', newNode);
        
        graph.addItem('edge', {
            source: parent.id,
            target: newNode.id
        });
        
        history.saveState(graph.save());
        
        if (matrix) {
            graph.get('group').setMatrix(matrix);
            graph.zoomTo(currentZoom);
        }
        
        selectedNode = newNode.id;
        const item = graph.findById(newNode.id);
        if (item) {
            graph.setItemState(item, 'selected', true);
            updateNodeProperties(newNode);
            
            graph.refreshItem(newNode.id);
        }
    }
    
    function removeNode(nodeId) {
        if (!nodeId || nodeId === 'root') return;
        
        const parent = findParentNode(mindMapData, nodeId);
        if (!parent) return;
        
        // Update data model
        parent.children = parent.children.filter(child => child.id !== nodeId);
        
        const currentZoom = graph.getZoom();
        const matrix = graph.get('group').getMatrix();
        
        graph.removeItem(nodeId);
        
        history.saveState(graph.save());
        
        if (matrix) {
            graph.get('group').setMatrix(matrix);
            graph.zoomTo(currentZoom);
        }
        
        selectedNode = parent.id;
        const item = graph.findById(parent.id);
        if (item) {
            graph.setItemState(item, 'selected', true);
            updateNodeProperties(parent);
            
            graph.refreshItem(parent.id);
        }
        
        hideNodePopover();
    }
    
    function toggleNodeCollapse(nodeId) {
        if (!nodeId) return;
        
        const node = findNodeById(mindMapData, nodeId);
        if (!node || !node.children || node.children.length === 0) return;
        
        node.collapsed = !node.collapsed;
        
        graph.updateItem(nodeId, { collapsed: node.collapsed });
        graph.refreshItem(nodeId);
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
            
            graph.refreshItem(newNode.id);
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
        console.log('applyNodeProperties called, selectedNode:', selectedNode);
        if (!selectedNode) return;
        
        if (selectedNode === 'debug') {
            console.log('Debug node detected in applyNodeProperties');
            
            if (nodePrioritySelect) {
                const priorityMap = {
                    '1': 'P0',
                    '2': 'P1',
                    '3': 'P2',
                    'none': null
                };
                
                const priority = nodePrioritySelect.value;
                const mappedPriority = priorityMap[priority] || priority;
                
                console.log('Applying priority to debug node:', priority, 'mapped to:', mappedPriority);
                applyPriorityToNode('debug', mappedPriority);
            }
            
            return;
        }
        
        const graphNode = graph.findById(selectedNode);
        if (!graphNode) {
            console.error('Node not found in graph:', selectedNode);
            return;
        }
        
        const nodeModel = graphNode.getModel();
        console.log('Applying node properties for node:', nodeModel);
        
        // Create a new model with all existing properties
        const newModel = { ...nodeModel };
        
        if (nodeTextInput) {
            newModel.label = nodeTextInput.value;
        }
        
        if (nodeDescInput) {
            newModel.description = nodeDescInput.value;
        }
        
        if (nodeColorInput) {
            if (!newModel.style) {
                newModel.style = {};
            }
            newModel.style.fill = nodeColorInput.value;
            newModel.style.stroke = adjustColor(nodeColorInput.value, -20);
        }
        
        if (nodeShapeSelect) {
            newModel.type = nodeShapeSelect.value;
        }
        
        if (nodePrioritySelect) {
            const priorityMap = {
                '1': 'P0',
                '2': 'P1',
                '3': 'P2',
                'none': null
            };
            
            const priority = nodePrioritySelect.value;
            newModel.priority = priorityMap[priority] || priority;
            
            console.log('Setting priority:', priority, 'mapped to:', newModel.priority);
        }
        
        if (tagsList) {
            const tags = [];
            const tagElements = tagsList.querySelectorAll('.tag-item span');
            tagElements.forEach(tagElement => {
                tags.push(tagElement.textContent);
            });
            newModel.tags = tags;
        }
        
        console.log('New node model:', newModel);
        
        // Update the node directly instead of removing and re-adding
        try {
            graph.updateItem(selectedNode, newModel);
            
            // Update the mindMapData
            mindMapData = graph.save();
            history.saveState(mindMapData);
            
            // Force a refresh of just this node to ensure it's rendered correctly
            graph.refreshItem(selectedNode);
            
            // Update the properties panel
            updateNodeProperties(newModel);
            
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.add('visible');
            }
            
            console.log('Node properties applied successfully with direct update');
        } catch (error) {
            console.error('Error applying node properties:', error);
            
            try {
                const x = nodeModel.x;
                const y = nodeModel.y;
                const parent = findParentNode(mindMapData, selectedNode);
                const children = mindMapData && mindMapData.nodes ? mindMapData.nodes.filter(n => n.parent === selectedNode) : [];
                
                graph.removeItem(selectedNode);
                
                // Add it back with the new properties
                newModel.x = x;
                newModel.y = y;
                newModel.id = selectedNode; // Ensure ID is preserved
                graph.addItem('node', newModel);
                
                if (parent) {
                    graph.addItem('edge', {
                        source: parent.id,
                        target: selectedNode,
                        type: 'cubic-horizontal'
                    });
                }
                
                children.forEach(child => {
                    graph.addItem('edge', {
                        source: selectedNode,
                        target: child.id,
                        type: 'cubic-horizontal'
                    });
                });
                
                mindMapData = graph.save();
                history.saveState(mindMapData);
                graph.refresh();
                
                updateNodeProperties(newModel);
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
            }
        }
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
    
    const debugPopoverBtn = document.getElementById('debug-popover');
    if (debugPopoverBtn) {
        debugPopoverBtn.addEventListener('click', () => {
            console.log('Debug popover button clicked');
            
            if (!document.getElementById('node-popover')) {
                console.error('Popover element not found, creating it dynamically');
                nodePopover = createPopoverElement();
                popoverClose = nodePopover.querySelector('.popover-close');
            }
            
            const popover = document.getElementById('node-popover');
            if (popover) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                popover.style.zIndex = '9999';
                popover.style.position = 'fixed';
                popover.style.display = 'block';
                popover.setAttribute('style', popover.getAttribute('style') + '; display: block !important');
                popover.style.left = `${viewportWidth / 2 - 150}px`;
                popover.style.top = `${viewportHeight / 2 - 150}px`;
                
                console.log('Debug popover positioned at:', { 
                    left: popover.style.left, 
                    top: popover.style.top,
                    display: popover.style.display,
                    zIndex: popover.style.zIndex
                });
                
                const sampleNode = { id: 'debug', priority: 'P1', title: '用例标题' };
                
                setTimeout(() => {
                    // Update active states based on node properties
                    updatePopoverActiveStates(sampleNode);
                    
                    const priorityLabels = popover.querySelectorAll('.priority-label');
                    priorityLabels.forEach(label => {
                        const priority = label.getAttribute('data-priority');
                        label.onclick = function(e) {
                            e.stopPropagation();
                            applyPriorityToNode('debug', priority);
                            updatePopoverActiveStates(sampleNode);
                        };
                    });
                    
                    const titleLabels = popover.querySelectorAll('.title-label');
                    titleLabels.forEach(label => {
                        const title = label.getAttribute('data-title');
                        label.onclick = function(e) {
                            e.stopPropagation();
                            applyTitleToNode('debug', title);
                            updatePopoverActiveStates(sampleNode);
                        };
                    });
                    
                    if (popoverClose) {
                        popoverClose.onclick = function() {
                            popover.style.display = 'none';
                        };
                    }
                    
                    document.removeEventListener('click', handlePopoverOutsideClick);
                    document.addEventListener('click', handlePopoverOutsideClick);
                    
                    
                    console.log('Debug popover setup complete with event handlers');
                }, 100);
            } else {
                console.error('Failed to create or find popover element');
            }
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
            console.log('Tab key pressed, adding child node to', selectedNode);
            if (addChildBtn) {
                addChildBtn.click();
            } else {
                addChildNode(selectedNode);
            }
        }
        
        if (e.key === 'Enter' && selectedNode) {
            e.preventDefault();
            console.log('Enter key pressed, selectedNode:', selectedNode);
            
            if (selectedNode === 'root') {
                console.log('Root node selected, not adding sibling');
                return;
            }
            
            console.log('Adding sibling node to', selectedNode);
            if (addSiblingBtn) {
                addSiblingBtn.click();
            } else {
                addSiblingNode(selectedNode);
            }
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
