// Interactive Concept Mind Map for Linux Administration
(function() {
    const mindMapData = {
        name: "Linux Admin",
        children: [
            {
                name: "Basic Commands",
                color: "#4ecdc4",
                children: [
                    { name: "pwd", description: "Print working directory" },
                    { name: "ls", description: "List files" },
                    { name: "cd", description: "Change directory" },
                    { name: "cat", description: "View file contents" }
                ]
            },
            {
                name: "File System",
                color: "#667eea",
                children: [
                    { name: "mkdir", description: "Create directory" },
                    { name: "touch", description: "Create file" },
                    { name: "cp", description: "Copy files" },
                    { name: "mv", description: "Move/rename files" },
                    { name: "rm", description: "Remove files" }
                ]
            },
            {
                name: "Permissions",
                color: "#764ba2",
                children: [
                    { name: "chmod", description: "Change permissions" },
                    { name: "chown", description: "Change owner" },
                    { name: "umask", description: "Default permissions" }
                ]
            },
            {
                name: "System Admin",
                color: "#ff6b6b",
                children: [
                    { name: "ps", description: "Process list" },
                    { name: "top", description: "System monitor" },
                    { name: "systemctl", description: "Service management" },
                    { name: "apt/yum", description: "Package manager" }
                ]
            }
        ]
    };

    function createMindMap() {
        const container = document.getElementById('mindMapContainer');
        if (!container) return;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '600');
        svg.setAttribute('viewBox', '0 0 1200 600');
        svg.style.background = 'var(--bg-secondary)';
        svg.style.borderRadius = '16px';

        // Center node
        const centerX = 600;
        const centerY = 300;
        const centerRadius = 80;

        // Draw center circle
        const centerGroup = createCircle(centerX, centerY, centerRadius, '#667eea', mindMapData.name, true);
        svg.appendChild(centerGroup);

        // Calculate positions for main branches
        const numBranches = mindMapData.children.length;
        const angleStep = (2 * Math.PI) / numBranches;
        const branchDistance = 250;

        mindMapData.children.forEach((branch, i) => {
            const angle = i * angleStep - Math.PI / 2; // Start from top
            const branchX = centerX + Math.cos(angle) * branchDistance;
            const branchY = centerY + Math.sin(angle) * branchDistance;
            const branchRadius = 60;

            // Draw connecting line from center to branch
            const line = createLine(centerX, centerY, branchX, branchY, branch.color);
            svg.appendChild(line);

            // Draw branch circle
            const branchGroup = createCircle(branchX, branchY, branchRadius, branch.color, branch.name);
            svg.appendChild(branchGroup);

            // Draw child nodes
            const numChildren = branch.children.length;
            const childAngleStep = Math.PI / (numChildren + 1);
            const childDistance = 120;

            branch.children.forEach((child, j) => {
                const childAngle = angle + childAngleStep * (j - numChildren / 2 + 1);
                const childX = branchX + Math.cos(childAngle) * childDistance;
                const childY = branchY + Math.sin(childAngle) * childDistance;
                const childRadius = 35;

                // Draw connecting line from branch to child
                const childLine = createLine(branchX, branchY, childX, childY, branch.color);
                childLine.style.opacity = '0.5';
                svg.appendChild(childLine);

                // Draw child circle
                const childGroup = createCircle(childX, childY, childRadius, branch.color, child.name, false, child.description);
                svg.appendChild(childGroup);
            });
        });

        container.appendChild(svg);
    }

    function createLine(x1, y1, x2, y2, color) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2');
        line.style.opacity = '0.6';
        return line;
    }

    function createCircle(x, y, r, color, text, isCenter = false, description = '') {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'mind-map-node');
        group.style.cursor = 'pointer';

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', color);
        circle.setAttribute('fill-opacity', '0.2');
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', '3');

        // Text
        const textElem = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElem.setAttribute('x', x);
        textElem.setAttribute('y', y);
        textElem.setAttribute('text-anchor', 'middle');
        textElem.setAttribute('dominant-baseline', 'middle');
        textElem.setAttribute('fill', 'var(--text-primary)');
        textElem.setAttribute('font-size', isCenter ? '18' : r > 50 ? '14' : '12');
        textElem.setAttribute('font-weight', isCenter ? 'bold' : '600');
        textElem.textContent = text;

        group.appendChild(circle);
        group.appendChild(textElem);

        // Add hover effects
        group.addEventListener('mouseenter', function() {
            circle.setAttribute('fill-opacity', '0.4');
            circle.setAttribute('stroke-width', '4');

            if (description) {
                showTooltip(x, y, text, description);
            }
        });

        group.addEventListener('mouseleave', function() {
            circle.setAttribute('fill-opacity', '0.2');
            circle.setAttribute('stroke-width', '3');
            hideTooltip();
        });

        return group;
    }

    function showTooltip(x, y, title, description) {
        hideTooltip(); // Remove any existing tooltip

        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tooltip.setAttribute('id', 'mindMapTooltip');
        tooltip.style.pointerEvents = 'none';

        // Tooltip background
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x + 50);
        rect.setAttribute('y', y - 30);
        rect.setAttribute('width', '200');
        rect.setAttribute('height', '60');
        rect.setAttribute('fill', 'var(--bg-secondary)');
        rect.setAttribute('stroke', 'var(--accent-primary)');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '8');
        rect.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';

        // Title text
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', x + 60);
        titleText.setAttribute('y', y - 10);
        titleText.setAttribute('fill', 'var(--accent-primary)');
        titleText.setAttribute('font-size', '14');
        titleText.setAttribute('font-weight', 'bold');
        titleText.textContent = title;

        // Description text
        const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        descText.setAttribute('x', x + 60);
        descText.setAttribute('y', y + 10);
        descText.setAttribute('fill', 'var(--text-secondary)');
        descText.setAttribute('font-size', '12');
        descText.textContent = description;

        tooltip.appendChild(rect);
        tooltip.appendChild(titleText);
        tooltip.appendChild(descText);

        document.querySelector('#mindMapContainer svg').appendChild(tooltip);
    }

    function hideTooltip() {
        const tooltip = document.getElementById('mindMapTooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createMindMap);
    } else {
        createMindMap();
    }
})();
