// Store tasks in localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM Elements
const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const clearAllBtn = document.getElementById('clearAll');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    updateCountdowns();
    setInterval(updateCountdowns, 1000); // Update every second
});

// Add task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const taskName = document.getElementById('taskName').value;
    const deadline = document.getElementById('deadline').value;
    const priority = document.getElementById('priority').value;
    
    const task = {
        id: Date.now(),
        name: taskName,
        deadline: deadline,
        priority: priority,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    taskForm.reset();
    
    // Show success animation
    showNotification('Task added successfully! 🎉');
});

// Sort tasks by deadline (nearest first)
function sortTasks() {
    tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
    sortTasks(); // Auto-sort before rendering
    
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <p>🎯 No tasks yet! Add your first task above.</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-card ${task.priority}" data-id="${task.id}">
            <div class="task-header">
                <div class="task-name">${task.name}</div>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            <div class="task-deadline">
                📅 Deadline: ${formatDeadline(task.deadline)}
            </div>
            <div class="task-countdown" id="countdown-${task.id}">
                Calculating...
            </div>
            <div class="task-actions">
                <button class="btn-delete" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Format deadline display
function formatDeadline(deadline) {
    const date = new Date(deadline);
    return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update countdowns
function updateCountdowns() {
    tasks.forEach(task => {
        const countdownEl = document.getElementById(`countdown-${task.id}`);
        if (countdownEl) {
            const timeLeft = getTimeLeft(task.deadline);
            countdownEl.textContent = timeLeft.text;
            
            if (timeLeft.isUrgent) {
                countdownEl.classList.add('urgent');
            } else {
                countdownEl.classList.remove('urgent');
            }
        }
    });
}

// Calculate time left
function getTimeLeft(deadline) {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;
    
    if (diff < 0) {
        return {
            text: '⏰ OVERDUE!',
            isUrgent: true
        };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    let text = '⏱️ Time Left: ';
    if (days > 0) {
        text += `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        text += `${hours}h ${minutes}m ${seconds}s`;
    } else {
        text += `${minutes}m ${seconds}s`;
    }
    
    const isUrgent = days === 0 && hours < 2; // Urgent if less than 2 hours
    
    return { text, isUrgent };
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        showNotification('Task deleted! 🗑️');
    }
}

// Clear all tasks
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete ALL tasks?')) {
        tasks = [];
        saveTasks();
        renderTasks();
        showNotification('All tasks cleared! 🧹');
    }
});

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}
