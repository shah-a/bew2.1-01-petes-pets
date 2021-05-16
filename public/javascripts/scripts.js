if (document.querySelector('#new-pet')) {
  document.querySelector('#new-pet').addEventListener('submit', (e) => {
    e.preventDefault();

    var form = document.getElementById('new-pet');
    var pet = new FormData(form);

    axios.post('/pets', pet, {
      headers: {
        'Content-Type': 'multipart/form-data;'
      }
    })
      .then(function (response) {
        window.location.replace(`/pets/${response.data.pet._id}`);
      })
      .catch(function (error) {
        const alert = document.getElementById('alert');
        alert.classList.add('alert-danger');
        alert.textContent = "Oops, something went wrong saving your pet. Please check your information and try again."
        alert.style.display = 'block';
        setTimeout(function () {
          alert.classList.remove('alert-danger');
          alert.textContent = "";
          alert.style.display = 'none';
        }, 3000);
      });
  });
}
