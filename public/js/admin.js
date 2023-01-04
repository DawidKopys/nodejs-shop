const buttons = document.querySelectorAll('.btn-delete')

buttons.forEach((btn) => {
  btn.addEventListener('click', deleteProduct.bind(null, btn))
})

async function deleteProduct (btnElement) {
  const productId = btnElement.getAttribute('data-product-id');
  const csrfToken = btnElement.getAttribute('data-csrf');
  const headers = { 'csrf-token': csrfToken }
  const url = `/admin/delete-product/?productId=${productId}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers
  });
  const data = await response.json();

  if (data && data.success) {
    const productTileElement = btnElement.closest('.card.product-item');
    productTileElement.remove();
  }
}
