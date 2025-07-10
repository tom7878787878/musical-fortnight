function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function searchAmazon() {
  const query = document.getElementById('searchInput').value;
  document.getElementById('searchResults').innerHTML = 'Searching Amazon for: ' + query;
}