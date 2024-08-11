function toggleActiveClass(element) {
    // Remove active class from all containers
    document.querySelectorAll('.hospital-container, .police-container, .fire-container').forEach(container => {
        container.classList.remove('active');
        container.style.display = 'none'; // Set display to 'none' for all containers initially
    });

    // Add active class to the parent container of the clicked image
    const activeContainer = element.closest('.image-container').parentNode;
    activeContainer.classList.add('active');
    
    // Show the active container
    activeContainer.style.display = 'block';

    // Show the reset button
    document.querySelector('.resetBtn').style.display = 'flex';
}

function resetClasses() {
    // Remove active class from all containers
    document.querySelectorAll('.hospital-container, .police-container, .fire-container').forEach(container => {
        container.classList.remove('active');
        container.style.display = 'flex'; // Set display back to 'flex' for all containers
    });

    // Hide the reset button
    document.querySelector('.resetBtn').style.display = 'none';
}
