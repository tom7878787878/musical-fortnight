// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbASk2ttihM-k3Noo1uhTCCsuc2FBBiSc", 
  authDomain: "apex-ad8c0.firebaseapp.com",
  projectId: "apex-ad8c0",
  storageBucket: "apex-ad8c0.firebasestorage.app",
  messagingSenderId: "243749227658",
  appId: "1:243749227658:web:3ac6fba9aac3105abcb173",
  measurementId: "G-SKZY7WC4E3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Amazon Affiliate Tag
const amazonTag = "everythi09e02-20"; 

// Hamburger Menu Logic
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navLinks = document.getElementById('navLinks');

hamburgerMenu.addEventListener('click', (event) => {
    event.stopPropagation();
    navLinks.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });
});

document.addEventListener('click', (event) => {
    if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});


// Page Navigation
window.showPage = function(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  // Special handling for the products page and garage page
  if (id === 'products') {
    loadVehicleForProducts();
  } else if (id === 'garage') {
    loadVehicle(); // Ensure vehicle is loaded when navigating to garage
  } else if (id === 'wishlist') { // Load wishlist when navigating to it
      loadWishlist();
  }
}

// --- Notification System ---
const notificationContainer = document.getElementById('notificationContainer');

function showNotification(message, type = 'info', duration = 3000) {
    const notificationItem = document.createElement('div');
    notificationItem.className = `notification-item notification-${type}`;
    notificationItem.textContent = message;
    notificationContainer.appendChild(notificationItem);

    // Remove the notification after a delay
    setTimeout(() => {
        notificationItem.remove();
    }, duration);
}


// Function to clear auth form fields
function clearAuthFields() {
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPass").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPass").value = "";
}

// --- Button Loading State Management ---
const originalButtonTexts = new Map(); 

function setButtonLoading(button, isLoading) {
    if (!button) return; // Guard against null button

    if (isLoading) {
        // Store original text if not already stored
        if (!originalButtonTexts.has(button)) {
            originalButtonTexts.set(button, button.textContent);
        }
        button.textContent = 'Loading...';
        button.classList.add('is-loading');
        button.disabled = true;
    } else {
        // Restore original text
        if (originalButtonTexts.has(button)) {
            button.textContent = originalButtonTexts.get(button);
            originalButtonTexts.delete(button); // Clean up
        }
        button.classList.remove('is-loading');
        button.disabled = false;
    }
}


// Auth State Listener
onAuthStateChanged(auth, user => {
  const emailSpan = document.getElementById("userEmail");
  if (user) {
    emailSpan.textContent = `Logged in as: ${user.email}`;
    // Only load vehicle if the current page is garage, or if just logged in from auth page
    if (document.querySelector('.page.active')?.id === 'garage' || document.querySelector('.page.active')?.id === 'auth') {
         loadVehicle();
    }
    // If coming from auth page, automatically switch.
    if (document.querySelector('.page.active')?.id === 'auth') {
      showPage('garage'); 
    }
    clearAuthFields(); // Clear fields on successful login/registration by state change
  } else {
    emailSpan.textContent = "";
    // If the user logs out or is not logged in and on the garage page, redirect to auth
    if (document.querySelector(".page.active")?.id === "garage") {
      showPage("auth");
    }
    // Clear garage display if user logs out
    document.getElementById("garageDisplay").textContent = "";
    document.getElementById("make").value = "";
    document.getElementById("model").value = "";
    document.getElementById("year").value = "";
    clearAuthFields(); // Clear fields on logout
  }
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const loginEmail = document.getElementById("loginEmail");
  const loginPass = document.getElementById("loginPass");
  const submitBtn = e.submitter; // Get the button that triggered the submit

  setButtonLoading(submitBtn, true); // Show loading state

  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPass.value);
    showNotification("Login successful!", "success"); // Use new notification
    clearAuthFields(); 
  } catch (err) {
    let errorMessage = "An unknown error occurred.";
    if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
    } else if (err.code === 'auth/user-not-found') {
        errorMessage = "No user found with that email.";
    } else if (err.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
    } else {
        errorMessage = err.message; // Fallback to generic Firebase message
    }
    showNotification("Login failed: " + errorMessage, "error"); // Use new notification
  } finally {
    setButtonLoading(submitBtn, false); // Hide loading state
  }
});

// Register
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const regEmail = document.getElementById("regEmail");
  const regPass = document.getElementById("regPass");
  const submitBtn = e.submitter; // Get the button that triggered the submit

  setButtonLoading(submitBtn, true); // Show loading state

  try {
    await createUserWithEmailAndPassword(auth, regEmail.value, regPass.value);
    showNotification("Registered successfully!", "success"); // Use new notification
    clearAuthFields(); 
  } catch (err) {
    let errorMessage = "An unknown error occurred.";
    if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
    } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = "Email is already in use.";
    } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak (min 6 characters).";
    } else {
        errorMessage = err.message; // Fallback to generic Firebase message
    }
    showNotification("Registration error: " + errorMessage, "error"); // Use new notification
  } finally {
    setButtonLoading(submitBtn, false); // Hide loading state
  }
});

// Google Login
window.googleLogin = async function() {
  const googleBtn = document.getElementById('googleLoginBtn'); // Get the specific button
  setButtonLoading(googleBtn, true); // Show loading state

  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    showNotification("Google login successful!", "success"); // Use new notification
    clearAuthFields(); 
  } catch (err) {
    // Firebase Auth error.code can be useful here for specific messages
    if (err.code === 'auth/popup-closed-by-user') {
        showNotification("Google login cancelled.", "info");
    } else if (err.code === 'auth/cancelled-popup-request') {
         showNotification("Login attempt already in progress.", "info");
    }
    else {
        showNotification("Google login error: " + err.message, "error"); // Use new notification
    }
  } finally {
    setButtonLoading(googleBtn, false); // Hide loading state
  }
}

// Logout
window.logout = async function() {
  const logoutBtn = document.getElementById('logoutBtn'); // Get the specific button
  setButtonLoading(logoutBtn, true); // Show loading state

  try {
    await signOut(auth);
    showNotification("Logged out successfully!", "info"); // Use new notification
    clearAuthFields(); 
  } catch (err) {
    showNotification("Logout error: " + err.message, "error"); // Use new notification
  } finally {
    setButtonLoading(logoutBtn, false); // Hide loading state
  }
}

// Save to Firestore
document.getElementById("garageForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const makeInput = document.getElementById("make"); 
  const modelInput = document.getElementById("model");
  const yearInput = document.getElementById("year");
  const display = document.getElementById("garageDisplay");
  const submitBtn = e.submitter; // Get the button that triggered the submit

  if (!auth.currentUser) {
    showNotification("Please log in to save your vehicle.", "error"); // Use new notification
    console.warn("Attempted to save vehicle without being logged in.");
    return;
  }

  const make = makeInput.value; 
  const model = modelInput.value;
  const year = yearInput.value;

  setButtonLoading(submitBtn, true); // Show loading state

  try {
    await setDoc(doc(db, "garages", auth.currentUser.uid), {
      make, model, year, timestamp: serverTimestamp()
    }, { merge: true }); // Use merge:true to ensure wishlist field is not overwritten if it exists
    display.textContent = `Saved: ${year} ${make} ${model}`;
    showNotification("Vehicle saved successfully!", "success"); // Use new notification
    
    makeInput.value = '';
    modelInput.value = '';
    yearInput.value = '';

    if (document.querySelector('.page.active')?.id === 'products') {
        loadVehicleForProducts(); // This function already handles its own "Loading..." message
    }
  } catch (err) {
    showNotification("Error saving vehicle: " + err.message, "error"); // Use new notification
    console.error("Error saving vehicle:", err);
  } finally {
    setButtonLoading(submitBtn, false); // Hide loading state
  }
});

// Load from Firestore for My Garage page
async function loadVehicle() {
  const display = document.getElementById("garageDisplay");
  const makeInput = document.getElementById("make");
  const modelInput = document.getElementById("model");
  const yearInput = document.getElementById("year");

  if (!auth.currentUser) {
    display.textContent = ""; 
    makeInput.value = "";
    modelInput.value = "";
    yearInput.value = "";
    console.log("No current user to load vehicle for.");
    return;
  }

  // No button to put a spinner on directly here, display.textContent acts as feedback
  display.textContent = "Loading vehicle..."; // Simple inline loading text for display

  try {
    const userDoc = await getDoc(doc(db, "garages", auth.currentUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      display.textContent = `Saved: ${data.year} ${data.make} ${data.model}`;
      makeInput.value = data.make;
      modelInput.value = data.model;
      yearInput.value = data.year;
      console.log("Vehicle loaded:", data);
    } else {
      display.textContent = "No vehicle saved yet.";
      makeInput.value = "";
      modelInput.value = "";
      yearInput.value = "";
      showNotification("No vehicle saved. Please add one!", "info"); // Informative notification
      console.log("No vehicle data found for user.");
    }
  } catch (err) {
    console.error("Error loading vehicle:", err);
    display.textContent = "Error loading vehicle data.";
    showNotification("Error loading vehicle data: " + err.message, "error"); // Notify of load error
  }
}

// Load Vehicle and generate product links for the Products page
async function loadVehicleForProducts() {
    const productContentDiv = document.getElementById('productContent');
    productContentDiv.innerHTML = '<h3>Loading your vehicle data...</h3>'; // This is the loading indicator for this section

    if (!auth.currentUser) {
        productContentDiv.innerHTML = `
            <div class="no-vehicle-message">
                <h3>Please Log In or Save Your Vehicle</h3>
                <p>To get personalized part searches, please <a href="#" onclick="showPage('auth')">log in</a> or go to <a href="#" onclick="showPage('garage')">My Garage</a> to save your vehicle details.</p>
            </div>
        `;
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "garages", auth.currentUser.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            const { year, make, model } = data; // Destructure vehicle data here
            
            let htmlContent = `
                <h3 style="text-align: center;">Parts for Your ${year} ${make} ${model}</h3>
                <div class="vehicle-info">Your Saved Vehicle: ${year} ${make} ${model}</div>
                
                <div class="general-search-section">
                    <label for="generalProductSearch" class="sr-only">Search Parts by Keyword</label>
                    <input type="text" id="generalProductSearch" placeholder="Search for any part (e.g., 'alternator')" />
                    <button id="generalSearchButton" onclick="searchAmazonGeneral('${year}', '${make}', '${model}')">Search</button>
                </div>

                <p style="text-align: center; margin-top: 2rem; margin-bottom: 1.5rem;">Or click a category below to search Amazon directly for your vehicle:</p>
                <div class="category-buttons">
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Brake Pads')">Brake Pads</button>
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Oil Filter')">Oil Filter</button>
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Air Filter')">Air Filter</button>
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Spark Plugs')">Spark Plugs</button>
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Suspension Kit')">Suspension Kit</button>
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Headlights')">Headlights</button>
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Tail Lights')">Tail Lights</button>
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Windshield Wipers')">Wiper Blades</button>
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Radiator')">Radiator</button>
                    <button onclick="searchAmazonSpecific('${year}', '${make}', '${model}', 'Battery')">Battery</button>
                    </div>
            `;
            productContentDiv.innerHTML = htmlContent;

            // IMPORTANT: Add event listener here because the elements are created dynamically
            const generalSearchInput = document.getElementById('generalProductSearch');
            const generalSearchButton = document.getElementById('generalSearchButton'); // Get the new search button

            generalSearchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Prevent form submission if input is inside a form
                    setButtonLoading(generalSearchButton, true); // Show loading
                    searchAmazonGeneral(year, make, model);
                    setButtonLoading(generalSearchButton, false); // Hide loading (instantly since it just opens a tab)
                }
            });

            // Also attach loading state to the general search button's click handler
            generalSearchButton.addEventListener('click', () => {
                setButtonLoading(generalSearchButton, true); // Show loading
                searchAmazonGeneral(year, make, model);
                setButtonLoading(generalSearchButton, false); // Hide loading
            });


        } else {
            productContentDiv.innerHTML = `
                <div class="no-vehicle-message">
                    <h3>No Vehicle Saved</h3>
                    <p>You haven't saved a vehicle yet. Please go to <a href="#" onclick="showPage('garage')">My Garage</a> to add your vehicle details to get personalized part suggestions.</p>
                </div>
            `;
             showNotification("No vehicle saved. Please add one in My Garage!", "info", 5000); // More persistent info
        }
    } catch (err) {
        console.error("Error loading vehicle for products page:", err);
        productContentDiv.innerHTML = `
            <div class="no-vehicle-message">
                <h3>Error Loading Vehicle</h3>
                <p>There was an error loading your vehicle data. Please try again or <a href="#" onclick="showPage('auth')">log in</a>.</p>
            </div>
        `;
        showNotification("Error loading vehicle data for products: " + err.message, "error", 5000); // Notify of load error
    }
}

// Specific Amazon Search Function (remains unchanged and correctly uses affiliate tag)
window.searchAmazonSpecific = function(year, make, model, partType) {
    const query = `${partType} ${year} ${make} ${model}`;
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${amazonTag}`;
    window.open(url, "_blank");
}

// General Amazon Search Function (Now filters by vehicle and uses affiliate tag)
window.searchAmazonGeneral = function(year, make, model) { // Added vehicle parameters
    const searchInput = document.getElementById('generalProductSearch');
    let query = searchInput.value.trim(); // User's input

    if (query) {
        // Combine user's query with vehicle info for a more specific search
        query = `${query} ${year} ${make} ${model}`; 
        const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${amazonTag}`;
        window.open(url, "_blank");
        searchInput.value = ''; // Clear the search input after search
    } else {
        showNotification("Please enter a search term.", "info"); // Use new notification
    }
}

// --- NEW Wishlist Logic (Firestore Integration) ---
// Get references
const featuredProductsGrid = document.getElementById('featuredProductsGrid');
const wishlistItemsContainer = document.getElementById('wishlistItems');
const clearWishlistButton = document.getElementById('clearWishlistBtn');

// Event listener for "Add to Wishlist" buttons (delegated)
featuredProductsGrid.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-wishlist-btn')) {
        const productCard = event.target.closest('.card');
        // Extract all data attributes
        const product = {
            id: productCard.dataset.productId, // Use the new unique product ID
            name: productCard.dataset.productName,
            price: productCard.dataset.productPrice,
            amazonUrl: productCard.dataset.amazonUrl,
            imageUrl: productCard.dataset.imageUrl // NEW: Image URL for wishlist display
        };
        
        addToWishlist(product);
    }
});

// Event listener for "Remove from Wishlist" buttons (delegated)
wishlistItemsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-from-wishlist-btn')) {
        const productIdToRemove = event.target.dataset.productId;
        removeFromWishlist(productIdToRemove);
    }
});

// Event listener for "Clear Wishlist" button
clearWishlistButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
        clearWishlist();
    }
});

// Helper to get user's garage document reference
function getUserGarageDocRef() {
    if (!auth.currentUser) {
        showNotification("Please log in to manage your wishlist.", "error");
        return null;
    }
    return doc(db, "garages", auth.currentUser.uid);
}


async function getWishlistFromFirestore() {
    const userDocRef = getUserGarageDocRef();
    if (!userDocRef) return [];

    try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            return data.wishlist || []; // Return wishlist array or empty if not present
        }
        return [];
    } catch (error) {
        console.error("Error getting wishlist from Firestore:", error);
        showNotification("Error loading wishlist.", "error");
        return [];
    }
}

async function addToWishlist(product) {
    const userDocRef = getUserGarageDocRef();
    if (!userDocRef) return;

    try {
        // Use arrayUnion to add product to the wishlist array without duplicates (by value)
        // For actual unique products, you'd want to check by product.id first
        await updateDoc(userDocRef, {
            wishlist: arrayUnion(product)
        });
        showNotification(`${product.name} added to wishlist!`, "success");
        // If the wishlist page is active, refresh it
        if (document.querySelector('.page.active')?.id === 'wishlist') {
            loadWishlist();
        }
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        showNotification(`Failed to add ${product.name} to wishlist.`, "error");
    }
}

async function removeFromWishlist(productId) {
    const userDocRef = getUserGarageDocRef();
    if (!userDocRef) return;

    try {
        // Get the current wishlist to find the exact item to remove by its ID
        const currentWishlist = await getWishlistFromFirestore();
        const itemToRemove = currentWishlist.find(item => item.id === productId);

        if (itemToRemove) {
            await updateDoc(userDocRef, {
                wishlist: arrayRemove(itemToRemove)
            });
            showNotification("Product removed from wishlist.", "info");
            loadWishlist(); // Refresh wishlist display
        } else {
            showNotification("Product not found in wishlist.", "info");
        }
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        showNotification("Failed to remove product from wishlist.", "error");
    }
}

async function clearWishlist() {
    const userDocRef = getUserGarageDocRef();
    if (!userDocRef) return;

    try {
        // Set wishlist array to empty
        await updateDoc(userDocRef, {
            wishlist: []
        });
        showNotification("Wishlist cleared!", "info");
        loadWishlist(); // Refresh display
    } catch (error) {
        console.error("Error clearing wishlist:", error);
        showNotification("Failed to clear wishlist.", "error");
    }
}

async function loadWishlist() {
    const wishlistItemsContainer = document.getElementById('wishlistItems');
    wishlistItemsContainer.innerHTML = '<p class="no-items-message">Loading wishlist...</p>'; // Show loading state

    const userDocRef = getUserGarageDocRef();
    if (!userDocRef) {
        wishlistItemsContainer.innerHTML = '<p class="no-items-message">Please log in to see your wishlist, or add some products from the Products page!</p>';
        return;
    }

    const wishlist = await getWishlistFromFirestore();
    wishlistItemsContainer.innerHTML = ''; // Clear loading message

    if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML = '<p class="no-items-message">Your wishlist is empty. Add some products from the Products page!</p>';
    } else {
        wishlist.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}">` : ''}
                <h4>${product.name}</h4>
                <p>Price: $${product.price}</p>
                <a href="${product.amazonUrl}" target="_blank" rel="noopener noreferrer">Buy on Amazon</a>
                <button class="remove-from-wishlist-btn" data-product-id="${product.id}">Remove</button>
            `;
            wishlistItemsContainer.appendChild(card);
        });
    }
}

// --- Contact Form Submission Handling (Formspree Integration) ---
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent default form submission
    const form = e.target;
    const submitBtn = e.submitter;

    setButtonLoading(submitBtn, true); // Show loading

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: new FormData(form), // Automatically collects form data
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            showNotification("Message sent successfully! We'll get back to you soon.", "success");
            form.reset(); // Clear the form fields
        } else {
            // Check for specific Formspree errors if needed
            const data = await response.json();
            if (data && data.errors) {
                showNotification(`Error sending message: ${data.errors.map(err => err.message).join(', ')}`, "error");
            } else {
                showNotification("Failed to send message. Please try again later.", "error");
            }
        }
    } catch (error) {
        showNotification("Network error or failed to send message. Please check your connection.", "error");
        console.error("Contact form submission error:", error);
    } finally {
        setButtonLoading(submitBtn, false); // Hide loading
    }
});


// Initial page load
showPage('home');
