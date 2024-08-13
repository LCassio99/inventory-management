document.addEventListener('DOMContentLoaded', function () {
    const addProductForm = document.getElementById('add-product-form');
    const editProductForm = document.getElementById('edit-product-form');
    const productsTbody = document.getElementById('products-tbody');
    const editProductContainer = document.getElementById('edit-product-container');

    // Hide edit form initially
    editProductContainer.style.display = 'none';

    // Handle add product form submission
    addProductForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('product-name').value;
        const quantity = document.getElementById('product-quantity').value;
        const price = document.getElementById('product-price').value;

        fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, quantity, price })
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || 'Unknown error');
                    });
                }
                return response.json();
            })
            .then(product => {
                console.log('Product added:', product);
                fetchProducts();
                addProductForm.reset(); // Clear form fields
            })
            .catch(error => console.error('Error adding product:', error));
    });

    // Handle edit product form submission
    editProductForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const id = parseInt(document.getElementById('edit-id').value, 10);
        const name = document.getElementById('edit-name').value;
        const quantity = document.getElementById('edit-quantity').value;
        const price = document.getElementById('edit-price').value;

        // Ensure ID is a valid number
        if (isNaN(id)) {
            console.error('Invalid product ID');
            return;
        }

        fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, quantity, price })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(product => {
                console.log('Product updated:', product);
                fetchProducts();
                editProductForm.reset(); // Clear form fields
                editProductContainer.style.display = 'none'; // Hide edit form
            })
            .catch(error => console.error('Error updating product:', error));
    });

    // Fetch products and populate table
    function fetchProducts() {
        fetch('/api/products')
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || 'Unknown error');
                    });
                }
                return response.json();
            })
            .then(products => {
                productsTbody.innerHTML = '';
                products.forEach(product => {
                    const row = productsTbody.insertRow();
                    row.insertCell(0).textContent = product.id;
                    row.insertCell(1).textContent = product.name;
                    row.insertCell(2).textContent = product.quantity;
                    row.insertCell(3).textContent = product.price;

                    // Action buttons container
                    const actionCell = row.insertCell(4);
                    const actionButtonsDiv = document.createElement('div');
                    actionButtonsDiv.className = 'action-buttons'; // Apply CSS class
                    actionCell.appendChild(actionButtonsDiv);

                    // Edit button
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.className = 'edit'; // Apply CSS class
                    editButton.addEventListener('click', () => {
                        document.getElementById('edit-id').value = product.id;
                        document.getElementById('edit-name').value = product.name;
                        document.getElementById('edit-quantity').value = product.quantity;
                        document.getElementById('edit-price').value = product.price;
                        editProductContainer.style.display = 'block'; // Show edit form
                    });
                    actionButtonsDiv.appendChild(editButton);

                    // Delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'delete'; // Apply CSS class
                    deleteButton.addEventListener('click', () => {
                        fetch(`/api/products/${product.id}`, {
                            method: 'DELETE'
                        })
                            .then(response => {
                                if (!response.ok) {
                                    return response.text().then(text => {
                                        throw new Error(text || 'Unknown error');
                                    });
                                }
                                return response.json();
                            })
                            .then(() => {
                                console.log('Product deleted:', product.id);
                                fetchProducts();
                            })
                            .catch(error => console.error('Error deleting product:', error));
                    });
                    actionButtonsDiv.appendChild(deleteButton);
                });
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // Load products on page load
    fetchProducts();
});
