const fetchData = async (url) => {
  return fetch(url)
    .then(function (data) {
      return data.json();
    })
    .catch(function () {
      return null;
    });
};

module.exports = fetchData;
