// PEGA AQUÍ TU URL DE SHEETDB
const API_URL = 'https://sheetdb.io/api/v1/d1zt4e9rosgot';

const formContainer = document.getElementById('form-container');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const cancelBtn = document.getElementById('cancel-btn');
const recipeForm = document.getElementById('recipe-form');
const recipesGrid = document.getElementById('recipes-grid');
const recipeModal = document.getElementById('recipe-modal');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');

let recipes = [];

// Mostrar/Ocultar formulario
function toggleForm(show) {
    if (show) {
        formContainer.classList.add('active');
        toggleFormBtn.style.display = 'none';
    } else {
        formContainer.classList.remove('active');
        toggleFormBtn.style.display = 'inline-flex';
        recipeForm.reset();
    }
}

toggleFormBtn.addEventListener('click', () => toggleForm(true));
cancelBtn.addEventListener('click', () => toggleForm(false));

// Cargar recetas desde Google Sheets al abrir la web
async function fetchRecipes() {
    try {
        const response = await fetch(API_URL);
        recipes = await response.json();
        renderRecipes();
    } catch (error) {
        console.error('Error al cargar las recetas:', error);
        recipesGrid.innerHTML = `<div class="empty-state"><p>Error al conectar con la nube.</p></div>`;
    }
}

// Guardar receta en Google Sheets
recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newRecipe = {
        id: String(Date.now()),
        title: document.getElementById('title').value,
        image: document.getElementById('image').value,
        servings: document.getElementById('servings').value,
        ingredients: document.getElementById('ingredients').value,
        instructions: document.getElementById('instructions').value
    };

    try {
        // Enviar a SheetDB
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: [newRecipe] })
        });

        recipes.unshift(newRecipe);
        toggleForm(false);
        renderRecipes();
    } catch (error) {
        alert('Error al guardar la receta en la nube.');
        console.error(error);
    }
});

// Renderizar tarjetas
function renderRecipes() {
    recipesGrid.innerHTML = '';

    if (!recipes || recipes.length === 0) {
        recipesGrid.innerHTML = `
            <div class="empty-state">
                <p>No tienes ninguna receta guardada.</p>
                <p style="font-size: 0.85rem; margin-top: 0.25rem;">Pulsa en "Nueva receta" para empezar.</p>
            </div>
        `;
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="recipe-img-container">
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-img" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=600'">
            </div>
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.title}</h3>
                <p class="recipe-snippet">${recipe.instructions}</p>
            </div>
        `;

        card.addEventListener('click', () => openModal(recipe));
        recipesGrid.appendChild(card);
    });
}

// Modal de detalle
function openModal(recipe) {
    modalBody.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}" class="modal-img" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=600'">
        <h2 class="modal-title">${recipe.title}</h2>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-weight: 500; font-size: 0.95rem;">👥 Para ${recipe.servings} personas</p>
        
        <h4 class="modal-section-title">Ingredientes</h4>
        <div class="modal-text">${recipe.ingredients}</div>
        
        <h4 class="modal-section-title">Preparación</h4>
        <div class="modal-text">${recipe.instructions}</div>

        <div class="modal-footer">
            <button class="btn btn-danger" onclick="deleteRecipe('${recipe.id}')">Eliminar receta</button>
        </div>
    `;
    recipeModal.classList.add('active');
}

function closeModal() {
    recipeModal.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);
recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) closeModal();
});

// Eliminar receta de Google Sheets
async function deleteRecipe(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
        try {
            await fetch(`${API_URL}/id/${id}`, {
                method: 'DELETE'
            });

            recipes = recipes.filter(r => r.id !== id);
            closeModal();
            renderRecipes();
        } catch (error) {
            alert('Error al eliminar la receta.');
            console.error(error);
        }
    }
}

// Inicializar cargando desde la nube
fetchRecipes();