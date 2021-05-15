if (document.querySelector('#new-pet')) {
  document.querySelector('#new-pet').addEventListener('submit', (e) => {
    e.preventDefault();

    let pet = {};
    const inputs = document.querySelectorAll('.form-control');
    for (const input of inputs) {
      pet[input.name] = input.value;
    }

    axios.post('/pets', pet)
      .then(function (response) {
        window.location.replace(`/pets/${response.data.pet._id}`);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}
