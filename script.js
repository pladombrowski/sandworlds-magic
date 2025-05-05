document.addEventListener('DOMContentLoaded', function() {
    // Get the SVG object
    const svgObject = document.getElementById('magic-svg');

    // Wait for the SVG to load
    svgObject.addEventListener('load', function() {
        // Get the SVG document
        const svgDoc = svgObject.contentDocument;

        // Define the primary and secondary circle IDs
        const primaryIds = ['water', 'air', 'light', 'dark', 'fire', 'earth'];
        const secondaryIds = [
            { id: 'frost', requires: ['water', 'air'] },
            { id: 'holy', requires: ['water', 'light'] },
            { id: 'decay', requires: ['water', 'dark'] },
            { id: 'nature', requires: ['water', 'earth'] },
            { id: 'ilusion', requires: ['air', 'light'] },
            { id: 'lightning', requires: ['air', 'fire'] },
            { id: 'psychic', requires: ['air', 'dark'] },
            { id: 'undeath', requires: ['dark', 'earth'] },
            { id: 'demonic', requires: ['dark', 'fire'] },
            { id: 'arcane', requires: ['fire', 'light'] },
            { id: 'volcanic', requires: ['fire', 'earth'] },
            { id: 'enchancement', requires: ['earth', 'light'] }
        ];

        // Find the primary and secondary circle elements in the SVG
        const primaryCircles = [];
        const secondaryCircles = [];

        // Find primary circles by their group IDs
        primaryIds.forEach(id => {
            // Find the group containing the circle and text for this primary magic type
            const group = findGroupByText(svgDoc, id.toUpperCase());
            if (group) {
                // Add data attributes to the group
                group.setAttribute('data-type', id);
                group.setAttribute('data-points', '0');
                group.setAttribute('data-primary', 'true');

                // Add the group to the primaryCircles array
                primaryCircles.push(group);

                // Add click event listener
                group.addEventListener('click', function() {
                    incrementPoints(this);
                    checkSecondaryCircles();
                });

                // Add points display
                addPointsDisplay(group);
            }
        });

        // Find secondary circles by their group IDs
        secondaryIds.forEach(item => {
            // Find the group containing the circle and text for this secondary magic type
            const group = findGroupByText(svgDoc, item.id.toUpperCase());
            if (group) {
                // Add data attributes to the group
                group.setAttribute('data-type', item.id);
                group.setAttribute('data-points', '0');
                group.setAttribute('data-requires', item.requires.join(','));
                group.setAttribute('data-secondary', 'true');
                group.classList.add('disabled');

                // Add the group to the secondaryCircles array
                secondaryCircles.push(group);

                // Add click event listener
                group.addEventListener('click', function() {
                    if (!this.classList.contains('disabled')) {
                        incrementPoints(this);
                    }
                });

                // Add points display
                addPointsDisplay(group);
            }
        });

        // Function to find a group by the text content
        function findGroupByText(doc, text) {
            const groups = doc.querySelectorAll('g');
            for (let i = 0; i < groups.length; i++) {
                const textElement = groups[i].querySelector('text');
                if (textElement) {
                    const content = textElement.textContent.trim().toUpperCase();
                    // Use exact matching for 'LIGHT' to avoid confusion with 'LIGHTNING'
                    if (text === 'LIGHT' && content === 'LIGHT') {
                        return groups[i];
                    }
                    // Use exact matching for 'LIGHTNING' to avoid confusion with 'LIGHT'
                    else if (text === 'LIGHTNING' && content === 'LIGHTNING') {
                        return groups[i];
                    }
                    // For other magic types, use includes() for flexibility
                    else if (text !== 'LIGHT' && text !== 'LIGHTNING' && content.includes(text)) {
                        return groups[i];
                    }
                }
            }
            return null;
        }

        // Function to add points display to a group
        function addPointsDisplay(group) {
            const circle = group.querySelector('circle');
            if (circle) {
                const cx = parseFloat(circle.getAttribute('cx'));
                const cy = parseFloat(circle.getAttribute('cy'));
                const r = parseFloat(circle.getAttribute('r'));

                // Create a text element for points display
                const pointsText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                pointsText.setAttribute('x', cx);
                pointsText.setAttribute('y', cy + r/2);
                pointsText.setAttribute('text-anchor', 'middle');
                pointsText.setAttribute('font-size', '20');
                pointsText.setAttribute('fill', '#ffffff');
                pointsText.setAttribute('class', 'points');
                pointsText.textContent = '0';

                // Create a circle background for the points
                const pointsBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                pointsBg.setAttribute('cx', cx);
                pointsBg.setAttribute('cy', cy + r/2);
                pointsBg.setAttribute('r', 15);
                pointsBg.setAttribute('fill', 'rgba(0, 0, 0, 0.6)');

                // Add the points display to the group
                group.appendChild(pointsBg);
                group.appendChild(pointsText);
            }
        }

        // Function to increment points when a circle is clicked
        function incrementPoints(group) {
            let points = parseInt(group.getAttribute('data-points')) || 0;
            points++;
            group.setAttribute('data-points', points);

            // Update the points display
            const pointsDisplay = group.querySelector('.points');
            if (pointsDisplay) {
                pointsDisplay.textContent = points;
            }

            // Add a visual effect for the click
            const circle = group.querySelector('circle');
            if (circle) {
                circle.classList.add('clicked');
                setTimeout(() => {
                    circle.classList.remove('clicked');
                }, 300);
            }
        }

        // Function to check if secondary circles should be enabled
        function checkSecondaryCircles() {
            secondaryCircles.forEach(secondaryGroup => {
                const requiredTypes = secondaryGroup.getAttribute('data-requires').split(',');
                let allRequirementsMet = true;

                // Check if all required primary circles have at least 1 point
                requiredTypes.forEach(type => {
                    const primaryGroup = primaryCircles.find(g => g.getAttribute('data-type') === type);
                    if (primaryGroup) {
                        const points = parseInt(primaryGroup.getAttribute('data-points')) || 0;
                        if (points < 1) {
                            allRequirementsMet = false;
                        }
                    } else {
                        allRequirementsMet = false;
                    }
                });

                // Enable or disable the secondary circle based on requirements
                const circle = secondaryGroup.querySelector('circle');
                if (circle) {
                    if (allRequirementsMet) {
                        secondaryGroup.classList.remove('disabled');
                        circle.setAttribute('stroke-dasharray', 'none');

                        // Add glow effect if newly enabled
                        if (secondaryGroup.classList.contains('disabled')) {
                            circle.classList.add('newly-enabled');
                            setTimeout(() => {
                                circle.classList.remove('newly-enabled');
                            }, 1500);
                        }
                    } else {
                        secondaryGroup.classList.add('disabled');
                        circle.setAttribute('stroke-dasharray', '12, 3');
                    }
                }
            });
        }

        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .clicked {
                animation: pulse 0.3s ease-out;
            }

            .newly-enabled {
                animation: glow 1.5s ease-in-out;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            @keyframes glow {
                0% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)); }
                50% { filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 25px rgba(255, 215, 0, 0.5)); transform: scale(1.2); }
                100% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)); }
            }
        `;
        document.head.appendChild(style);

        // Initialize the secondary circles
        checkSecondaryCircles();
    });
});
